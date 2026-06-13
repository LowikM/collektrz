# Handoff — Pokémon Event Trade

## Start here

Read `PROJECT_CONTEXT.md` first. Use the **actual Supabase schema** below — do not invent columns like `date`, `description`, `title`, or `target_price` (column exists in DB but is unused).

## Already built

- **Auth:** email sign up/in/out; `lib/supabase/client.ts`, `server.ts`, `middleware.ts`; protected `/profile`
- **Events:** public `/events` list + `/events/[id]` detail (name, location, start/end dates)
- **Listings:** create at `/events/[id]/new-listing`; **only `active` listings** on event detail
- **Interests:** express interest on listings; duplicate prevention; count + “Interested” state
- **My Listings:** protected `/my-listings` — owner’s listings, interested users, status updates
- **UI:** `Navbar`, `EventCard`, `ListingInterest`
- **Stack:** Next.js 16 App Router, React 19, Tailwind v4, Supabase SSR

## Build next (priority order)

1. **Join event** — use `events.join_code`
2. **Home page** — replace Next.js starter

## Supabase schema

**`events`:** `id`, `name`, `location`, `start_date`, `end_date`, `join_code`, `created_by`, `created_at`

**`listings`:** `id`, `event_id`, `user_id`, `type` (`want`|`trade`|`sale`), `card_name`, `card_ref` (required), `trade_for`, `status` (`active`|`reserved`|`completed`|`removed`), `condition`, `set_name`, `notes`, `created_at`, `updated_at`

**`interests`:** `id`, `listing_id`, `user_id`, `message`, `created_at`

**`users`:** `id`, `email`, `display_name`, `created_at`

**Links:** `event_id` → event; `user_id` → auth user; `listing_id` → listing; interests embed `users` via `user_id`

## Current status

| Area | Status |
|---|---|
| Auth | Done |
| Events list/detail | Done |
| Create listing | Done |
| Listings display | Done |
| Interests | Done |
| My Listings | Done |
| Listing status management | Done |
| Join event | Not started |

## Tips for the next chat

- Run `npm run dev` (Turbopack). Env in `.env.local`.
- Use Server Components + Server Actions; middleware refreshes auth cookies.
- Status updates: `updateListingStatus` in `app/my-listings/actions.ts`; revalidate `/my-listings` and `/events/[id]`.
- Event pages filter `listings.status = 'active'` only.
- After changes: `npm run build`.
