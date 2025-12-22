"use client";

import { Suspense, useEffect, useState } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP } from "@/dynamic/v3";

const FAQS = [
  {
    q: "How do I search and filter clients?",
    a: "Use the search bar on Clients to find by name or email, then filter by status or matter count with the dropdowns.",
  },
  {
    q: "How do I manage documents?",
    a: "Upload via drag-and-drop or file picker in Documents. You can rename, delete, or view versions in each card.",
  },
  {
    q: "Can I log time and filter billing entries?",
    a: "Yes. Use the timer or manual entry in Billing, then search and filter entries by date (today, week, two weeks, month, or a specific date).",
  },
  {
    q: "How do I message or delete a client?",
    a: "Open the client profile to send a quick message or remove the client from your list if needed.",
  },
];

function HelpContent() {
  const dyn = useDynamicSystem();
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    logEvent(EVENT_TYPES.HELP_VIEWED, { page: "help" });
  }, []);

  return dyn.v1.addWrapDecoy("help-page", (
    <div className="max-w-4xl mx-auto py-10 px-4 md:px-0">
      {dyn.v1.addWrapDecoy("help-header", (
        <>
          <h1 id={dyn.v3.getVariant("help_center_title", ID_VARIANTS_MAP, "help-center-title")} className="text-3xl font-extrabold mb-4">
            {dyn.v3.getVariant("help_center", undefined, "Help Center")}
          </h1>
          <p id={dyn.v3.getVariant("help_description", ID_VARIANTS_MAP, "help-description")} className="text-zinc-600 mb-6">
            {dyn.v3.getVariant("help_description_text", undefined, "Quick tips for using the CRM: managing clients, billing, and documents.")}
          </p>
        </>
      ))}
      {dyn.v1.addWrapDecoy("help-faqs", (
        <div className="space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = open === idx;
            return dyn.v1.addWrapDecoy(`help-faq-${idx}`, (
              <div key={item.q} className="border border-zinc-200 rounded-2xl bg-white shadow-sm">
                <button
                  id={dyn.v3.getVariant(`faq_question_${idx}`, ID_VARIANTS_MAP, `faq-question-${idx}`)}
                  className="w-full flex justify-between items-center px-4 py-3 text-left font-semibold text-zinc-800"
                  onClick={() => setOpen(isOpen ? null : idx)}
                >
                  {item.q}
                  <span className="text-xl text-zinc-400">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div id={dyn.v3.getVariant(`faq_answer_${idx}`, ID_VARIANTS_MAP, `faq-answer-${idx}`)} className="px-4 pb-4 text-sm text-zinc-600">{item.a}</div>
                )}
              </div>
            ));
          })}
        </div>
      ))}
    </div>
  ), "help-page-wrap");
}

export default function HelpPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading help...</div>}>
      <HelpContent />
    </Suspense>
  );
}
