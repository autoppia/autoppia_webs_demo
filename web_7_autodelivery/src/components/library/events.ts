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
  QUICK_REORDER: "QUICK_REORDER",
  RESTAURANT_FILTER: "RESTAURANT_FILTER",
  EDIT_CART_ITEM: "EDIT_CART_ITEM"
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
      "X-WebAgent-Id": resolvedWebAgentId,
      "X-Validator-Id": resolvedValidatorId,
      ...extra_headers,
    },
    body: JSON.stringify(backendPayload),
  }).catch((error) => {
    console.error("❌ Failed to log event:", error);
    throw error;
  });
}
