import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html, accessToken } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Champs requis manquants: to, subject, html' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token d\'accès Gmail manquant' },
        { status: 401 }
      );
    }

    // Initialiser le client OAuth2
    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Créer le message RFC 2822
    const message = [
      `From: me`,
      `To: ${to}`,
      `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
      `Content-Type: text/html; charset=utf-8`,
      `Content-Transfer-Encoding: base64`,
      '',
      html,
    ].join('\n');

    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return NextResponse.json({
      success: true,
      messageId: result.data.id,
      message: 'Email envoyé avec succès via Gmail',
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du mail:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: `Erreur lors de l'envoi: ${errorMessage}` },
      { status: 500 }
    );
  }
}
