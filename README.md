# 🗓️ Agenda Pro — SaaS de gestion de rendez-vous

Application web complète pour indépendants (coachs, coiffeurs, consultants, kinés...) pour gérer clients, rendez-vous, paiements et notifications.

## Stack technique
- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Drizzle ORM** + **PostgreSQL**
- **NextAuth v5** (authentification JWT)
- **Resend** (emails transactionnels)
- **FullCalendar** (vue calendrier interactive)
- **Stripe** (paiements, optionnel)

## Fonctionnalités
- ✅ Authentification (inscription, connexion, reset mot de passe)
- ✅ Dashboard avec statistiques en temps réel
- ✅ CRUD clients complet (nom, email, téléphone, notes, historique)
- ✅ Gestion rendez-vous avec calendrier interactif (semaine/mois/jour)
- ✅ Statuts RDV : confirmé, en attente, annulé, terminé
- ✅ Emails automatiques (confirmation, rappel, annulation) via Resend
- ✅ Suivi des paiements et revenus
- ✅ Interface responsive mobile
- ✅ Paramètres profil

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL (local ou Neon/Supabase/Railway)

### 1. Cloner et installer
```bash
cd agenda-pro
npm install
```

### 2. Variables d'environnement
Copier `.env.example` en `.env.local` et remplir :
```bash
cp .env.example .env.local
```

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/agenda_pro"

# NextAuth (génère avec: openssl rand -base64 32)
AUTH_SECRET="ton-secret-32-chars-minimum"
NEXTAUTH_URL="http://localhost:3000"

# Resend (emails) — optionnel pour tester
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM="Agenda Pro <noreply@tondomaine.fr>"

# Stripe (paiements) — optionnel
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxx"
```

### 3. Créer la base de données
```bash
# Créer la DB PostgreSQL
createdb agenda_pro

# Créer toutes les tables
npm run db:migrate
```

### 4. Données de démo (optionnel)
```bash
npm run db:seed
```
Crée un compte démo : **demo@agendapro.fr** / **demo1234**

### 5. Lancer
```bash
npm run dev
```
Ouvrir [http://localhost:3000](http://localhost:3000)

---

## 📁 Structure du projet
```
app/
  (auth)/           # Login, register, reset password
  (dashboard)/      # Pages protégées (dashboard, clients, calendrier...)
  api/              # Routes API REST
components/
  layout/           # Sidebar, Topbar
  ui/               # Composants réutilisables (Button, Modal, Card...)
  clients/          # ClientModal
  appointments/     # AppointmentModal
  charts/           # RevenueChart
lib/
  auth.ts           # NextAuth config
  db.ts             # Connexion Drizzle/PostgreSQL
  schema.ts         # Schéma de base de données
  email.ts          # Emails Resend
  utils.ts          # Helpers (dates, formatage...)
  validations.ts    # Schémas Zod
scripts/
  migrate.ts        # Création des tables
  seed.ts           # Données de démonstration
```

## 🛠️ Scripts disponibles
```bash
npm run dev          # Développement
npm run build        # Build production
npm run db:migrate   # Créer/mettre à jour les tables
npm run db:seed      # Remplir avec des données de démo
npm run db:studio    # Interface visuelle Drizzle Studio
npm run db:push      # Sync schéma sans migration
```

## 🌐 Déploiement (Vercel)
1. Push sur GitHub
2. Importer dans Vercel
3. Ajouter les variables d'environnement
4. Utiliser Neon ou Supabase pour PostgreSQL

```bash
# DATABASE_URL Neon format:
postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/agenda_pro?sslmode=require
```

## 📧 Emails avec Resend
1. Créer un compte sur [resend.com](https://resend.com)
2. Vérifier ton domaine
3. Ajouter `RESEND_API_KEY` dans `.env.local`

Sans clé Resend, les URLs de réinitialisation s'affichent dans la console serveur.

## 💳 Paiements Stripe
1. Créer un compte [Stripe](https://stripe.com)
2. Récupérer les clés API (mode test)
3. Ajouter dans `.env.local`
4. Configurer les webhooks : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
