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

## Notes

- Seed comes from URL and is clamped to `1..999`.
- If V2 is disabled, all webs use `seed=1` for data.
- `webs_server` must be running for V2 data. The script starts it automatically.
