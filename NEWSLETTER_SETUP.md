# 📧 Nouvelles Fonctionnalités - Système de Campagnes Newsletter

## 🎉 Résumé des Changements

Un système complet de newsletters et emails programmés a été ajouté à votre module de prospection. Vous pouvez maintenant:

✅ Créer des campagnes d'emails programmées  
✅ Personnaliser automatiquement le contenu par prospect  
✅ Choisir la fréquence d'envoi (une fois, quotidien, hebdomadaire, mensuel)  
✅ Sélectionner les destinataires  
✅ Envoyer des emails directs à un prospect  
✅ Utiliser des modèles prédéfinis  

## 📁 Fichiers Créés/Modifiés

### Nouveaux Fichiers

```
src/
  ├── components/
  │   ├── newsletter-campaign-dialog.tsx    # Dialogue pour créer une campagne
  │   ├── newsletter-campaigns-list.tsx     # Liste des campagnes
  │   ├── send-email-dialog.tsx             # Dialogue pour envoyer un email direct
  │   └── email-templates.tsx               # Modèles d'email prédéfinis
  │
  ├── app/
  │   ├── api/send-newsletter/route.ts      # Route API pour l'envoi automatique
  │   └── dashboard/prospection/
  │       └── campaigns/page.tsx            # Page de gestion des campagnes
  │
  └── docs/
      ├── NEWSLETTER_GUIDE.md               # Guide complet d'utilisation
      └── CRON_SETUP.md                     # Configuration CRON

vercel.json                                  # Configuration CRON Vercel
```

### Fichiers Modifiés

```
src/app/dashboard/prospection/page.tsx      # Ajout du lien vers les campagnes
```

## 🚀 Comment Utiliser

### 1. Accéder à la Page des Campagnes

Depuis la page **Prospection**, cliquez sur le bouton **"Campagnes"** pour aller sur la page de gestion.

### 2. Créer une Nouvelle Campagne

1. Cliquez sur **"Nouvelle campagne"**
2. Remplissez les informations:
   - **Nom**: Un identifiant pour votre campagne
   - **Sujet**: Sujet de l'email (avec possibilité de variables)
   - **Contenu**: Message personnalisé
3. Configurez l'envoi:
   - **Date**: Quand envoyer
   - **Heure**: À quelle heure
   - **Fréquence**: Une fois / Quotidien / Hebdomadaire / Mensuel
4. Sélectionnez les destinataires
5. Cliquez **"Créer la campagne"**

### 3. Utiliser les Modèles

Dans la section contenu, cliquez sur le bouton **"📋 Modèles"** pour utiliser des templates prédéfinis:
- Suivi Simple
- Présentation de Service
- Proposition Value
- Relance Friendly
- Offre Limitée

### 4. Variables de Personnalisation

Utilisez ces variables partout dans votre contenu:
- `{{companyName}}` → Nom de l'entreprise
- `{{contactName}}` → Nom du contact
- `{{email}}` → Email du prospect

## ⚙️ Configuration Requise

### Variables d'Environnement

Ajoutez ces variables dans `.env.local`:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@votredomaine.com
FIREBASE_ADMIN_SDK='{"type":"service_account",...}'
```

### Setup Resend

1. Créez un compte sur https://resend.com
2. Obtenez une clé API
3. Configurez le domaine d'envoi

### Setup Firebase Admin

1. Allez dans Firebase Console → Paramètres → Comptes de service
2. Générez une clé privée
3. Copiez le JSON complet

### Activer la CRON

Le fichier `vercel.json` est déjà configuré pour exécuter l'envoi toutes les 15 minutes.

Pour autre hébergement, consultez [CRON_SETUP.md](./docs/CRON_SETUP.md)

## 🔧 Fonctionnalités Détaillées

### Créer une Campagne

```typescript
// Données sauvegardées en Firestore
{
  userId: "user123",
  campaignName: "Janvier 2026 - Suivi",
  subject: "Suivi - {{companyName}}",
  content: "Bonjour {{contactName}}, ...",
  frequency: "weekly",
  scheduleDate: Timestamp(2026-02-19),
  nextSendDate: Timestamp(2026-02-26),
  selectedProspectIds: ["prospect1", "prospect2"],
  status: "scheduled",
  sentCount: 0
}
```

### Envoyer Automatiquement

- Les campagnes s'envoient via la CRON `/api/send-newsletter`
- Chaque prospect reçoit un email personnalisé
- Récurrence gérée automatiquement

### Personnalisation

```
Template: "Bonjour {{contactName}} de {{companyName}}"

Prospect 1: "Bonjour Jean de Acme Inc"
Prospect 2: "Bonjour Marie de Tech Corp"
```

## 📊 Gestion des Campagnes

### Affichage

Vous verrez:
- Nom de la campagne
- Sujet de l'email
- Date d'envoi programmée
- Fréquence
- Nombre de destinataires
- Statut (Programmé/Envoyé/En pause)

### Actions

- **Supprimer** une campagne
- Voir les détails
- Modifier les destinataires (suppression/recréation requise)

## 🧪 Tests Locaux

### Tester l'API

```bash
# Via cURL
curl -X POST http://localhost:3000/api/send-newsletter

# Via JavaScript
fetch('/api/send-newsletter', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

### Vérifier les Logs

```bash
npm run dev

# Les logs s'affichent dans la console
```

## 🔒 Sécurité

✅ Sécurisé:
- Authentification utilisateur requise
- Les données Firestore sont filtrées par userId
- Pas de clés API exposées au client
- Utilise Resend pour les emails (professionnel)

⚠️ À vérifier:
- Les variables d'environnement sont configurées
- Firestore rules restreignent l'accès

## 🐛 Dépannage

### Les emails ne s'envoient pas

1. Vérifiez que la CRON Vercel est activée
2. Vérifiez `RESEND_API_KEY` est valide
3. Vérifiez que la date/heure programmée est passée
4. Consultez les logs Vercel

### Erreur Firebase

- Vérifiez `FIREBASE_ADMIN_SDK` est un JSON valide
- Vérifiez les permissions Firestore

### Erreur Resend

- Vérifiez la clé API
- Vérifiez le domaine d'envoi
- Vérifiez les destinataires

## 📞 Documentation

- **Guide Complet**: [NEWSLETTER_GUIDE.md](./docs/NEWSLETTER_GUIDE.md)
- **Configuration CRON**: [CRON_SETUP.md](./docs/CRON_SETUP.md)
- **API Resend**: https://resend.com/docs

## 🎯 Cas d'Usage Courants

### Suivi Automatique Hebdomadaire
- Créez une campagne récurrente (hebdomadaire)
- Personnalisez par prospect
- Les emails s'envoient chaque semaine automatiquement

### Newsletter Mensuelle
- Créez une campagne mensuelle
- À tous les prospects
- Contenu partiellement personnalisé

### Offre Ponctuée
- Créez une campagne "Une seule fois"
- Ciblage spécifique
- Email immédiat ou programmé

## ✅ Next Steps

1. ✅ Configurer les variables d'environnement
2. ✅ Tester avec une campagne de test
3. ✅ Vérifier que les emails arrivent
4. ✅ Monitorer via Resend Dashboard
5. ✅ Lancer vos vraies campagnes

---

**Version**: 1.0  
**Date**: 19 Février 2026  
**Maintenance**: À partir de v1.1, nous ajouterons:
- Édition de campagnes
- Pause/Reprise de campagnes
- Statistiques d'envoi
- Tests d'emails avant envoi
