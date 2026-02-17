# AutoDiscord

A Discord-like demo for the subnet. Mocked data only — servers, channels, messages, and members are loaded from the webs_server API (`web_15_autodiscord`).

## Run

- Backend must serve `web_15_autodiscord` data (see `webs_server/initial_data/web_15_autodiscord/`).
- `npm install && npm run dev` — app runs on port 8015. API is proxied via Next.js rewrites to `NEXT_PUBLIC_API_URL` or `/api`.

## Seed

Use `?seed=1` (or 1–999) in the URL to change the seeded dataset slice (same as other demo webs).
