"use client";

import Link from "next/link";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useSeedLayout } from "@/library/utils";
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
  const { seed } = useSeedLayout();

  const getHrefWithSeedStructure = (href: string): string => {
    if (typeof window === "undefined") {
      return appendParams(href, seedStructure, seed);
    }
    
    try {
      const url = new URL(href, window.location.origin);
      if (seedStructure) {
        url.searchParams.set("seed-structure", seedStructure.toString());
      }
      if (seed) {
        url.searchParams.set("seed", seed.toString());
      }
      return url.pathname + url.search + url.hash;
    } catch {
      return appendParams(href, seedStructure, seed);
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

function appendParams(href: string, seedStructure?: number, seed?: number) {
  const hasQuery = href.includes("?");
  const params = new URLSearchParams(hasQuery ? href.split("?")[1] : "");
  if (seedStructure) {
    params.set("seed-structure", seedStructure.toString());
  }
  if (seed) {
    params.set("seed", seed.toString());
  }
  const base = hasQuery ? href.split("?")[0] : href;
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}
