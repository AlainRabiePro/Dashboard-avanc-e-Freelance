// Utilitaire pour Stripe Checkout Session
import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

const BASIC_PRICE_ID = process.env.STRIPE_BASIC_PRICE_ID!; // à définir dans .env.local
const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID!; // à définir dans .env.local

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, email } = req.body;
  if (!plan || !email) {
    return res.status(400).json({ error: 'Missing plan or email' });
  }

  let priceId = plan === 'premium' ? PREMIUM_PRICE_ID : BASIC_PRICE_ID;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?canceled=1`,
    });
    res.status(200).json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
