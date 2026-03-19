# AutoDiscord — Use Cases for Validators

This document describes **use cases** that validators (or automated agents) can perform to trigger events and verify behavior. All actions that matter for scoring are emitted as events to `/api/log-event` (proxied to `webs_server` `save_events`).

## Event types

| Event | When it fires |
|-------|----------------|
| `VIEW_SERVERS` | User clicks the Home (servers) icon in the left sidebar |
| `VIEW_DMS` | User clicks the Direct Messages icon |
| `SELECT_SERVER` | User selects a server from the server list |
| `SELECT_CHANNEL` | User selects a channel in the channel sidebar |
| `SEND_MESSAGE` | User sends a message in a channel |
| `ADD_REACTION` | User adds a reaction (e.g. thumbs up) to a message |
| `SELECT_DM` | User selects a DM conversation |
| `SEND_DM_MESSAGE` | User sends a message in a DM |
| `OPEN_SETTINGS` | User opens the Settings page |
| `SETTINGS_APPEARANCE` | User changes theme (Dark/Light) in Settings |
| `SETTINGS_NOTIFICATIONS` | User toggles notifications in Settings |
| `SETTINGS_ACCOUNT` | User saves display name in Settings |
| `CREATE_SERVER` | User submits the Create Server modal (name optional) |
| `OPEN_SERVER_SETTINGS` | User clicks the gear icon next to the server name |
| `DELETE_SERVER` | User deletes a server (only for locally created servers) in Server Settings |

## Use cases (step-by-step)

### UC1: Send a message in a channel

1. Open the app; ensure **Servers** view is active (Home icon selected).
2. Select a server from the left column.
3. Select a text channel (e.g. `#general`) in the channel list.
4. Type a message in the input at the bottom and submit (Enter or button).
5. **Expected events:** `SELECT_SERVER`, `SELECT_CHANNEL`, `SEND_MESSAGE`.

### UC2: Add a reaction to a message

1. In any channel with messages, hover a message.
2. Click the thumbs-up (or other reaction) control.
3. **Expected events:** `ADD_REACTION` (with `message_id` and `emoji` in payload).

### UC3: Open DMs and send a message

1. Click the **Direct Messages** icon (message circle) in the left sidebar.
2. Select a user from the DM list (peers are derived from server members).
3. Type a message and submit.
4. **Expected events:** `VIEW_DMS`, `SELECT_DM`, `SEND_DM_MESSAGE`.

### UC4: Change settings (Appearance, Notifications, Account)

1. Click the **Settings** icon (gear) at the bottom of the server list.
2. Change **Appearance** (e.g. select Light).
3. Toggle **Notifications**.
4. Change **Display name** and click **Save**.
5. **Expected events:** `OPEN_SETTINGS`, `SETTINGS_APPEARANCE`, `SETTINGS_NOTIFICATIONS`, `SETTINGS_ACCOUNT`.

### UC5: Create a server

1. Click the **Add server** button (green plus) in the left column.
2. Optionally enter a server name.
3. Click **Create**.
4. **Expected events:** `CREATE_SERVER` (with `server_name` in payload).

### UC6: Open server settings

1. Select a server and ensure the channel list is visible.
2. Click the **gear** icon next to the server name in the channel sidebar header.
3. **Expected events:** `OPEN_SERVER_SETTINGS` (with `server_id` in payload).

### UC7: Delete a server

1. Create a server (or use an existing **locally created** one).
2. Select that server and open **Server settings** (gear next to server name).
3. Click **Delete server** at the bottom of the modal.
4. **Expected events:** `DELETE_SERVER` (with `server_id`, `server_name` in payload). The server is removed from the list; selection moves to another server if available.

### UC8: Switch servers and channels

1. Click **Home** (servers view) if not already there.
2. Select **server A** from the left column.
3. Select a **channel** (e.g. `#general`) in the channel list.
4. Select **server B** from the left column.
5. Select a channel in server B.
6. **Expected events:** `VIEW_SERVERS` (if Home was clicked), `SELECT_SERVER` (twice), `SELECT_CHANNEL` (twice).

### UC9: Return to servers from DMs

1. Click the **Direct Messages** icon.
2. Optionally select a user (triggers `SELECT_DM`).
3. Click the **Home** icon to return to the server list.
4. **Expected events:** `VIEW_DMS`, optionally `SELECT_DM`, then `VIEW_SERVERS`.

### UC10: Full channel conversation (multiple messages and reactions)

1. Select a server and a text channel that has messages.
2. Send **two or more** messages in the input.
3. Hover a message and add a **reaction** (thumbs up).
4. Add a reaction to **another** message.
5. **Expected events:** `SELECT_SERVER`, `SELECT_CHANNEL`, `SEND_MESSAGE` (≥2), `ADD_REACTION` (≥2).

### UC11: Create server then open its settings

1. Click the **Add server** (green plus) button.
2. Enter a name (e.g. "Test Server") and click **Create**.
3. The new server is selected; click the **gear** next to the server name to open Server settings.
4. **Expected events:** `CREATE_SERVER`, `SELECT_SERVER` (when the new server is selected by the UI), `OPEN_SERVER_SETTINGS`.

### UC12: Open Settings and change one option

1. Click the **Settings** icon (gear at bottom of server column).
2. Change **Appearance** to Light (or Notifications toggle), then click **Back** to return.
3. **Expected events:** `OPEN_SETTINGS`, and either `SETTINGS_APPEARANCE` or `SETTINGS_NOTIFICATIONS`.

### UC13: Switch between DM conversations

1. Click the **Direct Messages** icon.
2. Select **user A** from the list.
3. Select **user B** from the list (without going back to servers).
4. **Expected events:** `VIEW_DMS`, `SELECT_DM` (user A), `SELECT_DM` (user B).

### UC14: Create server then delete it

1. Click **Add server**, enter a name, click **Create**.
2. With the new server selected, open **Server settings** (gear).
3. Click **Delete server** and confirm the server disappears.
4. **Expected events:** `CREATE_SERVER`, `OPEN_SERVER_SETTINGS`, `DELETE_SERVER`.

### UC15: View empty server (no channels)

1. **Create** a server (Add server → name → Create).
2. Leave the new server selected (it has no channels).
3. Observe the main area shows “No channels in this server”.
4. **Expected events:** `CREATE_SERVER`, `SELECT_SERVER`. No `SELECT_CHANNEL` or `SEND_MESSAGE` (no channel to select).

### UC16: End-to-end server lifecycle

1. Click **Home**.
2. **Create** a server named “E2E Test”.
3. **Select** it and open **Server settings**.
4. **Delete** the server.
5. **Expected events:** `VIEW_SERVERS`, `CREATE_SERVER`, `SELECT_SERVER`, `OPEN_SERVER_SETTINGS`, `DELETE_SERVER`.

## Triggering events from automation

- Use the same flows above in a headless browser (e.g. Playwright) or via Claude Code / Codex.
- Events are sent as `POST /api/log-event` with body shape expected by `webs_server` (e.g. `web_agent_id`, `web_url`, `validator_id`, `data`).
- Query stored events via `webs_server` `get_events` to verify that the expected event types and payloads were recorded.

## Running the event coverage test

From the project root:

```bash
node tests/test-events.js
```

This checks that every value in `EVENT_TYPES` is used in the codebase (e.g. in a `logEvent(EVENT_TYPES.XXX, ...)` call).

## Running the use-case E2E tests

Automated Playwright tests implement the use cases and assert event sequences:

```bash
npm run test:e2e
```

This starts the app (if not already running) and runs `tests/use-cases.spec.js`. Requires Node and Chromium (install with `npx playwright install chromium`).
