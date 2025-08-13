"use client";
import { useEffect } from "react";
import { logEvent, EVENT_TYPES } from "@/library/events";

export default function BookConsultationLogger({ expert }) {
  useEffect(() => {
    logEvent(EVENT_TYPES.BOOK_A_CONSULTATION, {
      expertSlug: expert.slug,
      expertName: expert.name,
      timestamp: Date.now(),
    });
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
