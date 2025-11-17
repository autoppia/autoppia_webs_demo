"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSeedLayout, SeedLayout, getEffectiveSeed, isDynamicEnabled } from "@/lib/seed-layout";

declare global {
  interface Window {
    __autodeliveryV2Seed?: number | null;
  }
  interface WindowEventMap {
    "autodelivery:v2SeedChange": CustomEvent<{ seed: number | null }>;
  }
}

interface LayoutContextType extends SeedLayout {
  seed: number;
  isDynamicMode: boolean;
  v2Seed: number | null;
  getElementAttributes: (elementType: string, index?: number) => Record<string, string>;
  generateId: (context: string, index?: number) => string;
  generateSeedClass: (baseClass: string) => string;
  getNavigationUrl: (path: string) => string;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const isDbModeEnabled = () => {
  const raw = (process.env.NEXT_PUBLIC_ENABLE_DB_MODE || process.env.ENABLE_DB_MODE || "").toString().toLowerCase();
  return raw === "true";
};

const getV2SeedFromUrl = (): number | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("v2-seed");
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 300) return null;
  return parsed;
};

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const getInitialSeed = () => {
    if (typeof window === "undefined") return 6;
    const urlParams = new URLSearchParams(window.location.search);
    const seedParam = urlParams.get("seed");
    if (seedParam) {
      return getEffectiveSeed(parseInt(seedParam, 10));
    }
    try {
      const stored = localStorage.getItem("autodeliverySeed");
      if (stored) {
        return getEffectiveSeed(parseInt(stored, 10));
      }
    } catch {
      /* ignore */
    }
    return 6;
  };

  const initialSeed = getInitialSeed();
  const [seed, setSeed] = useState(initialSeed);
  const [layout, setLayout] = useState<SeedLayout>(() => getSeedLayout(initialSeed));
  const [isDynamicMode, setIsDynamicMode] = useState(false);
  const [v2Seed, setV2Seed] = useState<number | null>(() => (isDbModeEnabled() ? getV2SeedFromUrl() : null));

  useEffect(() => {
    setIsDynamicMode(isDynamicEnabled());
  }, []);

  useEffect(() => {
    const updateFromUrl = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const seedParam = params.get("seed");
      setSeed((prev) => {
        const raw = seedParam ? parseInt(seedParam, 10) : prev;
        const effective = getEffectiveSeed(raw);
        setLayout(getSeedLayout(effective));
        try {
          localStorage.setItem("autodeliverySeed", String(effective));
        } catch {
          /* ignore */
        }
        return effective;
      });
      if (isDbModeEnabled()) {
        setV2Seed(getV2SeedFromUrl());
      }
    };

    updateFromUrl();

    const handlePopState = () => updateFromUrl();
    window.addEventListener("popstate", handlePopState);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      updateFromUrl();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      updateFromUrl();
    };

    return () => {
      window.removeEventListener("popstate", handlePopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!isDbModeEnabled()) {
      window.__autodeliveryV2Seed = null;
      return;
    }
    window.__autodeliveryV2Seed = v2Seed ?? null;
    window.dispatchEvent(new CustomEvent("autodelivery:v2SeedChange", { detail: { seed: v2Seed ?? null } }));
    console.log("[LayoutProvider] v2-seed", v2Seed);
  }, [v2Seed]);

  const getElementAttributes = (elementType: string, index: number = 0): Record<string, string> => {
    if (!isDynamicMode) {
      return {
        id: `${elementType}-${index}`,
        "data-element-type": elementType,
      };
    }
    return {
      id: `${elementType}-${seed}-${index}`,
      "data-seed": seed.toString(),
      "data-variant": (seed % 10).toString(),
      "data-element-type": elementType,
      "data-layout-id": layout.layoutId.toString(),
    };
  };

  const generateId = (context: string, index: number = 0) => {
    if (!isDynamicMode) {
      return `${context}-${index}`;
    }
    return `${context}-${seed}-${index}`;
  };

  const generateSeedClass = (baseClass: string) => {
    if (!isDynamicMode) {
      return baseClass;
    }
    return `${baseClass}-seed-${seed}`;
  };

  const getNavigationUrl = (path: string): string => {
    if (!path || path.startsWith("http")) {
      return path;
    }
    const [base, queryString] = path.split("?");
    const params = new URLSearchParams(queryString || "");

    if (!params.has("seed")) {
      params.set("seed", seed.toString());
    }

    if (typeof window !== "undefined") {
      const current = new URLSearchParams(window.location.search);
      const seedStructure = current.get("seed-structure");
      if (seedStructure && !params.has("seed-structure")) {
        params.set("seed-structure", seedStructure);
      }
    }

    if (v2Seed !== null) {
      params.set("v2-seed", v2Seed.toString());
    } else {
      params.delete("v2-seed");
    }

    const query = params.toString();
    return query ? `${base}?${query}` : base;
  };

  const value: LayoutContextType = {
    ...layout,
    seed,
    isDynamicMode,
    v2Seed,
    getElementAttributes,
    generateId,
    generateSeedClass,
    getNavigationUrl,
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
