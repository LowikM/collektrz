# Collektrz

**Collect. Connect. Trade.**

Collektrz is a modern marketplace and community for collectors. Browse in-person trading events, manage your collection and wishlist, post listings, find trade matches, and connect with other collectors — whether you collect Pokémon, Yu-Gi-Oh!, Magic, sports cards, comics, LEGO, or anything else.

## Tech stack

- **Next.js 16** (App Router)
- **React 19**, **TypeScript**
- **Tailwind CSS v4**
- **Supabase** — Postgres, Auth, RLS

## Getting started

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Set required values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `POKEMON_TCG_API_KEY` (optional — improves Pokémon TCG API rate limits for Set Browser and card search)

3. Apply Supabase migrations (see `RELEASE_CHECKLIST.md` and `supabase/migrations/`).

4. Run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Key routes

| Route | Access |
|---|---|
| `/` | Landing (guest) or collector dashboard (signed in) |
| `/events` | Public event list |
| `/events/[id]` | Public event detail + listings |
| `/login` | Sign in / sign up |
| `/my-collection`, `/my-wishlist`, `/sets` | Protected collector tools |
| `/my-listings`, `/my-matches`, `/messages` | Protected trading tools |

See `PROJECT_CONTEXT.md` for full route and schema documentation.

## Deploy

Deploy to Vercel with the env vars listed in `.env.example`. See `RELEASE_CHECKLIST.md` for pre-release steps.

## Documentation

- `PROJECT_CONTEXT.md` — architecture, schema, features
- `HANDOFF.md` — developer handoff notes
- `RELEASE_CHECKLIST.md` — deployment checklist
