"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";

const FAQS = [
  {
    question: "How do I change or cancel my reservation?",
    answer: "Go to your trips, open the reservation, and follow the change or cancel prompts. Policies vary by host.",
  },
  {
    question: "What payment options are available?",
    answer: "We accept major cards and let you choose cash on arrival for select stays during checkout.",
  },
  {
    question: "How do I contact the host?",
    answer: "Use the Message Host box on the listing or during checkout. Messages are delivered instantly.",
  },
  {
    question: "How is pricing calculated?",
    answer: "Nightly rate plus cleaning and service fees. The total is shown before you confirm and pay.",
  },
];

function HelpContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dyn = useDynamicSystem();

  useEffect(() => {
    logEvent(EVENT_TYPES.HELP_VIEWED, { page: "help" });
  }, []);

  const toggleItem = (index: number) => {
    const next = openIndex === index ? null : index;
    setOpenIndex(next);
    if (next !== null) {
      const item = FAQS[next];
      logEvent(EVENT_TYPES.FAQ_OPENED, {
        question: item.question,
      });
    }
  };

  return (
    dyn.v1.addWrapDecoy("help-page", (
    <div className="mt-6 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-2">Help & FAQs</h1>
      <p className="text-neutral-600 mb-4">
        Get answers to common questions about booking, payments, and messaging hosts.
      </p>

      <div className="flex flex-col gap-3">
        {FAQS.map((item, index) => {
          const open = openIndex === index;
          return (
            <div
              key={item.question}
              className="border rounded-xl bg-white shadow-sm"
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => toggleItem(index)}
              >
                <span className="font-medium text-neutral-800">{item.question}</span>
                <span className="text-xl text-neutral-500">
                  {open ? "−" : "+"}
                </span>
              </button>
              {open && (
                <div className="px-4 pb-4 text-sm text-neutral-700">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
    ), "help-page-wrap")
  );
}

export default function HelpPage() {
  return (
    <Suspense fallback={<div>Loading help...</div>}>
      <HelpContent />
    </Suspense>
  );
}
