"use client";

import Link from "next/link";
import { useSeedLayout } from "@/library/utils";
import type { ComponentProps } from "react";

interface SeedLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string;
  preserveSeed?: boolean; // Default true, set to false to skip adding seed
}

/**
 * Custom Link component that automatically preserves seed parameter in URLs
 */
export function SeedLink({ href, preserveSeed = true, ...props }: SeedLinkProps) {
  const { seed } = useSeedLayout();
  
  // If preserveSeed is false or href starts with http (external link) or href is just a hash, use original href
  if (!preserveSeed || href.startsWith('http') || href.startsWith('#')) {
    return <Link href={href} {...props} />;
  }
  
  // Add seed to URL if it exists
  const finalHref = seed ? (
    href.includes('?') 
      ? (href.includes('seed=') ? href : `${href}&seed=${seed}`)
      : `${href}?seed=${seed}`
  ) : href;
  
  return <Link href={finalHref} {...props} />;
}

