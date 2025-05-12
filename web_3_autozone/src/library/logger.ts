// src/lib/logger.ts

export const EVENT_TYPES = {
  SEARCH: "SEARCH", //fine
  ADD_TO_CART: "ADD_TO_CART", //fine 
  BUY_NOW: "BUY_NOW", //fine
  CART_OPENED: "CART_OPENED", //fine
  SCROLL_CAROUSEL: "CAROUSEL_SCROLL", //fine
  VIEW_DETAIL: "VIEW_DETAIL", //fine
  QUANTITY_CHANGED: "QUANTITY_CHANGED", //fine
  OPENED_ALL_DROPDOWN: "OPENED_ALL_DROPDOWN", //fine
  PLACE_ORDER: "PLACE_ORDER", //fine
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