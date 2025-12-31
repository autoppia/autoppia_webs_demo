"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSeedLayout } from '@/dynamic/v3-dynamic';

type TagName = 'div' | 'section' | 'nav' | 'header' | 'footer' | 'main' | 'aside' | 'span' | 'button' | 'a' | 'tr';

interface DynamicElementProps extends React.HTMLAttributes<HTMLElement> {
  elementType: string;
  as?: TagName;
  index?: number;
}

export function DynamicElement({ elementType, as: Component = 'div', index = 0, className = '', ...rest }: DynamicElementProps) {
  const ref = useRef<HTMLElement>(null);
  const { getElementAttributes, generateId, generateSeedClass, createDynamicStyles, applyCSSVariables } = useSeedLayout();
  const [attrs, setAttrs] = useState<Record<string, string>>({});

  useEffect(() => {
    const a = getElementAttributes(elementType, index);
    const id = generateId(elementType, index);
    const seedClass = generateSeedClass(`dynamic-${elementType}`);
    setAttrs({ ...a, id, className: `${seedClass} ${className}`.trim() });
  }, [elementType, index, className, getElementAttributes, generateId, generateSeedClass]);

  const style = useMemo(() => createDynamicStyles(rest.style as React.CSSProperties), [createDynamicStyles, rest.style]);

  useEffect(() => {
    if (ref.current) applyCSSVariables(ref.current);
  }, [applyCSSVariables, style]);

  return React.createElement(Component, { ref, ...attrs, ...rest, style });
}


