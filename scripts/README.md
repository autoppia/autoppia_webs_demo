# Setup Script Documentation

## Overview

The `setup.sh` script is a unified deployment tool for all web demo projects. It manages Docker containers for multiple web applications (Django and Next.js) and provides a flexible dynamic versioning system to control features like layout variants, data generation, and HTML structure changes.

## Quick Start

```bash
# Deploy all webs with default configuration (v1 enabled)
./setup.sh

# Deploy specific demo
./setup.sh --demo=automail

# Deploy with specific dynamic versions
./setup.sh --enabled_dynamic_versions=v1,v2
```

## Dynamic Versions System

The script uses a unified versioning system where you specify which dynamic features to enable:

### Version Overview

| Version | Feature         | Description                                                               |
| ------- | --------------- | ------------------------------------------------------------------------- |
| **v1**  | Layout Variants | Seeds + layout variants (changes layout based on `?seed=X` URL parameter) |
| **v2**  | Data Generation | Generates or loads different data (AI generation or DB mode)              |
| **v3**  | HTML Structure  | Changes CSS classes, IDs, and HTML structure (anti-fingerprinting)        |

### v1: Layout Variants (Default)

**What it does:**

- Enables seed-based layout system
- URLs accept `?seed=X` parameter (1-300)
- Maps seeds to 10 distinct layout variants
- Preserves seed across navigation (login, details, etc.)

**Default:** ✅ Enabled by default

**Flags activated:**

- `ENABLE_DYNAMIC_HTML=true`

**Example:**

```bash
# v1 enabled by default
./setup.sh

# Explicitly enable v1
./setup.sh --enabled_dynamic_versions=v1

# Access with seed: http://localhost:8000/?seed=258
```

### v2: Data Generation

**What it does:**

- Enables dynamic data generation system
- Two modes available: **AI Generation** or **DB Mode**

**Flags activated:**

- `ENABLE_DATA_GENERATION=true` (AI mode) OR
- `ENABLE_DB_MODE=true` (DB mode)

#### v2 Mode Selection

**AI Generation Mode (Default):**

```bash
# Generates data on-the-fly using AI
./setup.sh --enabled_dynamic_versions=v2

# With optional seed for reproducibility
./setup.sh --enabled_dynamic_versions=v2 --data_seed_value=42
```

**DB Mode:**

```bash
# Loads pre-generated data from database
./setup.sh --enabled_dynamic_versions=v2 --enable_db_mode=true

# DB mode automatically uses DATA_SEED_VALUE=1 if not specified
# Or specify custom seed:
./setup.sh --enabled_dynamic_versions=v2 --enable_db_mode=true --data_seed_value=42
```

**Important:**

- DB Mode requires `--enable_db_mode=true`
- DB Mode uses `DATA_SEED_VALUE=1` by default (can override with `--data_seed_value=X`)
- AI Mode: `DATA_SEED_VALUE` is optional
- Both modes are mutually exclusive (DB mode disables AI generation)

### v3: HTML Structure Changes

**What it does:**

- Changes CSS classes, IDs, and HTML element structure
- Used for anti-fingerprinting
- Mutates HTML structure dynamically

**Flags activated:**

- `ENABLE_DYNAMIC_HTML_STRUCTURE=true`

**Example:**

```bash
./setup.sh --enabled_dynamic_versions=v3
```

## Common Usage Patterns

### 1. Default Deployment (v1 only)

```bash
./setup.sh
```

**Result:** All webs deployed with layout variants enabled (seeds work via `?seed=X`)

### 2. Layouts + AI Data Generation

```bash
./setup.sh --enabled_dynamic_versions=v1,v2
```

**Result:** Layout variants + AI-generated data

### 3. Layouts + DB Data Loading

```bash
./setup.sh --enabled_dynamic_versions=v1,v2 --enable_db_mode=true --data_seed_value=42
```

**Result:** Layout variants + pre-generated data from database (seed=42)

### 4. All Features Enabled

