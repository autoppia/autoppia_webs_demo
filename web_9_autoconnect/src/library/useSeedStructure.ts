"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function useSeedStructure(): {
  seedStructure?: number;
  getNavigationUrlWithStructure: (path: string) => string;
} {
  const searchParams = useSearchParams();
  const [persisted, setPersisted] = useState<number | undefined>(undefined);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("autoconnect-seed-structure");
      if (stored) {
        const n = parseInt(stored, 10);
        if (!isNaN(n) && n >= 1 && n <= 300) setPersisted(n);
      }
    } catch {}
  }, []);

  const seedStructure = useMemo(() => {
    const param = searchParams?.get("seed-structure");
    if (param) {
      const n = parseInt(param, 10);
      if (!isNaN(n) && n >= 1 && n <= 300) {
        try { localStorage.setItem("autoconnect-seed-structure", n.toString()); } catch {}
        return n;
      }
    }
    return persisted;
  }, [searchParams, persisted]);

  const getNavigationUrlWithStructure = (path: string): string => {
    if (!seedStructure) return path;
    const hasQuery = path.includes("?");
    const hasParam = path.includes("seed-structure=");
    if (hasParam) return path;
    return `${path}${hasQuery ? "&" : "?"}seed-structure=${seedStructure}`;
  };

  return { seedStructure, getNavigationUrlWithStructure };
}


