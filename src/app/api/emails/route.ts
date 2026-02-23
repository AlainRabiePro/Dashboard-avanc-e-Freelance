
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
const redirectUri = process.env.GOOGLE_REDIRECT_URI;

const oAuth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);
oAuth2Client.setCredentials({ refresh_token: refreshToken });

export async function GET() {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    // Récupère les 10 derniers emails
    const res = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
    const messages = res.data.messages || [];

    // Récupère les détails de chaque email
    const emails = await Promise.all(messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({ userId: 'me', id: msg.id! });
      const headers = detail.data.payload?.headers || [];
      const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
      return {
        id: msg.id,
        from: getHeader('From'),
        subject: getHeader('Subject'),
        snippet: detail.data.snippet,
        date: getHeader('Date'),
        unread: !(detail.data.labelIds || []).includes('READ'),
        starred: (detail.data.labelIds || []).includes('STARRED'),
        important: (detail.data.labelIds || []).includes('IMPORTANT'),
        tags: [] // À adapter si tu veux gérer les tags personnalisés
      };
    }));

    return NextResponse.json({ emails });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
