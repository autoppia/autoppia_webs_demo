// src/library/events.ts

export const EVENT_TYPES = {
  // Appointment Events
  BOOK_APPOINTMENT: "BOOK_APPOINTMENT",
  VIEW_APPOINTMENT: "VIEW_APPOINTMENT",
  CANCEL_APPOINTMENT: "CANCEL_APPOINTMENT",
  RESCHEDULE_APPOINTMENT: "RESCHEDULE_APPOINTMENT",
  
  // Prescription Events
  VIEW_PRESCRIPTION: "VIEW_PRESCRIPTION",
  REFILL_PRESCRIPTION: "REFILL_PRESCRIPTION",
  DOWNLOAD_PRESCRIPTION: "DOWNLOAD_PRESCRIPTION",
  
  // Doctor Events
  VIEW_DOCTOR_PROFILE: "VIEW_DOCTOR_PROFILE",
  SEARCH_DOCTORS: "SEARCH_DOCTORS",
  FILTER_DOCTORS: "FILTER_DOCTORS",
  
  // Navigation Events
  NAVIGATE_TO_APPOINTMENTS: "NAVIGATE_TO_APPOINTMENTS",
  NAVIGATE_TO_PRESCRIPTIONS: "NAVIGATE_TO_PRESCRIPTIONS",
  NAVIGATE_TO_DOCTORS: "NAVIGATE_TO_DOCTORS",
  NAVIGATE_TO_HOME: "NAVIGATE_TO_HOME",
  
  // User Actions
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  VIEW_PROFILE: "VIEW_PROFILE",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  
  // Search and Filter Events
  SEARCH_MEDICAL_RECORDS: "SEARCH_MEDICAL_RECORDS",
  FILTER_BY_DATE: "FILTER_BY_DATE",
  FILTER_BY_SPECIALTY: "FILTER_BY_SPECIALTY",
  
  // Health Data Events
  UPLOAD_HEALTH_DATA: "UPLOAD_HEALTH_DATA",
  VIEW_HEALTH_METRICS: "VIEW_HEALTH_METRICS",
  EXPORT_HEALTH_DATA: "EXPORT_HEALTH_DATA",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export function logEvent(eventType: EventType, data: Record<string, unknown> = {}, extra_headers: Record<string, string> = {}) {
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
  }).catch((error) => {
    console.error("Failed to log event:", error);
  });
}
