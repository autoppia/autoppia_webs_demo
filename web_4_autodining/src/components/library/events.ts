// src/lib/logger.ts

export const EVENT_TYPES = {
  SEARCH_RESTAURANT:"SEARCH_RESTAURANT",
  TIME_DROPDOWN_OPENED:"TIME_DROPDOWN_OPENED",
  DATE_DROPDOWN_OPENED:"DATE_DROPDOWN_OPENED",
  PEOPLE_DROPDOWN_OPENED:"PEOPLE_DROPDOWN_OPENED",
  SCROLL_VIEW:"SCROLL_VIEW",
  VIEW_RESTAURANT:"VIEW_RESTAURANT",
  BOOK_RESTAURANT:"BOOK_RESTAURANT",
  COUNTRY_SELECTED:"COUNTRY_SELECTED",
  OCCASION_SELECTED:"OCCASION_SELECTED",
  RESERVATION_COMPLETE: "RESERVATION_COMPLETE",
  VIEW_FULL_MENU:"VIEW_FULL_MENU",
  COLLAPSE_MENU:"COLLAPSE_MENU",
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