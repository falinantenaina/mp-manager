# FB MP Manager

PWA de gestion des messages Facebook — notification temps réel pour l'équipe.

## Stack
- **Next.js 14** (App Router)
- **NextAuth.js** (auth Credentials)
- **Prisma** + **PostgreSQL**
- **SSE** (Server-Sent Events) pour le temps réel dans l'app
- **Web Push API** pour les notifications push Android (app fermée)

## Démarrage rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer l'environnement
```bash
cp .env.example .env
```
Remplissez `.env` :
- `DATABASE_URL` → votre PostgreSQL
- `NEXTAUTH_SECRET` → `openssl rand -base64 32`
- `NEXTAUTH_URL` → URL de votre appli en prod
- Clés VAPID → `npx web-push generate-vapid-keys`

### 3. Base de données
```bash
npm run db:push     # Crée les tables
npm run db:seed     # Crée les comptes par défaut
```

Comptes créés :
| Rôle     | Email                  | Mot de passe  |
|----------|------------------------|---------------|
| Admin    | admin@fbmp.local       | admin123      |
| Employé  | employe@fbmp.local     | employee123   |

> ⚠️ Changez ces mots de passe en production via Prisma Studio : `npx prisma studio`

### 4. Lancer en développement
```bash
npm run dev
```

### 5. Build production
```bash
npm run build
npm run start
```

## Déploiement recommandé

**Railway.app** (le plus simple, PostgreSQL inclus) :
1. Créer un projet Railway
2. Ajouter un service PostgreSQL → copier l'URL dans `DATABASE_URL`
3. Déployer le repo GitHub
4. Ajouter toutes les variables d'env dans les settings
5. Lancer `npm run db:push && npm run db:seed` via Railway Shell

**VPS (DigitalOcean / Contabo)** :
- Node.js 20+, PostgreSQL, PM2, Nginx reverse proxy

## Ajouter des employés

Via Prisma Studio :
```bash
npx prisma studio
```
Ou créer une route `/api/users` protégée admin (voir TODO ci-dessous).

## Architecture des notifications

```
Employé signale un MP
  → POST /api/tickets
    → web-push → notification Android (même app fermée)
    → SSE broadcast → mise à jour temps réel si app ouverte
```

## TODO (évolutions)
- [ ] Page admin de gestion des utilisateurs (ajouter/supprimer employés)
- [ ] Historique avec pagination
- [ ] Statistiques par employé
- [ ] Thème sombre automatique (déjà partiellement en CSS)
- [ ] Lien direct m.me auto-complété depuis le nom Facebook
