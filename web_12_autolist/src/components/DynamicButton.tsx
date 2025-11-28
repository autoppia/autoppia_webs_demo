// src/components/DynamicButton.tsx

import { useState, useEffect, ButtonHTMLAttributes, useRef } from "react";
import { useSeedLayout } from "@/dynamic/v3-dynamic";

interface DynamicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  eventType?: string;
  variant?: "default" | "primary" | "secondary" | "danger";
  className?: string;
  children: React.ReactNode;
  index?: number;
}

export function DynamicButton({
  eventType = "button",
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
    
    // Get variant-specific classes
    const variantClasses = {
      default: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
      primary: "bg-[#d1453b] text-white hover:bg-[#c0342f]",
      secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
      danger: "bg-red-500 text-white hover:bg-red-600"
    };
    
    setAttributes({
      ...elementAttrs,
      id: elementId,
      className: `${buttonClasses} ${seedClass} ${variantClasses[variant]} ${className}`.trim()
    });
    
    setDynamicStyles(createDynamicStyles());
  }, [eventType, index, className, variant, getElementAttributes, getLayoutClasses, generateId, generateSeedClass, createDynamicStyles]);

  useEffect(() => {
    // Apply CSS variables to the button element
    if (buttonRef.current) {
      applyCSSVariables(buttonRef.current);
    }
  }, [dynamicStyles, applyCSSVariables]);

  return (
    <button
      ref={buttonRef}
      {...attributes}
      {...props}
      style={dynamicStyles}
    >
      {children}
    </button>
  );
}
