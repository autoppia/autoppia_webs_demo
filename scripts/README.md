# Setup Script Documentation

## Overview

`scripts/setup.sh` deploys all web demos plus `webs_server`. It also controls dynamic behavior (V1/V2/V3) through one flag: `--enabled_dynamic_versions`.

## Quick Start

```bash
# Deploy all webs with defaults (v1,v2,v3 enabled)
./setup.sh

# Deploy a single demo
./setup.sh --demo=autodrive

# Enable only V2 (data by seed)
./setup.sh --enabled_dynamic_versions=v2
```

## Dynamic Versions (Simple Model)

| Version | Meaning | Behavior |
| --- | --- | --- |
| `v1` | Layout/structure variations | Wrappers/decoys + change order |
| `v2` | Data by seed | Backend dataset varies by `?seed=` |
| `v3` | ID/class/text variants | Attribute/text variations |

**Default:** `v1,v2,v3` are enabled if you don’t pass `--enabled_dynamic_versions`.

## Flags Set by the Script

For each deployed web, the script exports:

- `ENABLE_DYNAMIC_V1` / `NEXT_PUBLIC_ENABLE_DYNAMIC_V1`
- `ENABLE_DYNAMIC_V2` / `NEXT_PUBLIC_ENABLE_DYNAMIC_V2`
- `ENABLE_DYNAMIC_V3` / `NEXT_PUBLIC_ENABLE_DYNAMIC_V3`
- `ENABLE_DYNAMIC_V4` / `NEXT_PUBLIC_ENABLE_DYNAMIC_V4` (reserved)

## Cleanup Behavior

By default, cleanup only removes containers/volumes created by these demos. It does **not** delete unrelated Docker resources.

If you really want a full Docker wipe, use:

```bash
./setup.sh --clean_all=true
```

For faster rebuilds without cleanup:

```bash
./setup.sh --fast=true
```

Parallel deploy for all demos:

```bash
./setup.sh --demo=all --parallel=4
```

## Examples

```bash
# All demos with V1+V2+V3 (default)
./setup.sh

# Only V1
./setup.sh --enabled_dynamic_versions=v1

# V1 + V2
./setup.sh --enabled_dynamic_versions=v1,v2

# No dynamic features
./setup.sh --enabled_dynamic_versions=""
```

## Lint before push

To run lint in all `web_*` apps (same as CI) before pushing:

```bash
./scripts/lint-all-webs.sh
```

To run it automatically on every `git push`, install the pre-push hook once:

```bash
./scripts/install-pre-push-hook.sh
```


## Monorepo coverage

There is no root `package.json`; each `web_*` app has its own Jest setup. To **generate coverage for every project and then print one monorepo table**, use:

```bash
./scripts/coverage-all.sh
```

This script, in order:

1. Runs `npm test -- --coverage --watch=false` in each `web_*` directory that defines a `test` script (skips apps without tests).
2. Runs `python3 -m pytest` with `--cov` in `webs_server` so `coverage.xml` is written at the repo root of that package (as in CI).
3. Runs `node scripts/monorepo-coverage-summary.mjs --coverageBaseDir .` to aggregate results.

**Prerequisites:** install dependencies per app (e.g. `npm ci` in each `web_*` you care about) and install Python test tooling for the backend (`pytest`, `pytest-cov`, `coverage`), matching what the GitHub workflow installs.

To apply the **same thresholds as CI** when printing the summary (optional):

```bash
COVERAGE_ENFORCE=1 ./scripts/coverage-all.sh
```

### Summary only (coverage already generated)

`monorepo-coverage-summary.mjs` reads existing reports and prints a compact per-app table plus **TOTAL**. It expects, per project:

- Frontends: `coverage/coverage-final.json` (Jest) under each `web_*` (or a flat `coverage-final.json` next to the app name when using downloaded CI artifacts).
- Backend: `coverage.xml` (coverage.py) under `webs_server/`.

From the repository root, after tests have produced those files:

```bash
node scripts/monorepo-coverage-summary.mjs --coverageBaseDir .
```

### CI / enforcement (artifacts from the workflow)

After `actions/download-artifact` has populated `.coverage-artifacts`:

```bash
node scripts/monorepo-coverage-summary.mjs --coverageBaseDir .coverage-artifacts --enforce 1 --failOnMissing 0
```


## Notes

- Seed comes from URL and is clamped to `1..999`.
- If V2 is disabled, all webs use `seed=1` for data.
- `webs_server` must be running for V2 data. The script starts it automatically.
