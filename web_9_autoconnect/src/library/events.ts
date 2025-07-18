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

  const payload = {
    event_name: eventType,
    data,
    user_id: user,
  };

  console.log("📦 Logging Event:", { ...payload, headers: extra_headers });

  fetch("/api/log-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...extra_headers,
    },
    body: JSON.stringify(payload),
  });
}
