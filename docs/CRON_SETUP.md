# Configuration CRON pour l'Envoi Automatique de Newsletters

## 📋 Étapes de Configuration

### 1. Configurer vercel.json (Vercel Cron)

Si vous utilisez **Vercel**, créez ou mettez à jour le fichier `vercel.json` à la racine du projet:

```json
{
  "crons": [
    {
      "path": "/api/send-newsletter",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

**Explications des horaires:**
- `*/15 * * * *` = Toutes les 15 minutes
- `0 9 * * *` = Chaque jour à 9h (UTC)
- `0 9 * * 1` = Chaque lundi à 9h (UTC)
- `0 9 1 * *` = Le 1er de chaque mois à 9h (UTC)

### 2. Configurer les Variables d'Environnement

Ajoutez ces variables dans votre `.env.local` ou Vercel Dashboard:

```bash
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@votredomaine.com

# Firebase Admin
FIREBASE_ADMIN_SDK='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

### 3. Récupérer les Clés

#### Clé Resend API
1. Allez sur https://resend.com/api-keys
2. Créez une nouvelle clé API
3. Copiez-la dans `RESEND_API_KEY`

#### Firebase Service Account
1. Allez sur Firebase Console
2. Paramètres du projet → Comptes de service
3. Cliquez sur "Générer une nouvelle clé privée"
4. Copiez le contenu JSON dans `FIREBASE_ADMIN_SDK`

### 4. Déployer sur Vercel

```bash
# Commitez vercel.json
git add vercel.json
git commit -m "Add newsletter cron job"
git push

# Vercel détectera automatiquement et configurera la tâche CRON
```

## 🧪 Test en Local

### Tester manuellement

```bash
# Via cURL
curl -X POST http://localhost:3000/api/send-newsletter

# Via Node.js
node -e "fetch('http://localhost:3000/api/send-newsletter', {method: 'POST'}).then(r => r.json()).then(console.log)"
```

### Logs
```bash
# Vérifier les logs en développement
npm run dev

# Ou en production via Vercel
# Accédez à: https://vercel.com/dashboard → Logs
```

## 📊 Monitoring

### Vérifier que la CRON fonctionne

1. **Vercel Dashboard**
   - Allez sur votre projet
   - Onglet "Functions"
   - Cherchez "send-newsletter"
   - Vérifiez les exécutions récentes

2. **Firebase Console**
   - Allez dans Firestore
   - Vérifiez que les campagnes mises à jour
   - Vérifiez les timestamps "lastSendDate"

3. **Resend Dashboard**
   - https://resend.com/emails
   - Vérifiez que les emails sont envoyés

## 🔧 Dépannage

### Les campagnes ne s'envoient pas

**Vérifier:**
1. La CRON est-elle activée dans Vercel?
2. Les variables d'environnement sont-elles correctes?
3. Y a-t-il des campagnes programmées?
4. La date/heure programmée est-elle passée?

**Solution:**
```bash
# Test manuel via Vercel CLI
vercel dev

# Puis appelez l'endpoint
curl -X POST http://localhost:3000/api/send-newsletter
```

### Erreur Firebase Admin

```
Error: FIREBASE_ADMIN_SDK environment variable is not set or invalid
```

**Solution:**
1. Vérifiez que `FIREBASE_ADMIN_SDK` est un JSON valide
2. Copiez-collez le fichier .json complet
3. Dans Vercel, utilisez l'éditeur JSON

### Erreur Resend API

```
Error: Invalid Resend API key
```

**Solution:**
1. Générante une nouvelle clé sur https://resend.com/api-keys
2. Formatez comme: `re_xxxxx...`
3. Testes avec cURL:
```bash
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"noreply@example.com","to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'
```

## 📈 Optimisation

### Intervalle CRON Recommandé

- **Haute fréquence**: `*/5 * * * *` (toutes les 5 min) - Si beaucoup de campagnes
- **Standard**: `*/15 * * * *` (toutes les 15 min) - Recommandé
- **Basse fréquence**: `0 * * * *` (chaque heure) - Si peu de campagnes

### Limites Resend

- Plan Gratuit: 100 emails/jour
- Plan Pro: Illimité
- Vérifiez les limites de votre plan

## 🔐 Sécurité

✅ À faire:
- Utilisez des clés API fortes
- Stockez les secrets dans Vercel, pas en local
- Limitez les permissions Firebase au strict nécessaire

❌ À ne pas faire:
- Ne commitez jamais les clés API
- Ne partagez pas vos fichiers .env
- N'utilisez pas de clés API génériques

## ✅ Checklist de Configuration

- [ ] `vercel.json` créé avec la CRON
- [ ] `RESEND_API_KEY` configurée
- [ ] `RESEND_FROM_EMAIL` configurée  
- [ ] `FIREBASE_ADMIN_SDK` configurée
- [ ] Déployé sur Vercel
- [ ] Test manuel réussi
- [ ] Campagne de test créée
- [ ] Vérification des emails reçus

## 🎯 Prochaines Étapes

1. Créez une campagne de test
2. Attendez le prochain cycle CRON
3. Vérifiez que l'email est arrivé
4. Monitez via le dashboard Resend
5. Ajustez l'intervalle CRON si nécessaire
