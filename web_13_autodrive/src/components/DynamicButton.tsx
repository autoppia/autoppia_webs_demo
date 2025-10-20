// src/components/DynamicButton.tsx

import { useState, useEffect, ButtonHTMLAttributes, useRef } from "react";
import { useSeedLayout } from "@/library/useSeedLayout";

interface DynamicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  eventType?: string;
  variant?: "default" | "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
  index?: number;
}

export function DynamicButton({
  eventType = "button",
  variant = "default",
  size = "md",
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
    
    // Get variant and size specific classes
    const variantClasses = {
      default: "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200",
      primary: "bg-[#2095d2] text-white hover:bg-[#1273a0] shadow-lg",
      secondary: "bg-transparent border-2 border-[#2095d2] text-[#2095d2] hover:bg-[#2095d2] hover:text-white",
      danger: "bg-red-500 text-white hover:bg-red-600",
      success: "bg-green-500 text-white hover:bg-green-600"
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base", 
      lg: "px-6 py-3 text-lg"
    };
    
    setAttributes({
      ...elementAttrs,
      id: elementId,
      className: `rounded-md font-semibold transition-all duration-200 ${buttonClasses} ${seedClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()
    });
    
    setDynamicStyles(createDynamicStyles());
  }, [eventType, index, className, variant, size, getElementAttributes, getLayoutClasses, generateId, generateSeedClass, createDynamicStyles]);

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
