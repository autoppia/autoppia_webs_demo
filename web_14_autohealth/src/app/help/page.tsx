"use client";

import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { cn } from "@/library/utils";
import { useEffect, useMemo } from "react";

const faqItems = [
  {
    question: "How do I book an appointment?",
    answer:
      "Navigate to the Appointments page from the top menu, then click the \"Book now\" button. Select your preferred doctor, date, and time slot to confirm your booking.",
  },
  {
    question: "How can I view my prescriptions?",
    answer:
      "Go to the Prescriptions page to see all your current and past prescriptions. You can filter by status or search by medicine or doctor name.",
  },
  {
    question: "How do I request a prescription refill?",
    answer:
      "Open the Prescriptions page, click \"View Prescription\" on the medication you need refilled, and then click \"Request Refill\" at the bottom of the detail view.",
  },
  {
    question: "Where can I find my medical records?",
    answer:
      "Your medical analysis records are available on the Medical Analysis page. You can view test results, lab reports, and other health data there.",
  },
  {
    question: "How do I find a specific doctor?",
    answer:
      "Visit the Doctors page to browse our directory. You can view each doctor's profile, specialty, and availability by clicking on their name.",
  },
  {
    question: "Who do I contact for technical support?",
    answer:
      "For technical issues with the portal, please reach out to our support team at support@autohealth.demo. We aim to respond within 24 hours.",
  },
];

export default function HelpPage() {
  const dyn = useDynamicSystem();

  useEffect(() => {
    logEvent(EVENT_TYPES.VIEW_HELP_PAGE, { page: "help" });
  }, []);

  const orderedFaqItems = useMemo(() => {
    const order = dyn.v1.changeOrderElements("help-faq-items", faqItems.length);
    return order.map((idx) => faqItems[idx]);
  }, [dyn]);

  const orderedSections = useMemo(() => {
    const sections = ["header", "faq", "contact"];
    const order = dyn.v1.changeOrderElements("help-sections", sections.length);
    return order.map((idx) => sections[idx]);
  }, [dyn]);

  return (
    <div className="container py-10">
      {orderedSections.map((section, si) =>
        dyn.v1.addWrapDecoy(`help-section-${si}`, (
          <div key={section}>
            {section === "header" && (
              dyn.v1.addWrapDecoy("help-header", (
                <div className="mb-8">
                  <h1
                    id={dyn.v3.getVariant("help-title", ID_VARIANTS_MAP, "help-title")}
                    className={cn("text-2xl font-semibold", dyn.v3.getVariant("help-title", CLASS_VARIANTS_MAP, ""))}
                  >
                    {dyn.v3.getVariant("help_title", TEXT_VARIANTS_MAP, "Help & Support")}
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    {dyn.v3.getVariant("help_subtitle", TEXT_VARIANTS_MAP, "Find answers to common questions about using the AutoHealth portal.")}
                  </p>
                </div>
              ))
            )}

            {section === "faq" && (
              dyn.v1.addWrapDecoy("help-faq", (
                <div className="space-y-4">
                  <h2
                    id={dyn.v3.getVariant("faq-heading", ID_VARIANTS_MAP, "faq-heading")}
                    className={cn("text-xl font-semibold", dyn.v3.getVariant("faq-heading", CLASS_VARIANTS_MAP, ""))}
                  >
                    {dyn.v3.getVariant("faq_heading", TEXT_VARIANTS_MAP, "Frequently Asked Questions")}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {orderedFaqItems.map((item, i) =>
                      dyn.v1.addWrapDecoy(`faq-item-${i}`, (
                        <div
                          key={i}
                          id={dyn.v3.getVariant(`faq-item-${i}`, ID_VARIANTS_MAP, `faq-item-${i}`)}
                          className={cn("rounded-lg border bg-card p-4", dyn.v3.getVariant("faq-item", CLASS_VARIANTS_MAP, ""))}
                        >
                          <h3 className="font-medium">{item.question}</h3>
                          <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
                        </div>
                      ), `faq-item-${i}`)
                    )}
                  </div>
                </div>
              ))
            )}

            {section === "contact" && (
              dyn.v1.addWrapDecoy("help-contact", (
                <div className="mt-8 rounded-lg border bg-emerald-50 p-6">
                  <h2
                    id={dyn.v3.getVariant("contact-heading", ID_VARIANTS_MAP, "contact-heading")}
                    className={cn("text-xl font-semibold text-emerald-800", dyn.v3.getVariant("contact-heading", CLASS_VARIANTS_MAP, ""))}
                  >
                    {dyn.v3.getVariant("contact_heading", TEXT_VARIANTS_MAP, "Still need help?")}
                  </h2>
                  <p className="mt-2 text-sm text-emerald-700">
                    {dyn.v3.getVariant("contact_text", TEXT_VARIANTS_MAP, "If you couldn't find what you're looking for, contact our support team at support@autohealth.demo and we'll get back to you as soon as possible.")}
                  </p>
                </div>
              ))
            )}
          </div>
        ), `help-section-${si}`)
      )}
    </div>
  );
}
