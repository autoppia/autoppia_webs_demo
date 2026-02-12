# V2 Implementation - Dynamic Data System

## Overview

V2 is a dynamic data system for `web_1_autocinema` that enables three modes of data loading:
1. **DB Mode**: Loads pre-generated data from the backend `/datasets/load` endpoint based on seed values
2. **AI Generation Mode**: Generates data on-the-fly using OpenAI via the `/datasets/generate-smart` endpoint
3. **Fallback Mode**: Uses original local JSON data when both modes are disabled

The system automatically derives V2 seeds from base URL seeds (using `?seed=X` parameter) and prioritizes data sources in the order listed above.

## Features

- ✅ **Seed-based data loading**: V2 seed is automatically derived from base seed using formula: `((baseSeed * 53 + 17) % 300) + 1`
- ✅ **Three data modes**: DB mode, AI generation mode, and fallback to original data
- ✅ **Automatic data reloading**: Data reloads when seed changes in URL
- ✅ **Environment-based configuration**: Enable/disable modes via environment variables
- ✅ **Graceful fallback**: Falls back to local JSON if backend/AI generation fails
- ✅ **Type-safe**: Full TypeScript support with proper interfaces

## Quick Start Commands

### DB Mode (Load from Backend Dataset)

```bash
# Deploy with DB mode enabled
./scripts/setup.sh --enabled_dynamic_versions=v1,v2,v3 --enable_db_mode=true

# Access the application
# Open: http://localhost:8000/?seed=42
# The V2 seed (e.g., 230) is automatically derived from base seed (42)
```

**Requirements:**
- Backend server running on port 8090
- Dataset files available in `webs_server/initial_data/web_1_autocinema/data/movies_*.json`
- Backend `ENABLE_DYNAMIC_V2=true` environment variable set

### AI Generation Mode (Generate Data via OpenAI)

```bash
# Deploy with AI generation mode enabled
./scripts/setup.sh --enabled_dynamic_versions=v1,v2,v3 --enable_ai_generation_mode=true

# Access the application
# Open: http://localhost:8000/?seed=42
# Data is generated on-the-fly using OpenAI
```

**Requirements:**
- Backend server running on port 8090
- `OPENAI_API_KEY` configured in backend environment (webs_server/.env)
- Example data file: `webs_server/initial_data/web_1_autocinema/data/movies_1.json` (for structure inference)

### Fallback Mode (Original Data)

```bash
# Deploy with V2 enabled but no specific mode (uses fallback)
./scripts/setup.sh --enabled_dynamic_versions=v1,v2,v3

# Access the application
# Open: http://localhost:8000/?seed=42
# Uses local JSON data from src/data/original/movies_1.json
```

## Architecture

### Data Loading Priority

The system follows this priority order:

1. **DB Mode** (if `NEXT_PUBLIC_ENABLE_DYNAMIC_V2=true`):
   - Fetches data from `/datasets/load` endpoint
   - Uses seed-derived selection from backend dataset
   - Falls back to local JSON if backend unavailable

2. **Fallback Mode** (if DB mode disabled):
   - Loads from `src/data/original/movies_1.json`
   - Always available as last resort

### Seed System

- **Base Seed**: Provided via URL parameter `?seed=X` (1-300)
- **V2 Seed**: Automatically derived using formula: `((baseSeed * 53 + 17) % 300) + 1`
- **Seed Resolution**: Handled by `src/shared/seed-resolver.ts`

### Key Components

#### Frontend Files

- `src/data/movies.ts`: Main data initialization logic
  - `initializeMovies()`: Entry point for loading movies
  - `fetchSeededSelection()`: Fetches from `/datasets/load` (DB mode)
- `src/dynamic/shared/flags.ts`: Feature flags
  - `isV2Enabled()`: Checks if DB mode is enabled
  - `isV2Enabled()`: Same as DB mode (AI generate removed)

- `src/dynamic/v2/data-provider.ts`: Singleton data provider
  - `getMovies()`: Returns cached movies
  - `reload()`: Reloads data when seed changes

- `src/components/layout/DataReadyGate.tsx`: Component that ensures data is ready before rendering

#### Backend Endpoints

- `POST /datasets/load`: Returns seeded selection from dataset files

## Configuration

### Environment Variables

#### Frontend (Next.js)

| Variable | Description | Required For |
|----------|-------------|--------------|
| `NEXT_PUBLIC_ENABLE_DYNAMIC_V2` | Enable DB mode | DB Mode |
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:8090`) | DB mode |

#### Backend (webs_server)

| Variable | Description | Required For |
|----------|-------------|--------------|
| `ENABLE_DYNAMIC_V2` | Enable DB mode in backend | DB Mode |
| `OPENAI_API_KEY` | OpenAI API key for data generation | AI Mode |
| `BASE_DATA_PATH` | Base path for dataset files (default: `/app/data`) | DB Mode |

### Setup Script Options

The `setup.sh` script handles configuration automatically:

```bash
# DB Mode
./scripts/setup.sh --enabled_dynamic_versions=v1,v2,v3 --enable_db_mode=true

# AI Generation Mode
./scripts/setup.sh --enabled_dynamic_versions=v1,v2,v3 --enable_ai_generation_mode=true

# Fallback Mode (no mode flags)
./scripts/setup.sh --enabled_dynamic_versions=v1,v2,v3
```

## Data Flow

### DB Mode Flow

```
URL (?seed=42)
  ↓
Base Seed: 42
  ↓
V2 Seed Derivation: ((42 * 53 + 17) % 300) + 1 = 230
  ↓
Frontend: fetchSeededSelection({ seedValue: 230 })
  ↓
Backend: /datasets/load endpoint
  ↓
Backend: Reads from initial_data/web_1_autocinema/data/movies_*.json
  ↓
Backend: Applies seeded selection/distribution
  ↓
Frontend: Receives and caches movies
  ↓
UI: Displays movies
```
