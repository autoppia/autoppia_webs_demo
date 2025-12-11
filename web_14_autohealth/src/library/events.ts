// src/library/events.ts

export const EVENT_TYPES = {
  // Appointment Events
  BOOK_APPOINTMENT: "BOOK_APPOINTMENT",
  VIEW_APPOINTMENT: "VIEW_APPOINTMENT",
  CANCEL_APPOINTMENT: "CANCEL_APPOINTMENT",
  RESCHEDULE_APPOINTMENT: "RESCHEDULE_APPOINTMENT",
  APPOINTMENT_BOOKED_SUCCESSFULLY: "APPOINTMENT_BOOKED_SUCCESSFULLY",
  CANCEL_BOOK_APPOINTMENT: "CANCEL_BOOK_APPOINTMENT",
  
  // Prescription Events
  VIEW_PRESCRIPTION: "VIEW_PRESCRIPTION",
  REFILL_PRESCRIPTION: "REFILL_PRESCRIPTION",
  DOWNLOAD_PRESCRIPTION: "DOWNLOAD_PRESCRIPTION",
  
  // Doctor Events
  VIEW_DOCTOR_PROFILE: "VIEW_DOCTOR_PROFILE",
  CONTACT_DOCTOR: "CONTACT_DOCTOR",
  VIEW_REVIEWS_CLICKED: "VIEW_REVIEWS_CLICKED",
  SEARCH_DOCTORS: "SEARCH_DOCTORS",
  FILTER_DOCTORS: "FILTER_DOCTORS",
  CANCEL_CONTACT_DOCTOR: "CANCEL_CONTACT_DOCTOR",
  FILTER_REVIEWS: "FILTER_REVIEWS",
  SORT_REVIEWS: "SORT_REVIEWS",
  CANCEL_VIEW_REVIEWS: "CANCEL_VIEW_REVIEWS",
  
  // Navigation Events
  BROWSE_APPOINTMENTS_CLICKED: "BROWSE_APPOINTMENTS_CLICKED",
  BROWSE_PRESCRIPTIONS_CLICKED: "BROWSE_PRESCRIPTIONS_CLICKED",
  BROWSE_DOCTORS_CLICKED: "BROWSE_DOCTORS_CLICKED",
  BROWSE_HOME_CLICKED: "BROWSE_HOME_CLICKED",
  BROWSE_MEDICAL_RECORDS_CLICKED: "BROWSE_MEDICAL_RECORDS_CLICKED",
  BOOK_NOW_CLICKED: "BOOK_NOW_CLICKED",
  
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
  
  // Doctor Contact Events
  DOCTOR_CONTACTED_SUCCESSFULLY: "DOCTOR_CONTACTED_SUCCESSFULLY",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export function logEvent(eventType: EventType, data: Record<string, unknown> = {}, extra_headers: Record<string, string> = {}) {
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
