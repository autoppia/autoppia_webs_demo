"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useSeedLayout } from '@/library/useSeedLayout';

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
    const elementAttrs = getElementAttributes('container', index);
    const containerClasses = getLayoutClasses('container');
    const elementId = generateId('container', index);
    const seedClass = generateSeedClass('dynamic-container');
    
    setAttributes({
      ...elementAttrs,
      id: elementId,
      className: `${containerClasses} ${seedClass} ${className}`.trim()
    });
    
    setDynamicStyles(createDynamicStyles());
  }, [index, className, getElementAttributes, getLayoutClasses, generateId, generateSeedClass, createDynamicStyles]);

  useEffect(() => {
    if (containerRef.current) {
      applyCSSVariables(containerRef.current);
    }
  }, [dynamicStyles, applyCSSVariables]);

  return (
    <div
      ref={containerRef}
      {...attributes}
      {...rest}
      className={attributes.className}
      style={dynamicStyles}
    >
      {children}
    </div>
  );
}

interface DynamicItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function DynamicItem({
  children,
  className = "",
  index = 0,
  ...rest
}: DynamicItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
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
    const elementAttrs = getElementAttributes('item', index);
    const itemClasses = getLayoutClasses('item');
    const elementId = generateId('item', index);
    const seedClass = generateSeedClass('dynamic-item');
    
    setAttributes({
      ...elementAttrs,
      id: elementId,
      className: `${itemClasses} ${seedClass} ${className}`.trim()
    });
    
    setDynamicStyles(createDynamicStyles());
  }, [index, className, getElementAttributes, getLayoutClasses, generateId, generateSeedClass, createDynamicStyles]);

  useEffect(() => {
    if (itemRef.current) {
      applyCSSVariables(itemRef.current);
    }
  }, [dynamicStyles, applyCSSVariables]);

  return (
    <div
      ref={itemRef}
      {...attributes}
      {...rest}
      className={attributes.className}
      style={dynamicStyles}
    >
      {children}
    </div>
  );
}

