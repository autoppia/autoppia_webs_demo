// src/lib/logger.ts

export const EVENT_TYPES = {
  SEARCH_RESTAURANT: "SEARCH_RESTAURANT",
  TIME_DROPDOWN_OPENED: "TIME_DROPDOWN_OPENED",
  DATE_DROPDOWN_OPENED: "DATE_DROPDOWN_OPENED",
  PEOPLE_DROPDOWN_OPENED: "PEOPLE_DROPDOWN_OPENED",
  SCROLL_VIEW: "SCROLL_VIEW",
  VIEW_RESTAURANT: "VIEW_RESTAURANT",
  BOOK_RESTAURANT: "BOOK_RESTAURANT",
  COUNTRY_SELECTED: "COUNTRY_SELECTED",
  OCCASION_SELECTED: "OCCASION_SELECTED",
  RESERVATION_COMPLETE: "RESERVATION_COMPLETE",
  VIEW_FULL_MENU: "VIEW_FULL_MENU",
  COLLAPSE_MENU: "COLLAPSE_MENU",
  ABOUT_PAGE_VIEW: "ABOUT_PAGE_VIEW",
  ABOUT_FEATURE_CLICK: "ABOUT_FEATURE_CLICK",
  CONTACT_PAGE_VIEW: "CONTACT_PAGE_VIEW",
  CONTACT_CARD_CLICK: "CONTACT_CARD_CLICK",
  CONTACT_FORM_SUBMIT: "CONTACT_FORM_SUBMIT",
  HELP_PAGE_VIEW: "HELP_PAGE_VIEW",
  HELP_CATEGORY_SELECTED: "HELP_CATEGORY_SELECTED",
  HELP_FAQ_TOGGLED: "HELP_FAQ_TOGGLED",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

// Import the SeedVariationManager for event registration
import { SeedVariationManager } from "./utils";

export function logEvent(
  eventType: EventType,
  data: any = {},
  extra_headers: Record<string, string> = {}
) {
  if (typeof window === "undefined") return;

  try {
    let user = localStorage.getItem("user");
    if (user === "null") {
      user = null;
    }

    const payload = {
      event_name: eventType,
      data,
      user_id: user,
    };

    // Solo log en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log("📦 Logging Event:", { ...payload, headers: extra_headers });
    }

    // Register the event with the SeedVariationManager to trigger layout changes
    // Envolver en try-catch para que no rompa si hay error
    try {
      SeedVariationManager.registerEvent(eventType);
    } catch (err) {
      // Ignorar errores en el registro de eventos - no debe romper la página
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ Error registering event:", err);
      }
    }

    // Enviar evento de forma completamente silenciosa (no bloquear la UI si falla)
    fetch("/api/log-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...extra_headers,
      },
      body: JSON.stringify(payload),
    })
      .catch(() => {
        // Ignorar errores silenciosamente - no afectar la experiencia del usuario
      })
      .finally(() => {
        // No hacer nada, solo asegurar que no hay efectos secundarios
      });
  } catch (err) {
    // Si algo falla, ignorar completamente - la página debe seguir funcionando
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ Error in logEvent (ignored):", err);
    }
  }
}

// Helper function to get active events
export function getActiveEvents(): string[] {
  return SeedVariationManager.getActiveEvents();
}

// Helper function to clear all events
export function clearEvents(): void {
  SeedVariationManager.clearEvents();
}

// Helper function to register an event manually
export function registerEvent(eventType: string): void {
  SeedVariationManager.registerEvent(eventType);
}
