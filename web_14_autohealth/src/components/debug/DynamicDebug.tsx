"use client";

import { useEffect } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { EVENT_TYPES } from "@/library/events";

const debugTextVariants: Record<string, string[]> = {
  debug_title: ["Debug Title", "Title Variant", "Alt Title"],
  debug_cta: ["Start Now", "Begin", "Kick Off", "Get Started"],
  debug_copy: ["Exploring dynamic outputs", "Testing variant system", "Validating anti-scraping"],
};

export function DynamicDebug() {
  const dyn = useDynamicSystem();

  const debugOrders = [
    dyn.v1.changeOrderElements("debug-order-nav", 4),
    dyn.v1.changeOrderElements("debug-order-hero", 3),
    dyn.v1.changeOrderElements("debug-order-cards", 6),
    dyn.v1.changeOrderElements("debug-order-list", 5),
    dyn.v1.changeOrderElements("debug-order-footer", 2),
    dyn.v1.changeOrderElements("debug-order-sidebar", 4),
  ];

  const debugIds = [
    dyn.v3.getVariant("nav-link", ID_VARIANTS_MAP, "nav-link"),
    dyn.v3.getVariant("hero-section", ID_VARIANTS_MAP, "hero-section"),
    dyn.v3.getVariant("cta-button", ID_VARIANTS_MAP, "cta-button"),
    dyn.v3.getVariant("doctor-card", ID_VARIANTS_MAP, "doctor-card"),
    dyn.v3.getVariant("appointment-row", ID_VARIANTS_MAP, "appointment-row"),
    dyn.v3.getVariant("records-filter", ID_VARIANTS_MAP, "records-filter"),
    dyn.v3.getVariant("prescription-card", ID_VARIANTS_MAP, "prescription-card"),
    dyn.v3.getVariant("profile-tab", ID_VARIANTS_MAP, "profile-tab"),
    dyn.v3.getVariant("contact-modal", ID_VARIANTS_MAP, "contact-modal"),
    dyn.v3.getVariant("reviews-modal", ID_VARIANTS_MAP, "reviews-modal"),
    dyn.v3.getVariant("seed-debug", ID_VARIANTS_MAP, "seed-debug"),
    dyn.v3.getVariant("stats-card", ID_VARIANTS_MAP, "stats-card"),
    dyn.v3.getVariant("hero-banner", ID_VARIANTS_MAP, "hero-banner"),
    dyn.v3.getVariant("nav-card", ID_VARIANTS_MAP, "nav-card"),
    dyn.v3.getVariant("table-row", ID_VARIANTS_MAP, "table-row"),
    dyn.v3.getVariant("badge", ID_VARIANTS_MAP, "badge"),
    dyn.v3.getVariant("icon", ID_VARIANTS_MAP, "icon"),
    dyn.v3.getVariant("time-slot-button", ID_VARIANTS_MAP, "time-slot-button"),
    dyn.v3.getVariant("input-field", ID_VARIANTS_MAP, "input-field"),
    dyn.v3.getVariant("search-input", ID_VARIANTS_MAP, "search-input"),
    dyn.v3.getVariant("search-button", ID_VARIANTS_MAP, "search-button"),
    dyn.v3.getVariant("upload-input", ID_VARIANTS_MAP, "upload-input"),
    dyn.v3.getVariant("book-now-button", ID_VARIANTS_MAP, "book-now-button"),
    dyn.v3.getVariant("view-profile-button", ID_VARIANTS_MAP, "view-profile-button"),
    dyn.v3.getVariant("doctor-profile-header", ID_VARIANTS_MAP, "doctor-profile-header"),
    dyn.v3.getVariant("debug-footer-link", ID_VARIANTS_MAP, "debug-footer-link"),
  ];

  const debugClasses = [
    dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "btn-primary"),
    dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "btn-secondary"),
    dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "card"),
    dyn.v3.getVariant("navbar", CLASS_VARIANTS_MAP, "navbar"),
    dyn.v3.getVariant("footer", CLASS_VARIANTS_MAP, "footer"),
    dyn.v3.getVariant("hero", CLASS_VARIANTS_MAP, "hero"),
    dyn.v3.getVariant("grid", CLASS_VARIANTS_MAP, "grid"),
    dyn.v3.getVariant("badge", CLASS_VARIANTS_MAP, "badge"),
    dyn.v3.getVariant("icon", CLASS_VARIANTS_MAP, "icon"),
    dyn.v3.getVariant("rating", CLASS_VARIANTS_MAP, "rating"),
    dyn.v3.getVariant("time-slot-button", CLASS_VARIANTS_MAP, "time-slot"),
    dyn.v3.getVariant("doctor-card", CLASS_VARIANTS_MAP, "doctor-card"),
    dyn.v3.getVariant("hero-banner", CLASS_VARIANTS_MAP, "hero-banner"),
    dyn.v3.getVariant("nav-link", CLASS_VARIANTS_MAP, "nav-link"),
    dyn.v3.getVariant("grid-layout", CLASS_VARIANTS_MAP, "grid-layout"),
    dyn.v3.getVariant("card-image", CLASS_VARIANTS_MAP, "card-image"),
    dyn.v3.getVariant("table-row", CLASS_VARIANTS_MAP, "table-row"),
  ];

  const debugTexts = [
    dyn.v3.getVariant("hero_title", TEXT_VARIANTS_MAP, "Hero Title"),
    dyn.v3.getVariant("hero_description", TEXT_VARIANTS_MAP, "Hero Description"),
    dyn.v3.getVariant("cta_primary", debugTextVariants, "Primary Action"),
    dyn.v3.getVariant("cta_secondary", debugTextVariants, "Secondary Action"),
    dyn.v3.getVariant("card_title", TEXT_VARIANTS_MAP, "Card Title"),
    dyn.v3.getVariant("card_description", TEXT_VARIANTS_MAP, "Card Description"),
    dyn.v3.getVariant("footer_link", TEXT_VARIANTS_MAP, "Footer Link"),
    dyn.v3.getVariant("nav_item", TEXT_VARIANTS_MAP, "Navigation Item"),
    dyn.v3.getVariant("appointment_title", TEXT_VARIANTS_MAP, "Appointment"),
    dyn.v3.getVariant("doctor_name", TEXT_VARIANTS_MAP, "Doctor Name"),
    dyn.v3.getVariant("doctor_specialty", TEXT_VARIANTS_MAP, "Doctor Specialty"),
    dyn.v3.getVariant("record_title", TEXT_VARIANTS_MAP, "Record Title"),
    dyn.v3.getVariant("record_category", TEXT_VARIANTS_MAP, "Record Category"),
    dyn.v3.getVariant("upload_label", TEXT_VARIANTS_MAP, "Upload Label"),
    dyn.v3.getVariant("view_record", TEXT_VARIANTS_MAP, "View Record"),
    dyn.v3.getVariant("filter_label", TEXT_VARIANTS_MAP, "Filter"),
    dyn.v3.getVariant("search_placeholder", TEXT_VARIANTS_MAP, "Search..."),
    dyn.v3.getVariant("search_button", TEXT_VARIANTS_MAP, "Search"),
    dyn.v3.getVariant("book_appointment", TEXT_VARIANTS_MAP, "Book Appointment"),
    dyn.v3.getVariant("view_profile", TEXT_VARIANTS_MAP, "View Profile"),
    dyn.v3.getVariant("book_now", TEXT_VARIANTS_MAP, "Book Now"),
    dyn.v3.getVariant("ratings_label", TEXT_VARIANTS_MAP, "Ratings"),
    dyn.v3.getVariant("reviews_label", TEXT_VARIANTS_MAP, "Reviews"),
    dyn.v3.getVariant("availability_label", TEXT_VARIANTS_MAP, "Availability"),
    dyn.v3.getVariant("education_label", TEXT_VARIANTS_MAP, "Education"),
    dyn.v3.getVariant("procedures_label", TEXT_VARIANTS_MAP, "Procedures"),
    dyn.v3.getVariant("contact_label", TEXT_VARIANTS_MAP, "Contact"),
    dyn.v3.getVariant("download_label", TEXT_VARIANTS_MAP, "Download"),
    dyn.v3.getVariant("refill_label", TEXT_VARIANTS_MAP, "Refill"),
    dyn.v3.getVariant("cancel_label", TEXT_VARIANTS_MAP, "Cancel"),
    dyn.v3.getVariant("schedule_label", TEXT_VARIANTS_MAP, "Schedule"),
    dyn.v3.getVariant("debug_title", debugTextVariants, "Debug Title"),
    dyn.v3.getVariant("debug_cta", debugTextVariants, "Debug CTA"),
  ];

  const debugWraps = [
    dyn.v1.addWrapDecoy("debug-wrapper-hero", <span className="hidden">{debugTexts[0]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-description", <span className="hidden">{debugTexts[1]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-cta", <span className="hidden">{debugTexts[2]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-cta-secondary", <span className="hidden">{debugTexts[3]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-card", <span className="hidden">{debugTexts[4]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-card-desc", <span className="hidden">{debugTexts[5]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-footer", <span className="hidden">{debugTexts[6]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-nav", <span className="hidden">{debugTexts[7]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-appointment", <span className="hidden">{debugTexts[8]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-doctor", <span className="hidden">{debugTexts[9]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-specialty", <span className="hidden">{debugTexts[10]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-record", <span className="hidden">{debugTexts[11]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-category", <span className="hidden">{debugTexts[12]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-upload", <span className="hidden">{debugTexts[13]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-view-record", <span className="hidden">{debugTexts[14]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-filter", <span className="hidden">{debugTexts[15]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-search", <span className="hidden">{debugTexts[16]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-search-button", <span className="hidden">{debugTexts[17]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-book", <span className="hidden">{debugTexts[18]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-view-profile", <span className="hidden">{debugTexts[19]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-book-now", <span className="hidden">{debugTexts[20]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-ratings", <span className="hidden">{debugTexts[21]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-reviews", <span className="hidden">{debugTexts[22]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-availability", <span className="hidden">{debugTexts[23]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-education", <span className="hidden">{debugTexts[24]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-procedures", <span className="hidden">{debugTexts[25]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-contact", <span className="hidden">{debugTexts[26]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-download", <span className="hidden">{debugTexts[27]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-refill", <span className="hidden">{debugTexts[28]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-cancel", <span className="hidden">{debugTexts[29]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-schedule", <span className="hidden">{debugTexts[30]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-debug-title", <span className="hidden">{debugTexts[31]}</span>),
    dyn.v1.addWrapDecoy("debug-wrapper-debug-cta", <span className="hidden">{debugTexts[2]}</span>),
  ];

  const eventCoverage = [
    EVENT_TYPES.BOOK_APPOINTMENT,
    EVENT_TYPES.VIEW_APPOINTMENT,
    EVENT_TYPES.CANCEL_APPOINTMENT,
    EVENT_TYPES.RESCHEDULE_APPOINTMENT,
    EVENT_TYPES.APPOINTMENT_BOOKED_SUCCESSFULLY,
    EVENT_TYPES.CANCEL_BOOK_APPOINTMENT,
    EVENT_TYPES.VIEW_PRESCRIPTION,
    EVENT_TYPES.REFILL_PRESCRIPTION,
    EVENT_TYPES.DOWNLOAD_PRESCRIPTION,
    EVENT_TYPES.VIEW_DOCTOR_PROFILE,
    EVENT_TYPES.CONTACT_DOCTOR,
    EVENT_TYPES.VIEW_REVIEWS_CLICKED,
    EVENT_TYPES.SEARCH_DOCTORS,
    EVENT_TYPES.FILTER_DOCTORS,
    EVENT_TYPES.CANCEL_CONTACT_DOCTOR,
    EVENT_TYPES.FILTER_REVIEWS,
    EVENT_TYPES.SORT_REVIEWS,
    EVENT_TYPES.CANCEL_VIEW_REVIEWS,
    EVENT_TYPES.BROWSE_APPOINTMENTS_CLICKED,
    EVENT_TYPES.BROWSE_PRESCRIPTIONS_CLICKED,
    EVENT_TYPES.BROWSE_DOCTORS_CLICKED,
    EVENT_TYPES.BROWSE_HOME_CLICKED,
    EVENT_TYPES.BROWSE_MEDICAL_RECORDS_CLICKED,
    EVENT_TYPES.BOOK_NOW_CLICKED,
    EVENT_TYPES.LOGIN,
    EVENT_TYPES.LOGOUT,
    EVENT_TYPES.VIEW_PROFILE,
    EVENT_TYPES.UPDATE_PROFILE,
    EVENT_TYPES.SEARCH_MEDICAL_RECORDS,
    EVENT_TYPES.FILTER_BY_DATE,
    EVENT_TYPES.FILTER_BY_SPECIALTY,
    EVENT_TYPES.UPLOAD_HEALTH_DATA,
    EVENT_TYPES.VIEW_HEALTH_METRICS,
    EVENT_TYPES.EXPORT_HEALTH_DATA,
    EVENT_TYPES.DOCTOR_CONTACTED_SUCCESSFULLY,
  ];

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.debug("[DynamicDebug] seed", dyn.seed, {
        v1: isV1Enabled(),
        v3: isV3Enabled(),
        wrappers: debugWraps.length,
        ids: debugIds.length,
        classes: debugClasses.length,
        texts: debugTexts.length,
        eventCount: eventCoverage.length,
      });
    }
  }, [dyn.seed, debugWraps.length, debugIds.length, debugClasses.length, debugTexts.length, eventCoverage.length]);

  return (
    <div className="hidden" aria-hidden="true" data-dynamic-debug data-order-count={debugOrders.length}>
      {debugWraps}
      <span data-debug-ids={debugIds.join("|")} data-debug-classes={debugClasses.join("|")} data-debug-texts={debugTexts.slice(0, 5).join("|")} />
    </div>
  );
}

