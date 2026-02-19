import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { Resend } from 'resend';

// Initialiser Firebase Admin
let db: admin.firestore.Firestore;

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK || '{}');
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }
  db = admin.firestore();
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

const resend = new Resend(process.env.RESEND_API_KEY || '');

interface NewsletterCampaign {
  id: string;
  userId: string;
  campaignName: string;
  subject: string;
  content: string;
  frequency: string;
  scheduleDate: any;
  nextSendDate: any;
  selectedProspectIds: string[];
  status: string;
  sentCount: number;
}

interface Prospect {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
}

function replacePlaceholders(content: string, prospect: Prospect): string {
  return content
    .replace(/\{\{companyName\}\}/g, prospect.companyName)
    .replace(/\{\{contactName\}\}/g, prospect.contactName)
    .replace(/\{\{email\}\}/g, prospect.email);
}

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      throw new Error('Firebase Admin not initialized');
    }

    // Récupérer toutes les campagnes programmées
    const campaignsSnapshot = await db
      .collection('newsletterCampaigns')
      .where('status', '==', 'scheduled')
      .get();

    const now = new Date();
    console.log('🔔 [CRON] Vérification des campagnes - Heure actuelle:', now.toISOString());
    console.log('🔔 [CRON] Nombre de campagnes programmées:', campaignsSnapshot.docs.length);

    let sentCount = 0;
    const errors: string[] = [];

    for (const campaignDoc of campaignsSnapshot.docs) {
      const campaign = campaignDoc.data() as NewsletterCampaign;
      const scheduleDate = campaign.scheduleDate.toDate();

      console.log(`📧 Campagne: "${campaign.campaignName}"`);
      console.log(`   Date programmée: ${scheduleDate.toISOString()}`);
      console.log(`   Maintenant: ${now.toISOString()}`);
      console.log(`   À envoyer? ${scheduleDate <= now}`);

      // Vérifier si c'est le moment d'envoyer (avec marge de 5 minutes)
      const timeDiff = now.getTime() - scheduleDate.getTime();
      const isTimeToSend = timeDiff >= 0 && timeDiff < 5 * 60 * 1000; // Fenêtre de 5 minutes

      if (isTimeToSend || scheduleDate <= now) {
        try {
          // Récupérer l'email de l'utilisateur
          const userDoc = await db
            .collection('users')
            .doc(campaign.userId)
            .get();
          
          // Utiliser l'email d'envoi par défaut (fallback)
          const userEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

          // Récupérer les prospects
          const prospectsSnapshot = await db
            .collection('prospects')
            .where('userId', '==', campaign.userId)
            .get();

          const prospectMap = new Map<string, Prospect>();
          prospectsSnapshot.docs.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
            prospectMap.set(doc.id, doc.data() as Prospect);
          });

          const prospects = campaign.selectedProspectIds
            .map(id => prospectMap.get(id))
            .filter((p): p is Prospect => p !== undefined);

          // Envoyer les emails
          for (const prospect of prospects) {
            try {
              const personalizedContent = replacePlaceholders(
                campaign.content,
                prospect
              );
              const personalizedSubject = replacePlaceholders(
                campaign.subject,
                prospect
              );

              console.log('Sending email:', {
                from: userEmail,
                to: prospect.email,
                subject: personalizedSubject,
              });

              const response = await resend.emails.send({
                from: userEmail,
                to: prospect.email,
                subject: personalizedSubject,
                html: personalizedContent,
              });

              console.log('Resend response:', response);

              if (response.error) {
                console.error('Resend error:', response.error);
                errors.push(
                  `Erreur Resend pour ${prospect.email}: ${JSON.stringify(response.error)}`
                );
              } else {
                sentCount++;
              }
            } catch (error) {
              console.error(
                `Erreur lors de l'envoi à ${prospect.email}:`,
                error
              );
              errors.push(
                `Erreur d'envoi à ${prospect.email}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
              );
            }
          }

          // Mettre à jour la campagne
          if (campaign.frequency === 'once') {
            // Une seule fois
            await campaignDoc.ref.update({
              status: 'sent',
              sentCount: (campaign.sentCount || 0) + prospects.length,
              lastSentDate: new Date(),
            });
          } else {
            // Récurrente: calculer la prochaine date
            let nextSendDate = new Date(scheduleDate);
            if (campaign.frequency === 'daily') {
              nextSendDate.setDate(nextSendDate.getDate() + 1);
            } else if (campaign.frequency === 'weekly') {
              nextSendDate.setDate(nextSendDate.getDate() + 7);
            } else if (campaign.frequency === 'monthly') {
              nextSendDate.setMonth(nextSendDate.getMonth() + 1);
            }

            await campaignDoc.ref.update({
              scheduleDate: nextSendDate,
              sentCount: (campaign.sentCount || 0) + prospects.length,
              lastSentDate: new Date(),
            });
          }
        } catch (error) {
          console.error(
            `Erreur lors du traitement de la campagne ${campaign.campaignName}:`,
            error
          );
          errors.push(
            `Erreur campagne ${campaign.campaignName}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${sentCount} emails envoyés avec succès`,
      sentCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Erreur dans la route d\'envoi des newsletters:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de l\'envoi des newsletters',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

// Optionnel: GET pour tester
export async function GET() {
  return NextResponse.json({
    message: 'Endpoint POST disponible pour envoyer les newsletters programmées',
  });
}
