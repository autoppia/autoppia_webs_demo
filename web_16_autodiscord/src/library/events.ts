export const EVENT_TYPES = {
  SELECT_SERVER: "SELECT_SERVER",
  SELECT_CHANNEL: "SELECT_CHANNEL",
  SEND_MESSAGE: "SEND_MESSAGE",
  ADD_REACTION: "ADD_REACTION",

  VIEW_DMS: "VIEW_DMS",
  SELECT_DM: "SELECT_DM",
  SEND_DM_MESSAGE: "SEND_DM_MESSAGE",

  OPEN_SETTINGS: "OPEN_SETTINGS",
  SETTINGS_APPEARANCE: "SETTINGS_APPEARANCE",
  SETTINGS_NOTIFICATIONS: "SETTINGS_NOTIFICATIONS",
  SETTINGS_ACCOUNT: "SETTINGS_ACCOUNT",

  CREATE_SERVER: "CREATE_SERVER",
  OPEN_SERVER_SETTINGS: "OPEN_SERVER_SETTINGS",
  DELETE_SERVER: "DELETE_SERVER",

  VIEW_SERVERS: "VIEW_SERVERS",

  CREATE_CHANNEL: "CREATE_CHANNEL",
  JOIN_VOICE_CHANNEL: "JOIN_VOICE_CHANNEL",
  LEAVE_VOICE_CHANNEL: "LEAVE_VOICE_CHANNEL",
  VOICE_MUTE_TOGGLE: "VOICE_MUTE_TOGGLE",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export function logEvent(
  eventType: EventType,
  data: Record<string, unknown> = {},
  extraHeaders: Record<string, string> = {},
): void {
  if (typeof window === "undefined") return;

  const rawUser = localStorage.getItem("user");
  const user = rawUser === "null" ? null : rawUser;
  const webAgentId = localStorage.getItem("web_agent_id");
  const validatorId = localStorage.getItem("validator_id");
  const resolvedWebAgentId =
    webAgentId && webAgentId !== "null" ? webAgentId : "1";
  const resolvedValidatorId =
    validatorId && validatorId !== "null" ? validatorId : "1";

  const eventData = {
    event_name: eventType,
    web_agent_id: resolvedWebAgentId,
    user_id: user,
    data,
    timestamp: new Date().toISOString(),
    validator_id: resolvedValidatorId,
  };

  const payload = {
    web_agent_id: resolvedWebAgentId,
    web_url: window.location.origin,
    validator_id: resolvedValidatorId,
    data: eventData,
  };

  fetch("/api/log-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WebAgent-Id": resolvedWebAgentId,
      "X-Validator-Id": resolvedValidatorId,
      ...extraHeaders,
    },
    body: JSON.stringify(payload),
  }).catch((err) => console.error("Failed to log event:", err));
}
