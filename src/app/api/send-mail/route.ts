
import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/resend';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  const { to, subject, html } = await req.json();
  if (!to || !subject || !html) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const result = await sendMail({ to, subject, html });
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// GET /api/send-mail : retourne la liste des mails depuis Firestore
export async function GET() {
  try {
    const { firestore } = initializeFirebase();
    const mailsCol = collection(firestore, 'mails');
    const snapshot = await getDocs(mailsCol);
    const mails = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ mails });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
