# IWA module for web_16_autodiscord

This directory holds config and data for **IWA** (Infinite Web Arena) task & test generation for the AutoDiscord demo.

## Contents

| File | Purpose |
|------|--------|
| `module.yaml` | Website registration: id, base_url, ports, paths to docs, event types, e2e/coverage commands. |
| `use_cases.json` | Machine-readable use cases (id, name, steps, expected_events) for task and test generation. |
| `README.md` | This file. |

## How to use in IWA

1. **Register the website** using `module.yaml` (or map its fields into IWA’s website/module format).
2. **Task & test generation** use `use_cases.json`: each use case has `id`, `name`, `steps`, and `expected_events` for validators or generated tests to run and assert.
3. **Human docs** remain in the demo-webs repo: `USE_CASES.md`, `EVENTS.md` (see `module.yaml` paths).

If IWA uses a different schema, transform `module.yaml` and `use_cases.json` to match (same IDs UC1–UC16 and event types as in `EVENTS.md`).
