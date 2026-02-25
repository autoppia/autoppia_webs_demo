"use client";

import Link from "next/link";
import { useSeed } from "@/context/SeedContext";
import type { ComponentProps } from "react";

interface SeedLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string;
  preserveSeed?: boolean;
}

export function SeedLink({ href, preserveSeed = true, ...props }: SeedLinkProps) {
  const { getNavigationUrl } = useSeed();

  const finalHref = (!preserveSeed || href.startsWith('http')) ? href : getNavigationUrl(href);

  return <Link href={finalHref} {...props} />;
}