```bash
./setup.sh --enabled_dynamic_versions=v1,v2,v3 --enable_db_mode=true --data_seed_value=42
```

**Result:** Layout variants + DB data + HTML structure changes

### 5. Deploy Specific Demo

```bash
./setup.sh --demo=automail
./setup.sh --demo=movies
./setup.sh --demo=books
```

### 6. Disable All Dynamic Features

```bash
./setup.sh --enabled_dynamic_versions=""
```

**Result:** All webs deployed in static/original mode

## Command-Line Options

### Core Options

| Option                 | Description                                                   | Default |
| ---------------------- | ------------------------------------------------------------- | ------- |
| `--demo=NAME`          | Deploy specific demo (movies, books, autozone, etc.) or 'all' | `all`   |
| `--web_port=PORT`      | Base HTTP port for Django apps                                | `8000`  |
| `--postgres_port=PORT` | Base PostgreSQL port for Django apps                          | `5434`  |
| `--webs_port=PORT`     | HTTP port for webs_server API                                 | `8090`  |
| `--webs_postgres=PORT` | PostgreSQL port for webs_server                               | `5437`  |
| `--fast=BOOL`          | Skip cleanup and use cached builds                            | `false` |
| `-h, --help`           | Show help message                                             | -       |

### Dynamic Versions Options

| Option                                  | Description                       | Default                       |
| --------------------------------------- | --------------------------------- | ----------------------------- |
| `--enabled_dynamic_versions=[v1,v2,v3]` | Enable specific dynamic versions  | `v1`                          |
| `--enable_db_mode=BOOL`                 | Enable DB-backed mode (for v2)    | `false`                       |
| `--data_seed_value=INT`                 | Seed value for v2 data generation | `1` (DB mode), `""` (AI mode) |

## Flag Activation Matrix

### Single Versions

| Command                    | ENABLE_DYNAMIC_HTML | ENABLE_DATA_GENERATION | ENABLE_DB_MODE | ENABLE_DYNAMIC_HTML_STRUCTURE |
| -------------------------- | ------------------- | ---------------------- | -------------- | ----------------------------- |
| `v1`                       | ✅ true             | ❌ false               | ❌ false       | ❌ false                      |
| `v2`                       | ❌ false            | ✅ true (AI)           | ❌ false       | ❌ false                      |
| `v2 --enable_db_mode=true` | ❌ false            | ❌ false               | ✅ true        | ❌ false                      |
| `v3`                       | ❌ false            | ❌ false               | ❌ false       | ✅ true                       |

### Combined Versions

| Command                          | ENABLE_DYNAMIC_HTML | ENABLE_DATA_GENERATION | ENABLE_DB_MODE | ENABLE_DYNAMIC_HTML_STRUCTURE |
| -------------------------------- | ------------------- | ---------------------- | -------------- | ----------------------------- |
| `v1,v2`                          | ✅ true             | ✅ true (AI)           | ❌ false       | ❌ false                      |
| `v1,v2 --enable_db_mode=true`    | ✅ true             | ❌ false               | ✅ true        | ❌ false                      |
| `v1,v3`                          | ✅ true             | ❌ false               | ❌ false       | ✅ true                       |
| `v1,v2,v3`                       | ✅ true             | ✅ true (AI)           | ❌ false       | ✅ true                       |
| `v1,v2,v3 --enable_db_mode=true` | ✅ true             | ❌ false               | ✅ true        | ✅ true                       |

## How It Works

### Execution Flow

1. **Parse Arguments**: Reads command-line options
2. **Set Defaults**: Initializes default values (v1 enabled by default)
3. **Normalize Versions**: Validates and normalizes version strings (e.g., `"v1,v2"`)
4. **Map Versions to Flags**: Converts version tokens to feature flags:
   - `v1` → `ENABLE_DYNAMIC_V1=true`
   - `v2` → `ENABLE_DYNAMIC_V2=true`
   - `v3` → `ENABLE_DYNAMIC_V3=true`
