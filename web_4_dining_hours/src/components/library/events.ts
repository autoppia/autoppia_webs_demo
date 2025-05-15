// src/lib/logger.ts

export const EVENT_TYPES = {
  RESERVATION_COMPLETE: "RESERVATION_COMPLETE",
  SEARCH_RESTAURANT:"SEARCH_RESTAURANT",
  TIME_DROPDOWN_OPENED:"TIME_DROPDOWN_OPENED",
  DATE_DROPDOWN_OPENED:"DATE_DROPDOWN_OPENED",
  PEOPLE_DROPDOWN_OPENED:"PEOPLE_DROPDOWN_OPENED",
  BOOK_RESTAURANT:"BOOK_RESTAURANT"
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