// src/lib/logger.ts

export const EVENT_TYPES = {
  SEARCH_MOVIE: "SEARCH_MOVIE",
  FILTER_MOVIES: "FILTER_MOVIES",
  VIEW_MOVIE_DETAIL: "VIEW_MOVIE_DETAIL",
  WATCH_TRAILER: "WATCH_TRAILER",
  ADD_TO_WATCHLIST: "ADD_TO_WATCHLIST",
  SHARE_MOVIE: "SHARE_MOVIE",
  POST_COMMENT: "POST_COMMENT",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export function logEvent(eventType: EventType, data: any = {}, extra_headers: Record<string, string> = {}) {
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

  console.log("🎬 Logging Event:", { ...payload, headers: extra_headers });

  fetch("/api/log-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...extra_headers,
    },
    body: JSON.stringify(payload),
  });
}
