import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// À personnaliser : mettre vos propres credentials Google Cloud Console
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

// Cette fonction suppose que vous avez déjà un token d'accès OAuth2 valide côté serveur
// (sinon il faut gérer le flow OAuth complet)
export async function GET(req: NextRequest) {
  const accessToken = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const res = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
    const messages = res.data.messages || [];
    // Pour chaque message, récupérer le contenu minimal (exemple)
    const mailDetails = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({ userId: 'me', id: msg.id! });
        return {
          id: msg.id,
          snippet: detail.data.snippet,
          payload: detail.data.payload,
        };
      })
    );
    return NextResponse.json({ mails: mailDetails });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
