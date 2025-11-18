# Autocinema – AI Movie Library (Next.js)

Autocinema is a Next.js demo that recreates the experience of `web_1_demo_movies` without the Django backend. Movies, genres and variants are loaded from the `/datasets/load` endpoint (`project_key=web_1_demo_movies`, `entity_type=movies`) so you can explore every `?v2-seed=` variant entirely on the client.

## Features
- Cinematic home hero with search, genre/year filters, and dataset-powered movie cards.
- Detail view with metadata, trailer/watchlist/share actions and simulated community comments.
- Related-movie suggestions plus spotlight rows inspired by the original Django templates.
- All assets resolved locally via `public/media/gallery` to match the dataset image paths.

## Running the demo
1. **Install dependencies** (one time):
   ```bash
   npm install
   ```
2. **Expose the datasets API** (default is `http://localhost:8090`, override with `NEXT_PUBLIC_API_URL`).
3. **Enable dataset mode** by exporting `NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE=true` (or `ENABLE_DYNAMIC_V2_DB_MODE=true` in Docker) so the app fetches from `/datasets/load`.
4. **Start the dev server** on port 8002, matching the other webs:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:8002](http://localhost:8002) and pass `?v2-seed=` plus the usual `?seed=` parameter to explore different layouts and datasets just like the other demos.

This folder follows the same workflow as the rest of the webs: `npm run build` for production, `npm run start` to serve the build, and `npm run lint` to run Biome + TypeScript checks.
