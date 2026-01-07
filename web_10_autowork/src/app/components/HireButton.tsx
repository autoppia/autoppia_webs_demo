"use client";

import { useSeedRouter } from "@/hooks/useSeedRouter";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useSeedLayout } from "@/dynamic/v3-dynamic";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

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
  const { getElementAttributes, getText, dyn } = useSeedLayout();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    logEvent(EVENT_TYPES.HIRE_BTN_CLICKED, {
      expertName: expert.name,
      expertSlug: expert.slug,
      country: expert.country,
      role: expert.role,
      event: "hire_click",
      timestamp: Date.now(),
    });
    router.push(`/expert/${expert.slug}/hire`);
  };

  return dyn.v1.addWrapDecoy("expert-hire-button", (
    <button
      id={dyn.v3.getVariant("start-hire-button", ID_VARIANTS_MAP, "start-hire-button")}
      type="button"
      onClick={handleClick}
      className={`px-8 py-2 rounded-full bg-[#1fc12c] text-white text-lg font-semibold shadow-sm ml-1 text-center flex items-center justify-center cursor-pointer hover:bg-[#1ab825] transition ${dyn.v3.getVariant("start-hire-button-class", CLASS_VARIANTS_MAP, "")}`}
    >
      {dyn.v3.getVariant("start-hire-button-text", TEXT_VARIANTS_MAP, getText('expert-hire-button-label', 'Start hire'))}
    </button>
  ));
}
