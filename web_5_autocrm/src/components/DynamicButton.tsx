// src/components/DynamicButton.tsx
// @deprecated - Use useDynamicSystem() directly instead

import { ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP } from "@/dynamic/v3";
import { EVENT_TYPES } from "@/library/events";

interface DynamicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  eventType: keyof typeof EVENT_TYPES;
  variant?: "default" | "outline" | "ghost";
  className?: string;
  children: React.ReactNode;
  index?: number;
}

export function DynamicButton({
  eventType,
  variant = "default",
  className = "",
  children,
  index = 0,
  ...props
}: DynamicButtonProps) {
  const dyn = useDynamicSystem();
  
  const buttonId = index > 0 
    ? dyn.v3.getVariant(`${eventType}-button-${index}`, ID_VARIANTS_MAP, `${eventType}-button-${index}`)
    : dyn.v3.getVariant(`${eventType}-button`, ID_VARIANTS_MAP, `${eventType}-button`);
  
  const buttonClass = dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, className || "btn-primary");

  return (
    <Button
      id={buttonId}
      className={`${buttonClass} ${className}`.trim()}
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );
}
