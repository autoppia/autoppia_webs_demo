"use client";

import { ReactNode } from 'react';
import { useSeed } from '@/library/useSeed';

interface LayoutWrapperProps {
  children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { layout } = useSeed();
  
  // Apply different body classes based on header position
  const bodyClasses = layout.headerPosition === 'left' || layout.headerPosition === 'right' 
    ? 'ml-16' // Add margin when header is on side
    : '';
  
  return (
    <div className={bodyClasses}>
      {children}
    </div>
  );
} 