"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useSeed } from '@/context/SeedContext';

interface DynamicContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function DynamicContainer({
  children,
  className = "",
  index = 0,
  ...rest
}: DynamicContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { seed } = useSeed();

  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({});

  useEffect(() => {
    const attrs = {
      'data-seed': seed?.toString() || '1',
      'data-container': 'true',
      'data-index': index.toString(),
    };
    setAttributes(attrs);

    const styles: React.CSSProperties = {
      '--seed': seed?.toString() || '1',
    } as React.CSSProperties;
    setDynamicStyles(styles);

    if (containerRef.current) {
      containerRef.current.style.setProperty('--seed', seed?.toString() || '1');
    }
  }, [seed, index]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={dynamicStyles}
      {...attributes}
      {...rest}
    >
      {children}
    </div>
  );
}
