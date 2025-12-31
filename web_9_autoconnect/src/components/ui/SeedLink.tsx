"use client";

import Link from "next/link";
import { useSeed } from "@/context/SeedContext";
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

  if (!preserveSeed || href.startsWith('http')) {
    return <Link href={href} {...props} />;
  }

  const withSeed = getNavigationUrl(href);
  return <Link href={withSeed} {...props} />;
}
