// src/components/DynamicElement.tsx
import { useState, useEffect, useRef, ReactNode } from 'react';
import { useSeedLayout } from '@/library/useSeedLayout';

interface DynamicElementProps {
  children: ReactNode;
  elementType: string;
  index?: number;
  className?: string;
  as?: 'div' | 'section' | 'header' | 'footer' | 'article' | 'aside' | 'main' | 'nav' | 'a';
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
  const {
    getElementAttributes,
    getElementXPath,
    generateId,
    generateSeedClass,
    applyCSSVariables,
    createDynamicStyles,
    reorderElements
  } = useSeedLayout();

  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({});

  useEffect(() => {
    // Generate dynamic attributes and styles based on seed
    const elementAttrs = getElementAttributes(elementType, index);
    const elementId = generateId(elementType, index);
    const seedClass = generateSeedClass(`dynamic-${elementType}`);
    const xpath = getElementXPath(elementType);
    
    setAttributes({
      ...elementAttrs,
      id: elementId,
      className: `${seedClass} ${className}`.trim(),
      'data-xpath': xpath,
      'data-element-type': elementType,
      'data-index': `${index}`
    });
    
    setDynamicStyles(createDynamicStyles());
  }, [elementType, index, className, getElementAttributes, generateId, generateSeedClass, getElementXPath, createDynamicStyles]);

  useEffect(() => {
    // Apply CSS variables to the element
    if (elementRef.current) {
      applyCSSVariables(elementRef.current);
    }
  }, [dynamicStyles, applyCSSVariables]);

  // Render based on component type to avoid TypeScript issues
  const commonProps = {
    ...attributes,
    ...props,
    style: dynamicStyles,
    children
  };

  switch (Component) {
    case 'section':
      return <section ref={elementRef as React.Ref<HTMLElement>} {...commonProps} />;
    case 'header':
      return <header ref={elementRef as React.Ref<HTMLElement>} {...commonProps} />;
    case 'footer':
      return <footer ref={elementRef as React.Ref<HTMLElement>} {...commonProps} />;
    case 'article':
      return <article ref={elementRef as React.Ref<HTMLElement>} {...commonProps} />;
    case 'aside':
      return <aside ref={elementRef as React.Ref<HTMLElement>} {...commonProps} />;
    case 'main':
      return <main ref={elementRef as React.Ref<HTMLElement>} {...commonProps} />;
    case 'nav':
      return <nav ref={elementRef as React.Ref<HTMLElement>} {...commonProps} />;
    case 'a':
      return <a ref={elementRef as React.Ref<HTMLAnchorElement>} {...commonProps} />;
    default:
      return <div ref={elementRef as React.Ref<HTMLDivElement>} {...commonProps} />;
  }
}

// Specialized components for common use cases
export function DynamicLink({ children, ...props }: React.ComponentPropsWithoutRef<'a'>) {
  return (
    <DynamicElement elementType="link" as="a" {...props}>
      {children}
    </DynamicElement>
  );
}

export function DynamicCard({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <DynamicElement elementType="card" {...props}>
      {children}
    </DynamicElement>
  );
}

export function DynamicSection({ children, ...props }: React.ComponentPropsWithoutRef<'section'>) {
  return (
    <DynamicElement elementType="section" as="section" {...props}>
      {children}
    </DynamicElement>
  );
}

export function DynamicHeader({ children, ...props }: React.ComponentPropsWithoutRef<'header'>) {
  return (
    <DynamicElement elementType="header" as="header" {...props}>
      {children}
    </DynamicElement>
  );
}

export function DynamicFooter({ children, ...props }: React.ComponentPropsWithoutRef<'footer'>) {
  return (
    <DynamicElement elementType="footer" as="footer" {...props}>
      {children}
    </DynamicElement>
  );
} 