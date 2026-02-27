export const EVENT_TYPES = {
  SEARCH_TOURNAMENT: "SEARCH_TOURNAMENT",
  FILTER_TOURNAMENT: "FILTER_TOURNAMENT",
  VIEW_TOURNAMENT: "VIEW_TOURNAMENT",
  SEARCH_PLAYER: "SEARCH_PLAYER",
  VIEW_PLAYER: "VIEW_PLAYER",
  SOLVE_PUZZLE: "SOLVE_PUZZLE",
  ANALYZE_GAME: "ANALYZE_GAME",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  REGISTRATION: "REGISTRATION",
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export function logEvent(
  eventType: EventType,
  data: Record<string, unknown> = {},
  extra_headers: Record<string, string> = {}
): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const user = localStorage.getItem("user");
  const resolvedUser = user === "null" ? null : user;

  const webAgentId = localStorage.getItem("web_agent_id");
  const validatorId = localStorage.getItem("validator_id");
  const resolvedWebAgentId = webAgentId && webAgentId !== "null" ? webAgentId : "1";
  const resolvedValidatorId = validatorId && validatorId !== "null" ? validatorId : "1";

  const eventData = {
    event_name: eventType,
    web_agent_id: resolvedWebAgentId,
    user_id: resolvedUser,
    data,
    timestamp: new Date().toISOString(),
    validator_id: resolvedValidatorId,
  };

  const backendPayload = {
    web_agent_id: resolvedWebAgentId,
    web_url: window.location.origin,
    validator_id: resolvedValidatorId,
    data: eventData,
  };

  console.log("Logging Event:", eventType, eventData);

  return fetch("/api/log-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WebAgent-Id": resolvedWebAgentId,
      "X-Validator-Id": resolvedValidatorId,
      ...extra_headers,
    },
    body: JSON.stringify(backendPayload),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`log-event failed: ${res.status}`);
    })
    .catch((error) => {
      console.warn("Failed to log event:", error);
    });
}
