// src/lib/logger.ts

export const EVENT_TYPES = {
  POST_A_JOB: "POST_A_JOB", //done
  WRITE_JOB_TITLE: "WRITE_JOB_TITLE", //done
  NEXT_SKILLS: "NEXT_SKILLS", //done
  BACK_BUTTON: "BACK_BUTTON", //done
  CLOSE_POST_A_JOB_WINDOW: "CLOSE_POST_A_JOB_WINDOW", //done
  SUBMIT_JOB: "SUBMIT_JOB", //done
  ATTACH_FILE_CLICKED: "ATTACH_FILE_CLICKED", //done
  SEARCH_SKILL: "SEARCH_SKILL", //done
  ADD_SKILL: "ADD_SKILL", //done
  REMOVE_SKILL: "REMOVE_SKILL", //done
  BOOK_A_CONSULTATION: "BOOK_A_CONSULTATION", //done
  HIRE_BTN_CLICKED: "HIRE_BTN_CLICKED", //done
  SELECT_HIRING_TEAM: "SELECT_HIRING_TEAM", //DONE
  HIRE_CONSULTANT: "HIRE_CONSULTANT", //done
  CANCEL_HIRE: "CANCEL_HIRE", //done
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export function logEvent<T extends Record<string, unknown>>(
  eventType: EventType,
  data: T = {} as T,
  extra_headers: Record<string, string> = {}
) {
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

  console.log("📦 Logging Event:", backendPayload);

  fetch("/api/log-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...extra_headers,
    },
    body: JSON.stringify(backendPayload),
  }).catch((error) => {
    console.error("❌ Failed to log event:", error);
  });
}
