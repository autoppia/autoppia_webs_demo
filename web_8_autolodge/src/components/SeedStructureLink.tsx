"use client";

import Link from "next/link";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { ReactNode } from "react";

interface SeedStructureLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  id?: string;
  style?: React.CSSProperties;
}

export default function SeedStructureLink({ 
  href, 
  children, 
  className, 
  onClick,
  id,
  style
}: SeedStructureLinkProps) {
  const { v3Seed } = useV3Attributes();

  const getHrefWithSeedStructure = (href: string): string => {
    if (typeof window === 'undefined') return href;
    
    try {
      const url = new URL(href, window.location.origin);
      url.searchParams.set('seed-structure', v3Seed.toString());
      return url.pathname + url.search;
    } catch {
      // If href is not a valid URL, just append the parameter
      const separator = href.includes('?') ? '&' : '?';
      return `${href}${separator}seed-structure=${v3Seed}`;
    }
  };

  return (
    <Link
      href={getHrefWithSeedStructure(href)}
      className={className}
      onClick={onClick}
      id={id}
      style={style}
    >
      {children}
    </Link>
  );
}
