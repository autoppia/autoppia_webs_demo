"use client";
import { useEffect } from "react";
import { logEvent, EVENT_TYPES } from "@/library/events";

export default function BookConsultationLogger({ expert }) {
  useEffect(() => {
    logEvent(EVENT_TYPES.BOOK_A_CONSULTATION, {
        expertName: expert.name,
        expertSlug: expert.slug,
        role: expert.role,
        rate: expert.rate,
        country: expert.country,
        rating: expert.rating,
        jobs: expert.jobs,
        timestamp: Date.now(),
    });
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
