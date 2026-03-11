
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

export function logEvent(eventType: EventType, data: Record<string, unknown> = {}, extraHeaders: Record<string, string> = {}) {
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

  // Keep console clean by default; opt-in with ?debug_events=1 or localStorage.debug_events="1"
  const debugEvents =
    process.env.NODE_ENV === "development" &&
    (new URLSearchParams(window.location.search).get("debug_events") === "1" ||
      localStorage.getItem("debug_events") === "1");
  if (debugEvents) {
    console.log("🛒 Logging Event:", backendPayload);
  }

  fetch("/api/log-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WebAgent-Id": resolvedWebAgentId,
      "X-Validator-Id": resolvedValidatorId,
      ...extraHeaders,
    },
    body: JSON.stringify(backendPayload),
  }).catch((error) => {
    console.error("❌ Failed to log event:", error);
    throw error;
  });
}
