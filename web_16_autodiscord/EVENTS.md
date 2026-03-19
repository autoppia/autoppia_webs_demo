# AutoDiscord — Events

Events are implemented and wired to the UI. Every relevant user action calls `logEvent(EVENT_TYPES.XXX, { ... })` and sends a **POST** to `/api/log-event` (proxied to `webs_server` `save_events`).

## Event types

| Category   | Event                  | When it fires |
|-----------|------------------------|----------------|
| Servers   | `VIEW_SERVERS`         | User clicks the Home (servers) icon |
|           | `SELECT_SERVER`        | User selects a server from the list |
|           | `CREATE_SERVER`        | User submits the Create Server modal |
|           | `OPEN_SERVER_SETTINGS` | User clicks the gear next to the server name |
|           | `DELETE_SERVER`       | User clicks Delete server (local servers only) |
| Channels  | `SELECT_CHANNEL`       | User selects a channel |
|           | `SEND_MESSAGE`        | User sends a message in a channel |
|           | `ADD_REACTION`        | User adds or removes a reaction (e.g. thumbs up) |
| DMs       | `VIEW_DMS`             | User clicks the Direct Messages icon |
|           | `SELECT_DM`            | User selects a DM conversation |
|           | `SEND_DM_MESSAGE`      | User sends a message in a DM |
| Settings  | `OPEN_SETTINGS`        | User opens the Settings page |
|           | `SETTINGS_APPEARANCE`  | User changes theme (Dark/Light) |
|           | `SETTINGS_NOTIFICATIONS` | User toggles notifications |
|           | `SETTINGS_ACCOUNT`    | User saves display name |

## Where events are fired

| Component / page        | Events |
|-------------------------|--------|
| `ServerList`            | `VIEW_SERVERS`, `VIEW_DMS`, `SELECT_SERVER`, (Create server opens modal) |
| `ChannelSidebar`        | `SELECT_CHANNEL`, `OPEN_SERVER_SETTINGS` |
| `ChatPanel`             | `SEND_MESSAGE`, `ADD_REACTION` |
| `DMSidebar`             | `SELECT_DM` |
| `DMChatPanel`           | `SEND_DM_MESSAGE` |
| `CreateServerModal`     | `CREATE_SERVER` |
| `ServerSettingsModal`  | `DELETE_SERVER` |
| Settings page (`/settings`) | `OPEN_SETTINGS`, `SETTINGS_APPEARANCE`, `SETTINGS_NOTIFICATIONS`, `SETTINGS_ACCOUNT` |

## Implementation

- **Definition:** `src/library/events.ts` — `EVENT_TYPES` and `logEvent()`.
- **Payload:** `logEvent(type, data)` sends `web_agent_id`, `web_url`, `validator_id`, and `data` (including `event_name`, `timestamp`) to `/api/log-event`.

## Use cases

| ID | Use case | Expected events |
|----|----------|-----------------|
| UC1 | Send a message in a channel | `SELECT_SERVER`, `SELECT_CHANNEL`, `SEND_MESSAGE` |
| UC2 | Add a reaction to a message | `ADD_REACTION` |
| UC3 | Open DMs and send a message | `VIEW_DMS`, `SELECT_DM`, `SEND_DM_MESSAGE` |
| UC4 | Change settings (Appearance, Notifications, Account) | `OPEN_SETTINGS`, `SETTINGS_APPEARANCE`, `SETTINGS_NOTIFICATIONS`, `SETTINGS_ACCOUNT` |
| UC5 | Create a server | `CREATE_SERVER` |
| UC6 | Open server settings | `OPEN_SERVER_SETTINGS` |
| UC7 | Delete a server | `DELETE_SERVER` (after create/open settings) |
| UC8 | Switch servers and channels | `VIEW_SERVERS`, `SELECT_SERVER` (×2), `SELECT_CHANNEL` (×2) |
| UC9 | Return to servers from DMs | `VIEW_DMS`, optionally `SELECT_DM`, `VIEW_SERVERS` |
| UC10 | Full channel conversation (multiple messages and reactions) | `SELECT_SERVER`, `SELECT_CHANNEL`, `SEND_MESSAGE` (≥2), `ADD_REACTION` (≥2) |
| UC11 | Create server then open its settings | `CREATE_SERVER`, `OPEN_SERVER_SETTINGS` |
| UC12 | Open Settings and change one option | `OPEN_SETTINGS`, `SETTINGS_APPEARANCE` or `SETTINGS_NOTIFICATIONS` |
| UC13 | Switch between DM conversations | `VIEW_DMS`, `SELECT_DM` (×2) |
| UC14 | Create server then delete it | `CREATE_SERVER`, `OPEN_SERVER_SETTINGS`, `DELETE_SERVER` |
| UC15 | View empty server (no channels) | `CREATE_SERVER`, `SELECT_SERVER` (no `SELECT_CHANNEL`) |
| UC16 | End-to-end server lifecycle | `VIEW_SERVERS`, `CREATE_SERVER`, `OPEN_SERVER_SETTINGS`, `DELETE_SERVER` |

Full step-by-step instructions: **USE_CASES.md**.

## Verification

- **Event coverage:** `node tests/test-events.js` — ensures every `EVENT_TYPES` value is used in the codebase.
- **E2E:** `npm run test:e2e` — Playwright tests for use cases (see `tests/use-cases.spec.js`).
