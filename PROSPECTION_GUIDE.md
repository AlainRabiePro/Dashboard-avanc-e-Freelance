# Page de Prospection - Guide Utilisateur

## Qu'est-ce qui a été créé ?

J'ai créé une page de prospection complète pour votre dashboard qui vous permet de gérer votre pipeline commercial.

## Fonctionnalités

### 1. **Page Principale de Prospection** (`/dashboard/prospection`)
   - Vue d'ensemble avec **statistiques en temps réel** :
     - Total de prospects
     - Nouveaux prospects
     - Prospects en cours (Contactés, Qualifiés, Intéressés)
     - Prospects convertis
   
   - **Tableau affichant tous vos prospects** avec :
     - Nom de l'entreprise
     - Nom du contact
     - Statut (avec badges colorés)
     - Email
     - Date du dernier contact
     - Source du prospect
     - Menu d'actions

   - **Actions disponibles** pour chaque prospect :
     - Modifier les détails
     - Contacter via email
     - Supprimer le prospect

### 2. **Créer un Nouveau Prospect** (`/dashboard/prospection/new`)
   - Formulaire complet avec les champs :
     - Nom de l'entreprise *
     - Nom du contact *
     - Email *
     - Téléphone
     - Site web
     - Secteur d'activité
     - Source (où vous avez trouvé ce prospect)
     - Budget estimé (€)
     - Dernier contact (date)
     - Suivi prévu (date)
     - Statut * (Nouveau, Contacté, Qualifié, Intéressé, Proposition envoyée, Gagné, Perdu)
     - Remarques

   (*) Champs obligatoires

### 3. **Modifier un Prospect** (`/dashboard/prospection/[id]`)
   - Accédez en cliquant sur le bouton "Modifier" dans le tableau
   - Modifiez tous les détails du prospect
   - Les modifications sont sauvegardées automatiquement

## Structure des Données

Un prospect contient les informations suivantes :
- Identification : ID, Date de création/modification
- Informations de l'entreprise : Nom, secteur d'activité, site web
- Informations du contact : Nom, email, téléphone
- Suivi commercial : Statut, date du dernier contact, date de suivi prévu
- Informations commerciales : Source, budget estimé
- Notes additionnelles

## Statuts Disponibles

1. **Nouveau** - Prospect venant d'être ajouté
2. **Contacté** - Vous avez pris contact
3. **Qualifié** - Prospect a montré de l'intérêt
4. **Intéressé** - Prospect est clairement intéressé
5. **Proposition Envoyée** - Vous avez envoyé une proposition
6. **Gagné** - Prospect converti en client
7. **Perdu** - Prospect n'a pas avancé

## Traductions

La page est disponible en :
- 🇫🇷 Français
- 🇬🇧 Anglais
- 🇪🇸 Espagnol

Changez la langue dans les paramètres pour voir les traductions appliquées automatiquement.

## Firebase

Les données des prospects sont stockées dans Firestore sous la collection `prospects`.

Chaque prospect est associé à l'utilisateur via son `userId`, donc chaque utilisateur voit uniquement ses propres prospects.

## Fichiers Créés/Modifiés

### Fichiers Créés :
- `/src/app/dashboard/prospection/new/page.tsx` - Page pour créer un nouveau prospect
- `/src/app/dashboard/prospection/new/prospect-form.tsx` - Formulaire réutilisable
- `/src/app/dashboard/prospection/[id]/page.tsx` - Page pour modifier un prospect

### Fichiers Modifiés :
- `/src/app/dashboard/prospection/page.tsx` - Page principale avec tableau et statistiques
- `/src/lib/types.ts` - Ajout du type `Prospect`
- `/src/locales/fr.json` - Traductions françaises
- `/src/locales/en.json` - Traductions anglaises
- `/src/locales/es.json` - Traductions espagnoles

## Prochaines Étapes (Optionnel)

Si vous voulez améliorer encore plus cette page, vous pourriez :
- Ajouter des filtres par statut
- Ajouter un graphique du pipeline commercial
- Ajouter des rappels/notifications pour les suivis
- Exporter les données en CSV
- Ajouter des notes/historique de communications
- Intégrer avec un CRM externe
