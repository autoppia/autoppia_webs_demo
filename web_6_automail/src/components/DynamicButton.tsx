// src/components/DynamicButton.tsx
import React, { ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { generateElementAttributes, generateButtonLayout } from "@/library/layoutVariants";
import { EVENT_TYPES } from "@/library/events";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children: React.ReactNode;
}

export interface DynamicButtonProps extends ButtonProps {
  eventType: keyof typeof EVENT_TYPES;
}

export function DynamicButton({
  eventType,
  variant = "default",
  size = "default",
  className = "",
  children,
  ...props
}: DynamicButtonProps) {
  const attributes = generateElementAttributes(eventType);
  const layout = generateButtonLayout(eventType);

  return (
    <Button
      {...props}
      {...attributes}
      variant={variant}
      size={size}
      className={`${layout} ${className}`}
    >
      {children}
    </Button>
  );
}
