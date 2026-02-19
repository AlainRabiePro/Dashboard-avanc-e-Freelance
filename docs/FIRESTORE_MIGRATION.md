// Migration Firestore pour les campagnes de newsletter
// À exécuter une seule fois pour initialiser la structure

const newsletterCampaignsMigration = `
Collection: newsletterCampaigns

Structure d'un document:
{
  id: "auto-generated",
  userId: "string",                    // ID de l'utilisateur propriétaire
  campaignName: "string",              // Nom identifiable
  subject: "string",                   // Sujet avec variables possibles
  content: "string",                   // Contenu avec variables possibles
  frequency: "once|daily|weekly|monthly",
  scheduleDate: "Timestamp",           // Prochaine date d'envoi
  nextSendDate: "Timestamp|null",      // Prochaine après (si récurrent)
  selectedProspectIds: ["string"],     // IDs des prospects ciblés
  createdAt: "Timestamp",              // Date de création
  lastSentDate: "Timestamp",           // Dernière date d'envoi
  status: "scheduled|sent|paused",
  sentCount: "number"                  // Nombre total d'emails envoyés
}

Règles Firestore recommandées:
`;

const firestoreRulesForNewsletter = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Campagnes de newsletter - accès utilisateur uniquement
    match /newsletterCampaigns/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    // Laisser ces règles existantes aussi
    match /prospects/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
`;

console.log(newsletterCampaignsMigration);
console.log('\n' + firestoreRulesForNewsletter);

export default {
  newsletterCampaignsMigration,
  firestoreRulesForNewsletter,
};

/* 
INSTRUCTIONS D'INSTALLATION:

1. Allez dans Firebase Console
2. Naviguer à Cloud Firestore
3. Créer une nouvelle collection nommée: "newsletterCampaigns"
4. Dans les règles, remplacer par le contenu de firestoreRulesForNewsletter

OU via Firebase CLI:

firebase init firestore
firebase deploy --only firestore:rules

*/
