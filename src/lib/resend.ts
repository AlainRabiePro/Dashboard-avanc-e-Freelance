import { Resend } from 'resend';

// ⚠️ Remplacez 're_xxxxxxxxx' par votre vraie clé API Resend (ex: 're_eobeF6S5_HndUfotqkkavmg1nmYkFTbwh')
const resend = new Resend(process.env.RESEND_API_KEY!);

// Utilise l'adresse d'expéditeur configurée dans .env.local (RESEND_FROM)
export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  return resend.emails.send({
    from: process.env.RESEND_FROM!, // Doit être une adresse validée sur Resend
    to,
    subject,
    html,
  });
}
