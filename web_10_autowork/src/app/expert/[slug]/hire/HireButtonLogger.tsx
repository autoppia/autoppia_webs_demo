"use client";
import {useEffect} from "react";
import {EVENT_TYPES, logEvent} from "@/library/events";

export default function HireButtonLogger({expert}) {
    useEffect(() => {
        logEvent(EVENT_TYPES.HIRE_BTN_CLICKED, {
            expertName: expert.name,
            expertSlug: expert.slug,
            role: expert.role,
            country: expert.country,
        });
        // Only on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
}
