import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email;
    const plan = session.metadata?.plan || session.metadata?.subscriptionPlan;
    if (email && plan) {
      const usersRef = admin.firestore().collection('users');
      const snap = await usersRef.where('email', '==', email).get();
      if (!snap.empty) {
        const userDoc = snap.docs[0];
        await userDoc.ref.update({
          subscriptionPlan: plan,
          subscriptionActive: true,
          subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  }

  res.status(200).json({ received: true });
}
