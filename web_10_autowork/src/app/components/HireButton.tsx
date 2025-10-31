"use client";

import { useRouter } from "next/navigation";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useSeedLayout } from "@/library/useSeedLayout";

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
  const router = useRouter();
  const { getElementAttributes, getText } = useSeedLayout();

  return (
    <button
      onClick={() => {
        router.push(`/expert/${expert.slug}/hire`);
      }}
      className="px-8 py-2 rounded-full bg-[#1fc12c] text-white text-lg font-semibold shadow-sm ml-1 text-center flex items-center justify-center"
      {...getElementAttributes('expert-hire-button', 0)}
    >
      {getText('expert-hire-button-label', 'Hire')}
    </button>
  );
}
