"use client";

import React, { useEffect, useRef, useState, type ButtonHTMLAttributes } from 'react';
import { useSeedLayout } from '@/library/useSeedLayout';

interface DynamicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  eventType: string;
  className?: string;
  children: React.ReactNode;
  index?: number;
}

export function DynamicButton({
  eventType,
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
    <button
      ref={buttonRef}
      {...attributes}
      {...props}
      className={attributes.className}
      style={dynamicStyles}
    >
      {children}
    </button>
  );
}

