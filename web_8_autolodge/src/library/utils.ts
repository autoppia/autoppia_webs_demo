import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { getEffectiveSeed, getLayoutConfig, isDynamicModeEnabled } from "@/utils/dynamicDataProvider";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Layout configuration types
export interface LayoutConfig {
  searchBar: {
    position: 'top' | 'right' | 'bottom' | 'left' | 'center';
    wrapper: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'nav';
    className: string;
  };
  propertyDetail: {
    layout: 'sidebar' | 'grid' | 'stack' | 'horizontal' | 'vertical';
    wrapper: 'div' | 'section' | 'article' | 'main';
    className: string;
  };
  eventElements: {
    order: string[];
    wrapper: 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer';
    className: string;
  };
}

// Enhanced seed-based layout configurations with proper spacing
export function getSeedLayout(seed?: number, pageType: 'stay' | 'confirm' = 'stay'): LayoutConfig {
  // If no seed provided, return default layout
  if (!seed) {
    const defaultOrder = pageType === 'confirm' 
      ? ['view', 'dates', 'guests', 'message', 'wishlist', 'share', 'back', 'confirm']
      : ['view', 'dates', 'guests', 'message', 'wishlist', 'share', 'back', 'reserve'];
    
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

  // Normalize seed to 1-10 range
  const normalizedSeed = ((seed - 1) % 10) + 1;

  // Get the appropriate element order based on page type
  const getElementOrder = (baseOrder: string[]) => {
    return pageType === 'confirm' 
      ? baseOrder.map(el => el === 'reserve' ? 'confirm' : el)
      : baseOrder;
  };

  const layouts: Record<number, LayoutConfig> = {
    1: {
      searchBar: { position: 'top', wrapper: 'section', className: 'w-full flex justify-center mb-6' },
      propertyDetail: { layout: 'vertical', wrapper: 'div', className: 'max-w-4xl mx-auto px-4 py-8' },
      eventElements: { 
        order: getElementOrder(['message', 'share', 'guests', 'wishlist', 'back', 'view', 'dates', 'reserve']), 
        wrapper: 'div', 
        className: 'flex flex-col gap-6' 
      }
    },
    2: {
      searchBar: { position: 'right', wrapper: 'aside', className: 'w-full flex justify-end mb-6' },
      propertyDetail: { layout: 'vertical', wrapper: 'section', className: 'max-w-5xl mx-auto px-4 py-8' },
      eventElements: { 
        order: getElementOrder(['reserve', 'back', 'view', 'dates', 'guests', 'message', 'share', 'wishlist']), 
        wrapper: 'article', 
        className: 'flex flex-col gap-8' 
      }
    },
    3: {
      searchBar: { position: 'bottom', wrapper: 'footer', className: 'w-full flex justify-center mt-8 mb-6' },
      propertyDetail: { layout: 'vertical', wrapper: 'main', className: 'max-w-6xl mx-auto px-4 py-8' },
      eventElements: { 
        order: getElementOrder(['wishlist', 'guests', 'dates', 'view', 'share', 'message', 'back', 'reserve']), 
        wrapper: 'section', 
        className: 'flex flex-col gap-4' 
      }
    },
    4: {
      searchBar: { position: 'left', wrapper: 'nav', className: 'w-full flex justify-start mb-6' },
      propertyDetail: { layout: 'vertical', wrapper: 'div', className: 'max-w-3xl mx-auto px-4 py-8' },
      eventElements: { 
        order: getElementOrder(['dates', 'view', 'reserve', 'back', 'share', 'message', 'guests', 'wishlist']), 
        wrapper: 'div', 
        className: 'flex flex-col gap-5' 
      }
    },
    5: {
      searchBar: { position: 'center', wrapper: 'header', className: 'w-full flex justify-center mb-6' },
      propertyDetail: { layout: 'vertical', wrapper: 'div', className: 'max-w-4xl mx-auto px-4 py-8' },
      eventElements: { 
        order: getElementOrder(['back', 'reserve', 'message', 'share', 'view', 'dates', 'guests', 'wishlist']), 
        wrapper: 'aside', 
        className: 'flex flex-col gap-7' 
      }
    },
    6: {
      searchBar: { position: 'top', wrapper: 'section', className: 'w-full flex justify-center mb-6 bg-purple-50 p-4 rounded-lg' },
      propertyDetail: { layout: 'vertical', wrapper: 'section', className: 'max-w-5xl mx-auto px-4 py-8' },
      eventElements: { 
        order: getElementOrder(['share', 'wishlist', 'guests', 'dates', 'view', 'message', 'back', 'reserve']), 
        wrapper: 'div', 
        className: 'flex flex-col gap-6' 
      }
    },
    7: {
      searchBar: { position: 'right', wrapper: 'aside', className: 'w-full flex justify-end mb-6' },
      propertyDetail: { layout: 'vertical', wrapper: 'main', className: 'max-w-4xl mx-auto px-4 py-8' },
      eventElements: { 
        order: getElementOrder(['view', 'dates', 'reserve', 'back', 'message', 'share', 'guests', 'wishlist']), 
        wrapper: 'article', 
        className: 'flex flex-col gap-8' 
      }
    },
    8: {
      searchBar: { position: 'bottom', wrapper: 'footer', className: 'w-full flex justify-center mt-8 mb-6 bg-green-50 p-4 rounded-lg' },
      propertyDetail: { layout: 'vertical', wrapper: 'div', className: 'max-w-6xl mx-auto px-4 py-8' },
      eventElements: { 
        order: getElementOrder(['guests', 'message', 'share', 'wishlist', 'view', 'dates', 'back', 'reserve']), 
        wrapper: 'section', 
        className: 'flex flex-col gap-5' 
      }
    },
    9: {
      searchBar: { position: 'left', wrapper: 'nav', className: 'w-full flex justify-start mb-6 bg-orange-50 p-4 rounded-lg' },
      propertyDetail: { layout: 'vertical', wrapper: 'div', className: 'max-w-3xl mx-auto px-4 py-8' },
      eventElements: { 
        order: getElementOrder(['reserve', 'back', 'wishlist', 'share', 'message', 'view', 'dates', 'guests']), 
        wrapper: 'div', 
        className: 'flex flex-col gap-6' 
      }
    },
    10: {
      searchBar: { position: 'center', wrapper: 'header', className: 'w-full flex justify-center mb-6 bg-indigo-50 p-4 rounded-lg' },
      propertyDetail: { layout: 'vertical', wrapper: 'section', className: 'max-w-5xl mx-auto px-4 py-8' },
      eventElements: { 
        order: getElementOrder(['message', 'share', 'back', 'reserve', 'view', 'dates', 'guests', 'wishlist']), 
        wrapper: 'aside', 
        className: 'flex flex-col gap-7' 
      }
    }
  };

  return layouts[normalizedSeed] || layouts[1];
}

// Hook to get current seed and layout with dynamic HTML support
export function useSeedLayout(pageType: 'stay' | 'confirm' = 'stay') {
  const searchParams = useSearchParams();
  
  // Custom function to handle malformed URLs with multiple ? characters
  const getSeedFromUrl = () => {
    if (typeof window === 'undefined') return null;
    
    const url = window.location.href;
    // Look for ?seed=X pattern anywhere in the URL (handles malformed URLs)
    const seedMatch = url.match(/\?seed=(\d+)/);
    return seedMatch ? seedMatch[1] : null;
  };
  
  // Try to get seed from searchParams first, then fallback to custom URL parsing
  const seedParam = searchParams.get('seed') || getSeedFromUrl();
  
  const seed = useMemo(() => {
    if (!seedParam) return undefined;
    const parsed = parseInt(seedParam, 10);
    if (isNaN(parsed)) return undefined;
    
    // Check if dynamic mode is enabled
    const isDynamicEnabled = isDynamicModeEnabled();
    if (!isDynamicEnabled) {
      // When disabled, return default seed (1)
      return 1;
    }
    
    // When enabled, support seeds 1-300
    return getEffectiveSeed(parsed);
  }, [seedParam]);
  
  const layout = useMemo(() => getSeedLayout(seed, pageType), [seed, pageType]);
  
  return { seed, layout };
}
