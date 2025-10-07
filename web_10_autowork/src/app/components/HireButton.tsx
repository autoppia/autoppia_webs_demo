"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

  return (
    <button
      onClick={() => {
        // logEvent(EVENT_TYPES.HIRE_BTN_CLICKED, {
        //   expertName: expert.name,
        //   expertSlug: expert.slug,
        //   role: expert.role,
        //   country: expert.country,
        // });

        router.push(`/expert/${expert.slug}/hire`);
      }}
      className="px-8 py-2 rounded-full bg-[#1fc12c] text-white text-lg font-semibold shadow-sm ml-1 text-center flex items-center justify-center"
    >
      Hire
    </button>
  );
}
