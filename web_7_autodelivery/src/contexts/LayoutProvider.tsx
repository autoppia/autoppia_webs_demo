"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useSeed } from "@/context/SeedContext";

// SeedLayout type definition (previously from v1-layouts)
export type SeedLayout = {
  seed: number;
  layoutId: number;
  searchBar: {
    position: string;
    containerClass: string;
    inputClass: string;
    wrapperClass: string;
    xpath: string;
  };
  navbar: {
    logoPosition: string;
    cartPosition: string;
    menuPosition: string;
    containerClass: string;
    xpath: string;
  };
  navigation: {
    logoPosition: string;
    cartPosition: string;
    menuPosition: string;
    containerClass: string;
    logoClass: string;
    cartClass: string;
    menuClass: string;
    xpath: string;
  };
  hero: {
    buttonPosition: string;
    buttonClass: string;
    containerClass: string;
    xpath: string;
  };
  restaurantCard: {
    containerClass: string;
    imageClass: string;
    titleClass: string;
    descriptionClass: string;
    buttonClass: string;
    xpath: string;
  };
  cart: {
    iconClass: string;
    badgeClass: string;
    pageContainerClass: string;
    itemClass: string;
    buttonClass: string;
    xpath: string;
  };
  modal: {
    containerClass: string;
    contentClass: string;
    headerClass: string;
    bodyClass: string;
    footerClass: string;
    buttonClass: string;
    xpath: string;
  };
  grid: {
    containerClass: string;
    itemClass: string;
    paginationClass: string;
    xpath: string;
  };
  restaurantDetail: {
    elementOrder: string[];
    containerClass: string;
    headerClass: string;
    menuClass: string;
    reviewsClass: string;
    xpath: string;
  };
};

declare global {
  interface Window {
    __autodeliveryV2Seed?: number | null;
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

// Fixed layout matching the preferred (seed 26) look, but static
const STATIC_LAYOUT: SeedLayout = {
  seed: 26,
  layoutId: 1,
  searchBar: {
    position: "left",
    containerClass: "",
    inputClass: "",
    wrapperClass: "",
    xpath: "",
  },
  navbar: {
    logoPosition: "left",
    cartPosition: "right",
    menuPosition: "center",
    containerClass: "",
    xpath: "",
  },
  navigation: {
    logoPosition: "left",
    cartPosition: "right",
    menuPosition: "center",
    containerClass: "",
    logoClass: "",
    cartClass: "",
    menuClass: "",
    xpath: "",
  },
  hero: {
    buttonPosition: "right",
    buttonClass: "",
    containerClass: "",
    xpath: "",
  },
  restaurantCard: {
    containerClass: "",
    imageClass: "",
    titleClass: "",
    descriptionClass: "",
    buttonClass: "",
    xpath: "",
  },
  cart: {
    iconClass: "",
    badgeClass: "",
    pageContainerClass: "",
    itemClass: "",
    buttonClass: "",
    xpath: "",
  },
  modal: {
    containerClass: "",
    contentClass: "",
    headerClass: "",
    bodyClass: "",
    footerClass: "",
    buttonClass: "",
    xpath: "",
  },
  grid: {
    containerClass: "",
    itemClass: "",
    paginationClass: "",
    xpath: "",
  },
  restaurantDetail: {
    elementOrder: ["header", "menu", "reviews"],
    containerClass: "",
    headerClass: "",
    menuClass: "",
    reviewsClass: "",
    xpath: "",
  },
};

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const { seed, resolvedSeeds, getNavigationUrl: seedGetNavigationUrl } = useSeed();
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;

  const getElementAttributes = (elementType: string, index: number = 0): Record<string, string> => ({
    "data-element-type": elementType,
  });

  const generateId = (context: string, index: number = 0) => `${context}-${index}`;

  const generateSeedClass = (baseClass: string) => baseClass;

  const getNavigationUrl = useCallback(
    (path: string): string => seedGetNavigationUrl(path),
    [seedGetNavigationUrl]
  );

  const value: LayoutContextType = {
    ...STATIC_LAYOUT,
    seed,
    isDynamicMode: false,
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
