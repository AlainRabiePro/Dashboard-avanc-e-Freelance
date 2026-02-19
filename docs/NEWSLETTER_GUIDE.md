# Guide de Configuration - Campagnes de Newsletter

## 📧 Nouvelles Fonctionnalités de Prospection

Vous pouvez maintenant programmer l'envoi de newsletters et emails personnalisés à vos prospects directement depuis votre dashboard.

## ✨ Fonctionnalités Principales

### 1. **Campagnes de Newsletter**
- 📅 Programmez l'envoi à une date et heure spécifique
- 🔁 Envois récurrents (une seule fois, quotidien, hebdomadaire, mensuel)
- 👥 Sélectionnez les prospects destinataires
- 🎨 Contenu personnalisé avec variables dynamiques

### 2. **Variables Personnalisées**
Utilisez ces variables dans votre contenu pour personaliser automatiquement:
- `{{companyName}}` - Nom de l'entreprise
- `{{contactName}}` - Nom du contact
- `{{email}}` - Email du prospect

Exemple:
```
Bonjour {{contactName}},

Je vous contacte concernant un projet pour {{companyName}}.

Cordialement
```

### 3. **Envoi Direct d'Email**
- Envoyez un email immédiatement à un prospect
- Accès rapide via le menu des actions dans la liste des prospects

## 🚀 Guide d'Utilisation

### Créer une Campagne de Newsletter

1. Allez dans **Prospection → Campagnes**
2. Cliquez sur **Nouvelle campagne**
3. Remplissez les informations:
   - **Nom de la campagne**: Un identifiant pour votre campagne
   - **Sujet**: Sujet de l'email (peut contenir des variables)
   - **Contenu**: Le message personnalisé
4. Configurez la planification:
   - **Date d'envoi**: Quand envoyer les emails
   - **Heure d'envoi**: À quelle heure
   - **Fréquence**: Une fois, quotidien, hebdomadaire, mensuel
5. Sélectionnez les destinataires:
   - Utilisez les boutons "Tous" et "Aucun" pour sélectionner rapidement
   - Ou cochez les prospects individuellement
6. Cliquez sur **Créer la campagne**

### Envoyer un Email Direct

1. Allez dans **Prospection**
2. Dans le menu des actions d'un prospect, cliquez sur **Contacter**
3. Remplissez le sujet et le contenu
4. Cliquez sur **Envoyer**

## ⚙️ Configuration Requise

### Variables d'Environnement
```
RESEND_API_KEY=votre_clé_api_resend
RESEND_FROM_EMAIL=noreply@votredomaine.com
FIREBASE_ADMIN_SDK=votre_fichier_service_account_json
```

### Tâche CRON
Pour que les campagnes s'envoient automatiquement, vous devez configurer une tâche CRON qui appelle l'endpoint:

```
POST /api/send-newsletter
```

**Exemple avec Vercel Cron:**
```json
{
  "crons": [{
    "path": "/api/send-newsletter",
    "schedule": "*/15 * * * *"
  }]
}
```

Cette configuration envoie les newsletters toutes les 15 minutes.

## 📊 Gestion des Campagnes

### États des Campagnes
- **Programmé**: En attente d'envoi
- **Envoyé**: Campagne unique complétée
- **En pause**: À implémenter

### Actions Disponibles
- **Supprimer**: Supprimez une campagne
- Voir le détail: Nombre d'emails envoyés, destinataires, etc.

## 🔒 Sécurité

- Seules les campagnes de l'utilisateur connecté sont visibles
- Les emails sont envoyés via Resend (service professionnel d'email)
- Chaque campagne est liée à l'ID utilisateur

## 🎯 Cas d'Utilisation

### Exemple 1: Suivi Automatique Hebdomadaire
- Créer une campagne pour suivre les leads
- Fréquence: Hebdomadaire
- Contenu personnalisé pour chaque prospect
- Chaque semaine, les emails s'envoient automatiquement

### Exemple 2: Annonce Ponctuée
- Annoncer un nouveau service
- Fréquence: Une seule fois
- Cibler les prospects qualifiés
- Email personnalisé avec le contexte de chaque prospect

### Exemple 3: Newsletter Mensuelle
- Envoyer des actualités et offres
- Fréquence: Mensuel
- À tous les prospects actifs
- Contenu partiellement personnalisé

## ❓ FAQ

**Q: Mes campagnes ne s'envoient pas?**
A: Vérifiez que:
1. La tâche CRON est configurée et active
2. Votre clé Resend API est valide
3. Les destinataires sont correctement sélectionnés

**Q: Puis-je modifier une campagne après création?**
A: Pour le moment, supprimez et recréez la campagne.

**Q: Combien de destinataires puis-je avoir?**
A: Dépend de votre plan Resend (généralement illimité pour les envois légitimes)

**Q: Les emails sont-ils vraiment personnalisés?**
A: Oui! Les variables {{}} sont remplacées pour chaque destinataire individuellement.

## 📞 Support

Pour toute question, consultez la documentation Resend:
https://resend.com/docs
