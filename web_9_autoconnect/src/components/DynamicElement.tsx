"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useSeed } from '@/context/SeedContext';
import { getSeedLayout } from '@/dynamic/v1-layouts';

interface DynamicElementProps {
  children: React.ReactNode;
  elementType: string;
  index?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'main' | 'aside' | 'nav' | 'a';
  reorder?: boolean;
  [key: string]: unknown;
}

export function DynamicElement({
  children,
  elementType,
  index = 0,
  className = "",
  as: Component = 'div',
  reorder = false,
  ...props
}: DynamicElementProps) {
  const elementRef = useRef<HTMLElement>(null);
  const { seed } = useSeed();
  const layout = getSeedLayout(seed);

  const [attributes, setAttributes] = useState<Record<string, string>>({});

  useEffect(() => {
    const attrs = {
      'data-seed': seed?.toString() || '1',
      'data-element-type': elementType,
      'data-index': index.toString(),
    };
    setAttributes(attrs);

    if (elementRef.current) {
      elementRef.current.style.setProperty('--seed', seed?.toString() || '1');
    }
  }, [seed, elementType, index]);

  return (
    <Component
      ref={elementRef as any}
      className={`${className} dynamic-element`}
      {...attributes}
      {...props}
    >
      {children}
    </Component>
  );
}
