"use client";

import { useSeedRouter } from "@/hooks/useSeedRouter";
import { EVENT_TYPES, logEvent } from "@/library/events";

export default function HireButton({
  expert,
}: {
  expert: {
    name: string;
    slug: string;
    role: string;
    country: string;
  };
}) {
  const router = useSeedRouter();

  return (
    <button
      onClick={() => {
        router.push(`/expert/${expert.slug}/hire`);
        logEvent(EVENT_TYPES.BOOK_A_CONSULTATION, {
          expertName: expert.name,
          event: "hire_click",
          timestamp: Date.now(),
        });
      }}
      className="px-8 py-2 rounded-full bg-[#1fc12c] text-white text-lg font-semibold shadow-sm ml-1 text-center flex items-center justify-center"
    >
      Hire
    </button>
  );
}
