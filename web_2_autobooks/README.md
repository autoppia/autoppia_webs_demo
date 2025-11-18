# Autobooks – AI Reading Room (Next.js)

Autobooks mirrors the behaviour of `web_2_demo_books` but runs entirely on the client. Every catalog item, layout variant and user interaction is hydrated via the shared `/datasets/load` endpoint (`project_key=web_2_demo_books`, `entity_type=books`), so the app behaves like the Django original without shipping a backend.

## Features
- Responsive home screen with hero, search, genre/year filters, spotlight rows and a layout system that pulls one of 10 variants from the unified seed resolver.
- Detail page with preview/share/bookmark actions, simulated reader comments and validator controls that only emit telemetry (`edit.event`, `delete.event`).
- Login/profile workflow for miners: credentials go from `user1` to `user256` (all using `PASSWORD`) and each account gets one assigned book to review, edit or delete (event-only).
- Contact section wired to `contact.message`, plus client-side logging for search/filter/detail events so you can trace the whole flow in `scripts/webs_server`.
- Single-seed resolver (`?seed=`) that maps to layout (v1) + dataset (v2) seeds, respecting `?enable_dynamic=` to toggle the layers just like the other Next.js webs.

## Running the demo
1. **Install dependencies** (first run):
   ```bash
   npm install
   ```
2. **Expose the datasets API**. All data is fetched from `http://localhost:8090/datasets/load` (override with `NEXT_PUBLIC_API_URL`). If you use Docker, bring up `webs_server` first: `docker compose -p webs_server up -d`.
3. **Enable dataset mode** by exporting `NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE=true` (or `ENABLE_DYNAMIC_V2_DB_MODE=true` inside Docker) so the client requests the DB-backed pools.
4. **Start the dev server** (defaults to port `8002`; pass `-p` to change it if you are running another demo on the same port):
   ```bash
   npm run dev
   ```
5. Visit [http://localhost:8002](http://localhost:8002) and append `?seed=42` (or any value between 1–300). The app will derive the layout + dataset seeds automatically. Use `?enable_dynamic=v1,v2` to force-enable layers or `?enable_dynamic=v1` to disable dataset shuffling.

## Production build
- `npm run build` – compile the Next.js app.
- `npm run start` – serve the production build (respects the same env vars).
- `npm run lint` – Biome + TypeScript checks used by the other webs.

All telemetry is posted to `/api/log-event`, so you can point Playwright miners to this app and audit the resulting events exactly like in the Django-based experience.
