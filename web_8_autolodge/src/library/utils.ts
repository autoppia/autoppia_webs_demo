import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

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
    layout: 'sidebar' | 'grid' | 'stack' | 'horizontal';
    wrapper: 'div' | 'section' | 'article' | 'main';
    className: string;
  };
  eventElements: {
    order: string[];
    wrapper: 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer';
    className: string;
  };
}

// Seed-based layout configurations
export function getSeedLayout(seed?: number): LayoutConfig {
  // If no seed provided, return default layout
  if (!seed) {
    return {
      searchBar: { position: 'top', wrapper: 'div', className: 'w-full flex justify-center' },
      propertyDetail: { layout: 'sidebar', wrapper: 'div', className: 'flex gap-8' },
      eventElements: { 
        order: ['search', 'view', 'reserve', 'guests', 'dates', 'message', 'confirm', 'wishlist', 'share', 'back'], 
        wrapper: 'div', 
        className: 'flex flex-col gap-4 w-full' 
      }
    };
  }

  // Normalize seed to 1-10 range
  const normalizedSeed = ((seed - 1) % 10) + 1;

  const layouts: Record<number, LayoutConfig> = {
    1: {
      searchBar: { position: 'top', wrapper: 'section', className: 'w-full flex justify-center' },
      propertyDetail: { layout: 'sidebar', wrapper: 'div', className: 'flex gap-8' },
      eventElements: { 
        order: ['search', 'view', 'reserve', 'guests', 'dates', 'message', 'confirm', 'wishlist', 'share', 'back'], 
        wrapper: 'div', 
        className: 'flex flex-col gap-4 w-full' 
      }
    },
    2: {
      searchBar: { position: 'right', wrapper: 'aside', className: 'w-full flex justify-end' },
      propertyDetail: { layout: 'grid', wrapper: 'section', className: 'grid grid-cols-1 lg:grid-cols-2 gap-8' },
      eventElements: { 
        order: ['view', 'search', 'reserve', 'dates', 'guests', 'message', 'wishlist', 'share', 'confirm', 'back'], 
        wrapper: 'article', 
        className: 'flex flex-col gap-4 w-full' 
      }
    },
    3: {
      searchBar: { position: 'bottom', wrapper: 'footer', className: 'w-full flex justify-center mt-8' },
      propertyDetail: { layout: 'stack', wrapper: 'main', className: 'flex flex-col gap-8' },
      eventElements: { 
        order: ['reserve', 'view', 'search', 'guests', 'message', 'confirm', 'dates', 'wishlist', 'share', 'back'], 
        wrapper: 'section', 
        className: 'flex flex-col gap-4 w-full' 
      }
    },
    4: {
      searchBar: { position: 'left', wrapper: 'nav', className: 'w-full flex justify-start' },
      propertyDetail: { layout: 'horizontal', wrapper: 'div', className: 'flex flex-row gap-8' },
      eventElements: { 
        order: ['guests', 'search', 'view', 'reserve', 'message', 'dates', 'wishlist', 'share', 'confirm', 'back'], 
        wrapper: 'div', 
        className: 'flex flex-col gap-4 w-full' 
      }
    },
    5: {
      searchBar: { position: 'center', wrapper: 'header', className: 'w-full flex justify-center' },
      propertyDetail: { layout: 'sidebar', wrapper: 'div', className: 'flex gap-8' },
      eventElements: { 
        order: ['dates', 'search', 'view', 'reserve', 'guests', 'wishlist', 'message', 'share', 'confirm', 'back'], 
        wrapper: 'aside', 
        className: 'flex flex-col gap-4 w-full' 
      }
    },
    6: {
      searchBar: { position: 'top', wrapper: 'section', className: 'w-full flex justify-center bg-purple-50' },
      propertyDetail: { layout: 'grid', wrapper: 'section', className: 'grid grid-cols-1 lg:grid-cols-2 gap-8' },
      eventElements: { 
        order: ['message', 'search', 'view', 'reserve', 'guests', 'dates', 'wishlist', 'share', 'confirm', 'back'], 
        wrapper: 'div', 
        className: 'flex flex-col gap-4 w-full bg-purple-50 p-4' 
      }
    },
    7: {
      searchBar: { position: 'right', wrapper: 'aside', className: 'w-full flex justify-end' },
      propertyDetail: { layout: 'stack', wrapper: 'main', className: 'flex flex-col gap-4' },
      eventElements: { 
        order: ['share', 'search', 'view', 'reserve', 'guests', 'dates', 'message', 'wishlist', 'confirm', 'back'], 
        wrapper: 'article', 
        className: 'flex flex-col gap-4 w-full' 
      }
    },
    8: {
      searchBar: { position: 'bottom', wrapper: 'footer', className: 'w-full flex justify-center mt-8 bg-green-50' },
      propertyDetail: { layout: 'horizontal', wrapper: 'div', className: 'flex flex-row gap-8' },
      eventElements: { 
        order: ['wishlist', 'search', 'view', 'reserve', 'guests', 'dates', 'message', 'share', 'confirm', 'back'], 
        wrapper: 'section', 
        className: 'flex flex-col gap-4 w-full bg-green-50 p-4' 
      }
    },
    9: {
      searchBar: { position: 'left', wrapper: 'nav', className: 'w-full flex justify-start bg-orange-50' },
      propertyDetail: { layout: 'sidebar', wrapper: 'div', className: 'flex gap-8' },
      eventElements: { 
        order: ['confirm', 'search', 'view', 'reserve', 'guests', 'dates', 'message', 'wishlist', 'share', 'back'], 
        wrapper: 'div', 
        className: 'flex flex-col gap-4 w-full bg-orange-50 p-4' 
      }
    },
    10: {
      searchBar: { position: 'center', wrapper: 'header', className: 'w-full flex justify-center bg-indigo-50' },
      propertyDetail: { layout: 'grid', wrapper: 'section', className: 'grid grid-cols-1 lg:grid-cols-2 gap-8' },
      eventElements: { 
        order: ['back', 'search', 'view', 'reserve', 'guests', 'dates', 'message', 'wishlist', 'share', 'confirm'], 
        wrapper: 'aside', 
        className: 'flex flex-col gap-4 w-full bg-indigo-50 p-4' 
      }
    }
  };

  return layouts[normalizedSeed] || layouts[1];
}

// Hook to get current seed and layout
export function useSeedLayout() {
  const searchParams = useSearchParams();
  const seedParam = searchParams.get('seed');
  const seed = useMemo(() => {
    if (!seedParam) return undefined;
    const parsed = parseInt(seedParam, 10);
    return isNaN(parsed) ? undefined : Math.max(1, Math.min(10, parsed));
  }, [seedParam]);
  
  const layout = useMemo(() => getSeedLayout(seed), [seed]);
  
  return { seed, layout };
}
