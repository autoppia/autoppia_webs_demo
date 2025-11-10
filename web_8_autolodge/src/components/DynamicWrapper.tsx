"use client";
import { Suspense } from "react";
import { useSeedLayout } from "@/library/utils";
import React from "react";

interface DynamicWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  [key: string]: unknown;
}

function DynamicWrapperContent({ 
  children, 
  as: Component = 'div', 
  className = '', 
  ...props 
}: DynamicWrapperProps) {
  const { seed, layout } = useSeedLayout();
  
  // Handle undefined seed case
  const seedValue = seed || 'default';
  
  // Add seed-based data attributes for additional DOM variation
  const seedAttributes = {
    'data-seed': seedValue.toString(),
    'data-layout-version': `v${seedValue}`,
    'data-element-order': layout.eventElements.order.join('-'),
  };

  return (
    <Component {...seedAttributes} className={`seed-${seedValue} layout-${layout.propertyDetail.layout} ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function DynamicWrapper({ children, fallback = <div>Loading...</div>, ...props }: DynamicWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      <DynamicWrapperContent {...props}>
        {children}
      </DynamicWrapperContent>
    </Suspense>
  );
} 