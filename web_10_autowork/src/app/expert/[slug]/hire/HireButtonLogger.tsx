"use client";
import { useEffect } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";

interface Expert {
  name: string;
  slug: string;
  role: string;
  country: string;
}

export default function HireButtonLogger({ expert }: { expert: Expert }) {
  useEffect(() => {
    logEvent(EVENT_TYPES.HIRE_BTN_CLICKED, {
      expertName: expert.name,
      expertSlug: expert.slug,
      role: expert.role,
      country: expert.country,
    });
  }, [expert]);
  return null;
}
