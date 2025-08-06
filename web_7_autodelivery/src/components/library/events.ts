// src/lib/logger.ts

export const EVENT_TYPES = {
  SEARCH_RESTAURANT: "SEARCH_DELIVERY_RESTAURANT",
  VIEW_RESTAURANT: "VIEW_DELIVERY_RESTAURANT",
  BACK_TO_ALL_RESTAURANTS: "BACK_TO_ALL_RESTAURANTS", 
  ADD_TO_CART_MODAL_OPEN: "ADD_TO_CART_MODAL_OPEN", 
  ADD_TO_CART_MENU_ITEM: "ADD_TO_CART_MENU_ITEM",
  ITEM_INCREMENTED: "ITEM_INCREMENTED", 
  ITEM_DECREMENTED: "ITEM_DECREMENTED", 
  EMPTY_CART: "EMPTY_CART", 
  OPEN_CHECKOUT_PAGE: "OPEN_CHECKOUT_PAGE", 
  ADDRESS_ADDED: "ADDRESS_ADDED", 
  DROPOFF_PREFERENCE: "DROPOFF_PREFERENCE", 
  DELIVERY_MODE: "DELIVERY_MODE", 
  PICKUP_MODE: "PICKUP_MODE", 
  PLACE_ORDER: "PLACE_ORDER", 
  DELETE_REVIEW: "DELETE_REVIEW",
  QUICK_ORDER_STARTED: "QUICK_ORDER_STARTED",
  VIEW_ALL_RESTAURANTS: "VIEW_ALL_RESTAURANTS",
  VIEW_CART: "VIEW_CART",
  QUICK_ORDER_MODAL_OPEN: "QUICK_ORDER_MODAL_OPEN",
  QUICK_REORDER: "QUICK_REORDER",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
type JsonPayload = Record<string, unknown>;

export function logEvent(
  eventType: EventType,
  data: JsonPayload = {},
  extra_headers: Record<string, string> = {}
) {
  if (typeof window === "undefined") return;

  let user = null;
  try {
    user = localStorage.getItem("user");
    if (user === "null") {
      user = null;
    }
  } catch (error) {
    console.error("Error accessing localStorage:", error);
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
