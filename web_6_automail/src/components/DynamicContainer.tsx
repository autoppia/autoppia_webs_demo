// src/components/DynamicContainer.tsx
import React, { HTMLAttributes } from "react";
import { cn } from "@/library/utils";
import { generateElementAttributes } from "@/library/layoutVariants";
import { EVENT_TYPES } from "@/library/events";

interface ContainerBaseProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export interface DynamicContainerProps extends ContainerBaseProps {
  eventType: keyof typeof EVENT_TYPES;
}

export interface DynamicItemProps extends ContainerBaseProps {
  eventType: keyof typeof EVENT_TYPES;
}

export function DynamicContainer({
  children,
  className = "",
  eventType,
  ...props
}: DynamicContainerProps) {
  const attributes = generateElementAttributes(eventType);

  return (
    <div
      {...props}
      {...attributes}
      className={cn(
        "rounded-lg border border-border bg-background shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DynamicItem({
  children,
  className = "",
  eventType,
  ...props
}: DynamicItemProps) {
  const attributes = generateElementAttributes(eventType);

  return (
    <div
      {...props}
      {...attributes}
      className={cn(
        "p-4 bg-background hover:bg-accent/5 transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}
