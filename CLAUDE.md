# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo of 15 independent Next.js demo web applications + a shared FastAPI backend (`webs_server/`). These apps are testing targets for **Bittensor Subnet 36** web agent validators. Each app is fully containerized with Docker.

## Commands

### Frontend (per web app, run from its directory e.g. `web_6_automail/`)
```bash
npm install              # Install dependencies
npm run dev              # Dev server (Next.js with --turbopack)
npm run build            # Production build
npm run lint             # Biome lint + TypeScript type checking
npm run format           # Format with Biome
```

### Backend (`webs_server/`)
```bash
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8090
```

### Docker Deployment
```bash
./scripts/setup.sh --demo=all                    # Deploy all apps
./scripts/setup.sh --demo=automail --web_port=8005  # Deploy single app
./scripts/setup.sh --demo=automail --enabled_dynamic_versions=v1,v3  # With dynamic features
./scripts/setup.sh --demo=all --fast=true        # Skip cleanup, use cached builds
./scripts/restart_webs_demo.sh                   # Restart all containers
```

## Architecture

### Web Apps (web_1 through web_15)
Each app is an independent **Next.js 15 (App Router)** + **TypeScript** project with:
- **Styling**: Tailwind CSS 3.4 + shadcn/ui (Radix UI components)
- **Linting**: Biome 1.9.4 (2-space indent, double quotes, 200 char line width, a11y rules disabled)
- **State**: React Context (SeedContext) + URL query params for seed
- **Data**: Mock data in `src/data/`, deterministically selected by seed via seeded LCG random generator
- **Port mapping**: web_1=8000, web_2=8001, ..., web_14=8013, web_15=8014
- **Charts**: lightweight-charts v5 (candlestick, area), recharts, custom SVG sparklines
- **Config**: `reactStrictMode: false`, `devIndicators: false`, image optimization disabled

### Common App Directory Layout
```
src/
├── app/            # Next.js App Router (pages, layouts, API routes)
├── components/     # React components (layout/, pages/, charts/, shared/, ui/)
├── context/        # React Context providers (SeedContext)
├── data/           # Mock data & deterministic generators
├── dynamic/        # Dynamic anti-scraping system (v1/, v2/, v3/, shared/)
├── hooks/          # Custom hooks (useSeedRouter, useEventLogger)
├── shared/         # Types and constants
└── library/        # Utility functions (formatters, logger)
```

### Shared Backend (`webs_server/`)
FastAPI + asyncpg (PostgreSQL 15, port 5437, connection pool min=10 max=50). Uses orjson for fast serialization, Pydantic for validation, loguru for logging.

**Key API endpoints:**
- `/health` — Health check with DB pool status
- `/save_events/` / `/get_events/` / `/reset_events/` — Event logging CRUD
- `/datasets/load` — Load pre-seeded datasets
- `/datasets/generate` / `/datasets/generate-smart` — AI data generation (OpenAI)
- `/datasets/pools` / `/datasets/pool/info` — Master data pool management
- `/seeds/resolve` — Resolve base seed to v1/v2/v3 deterministic variants

Pre-seeded data lives in `webs_server/initial_data/<project>/original/` (high-quality, fewer records) and `data/` (more records for V2 mode).

### Dynamic System (`src/dynamic/`)
Anti-scraping system with 4 independent versions, all driven by a URL `?seed=N` parameter (1-999, deterministic):
- **V1**: DOM structure modification (wrappers + decoys to break XPath selectors)
- **V2**: Database-backed dynamic data loading (enabled via `?v2-seed=X`)
- **V3**: HTML attribute/class/text variation (anti-fingerprinting) via JSON variant maps
- **V4**: Seed-based HTML variations

Core function: `selectVariantIndex(seed, key, count)` — deterministic hash producing a variant index. Default enabled: v1,v3. Feature flags in `src/dynamic/shared/flags.ts`. Central hook: `useDynamicSystem()`.

Key components: `DynamicWrapper` (V1 DOM wrapping), `DynamicText` (V3 text variants), `SeedLink` (seed-preserving navigation).

### Key Patterns
- Seed is read from URL query param, preserved across navigation via `useSeedRouter()` hook, defaults to 1
- Each app has its own Dockerfile (multi-stage: deps → builder → runner) with build args for dynamic feature toggles (`ENABLE_DYNAMIC_V1`, `ENABLE_DYNAMIC_V2_DB_MODE`, `ENABLE_DYNAMIC_V3`, `ENABLE_DYNAMIC_V4`)
- API routes in `src/app/api/` proxy to webs_server via Next.js rewrites in `next.config.js`
- Event logging via `useEventLogger` hook → `/api/log-event`
- Docker containers use `apps_net` external network for inter-container communication
- Auto-versioning: package.json version + git commit hash (per-directory last modified)
- V1/V3 always enabled in local dev mode; hydration-safe via `mounted` state check

### Code Style
- **Frontend**: Biome handles formatting + linting. Double quotes, 2-space indent, organized imports. All a11y lint rules are disabled.
- **Python**: Ruff via pre-commit hooks (line-length 200). Pre-commit also enforces trailing whitespace removal and line ending normalization.
- No formal test framework is configured (no Jest/Vitest/Playwright).

## Recent Features (Last 3 PRs)

### PR #73 — Subnet Detail Page (`web_15_autostats`)
Added `/subnets/[id]` dynamic route with:
- Two-column layout (380px sidebar + content area)
- Left sidebar: price card with mini chart, financial data, token stats, trading stats, subnet metrics
- Candlestick chart using lightweight-charts v5 with 3 timeframes (1H, 4H, 1D)
- Place Order section (Buy/Sell forms) and Transaction History table
- Files: `src/app/subnets/[id]/page.tsx`, `SubnetDetailPageContent.tsx`, `CandlestickChart.tsx`

### PR #72 — Subnets List Page (`web_15_autostats`)
Added `/subnets` page with:
- Sortable 11-column table (ID, Name, Emission, Price, 1H/24H/1W/1M changes, Market Cap, Volume, 7D Trend)
- Three stats cards comparing Root vs Alpha subnets (Value, Stake Split, Volume)
- Search/filter, TAO/USD display toggle, totals row
- New `SubnetWithTrend` type, updated `generators.ts` with `generateSubnetsWithTrends()`
- Files: `src/app/subnets/page.tsx`, `SubnetsPageContent.tsx`, `SubnetsPriceChart.tsx`

### PR #71 — AutoStats Initial Setup (`web_15_autostats`)
New web app (web_15) — a Bittensor network explorer (taostats-inspired) with:
- Landing page: TAO price area chart, Quick Action card, Top Subnets/Validators/Transactions tables
- Full data model: Block, Subnet, Validator, Account, Transfer, NetworkStats, plus analytics types (PriceDataPoint, CandleDataPoint, VolumeDataPoint)
- Deterministic generators for all data types using seeded LCG
- Header nav links: Subnets, Validators, Transfers, Accounts (validators/transfers/accounts pages not yet implemented)
- Dark theme (zinc-950 background, blue-600/cyan-600 accents, green/red for up/down)
- Port 8014
