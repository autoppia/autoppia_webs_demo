# Autocinema – AI Movie Library (Next.js)

Autocinema is a Next.js demo that recreates the experience of `web_1_demo_movies` without the Django backend. Movies, genres and variants are loaded from the `/datasets/load` endpoint (`project_key=web_1_autocinema`, `entity_type=movies`). The v2 seed is automatically derived from the base `?seed=` parameter, so you only need to pass `?seed=XYZ` in the URL.

## Features
- Cinematic home hero with search, genre/year filters, and dataset-powered movie cards.
- Detail view with metadata, trailer/watchlist/share actions and simulated community comments.
- Related-movie suggestions plus spotlight rows inspired by the original Django templates.
- Self-serve login/registration so validators can create a local curator account instantly.
- All assets resolved locally via `public/media/gallery` to match the dataset image paths.

## Running the demo
1. **Install dependencies** (one time):
   ```bash
   npm install
   ```
2. **Expose the datasets API** (default is `http://localhost:8090`, override with `NEXT_PUBLIC_API_URL`).
3. **Enable dataset mode** by exporting `NEXT_PUBLIC_ENABLE_DYNAMIC_V2=true` (or `ENABLE_DYNAMIC_V2=true` in Docker) so the app fetches from `/datasets/load`.
4. **Start the dev server** on port 8000:
   ```bash
   NEXT_PUBLIC_ENABLE_DYNAMIC_V2=true npm run dev
   ```
5. Open [http://localhost:8000](http://localhost:8000) and pass `?seed=XYZ` to explore different variants. The v2 seed for data loading is automatically derived from the base seed.

This folder follows the same workflow as the rest of the webs: `npm run build` for production, `npm run start` to serve the build, and `npm run lint` to run Biome + TypeScript checks.
