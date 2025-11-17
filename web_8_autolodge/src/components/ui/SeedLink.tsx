'use client';

import Link from 'next/link';
import { useDynamicStructure } from '@/context/DynamicStructureContext';
import type { ComponentProps } from 'react';

interface SeedLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string;
  preserveSeed?: boolean;
}

/**
 * A Link component that automatically preserves v2-seed parameter
 */
export function SeedLink({ href, preserveSeed = true, ...props }: SeedLinkProps) {
  const { getNavigationUrl } = useDynamicStructure();
  
  // If preserveSeed is false, just return a normal Link
  if (!preserveSeed) {
    return <Link href={href} {...props} />;
  }
  
  // Use getNavigationUrl to preserve v2-seed
  const hrefWithSeed = getNavigationUrl(href);
  
  return <Link href={hrefWithSeed} {...props} />;
}
