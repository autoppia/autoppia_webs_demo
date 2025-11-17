"use client";

import Link from "next/link";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
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
  const { seedStructure } = useDynamicStructure();

  const getHrefWithSeedStructure = (href: string): string => {
    if (typeof window === 'undefined') return href;
    
    try {
      const url = new URL(href, window.location.origin);
      url.searchParams.set('seed-structure', seedStructure.toString());
      return url.pathname + url.search;
    } catch {
      // If href is not a valid URL, just append the parameter
      const separator = href.includes('?') ? '&' : '?';
      return `${href}${separator}seed-structure=${seedStructure}`;
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
