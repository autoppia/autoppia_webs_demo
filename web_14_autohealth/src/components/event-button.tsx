"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { logEvent, EVENT_TYPES } from "@/library/events";

interface EventButtonProps
  extends React.ComponentProps<typeof Button> {
  event: keyof typeof EVENT_TYPES;
  payload?: Record<string, unknown>;
}

export function EventButton({ event, payload, onClick, ...props }: EventButtonProps) {
  return (
    <Button
      onClick={(e) => {
        logEvent(EVENT_TYPES[event], payload ?? {});
        onClick?.(e);
      }}
      {...props}
    />
  );
}
