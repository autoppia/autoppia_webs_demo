// src/lib/logger.ts

export const EVENT_TYPES = {
  SCROLL_CAROUSEL: "CAROUSEL_SCROLL",
  SEARCH_PRODUCT: "SEARCH_PRODUCT",
  VIEW_DETAIL: "VIEW_DETAIL",
  ADD_TO_CART: "ADD_TO_CART",
  CHECKOUT_STARTED: "CHECKOUT_STARTED",
  VIEW_CART: "VIEW_CART",
  QUANTITY_CHANGED: "QUANTITY_CHANGED",
  PROCEED_TO_CHECKOUT: "PROCEED_TO_CHECKOUT",
  ORDER_COMPLETED: "ORDER_COMPLETED",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

// Mock user/agent — replace with actual session/user context if available

export function logEvent(event: EventType, data: any = {}) {
  if (typeof window === "undefined") return;

  const user = localStorage.getItem("user");
  const web_agent_id = localStorage.getItem("web_agent_id");
  const payload = {
    event,
    data,
    user: user,
    web_agent_id: web_agent_id,
  };

  console.log("📦 Logging Event:", payload);

  fetch("/api/log-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
