"use client";
import React from "react";

interface DynamicWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  [key: string]: unknown;
}

export default function DynamicWrapper({ 
  children, 
  as: Component = 'div', 
  className = '', 
  ...props 
}: DynamicWrapperProps) {
  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
}
