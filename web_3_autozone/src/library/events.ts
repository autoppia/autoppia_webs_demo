// src/lib/logger.ts

export const EVENT_TYPES = {
  SCROLL_CAROUSEL: "CAROUSEL_SCROLL",
  SEARCH_PRODUCT: "SEARCH_PRODUCT",
  VIEW_DETAIL: "VIEW_DETAIL",
  ADD_TO_WISHLIST: "ADD_TO_WISHLIST",
  VIEW_WISHLIST: "VIEW_WISHLIST",
  ADD_TO_CART: "ADD_TO_CART",
  VIEW_CART: "VIEW_CART",
  CHECKOUT_STARTED: "CHECKOUT_STARTED",
  PROCEED_TO_CHECKOUT: "PROCEED_TO_CHECKOUT",
  ORDER_COMPLETED: "ORDER_COMPLETED",
  QUANTITY_CHANGED: "QUANTITY_CHANGED",
  SHARE_PRODUCT: "SHARE_PRODUCT",
  CATEGORY_FILTER: "CATEGORY_FILTER",
  DETAILS_TOGGLE: "DETAILS_TOGGLE",
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