5. **Set DB Mode Defaults**: If v2 + DB mode, sets `DATA_SEED_VALUE=1` if not specified
6. **Export to Docker**: Passes flags as environment variables to Docker containers
7. **Deploy**: Builds and starts Docker containers for each web application

### Environment Variables Passed to Containers

**Django Apps (web_1, web_2):**

- `ENABLE_DYNAMIC_V1`
- `ENABLE_DYNAMIC_V2` (for v2)

**Next.js Apps (web_3+):**

- `ENABLE_DYNAMIC_V1`
- `NEXT_PUBLIC_ENABLE_DYNAMIC_V1`
- `ENABLE_DYNAMIC_V2`
- `NEXT_PUBLIC_ENABLE_DYNAMIC_V2`
- `ENABLE_DYNAMIC_V3`
- `NEXT_PUBLIC_ENABLE_DYNAMIC_V3`
- `ENABLE_DYNAMIC_V4`
- `NEXT_PUBLIC_ENABLE_DYNAMIC_V4`

## Examples

### Example 1: Basic Deployment

```bash
./setup.sh
```

Deploys all webs with v1 (layout variants) enabled.

### Example 2: Single Demo with v1

```bash
./setup.sh --demo=automail
```

Deploys only `automail` demo with layout variants.

### Example 3: v1 + v2 (AI Generation)

```bash
./setup.sh --enabled_dynamic_versions=v1,v2
```

Deploys all webs with layout variants and AI data generation.

### Example 4: v1 + v2 (DB Mode)

```bash
./setup.sh --enabled_dynamic_versions=v1,v2 --enable_db_mode=true --data_seed_value=42
```

Deploys all webs with layout variants and pre-generated data from database (seed=42).

### Example 5: Fast Deployment (Skip Cleanup)

```bash
./setup.sh --fast=true
```

Deploys without cleaning up existing containers (faster, uses cache).

### Example 6: Custom Ports

```bash
./setup.sh --web_port=9000 --postgres_port=6000
```

Deploys with custom base ports (movies on 9000, books on 9001, etc.).

## Troubleshooting

### Issue: "Invalid --enabled_dynamic_versions value"

**Solution:** Use comma-separated values without spaces: `v1,v2` not `v1, v2`

### Issue: DB mode not working

**Solution:** Ensure v2 is enabled: `--enabled_dynamic_versions=v2 --enable_db_mode=true`

### Issue: Seed not preserved in URLs

**Solution:** Ensure v1 is enabled (default) and check that `ENABLE_DYNAMIC_HTML=true` is passed to containers

### Issue: Containers not starting

**Solution:** Check Docker is running: `docker ps`. Try cleanup: `./setup.sh` (without `--fast=true`)

## Architecture

```
setup.sh
├── Parse Arguments
├── Set Defaults (v1 enabled)
├── Normalize Versions
├── Map Versions → Flags
│   ├── v1 → ENABLE_DYNAMIC_HTML
│   ├── v2 → ENABLE_DATA_GENERATION or ENABLE_DB_MODE
│   └── v3 → ENABLE_DYNAMIC_HTML_STRUCTURE
├── Set DB Mode Defaults (DATA_SEED_VALUE=1)
├── Export Environment Variables
└── Deploy Containers
    ├── Django Apps (web_1, web_2)
    ├── Next.js Apps (web_3 to web_14)
    └── webs_server (API backend)
```

## Notes

- **v1 is enabled by default** - All webs will have layout variants unless explicitly disabled
- **v2 modes are mutually exclusive** - You can use either AI generation OR DB mode, not both
- **DB mode requires seed** - Uses `DATA_SEED_VALUE=1` by default if not specified
- **AI mode seed is optional** - Can work without `DATA_SEED_VALUE`
- **Version order doesn't matter** - `v1,v2` is the same as `v2,v1`

## See Also

- Individual web documentation in `web_*/README.md`
- Docker Compose files: `web_*/docker-compose.yml`
- Environment variable usage in each web's source code
