import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, message: 'Paramètres manquants: to, subject, html' },
        { status: 400 }
      );
    }

    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });

    if (response.error) {
      console.error('Resend error:', response.error);
      return NextResponse.json(
        {
          success: false,
          message: 'Erreur lors de l\'envoi',
          error: response.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email envoyé avec succès',
      id: response.data?.id,
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
