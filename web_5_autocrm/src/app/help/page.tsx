"use client";

import { Suspense, useEffect, useState } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";

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
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    logEvent(EVENT_TYPES.HELP_VIEWED, { page: "help" });
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 md:px-0">
      <h1 className="text-3xl font-extrabold mb-4">Help Center</h1>
      <p className="text-zinc-600 mb-6">
        Quick tips for using the CRM: managing clients, billing, and documents.
      </p>
      <div className="space-y-3">
        {FAQS.map((item, idx) => {
          const isOpen = open === idx;
          return (
            <div key={item.q} className="border border-zinc-200 rounded-2xl bg-white shadow-sm">
              <button
                className="w-full flex justify-between items-center px-4 py-3 text-left font-semibold text-zinc-800"
                onClick={() => setOpen(isOpen ? null : idx)}
              >
                {item.q}
                <span className="text-xl text-zinc-400">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm text-zinc-600">{item.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading help...</div>}>
      <HelpContent />
    </Suspense>
  );
}
