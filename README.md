# CRM MKB Logistics

CRM de prospection pour MKB Logistics (mkblogistics.ca), 3PL basé à Laval, Québec.
Next.js 16 (App Router) + Supabase + Tailwind CSS, déployé sur Vercel.

Deux comptes : **Narcisse Rambeloson** (prospecteur) et **Marek Bailly** (président).

## Fonctionnalités

- **Prospects** — table filtrable/triable (statut, priorité, province, angle MKB, semaine), recherche plein texte, export CSV, fiche détaillée éditable en ligne.
- **Leads chauds** — vue cartes triée par priorité, décideur, besoin, actions Narcisse/Marek, RDV.
- **Rappels** — liste groupée (en retard / aujourd'hui / cette semaine / à venir), filtre "mes rappels / tous", cochage rapide.
- **Scripts & courriels** — bibliothèque liée aux prospects, filtrable par type.
- **Tableau de bord** — statistiques clés, rappels du jour, interactions récentes.
- Mises à jour en temps réel (Supabase Realtime) — Narcisse et Marek voient les changements de l'autre instantanément.
- RLS : les deux comptes voient toutes les données ; seul Marek peut modifier `marek_notes`.
- Interface en français, couleurs de marque MKB (navy `#0F172A`, bleu `#3B82F6`), responsive mobile.

## 1. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com), créer un nouveau projet.
2. Dans **SQL Editor**, exécuter dans l'ordre :
   - `supabase/migrations/0001_schema.sql` (tables, triggers, index, realtime)
   - `supabase/migrations/0002_rls.sql` (row level security)
3. Dans **Authentication → Users**, créer les deux comptes manuellement (« Add user » → « Create new user », avec mot de passe) :
   - `narcisse@mkblogistics.ca`
   - `marek@mkblogistics.ca`

   La création déclenche automatiquement un profil dans `public.profiles` (rôle `prospecteur` pour Narcisse, `president` pour Marek — voir le trigger `handle_new_user`).
4. (Optionnel) Charger les leads et rappels pré-remplis en exécutant `supabase/seed.sql` **après** avoir créé les deux comptes (le script résout les emails vers les UUID des utilisateurs).
5. Dans **Project Settings → API**, noter :
   - `Project URL`
   - `anon public` key

## 2. Configuration locale

```bash
cp .env.local.example .env.local
```

Remplir `.env.local` avec l'URL et la clé anonyme du projet Supabase :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) — redirige vers `/login`.

## 3. Déploiement sur Vercel

1. Pousser ce dépôt sur GitHub (déjà fait si vous lisez ceci depuis la branche `claude/mkb-logistics-crm-n0zzba`).
2. Sur [vercel.com](https://vercel.com), **Add New → Project**, importer le dépôt GitHub.
3. Framework preset : Next.js (détecté automatiquement).
4. Ajouter les variables d'environnement (Project Settings → Environment Variables) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Déployer. Vercel construit et héberge automatiquement à chaque push sur la branche liée.
6. Dans Supabase → **Authentication → URL Configuration**, ajouter l'URL Vercel (`https://votre-projet.vercel.app`) aux **Redirect URLs** / **Site URL**.

## Structure du projet

```
src/
  app/
    login/                  Page de connexion (Supabase Auth)
    (app)/                  Routes protégées (sidebar + garde d'authentification)
      dashboard/
      prospects/            Liste + /prospects/[id] (détail)
      leads/
      reminders/
      scripts/
  components/                Composants partagés (badges, tableau, formulaires, éditeurs en ligne)
  lib/
    supabase/                Clients Supabase (navigateur, serveur, middleware)
    types.ts                 Types TypeScript alignés sur le schéma SQL
    constants.ts              Libellés français + couleurs de statut
    useRealtimeRows.ts        Hook de synchronisation temps réel générique
supabase/
  migrations/                 Schéma SQL + RLS
  seed.sql                    Données de démarrage (leads/rappels du document source)
legacy/
  index.html                  Ancien prototype HTML statique (conservé pour référence)
```

## Notes techniques

- Le générateur `create-next-app` a installé Next.js 16 (dernière version stable de la branche App Router) plutôt que Next.js 14 — l'App Router et toute l'architecture demandée sont identiques ; c'est simplement une version plus récente et activement maintenue.
- Les types Supabase (`src/lib/types.ts`) sont écrits à la main (pas d'accès à `supabase gen types` dans cet environnement). Si le schéma SQL change, mettre à jour ce fichier en conséquence.
- `marek_notes` est protégé au niveau trigger PostgreSQL (`protect_marek_notes`), pas seulement côté interface : toute tentative de modification par un compte non-président est silencieusement ignorée côté base de données.
