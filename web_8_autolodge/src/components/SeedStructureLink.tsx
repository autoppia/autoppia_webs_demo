"use client";

import Link from "next/link";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useSeedLayout } from "@/library/utils";
import { isDynamicModeEnabled } from "@/utils/dynamicDataProvider";
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
  style,
}: SeedStructureLinkProps) {
  const { seedStructure, isEnabled: isStructureEnabled } = useDynamicStructure();
  const { seed } = useSeedLayout();
  const dynamicEnabled =
    typeof window !== "undefined" ? isDynamicModeEnabled() : false;

  const shouldIncludeSeed = dynamicEnabled && !!seed;
  const shouldIncludeStructure = isStructureEnabled && !!seedStructure;

  const resolvedHref = updateHrefWithParams(href, {
    seed: shouldIncludeSeed ? seed : undefined,
    seedStructure: shouldIncludeStructure ? seedStructure : undefined,
  });

  return (
    <Link
      href={resolvedHref}
      className={className}
      onClick={onClick}
      id={id}
      style={style}
    >
      {children}
    </Link>
  );
}

function updateHrefWithParams(
  href: string,
  paramsToApply: { seed?: number; seedStructure?: number },
) {
  const [base, queryString = "", hash = ""] = splitHref(href);
  const params = new URLSearchParams(queryString);

  if (paramsToApply.seed !== undefined) {
    params.set("seed", paramsToApply.seed.toString());
  } else {
    params.delete("seed");
  }

  if (paramsToApply.seedStructure !== undefined) {
    params.set("seed-structure", paramsToApply.seedStructure.toString());
  } else {
    params.delete("seed-structure");
  }

  const query = params.toString();
  const hashPart = hash ? `#${hash}` : "";
  return query ? `${base}?${query}${hashPart}` : `${base}${hashPart}`;
}

function splitHref(href: string): [string, string, string] {
  const hashIndex = href.indexOf("#");
  const queryIndex = href.indexOf("?");
  let base = href;
  let query = "";
  let hash = "";

  if (hashIndex >= 0) {
    hash = href.slice(hashIndex + 1);
    base = href.slice(0, hashIndex);
  }

  if (queryIndex >= 0 && (queryIndex < hashIndex || hashIndex === -1)) {
    query = href.slice(queryIndex + 1, hashIndex >= 0 ? hashIndex : undefined);
    base = href.slice(0, queryIndex);
  }

  return [base, query, hash];
}
