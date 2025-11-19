"use client";
import React from "react";
import { useSeed } from "@/context/SeedContext";
import { getSeedLayout } from "@/dynamic/v1-layouts";

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
  const { seed } = useSeed();
  const layout = getSeedLayout(seed);
  
  // Handle undefined seed case
  const seedValue = seed || 'default';
  
  // Add seed-based data attributes for additional DOM variation
  const seedAttributes = {
    'data-seed': seedValue.toString(),
    'data-layout-version': `v${seedValue}`,
    'data-element-order': layout.eventElements.order.join('-'),
  };
  
  return (
    <Component
      className={className}
      {...seedAttributes}
      {...props}
    >
      {children}
    </Component>
  );
}

export default function DynamicWrapper(props: DynamicWrapperProps) {
  return <DynamicWrapperContent {...props} />;
}
