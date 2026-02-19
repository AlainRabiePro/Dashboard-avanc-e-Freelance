# **App Name**: Nexlance

## Schéma de parcours utilisateur idéal

| Type d’utilisateur         | Parcours recommandé                                                                 |
|---------------------------|-----------------------------------------------------------------------------------|
| Nouveau visiteur          | Page de présentation → Register → Dashboard                                         |
| Freelance déjà inscrit    | Page de présentation → Login → Dashboard (ou auto‑connexion si possible)            |
| Client potentiel          | Page de présentation → CTA “Découvrir” / “Essai gratuit” → Register                 |

## Core Features:

- Authentication et Profil: Permettre aux freelances de s'inscrire, de se connecter et de gérer leur profil utilisateur, incluant la mise à jour des informations personnelles et de leur rôle. Stockage et récupération des données 'users' depuis Firestore.
- Gestion des Projets: Fonctionnalités CRUD pour créer, consulter, modifier et supprimer des projets. Visualisation des projets, filtrage par statut et tri par date. Les données sont gérées dans la collection 'projects' de Firestore, en respectant les règles de sécurité.
- Gestion des Clients: Permettre de gérer un répertoire de clients (CRUD), incluant le statut du client (Prospect, Actif, Inactif) et des notes. Utilise la collection 'clients' de Firestore avec accès contrôlé par userId.
- Gestion des Tâches et Sous-traitants: Organiser les tâches associées aux projets (CRUD), assigner des sous-traitants, et suivre leur progression via différents statuts et priorités. Gérer la liste des sous-traitants. S'appuie sur les collections 'tasks' et 'subcontractors' dans Firestore.
- Planification et Événements: Visualiser et gérer un calendrier d'événements, incluant les réunions, échéances et revues, avec la possibilité d'ajouter et de modifier des entrées. Les données sont stockées dans la collection 'scheduleEvents' de Firestore.
- Gestion des Factures et Devis: Créer, envoyer, suivre et archiver les factures et devis. Suivi des statuts (Brouillon, Envoyé, Payé, Retard, Accepté, Rejeté). Interagit avec les collections 'invoices' et 'quotes' de Firestore.
- Assistant de Description IA: Un outil basé sur l'IA pour aider à générer des descriptions détaillées pour les postes de factures et les éléments de devis, améliorant l'efficacité de la rédaction et la cohérence.

## Style Guidelines:

- Scheme: Light.
- Primary color: A sophisticated, desaturated blue (#376B94) to convey professionalism and trustworthiness.
- Background color: A very light, subtle blue-tinted grey (#EEF4F7) for a clean and unobtrusive base.
- Accent color: A vibrant cyan-aqua (#2AB4B4) to highlight interactive elements and important information, ensuring strong contrast and a modern feel.
- Headline and body font: 'Inter' (sans-serif) for its modern, clear, and objective readability, essential for data-dense dashboards.
- Use a set of clean, modern, and consistently outlined icons. This choice ensures clarity and reduces visual clutter in a functional interface.
- A responsive, column-based layout with a persistent left-hand navigation sidebar to efficiently display data and allow quick access to main sections.
- Subtle, fluid animations for state changes (e.g., loading indicators, menu expansions) to provide a polished user experience without distractions.