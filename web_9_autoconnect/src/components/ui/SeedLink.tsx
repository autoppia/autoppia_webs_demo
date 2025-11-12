"use client";

import Link from "next/link";
import { useSeed } from "@/library/useSeed";
import { useSeedStructure } from "@/library/useSeedStructure";
import type { ComponentProps } from "react";

interface SeedLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string;
  preserveSeed?: boolean; // Default true, set to false to skip adding seed
}

/**
 * Custom Link component that automatically preserves seed parameter in URLs
 */
export function SeedLink({ href, preserveSeed = true, ...props }: SeedLinkProps) {
  const { getNavigationUrl } = useSeed();
  const { getNavigationUrlWithStructure } = useSeedStructure();

  if (!preserveSeed || href.startsWith('http')) {
    return <Link href={href} {...props} />;
  }

  // First add seed, then seed-structure
  const withSeed = getNavigationUrl(href);
  const finalHref = getNavigationUrlWithStructure(withSeed);

  return <Link href={finalHref} {...props} />;
}

