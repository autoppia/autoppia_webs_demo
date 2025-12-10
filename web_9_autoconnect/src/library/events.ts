// src/lib/logger.ts

export const EVENT_TYPES = {
  POST_STATUS: "POST_STATUS",
  LIKE_POST: "LIKE_POST",
  COMMENT_ON_POST: "COMMENT_ON_POST",
  SEARCH_USERS: "SEARCH_USERS",
  SEARCH_JOBS: "SEARCH_JOBS",
  HOME_NAVBAR: "HOME_NAVBAR",
  JOBS_NAVBAR: "JOBS_NAVBAR",
  PROFILE_NAVBAR: "PROFILE_NAVBAR",
  VIEW_USER_PROFILE: "VIEW_USER_PROFILE",
  CONNECT_WITH_USER: "CONNECT_WITH_USER",
  APPLY_FOR_JOB: "APPLY_FOR_JOB",
  VIEW_JOB: "VIEW_JOB",
  VIEW_ALL_RECOMMENDATIONS:"VIEW_ALL_RECOMMENDATIONS",
  FOLLOW_PAGE:"FOLLOW_PAGE"
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export function logEvent<T extends Record<string, unknown>>(
  eventType: EventType,
  data: T = {} as T,
  extra_headers: Record<string, string> = {}
) {
  if (typeof window === "undefined") return;

  let user = localStorage.getItem("user");
  if (user === "null") {
    user = null;
  }

  const webAgentId = localStorage.getItem("web_agent_id");
  const validatorId = localStorage.getItem("validator_id");
  const resolvedWebAgentId = webAgentId && webAgentId !== "null" ? webAgentId : "1";
  const resolvedValidatorId = validatorId && validatorId !== "null" ? validatorId : "1";

  // Construir el payload completo que espera el backend
  const eventData = {
    event_name: eventType,
    web_agent_id: resolvedWebAgentId,
    user_id: user,
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

  console.log("📦 Logging Event:", backendPayload);

  fetch("/api/log-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...extra_headers,
    },
    body: JSON.stringify(backendPayload),
  }).catch((error) => {
    console.error("❌ Failed to log event:", error);
  });
}
