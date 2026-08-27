# StoreControlOS — Multi-Store Command Center

A rebuild of the original concept: a CEO-facing dashboard that lets a business
owner switch between showrooms and see **that store's own live operational
data** — sales, inventory, staff, expenses, and customers — plus a cross-store
"All Stores" command view.

## Why this was rebuilt instead of edited

The uploaded file (`storecontrolos-dashboard-build.zip`) was a compiled,
minified static export (a Figma Make build output) with no readable source —
one 62-line JS bundle, no components, no data layer. There was nothing to
safely "upgrade" — any change to a minified bundle would have been unmaintainable.
This is a clean rebuild of the same product concept with real architecture:

- **A real backend** behind the store switcher. Selecting a store fires an
  actual HTTP request scoped to that store's ID (`GET /api/stores/:id/dashboard`)
  — it is not a local object swap. This is the part that makes "shows their
  real store's own data" true rather than cosmetic.
- **A single seam to swap in real data.** Every number currently comes from a
  deterministic mock generator (`backend/lib/generate.js`), seeded per store
  so numbers are stable and genuinely distinct per showroom. Replacing that
  one file's internals with real POS/inventory/HR/accounting queries is the
  entire migration to production data — nothing in `server.js` or the
  frontend needs to change.
- **Ultra-premium UI**, custom-designed (not a template): a "control room"
  aesthetic with a live-signal store switcher (status dot + synced timestamp
  per store), glass panels, brass/ink palette, and a Space Grotesk / Inter /
  IBM Plex Mono type system.

## Stack

- **Backend:** Node.js + Express, file-backed store registry (`backend/data/db.json`)
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Recharts + lucide-react

## Running it locally

You'll need Node.js 18+ installed.

**Terminal 1 — backend:**
```bash
cd backend
npm install
npm run dev
```
This starts the API on `http://localhost:4000`. On first run it seeds four
demo showrooms into `backend/data/db.json`.

**Terminal 2 — frontend:**
```bash
cd frontend
npm install
npm run dev
```
This starts the app on `http://localhost:5173` (Vite proxies `/api` calls to
the backend automatically — no CORS config needed on your end).

Open `http://localhost:5173`. Click between showrooms in the sidebar — watch
the network tab and you'll see a fresh `/api/stores/:id/dashboard` request
fire on every switch. Click "All Stores" for the CEO cross-store view.

## Deploying it live (Railway or Render — one service, not Netlify)

This app is a real backend + frontend, not a static site, so it can't be
dropped on Netlify as-is (Netlify hosts static files/serverless functions,
not a persistent Node server). Instead, the backend now serves the built
frontend directly (see the bottom of `backend/server.js`), so the whole app
deploys as **one service** — no separate frontend host, no CORS config.

**Railway:**
1. Push this project to a GitHub repo.
2. In Railway: New Project → Deploy from GitHub repo → select it.
3. Railway reads `nixpacks.toml` automatically and runs `npm run build`
   then `npm run start`. No manual config needed.
4. Once deployed, open the generated `*.up.railway.app` URL — that's your
   live app, frontend and API both.

**Render (alternative):**
1. Push to GitHub.
2. In Render: New → Blueprint → point it at the repo. It reads
   `render.yaml` automatically and does the same build/start as above.

**On data persistence:** `backend/data/db.json` lives on the service's
local disk. On Railway/Render's default (non-persistent) filesystem, that
file resets on every redeploy — fine for a demo, but it's the reason item 3
below (a real database) matters before this has real customers whose added
showrooms need to survive a deploy.

**If you ever do want the frontend on Netlify specifically** (e.g. for its
CDN/edge features), the split-hosting path still works: deploy `frontend/`
to Netlify, deploy `backend/` to Railway/Render on its own, and set the
`VITE_API_URL` environment variable in Netlify to the backend's URL —
`api.ts` already reads that variable and falls back to a relative path
when it's unset, so no code changes are needed either way.

## What to extend first (in priority order)

1. **Wire in real data.** Replace the body of `buildDashboardForStore()` in
   `backend/lib/generate.js` with real queries — POS API for sales, your
   inventory system for stock, HR/payroll for staff, accounting export for
   expenses. Keep the same return shape and the frontend needs zero changes.

2. **Add authentication + per-store access control.** Right now anyone who
   loads the app can see every store — fine for a prototype, not for
   production. Add auth (e.g. a proper auth provider) and scope which store
   IDs a given login can query server-side, not just hide-in-the-UI. This is
   the single most important thing before onboarding a real paying customer,
   since data leakage across locations is the trust-killer for this category.

3. **Swap the JSON file for a real database.** `backend/lib/db.js` is
   intentionally isolated so this is a contained change (Postgres via Prisma,
   or Supabase, are natural fits) — the function signatures
   (`listStores`, `getStore`, `addStore`, `removeStore`) are the contract to
   preserve.

4. **Turn the 30-second poll into push updates.** The sidebar currently
   polls `/api/stores` every 30s for health status. A websocket or SSE
   channel would make the "live" claim fully real-time and let you drop
   alerts into the UI the moment they happen (e.g. a stockout at 2pm shows
   up without a refresh).

5. **Alert delivery beyond the dashboard.** The alerts panel already computes
   real signal (low stock, thin margin, attendance dips, revenue drops) —
   the natural next step is pushing critical ones to email/SMS/WhatsApp so
   the CEO doesn't have to be looking at the screen when a store needs
   attention. This is usually the feature that turns "nice dashboard" into
   "I'd pay for this."

6. **Date-range picker.** The header has a placeholder for it; today
   everything is hardcoded to a 7/14-day window. Wiring a real range selector
   through to the backend query is straightforward once real data queries
   exist (item 1).
