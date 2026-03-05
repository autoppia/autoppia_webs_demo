# IWA PR: Register web_16_autodiscord and configure use cases

This doc describes what to add in the **IWA** (e.g. `autoppia_iwa`) repo so the AutoDiscord demo is initialized and use cases are configured. After merging the demo-webs fork (with `web_16_autodiscord`), open a PR to IWA with the following.

## 1. Website / module initialization

In IWA, ensure the **website** (or module) for this demo is registered and initialized, for example:

- **Name / id:** `web_16_autodiscord` or `autodiscord`
- **Base URL / port:** e.g. `http://localhost:8015` (or 8016 in dev; see repo `readme.md` and `scripts/setup.sh`)
- **Repo / path:** Pointer to the demo-webs repo and path `web_16_autodiscord/` (or the deployed URL if IWA only stores production URLs)
- Any **env or config** IWA uses to spin up or link to this web (e.g. Docker service name, port mapping)

Use existing demo webs (e.g. `web_14_autohealth`, `web_1_autocinema`) in IWA as the template and add an equivalent entry for `web_16_autodiscord`.

## 2. Use cases configuration

Configure **use cases** so validators (or IWA) can run and verify them:

- **Source of truth:** `USE_CASES.md` and `EVENTS.md` in `web_16_autodiscord/` (in demo-webs repo).
- **Use case list:** 16 use cases (UC1–UC16). Summary table is in `EVENTS.md`; full steps and expected events in `USE_CASES.md`.
- **Event types:** 15 events (see `EVENTS.md` or `src/library/events.ts`). Events are sent to `POST /api/log-event` (webs_server `save_events`).
- **E2E tests:** `npm run test:e2e` in `web_16_autodiscord/` runs Playwright tests that implement the use cases and assert event sequences.

In IWA, add or point to:

- The list of use case IDs (e.g. UC1–UC16) for this website.
- Expected event names (or payload shape) per use case if IWA stores that; otherwise reference `USE_CASES.md` / `EVENTS.md`.

## 3. Steps to open the PR

1. **Clone IWA** (e.g. `git clone <iwa-repo-url> && cd <iwa-dir>`).
2. **Create a branch** (e.g. `feat/autodiscord-module`).
3. **Add website init** – In the place where demo webs are registered, add `web_16_autodiscord` (name, URL/port, path or service config).
4. **Add use cases config** – In the place where use cases per website are defined, add the 16 use cases (and optionally expected events) for `web_16_autodiscord`, referencing `USE_CASES.md` / `EVENTS.md` if needed.
5. **Commit, push, open PR** – Request review (e.g. from Codex) so he can confirm the module init and use case configuration match the demo-webs repo.

## 4. References in this repo

| Item        | Path / command |
|------------|-----------------|
| Use cases  | `USE_CASES.md`  |
| Events     | `EVENTS.md`     |
| E2E tests  | `npm run test:e2e` (from `web_16_autodiscord/`) |
| Event coverage | `node tests/test-events.js` |

If IWA expects a specific config format (YAML, JSON, or code), mirror the format used for other demo webs and fill in the values above.
