"use client";

import React, { useEffect, useRef, useState, type ButtonHTMLAttributes } from 'react';
import { useSeed } from '@/context/SeedContext';

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
  const { seed } = useSeed();

  const [attributes, setAttributes] = useState<Record<string, string>>({});

  useEffect(() => {
    // Generate attributes based on seed
    const attrs = {
      'data-seed': seed?.toString() || '1',
      'data-event': eventType,
      'data-index': index.toString(),
    };
    setAttributes(attrs);

    if (buttonRef.current) {
      buttonRef.current.style.setProperty('--seed', seed?.toString() || '1');
    }
  }, [seed, eventType, index]);

  return (
    <button
      ref={buttonRef}
      className={`${className} dynamic-button`}
      {...attributes}
      {...props}
    >
      {children}
    </button>
  );
}
