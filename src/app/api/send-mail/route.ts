import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/resend';

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
