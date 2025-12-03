"use client";

import { useSeedRouter } from "@/hooks/useSeedRouter";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useSeedLayout } from "@/dynamic/v3-dynamic";

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
  const { getElementAttributes, getText } = useSeedLayout();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    logEvent(EVENT_TYPES.BOOK_A_CONSULTATION, {
      expertName: expert.name,
      event: "hire_click",
      timestamp: Date.now(),
    });
    router.push(`/expert/${expert.slug}/hire`);
  };

  return (
    <button
      {...getElementAttributes('expert-hire-button', 0)}
      type="button"
      onClick={handleClick}
      className="px-8 py-2 rounded-full bg-[#1fc12c] text-white text-lg font-semibold shadow-sm ml-1 text-center flex items-center justify-center cursor-pointer hover:bg-[#1ab825] transition"
    >
      {getText('expert-hire-button-label', 'Start hire')}
    </button>
  );
}
