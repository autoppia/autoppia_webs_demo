// src/library/events.ts
// Autostats use-case events. Payloads carry the dataset required for each event.

export const EVENT_TYPES = {
  /** Fired when user views a subnet (detail page). Fields: subnet_name, emission, price, 1h, 24h, 1w, 1M, cap, vol(24h). */
  VIEW_SUBNET: "VIEW_SUBNET",
  /** Fired when user views a validator (detail page). Fields:  rank, dominance, nominatorCount, etc. */
  VIEW_VALIDATOR: "VIEW_VALIDATOR",
  /** Fired when user views a block (detail page). Fields: number, timestamp, hash, extrinsics, etc. */
  VIEW_BLOCK: "VIEW_BLOCK",
  /** Fired when user views an account (detail page). Fields: rank, address, balance, stakedAmount, etc. */
  VIEW_ACCOUNT: "VIEW_ACCOUNT",
  /** Fired when user submits a buy order. Fields: orderType (limit|market), amountTAU, amountAlpha, priceImpact, maxAvailableTAU. */
  EXECUTE_BUY: "EXECUTE_BUY",
  /** Fired when user submits a sell order. Fields: orderType, amountTAU, amountAlpha, priceImpact, maxDelegatedAlpha. */
  EXECUTE_SELL: "EXECUTE_SELL",
  CONNECT_WALLET: "CONNECT_WALLET",
  DISCONNECT_WALLET: "DISCONNECT_WALLET",
  /** Fired when a transfer completes successfully. Fields: hash, from, to, amount, block_number. */
  TRANSFER_COMPLETE: "TRANSFER_COMPLETE",
  FAVORITE_SUBNET: "FAVORITE_SUBNET",
  DOCS_FEEDBACK_UP: "DOCS_FEEDBACK_UP",
  DOCS_FEEDBACK_DOWN: "DOCS_FEEDBACK_DOWN",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

/** Returns a Promise so callers can await before redirecting (avoids aborting the request on navigation). */
export function logEvent(
  eventType: EventType,
  data: Record<string, unknown> = {},
  extra_headers: Record<string, string> = {}
): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const user = localStorage.getItem("user");
  const resolvedUser = user === "null" ? null : user;

  const webAgentId = localStorage.getItem("web_agent_id");
  const validatorId = localStorage.getItem("validator_id");
  const resolvedWebAgentId = webAgentId && webAgentId !== "null" ? webAgentId : "1";
  const resolvedValidatorId = validatorId && validatorId !== "null" ? validatorId : "1";

  const eventData = {
    event_name: eventType,
    web_agent_id: resolvedWebAgentId,
    user_id: resolvedUser,
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

  console.log("📦 Logging Event:", eventType, eventData);

  return fetch("/api/log-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WebAgent-Id": resolvedWebAgentId,
      "X-Validator-Id": resolvedValidatorId,
      ...extra_headers,
    },
    body: JSON.stringify(backendPayload),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`log-event failed: ${res.status}`);
    })
    .catch((error) => {
      console.error("Failed to log event:", error);
      throw error;
    });
}
