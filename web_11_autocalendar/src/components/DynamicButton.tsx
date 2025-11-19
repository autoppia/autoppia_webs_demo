// src/components/DynamicButton.tsx

import { useState, useEffect, ButtonHTMLAttributes, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSeedLayout } from "@/dynamic/v3-dynamic";
import { EVENT_TYPES } from "@/library/events";

interface DynamicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  eventType: keyof typeof EVENT_TYPES;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const {
    getElementAttributes,
    getLayoutClasses,
    generateId,
    generateSeedClass,
    applyCSSVariables,
    createDynamicStyles
  } = useSeedLayout();

  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({});

  useEffect(() => {
    // Generate dynamic attributes and styles based on seed
    const elementAttrs = getElementAttributes(eventType, index);
    const buttonClasses = getLayoutClasses('button');
    const elementId = generateId(eventType, index);
    const seedClass = generateSeedClass('dynamic-button');
    
    setAttributes({
      ...elementAttrs,
      id: elementId,
      className: `${buttonClasses} ${seedClass} ${className}`.trim()
    });
    
    setDynamicStyles(createDynamicStyles());
  }, [eventType, index, className, getElementAttributes, getLayoutClasses, generateId, generateSeedClass, createDynamicStyles]);

  useEffect(() => {
    // Apply CSS variables to the button element
    if (buttonRef.current) {
      applyCSSVariables(buttonRef.current);
    }
  }, [dynamicStyles, applyCSSVariables]);

  return (
    <Button
      ref={buttonRef}
      {...attributes}
      {...props}
      variant={variant}
      style={dynamicStyles}
    >
      {children}
    </Button>
  );
}
