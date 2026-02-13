// src/components/DynamicElement.tsx
// @deprecated - Use useDynamicSystem() directly instead

import { ReactNode } from 'react';
import { useDynamicSystem } from '@/dynamic/shared';
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from '@/dynamic/v3';

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
  const dyn = useDynamicSystem();

  const elementId = index > 0
    ? dyn.v3.getVariant(`${elementType}-${index}`, ID_VARIANTS_MAP, `${elementType}-${index}`)
    : dyn.v3.getVariant(elementType, ID_VARIANTS_MAP, elementType);

  const elementClass = dyn.v3.getVariant(elementType, CLASS_VARIANTS_MAP, className || "");

  const wrapped = dyn.v1.addWrapDecoy(elementType, (
    <Component
      id={elementId}
      className={`${elementClass} ${className}`.trim()}
      data-element-type={elementType}
      data-index={index}
      {...props}
    >
      {children}
    </Component>
  ), `${elementType}-wrap-${index}`);

  return wrapped as React.ReactElement;
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
