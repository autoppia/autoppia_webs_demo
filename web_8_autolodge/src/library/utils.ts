import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useMemo } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface LayoutConfig {
  searchBar: {
    position: 'top' | 'right' | 'bottom' | 'left' | 'center';
    wrapper: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'nav';
    className: string;
  };
  propertyDetail: {
    layout: 'sidebar' | 'grid' | 'stack' | 'horizontal' | 'vertical' | 'wide' | 'narrow';
    wrapper: 'div' | 'section' | 'article' | 'main';
    className: string;
  };
  eventElements: {
    order: string[];
    wrapper: 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer';
    className: string;
  };
}

// Static layout (seed does not change structure)
export function getSeedLayout(_seed?: number, pageType: 'stay' | 'confirm' = 'stay'): LayoutConfig {
  const defaultOrder = pageType === 'confirm'
    ? ['search', 'view', 'dates', 'guests', 'message', 'wishlist', 'share', 'back', 'confirm']
    : ['search', 'view', 'dates', 'guests', 'message', 'wishlist', 'share', 'back', 'reserve'];

  return {
    searchBar: { position: 'top', wrapper: 'div', className: 'w-full flex justify-center mb-6' },
    propertyDetail: { layout: 'vertical', wrapper: 'div', className: 'max-w-4xl mx-auto px-4 py-8' },
    eventElements: {
      order: defaultOrder,
      wrapper: 'div',
      className: 'flex flex-col gap-6'
    }
  };
}

// Hook for static page layout (independent of URL seed; V2 owns `?seed=` for data)
export function useSeedLayout(pageType: 'stay' | 'confirm' = 'stay') {
  const isDynamicEnabled = useMemo(() => false, []);

  const layout = useMemo(() => getSeedLayout(undefined, pageType), [pageType]);

  return { layout, isDynamicEnabled };
}
