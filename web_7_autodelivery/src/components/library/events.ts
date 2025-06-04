// src/lib/logger.ts

export const EVENT_TYPES = {
  SEARCH_RESTAURANT: "SEARCH_RESTAURANT", //done
  VIEW_RESTAURANT: "VIEW_RESTAURANT", //done
  BACK_TO_ALL_RESTAURANTS: "BACK_TO_ALL_RESTAURANTS", //done
  ADD_TO_CART_MODAL_OPEN: "ADD_TO_CART_MODAL_OPEN", //done
  ADD_TO_CART: "ADD_TO_CART", //done
  ITEM_INCREMENTED: "ITEM_INCREMENTED", //done
  ITEM_DECREMENTED: "ITEM_DECREMENTED", //done
  EMPTY_CART: "EMPTY_CART", //done
  OPEN_CHECKOUT_PAGE: "OPEN_CHECKOUT_PAGE", //done
  ADDRESS_ADDED: "ADDRESS_ADDED", //done
  DROPOFF_PREFERENCE: "DROPOFF_PREFERENCE", //done
  DELIVERY_MODE: "DELIVERY_MODE", //done
  PICKUP_MODE: "PICKUP_MODE", //done
  PLACE_ORDER: "PLACE_ORDER", //done
  DELETE_REVIEW: "DELETE_REVIEW", //done 
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
type JsonPayload = Record<string, unknown>;

export function logEvent(
  eventType: EventType,
  data: JsonPayload = {},
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
