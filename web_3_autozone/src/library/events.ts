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
  SHARE_PRODUCT: "SHARE_PRODUCT",
  ADD_TO_WISHLIST: "ADD_TO_WISHLIST",
  VIEW_MORE_DETAILS: "VIEW_MORE_DETAILS",
  SERVICE_TOOL_NAV: "SERVICE_TOOL_NAV",
  PROJECT_CTA: "PROJECT_CTA",
  RESTOCK_SHORTCUT: "RESTOCK_SHORTCUT",
  QUICK_FILTER_CLICK: "QUICK_FILTER_CLICK",
  BUNDLE_VIEW: "BUNDLE_VIEW",
  BUNDLE_ACTION: "BUNDLE_ACTION",
  PROJECT_NOTE_VIEW: "PROJECT_NOTE_VIEW",
  WISHLIST_VIEW: "WISHLIST_VIEW",
  LANGUAGE_CHANGE: "LANGUAGE_CHANGE",
  ACCOUNT_MENU_ACTION: "ACCOUNT_MENU_ACTION",
  HEADER_NAV_LINK: "HEADER_NAV_LINK",
  SECONDARY_NAV_LINK: "SECONDARY_NAV_LINK",
  CATEGORY_FILTER: "CATEGORY_FILTER",
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
