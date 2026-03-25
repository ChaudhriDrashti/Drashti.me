# Aero Portfolio Hub (Neon + Local Admin)

This repository is configured as a local-first personal portfolio with a Neon-backed admin API built with:

- Vite
- React + TypeScript
- Tailwind CSS
- shadcn/ui components
- Framer Motion
- Node.js + Express API
- Neon Postgres

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the app:

```text
http://localhost:8080
```

`npm run dev` starts both:

- Web app on `http://localhost:8080`
- API server on `http://localhost:3001`

## Environment

Set these values in `.env`:

- `NEON_DATABASE_URL` (required)
- `JWT_SECRET` (required)
- `ADMIN_EMAIL` (optional, default `admin@portfolio.local`)
- `ADMIN_PASSWORD` (optional, default `admin123`)
- `ADMIN_ROLE` (optional, default `admin`)
- `API_PORT` (optional, default `3001`)
- `VITE_API_URL` (leave empty for local proxy)

For production, copy `.env.example` and set real values:

- `NODE_ENV=production`
- `JWT_SECRET` must be a strong secret
- `ADMIN_PASSWORD` must not be the default
- `CORS_ORIGIN` should be your frontend domain(s), comma-separated if multiple

## Build for Production

```bash
npm run build
npm run preview
```

## Deploy Ready Commands

Install and build frontend:

```bash
npm install
npm run build
```

Run API in production mode:

```bash
npm run start
```

Health check endpoint:

```text
GET /api/health
```

## Deploy to Vercel

This project is configured for Vercel with:

- Static frontend build from Vite (`dist/`)
- Node API from `server/index.js`
- API routes under `/api/*`

### Steps

1. Import the repository in Vercel.
2. Framework preset: `Other` (Vercel uses `vercel.json`).
3. Add environment variables in Vercel Project Settings:

- `NEON_DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_ROLE`
- `API_PORT` (optional)
- `NODE_ENV=production`
- `CORS_ORIGIN=https://your-vercel-domain.vercel.app`
- `VITE_API_URL` (leave empty for same-domain `/api` calls)
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

4. Deploy.

### Notes

- `server/index.js` auto-runs as serverless on Vercel (no local `listen()` there).
- Upload files are stored in `/tmp/uploads` on Vercel and are ephemeral; for durable media persistence use a persistent object storage strategy.

## Recommended Deployment Topology

- Frontend: deploy `dist/` to static hosting (Netlify/Vercel/Azure Static Web Apps/etc.)
- Backend API: deploy `server/index.js` as Node service (Render/Railway/Fly/Azure App Service/etc.)
- Database: Neon Postgres via `NEON_DATABASE_URL`

Set `VITE_API_URL` in frontend build environment to your deployed API base URL when frontend/backend are on different domains.

## Security Checklist Before Going Live

- Do not commit `.env` files; use `.env.example` as template
- Rotate any previously exposed secrets
- Set a strong `JWT_SECRET`
- Set a strong `ADMIN_PASSWORD`
- Restrict `CORS_ORIGIN` to trusted frontend origins

## Project Notes

- Public portfolio is available on `/`.
- Admin login is available on `/login` and protected admin pages are under `/admin/*`.
- Contact form writes messages to the Neon `contact_messages` table.
- On first API startup, tables are auto-created and a default admin user is seeded.
