// src/library/events.ts

export const EVENT_TYPES = {
  // Appointment Events
  /** Fired when user clicks the Book Appointment button (opens appointment booking form/modal). */
  OPEN_APPOINTMENT_FORM: "OPEN_APPOINTMENT_FORM",
  /** Fired only after the booking form is fully completed and the appointment is successfully reserved. */
  APPOINTMENT_BOOKED_SUCCESSFULLY: "APPOINTMENT_BOOKED_SUCCESSFULLY",
  /** Fired when user submits the homepage quick appointment form (hero); shows "We will contact you" popup. */
  REQUEST_QUICK_APPOINTMENT: "REQUEST_QUICK_APPOINTMENT",
  /** Fired when user clicks Search on the Appointments page (applies doctor/specialty/date filters). */
  SEARCH_APPOINTMENT: "SEARCH_APPOINTMENT",

  // Prescription Events
  /** Fired when user clicks Search on the Prescriptions page (applies medicine/doctor filters). */
  SEARCH_PRESCRIPTION: "SEARCH_PRESCRIPTION",
  VIEW_PRESCRIPTION: "VIEW_PRESCRIPTION",
  REFILL_PRESCRIPTION: "REFILL_PRESCRIPTION",

  // Doctor Events
  /** Fired when user clicks Search on the Doctors page (applies name/specialty filters). */
  SEARCH_DOCTORS: "SEARCH_DOCTORS",
  VIEW_DOCTOR_PROFILE: "VIEW_DOCTOR_PROFILE",
  /** Fired when user opens the Education & Certifications tab on a doctor profile. */
  VIEW_DOCTOR_EDUCATION: "VIEW_DOCTOR_EDUCATION",
  /** Fired when user clicks Contact Doctor and opens the contact form modal. */
  OPEN_CONTACT_DOCTOR_FORM: "OPEN_CONTACT_DOCTOR_FORM",
  CONTACT_DOCTOR: "CONTACT_DOCTOR",
  /** Fired when user filters doctor reviews by star rating (e.g. view 1-star reviews of Dr. Pepe). */
  FILTER_DOCTOR_REVIEWS: "FILTER_DOCTOR_REVIEWS",

  // Health Data Events
  /** Fired when user clicks Search on the Medical Records page (applies title/doctor filters). */
  SEARCH_MEDICAL_ANALYSIS: "SEARCH_MEDICAL_ANALYSIS",
  /** Fired when user clicks View Analysis on a medical analysis card. */
  VIEW_MEDICAL_ANALYSIS: "VIEW_MEDICAL_ANALYSIS",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

/** Returns a Promise so callers can await before redirecting (avoids aborting the request on navigation). */
export function logEvent(eventType: EventType, data: Record<string, unknown> = {}, extra_headers: Record<string, string> = {}): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  let user = localStorage.getItem("user");
  if (user === "null") {
    user = null;
  }

  const webAgentId = localStorage.getItem("web_agent_id");
  const validatorId = localStorage.getItem("validator_id");
  const resolvedWebAgentId = webAgentId && webAgentId !== "null" ? webAgentId : "1";
  const resolvedValidatorId = validatorId && validatorId !== "null" ? validatorId : "1";

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
      console.error("❌ Failed to log event:", error);
      throw error;
    });
}
