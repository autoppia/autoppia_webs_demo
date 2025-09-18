"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

interface EventButtonProps
  extends React.ComponentProps<typeof Button> {
  event: string;
  payload?: unknown;
}

export function EventButton({ event, payload, onClick, ...props }: EventButtonProps) {
  return (
    <Button
      onClick={(e) => {
        console.log(event, payload ?? null);
        onClick?.(e);
      }}
      {...props}
    />
  );
}
