// src/library/useSeedLayout.ts
import { useState, useEffect, useCallback } from 'react';
import { getSeedLayout, isDynamicEnabled } from './layouts';
import { getEffectiveSeed, getLayoutConfig } from '@/utils/dynamicDataProvider';
import { getTextForElement, type ElementKey } from '@/library/textVariants';

// Semantic ID mappings (10 per type; selected by seed mapped to 1-10)
const SEMANTIC_ID_MAP: Record<string, string[]> = {
  // Homepage
  'hero-title': [
    'hero-title', 'headline', 'main-title', 'page-hero', 'top-title',
    'title-hero', 'hero-heading', 'primary-title', 'landing-title', 'hero-text'
  ],
  'hero-subtitle': [
    'hero-subtitle', 'subheadline', 'lead-text', 'supporting-text', 'subtitle',
    'hero-lead', 'intro-text', 'secondary-text', 'subhead', 'tagline'
  ],
  'get-trip-button': [
    'get-trip-btn', 'start-ride', 'book-ride-btn', 'find-trip', 'plan-trip',
    'trip-start', 'ride-now', 'start-now', 'request-ride', 'begin-trip'
  ],
  'book-now-button': [
    'book-now-btn', 'book-ride', 'reserve-now', 'reserve-ride', 'book-trip',
    'book-btn', 'instant-book', 'quick-book', 'ride-book', 'ride-book-btn'
  ],
  'map-view': [
    'map-view', 'map-container', 'map-panel', 'map-area', 'map-block',
    'map-section', 'map-region', 'map-embed', 'map-surface', 'map-wrap'
  ],
  'available-rides-title': [
    'rides-available-title', 'available-title', 'rides-title', 'list-title', 'options-title',
    'available-heading', 'rides-heading', 'offers-title', 'results-title', 'catalog-title'
  ],
  'quick-booking-title': [
    'quick-booking-title', 'fast-book-title', 'express-book-title', 'quick-title', 'instant-book-title',
    'quick-heading', 'express-heading', 'fast-heading', 'instant-heading', 'rapid-book-title'
  ],
  'footer': [
    'footer', 'site-footer', 'page-footer', 'app-footer', 'global-footer',
    'bottom-bar', 'footer-bar', 'footer-wrap', 'footer-section', 'footer-area'
  ],

  // Trip page
  'trip-hero-title': [
    'trip-hero-title', 'trip-title', 'plan-trip-title', 'trip-heading', 'plan-heading',
    'trip-top', 'trip-head', 'trip-main-title', 'route-title', 'journey-title'
  ],
  'trip-hero-subtitle': [
    'trip-hero-subtitle', 'trip-subtitle', 'plan-trip-subtitle', 'trip-lead', 'plan-lead',
    'trip-support', 'trip-subhead', 'route-subtitle', 'journey-subtitle', 'assist-text'
  ],
  'search-button': [
    'search-btn', 'find-btn', 'lookup-btn', 'go-btn', 'discover-btn',
    'scan-btn', 'seek-btn', 'locate-btn', 'search-action', 'search-ride'
  ],
  'choose-ride-title': [
    'choose-ride-title', 'select-ride-title', 'ride-options-title', 'choose-title', 'selection-title',
    'ride-choice-title', 'pick-ride-title', 'ride-list-title', 'offers-heading', 'options-heading'
  ],
  'recommended-label': [
    'recommended', 'suggested', 'top-pick', 'best-choice', 'highlighted',
    'featured', 'our-pick', 'preferred', 'recommended-badge', 'editor-choice'
  ],

  // Trips page
  'trips-upcoming-title': [
    'upcoming-title', 'upcoming-rides', 'next-trips', 'future-trips', 'incoming-trips',
    'soon-trips', 'upcoming-heading', 'rides-upcoming', 'next-up-title', 'schedule-title'
  ],
  'trips-past-title': [
    'past-title', 'history-title', 'previous-trips', 'ride-history', 'past-rides',
    'completed-trips', 'archive-title', 'history-heading', 'earlier-trips', 'past-heading'
  ],
  'trips-filter-personal': [
    'filter-personal', 'my-trips', 'personal-filter', 'mine-filter', 'solo-filter',
    'me-filter', 'personal-btn', 'myrides-filter', 'myrides-btn', 'filter-me'
  ],
  'trips-filter-all': [
    'filter-all', 'all-trips', 'everyone-filter', 'allrides-filter', 'allrides-btn',
    'all-btn', 'allrides', 'all-selection', 'all-views', 'all-switch'
  ],
  'trips-details': [
    'view-details', 'trip-details', 'details-btn', 'open-details', 'details-link',
    'ride-details', 'more-details', 'details-action', 'details-view', 'details-open'
  ],
  'trips-rebook': [
    'rebook', 'book-again', 'rebook-btn', 'book-same', 'repeat-book',
    'reorder-ride', 'ride-again', 'quick-rebook', 'rebook-action', 'repeat-trip'
  ],
  'trips-card-details': [
    'trip-card', 'ride-card', 'booking-card', 'trip-summary', 'ride-summary',
    'trip-panel', 'card-trip', 'card-ride', 'trip-item', 'ride-item'
  ],
  'trips-aside-title': [
    'aside-title', 'panel-title', 'help-title', 'info-title', 'sidebar-title',
    'aside-heading', 'panel-heading', 'help-heading', 'info-heading', 'sidebar-heading'
  ],
  'trips-aside-desc': [
    'aside-desc', 'panel-desc', 'help-desc', 'info-desc', 'sidebar-desc',
    'aside-text', 'panel-text', 'help-text', 'info-text', 'sidebar-text'
  ],
  'trips-loading': [
    'loading-label', 'loading-text', 'loading-msg', 'loading-state', 'loading-note',
    'spinner-text', 'wait-text', 'busy-text', 'progress-text', 'status-loading'
  ],
};

function mapSeedToVariant(seed: number): number {
  if (!seed || seed < 1) return 1;
  return ((seed - 1) % 10) + 1;
}

function generateElementId(seed: number, elementType: string, index: number): string {
  const variant = mapSeedToVariant(seed);
  const ids = SEMANTIC_ID_MAP[elementType];
  if (ids && ids.length > 0) {
    return ids[(variant - 1) % ids.length];
  }
  // Fallbacks when no explicit mapping exists
  const bases = [
    elementType.replace(/-button$/, '-btn'),
    elementType.replace(/^[^-]+-/, ''),
    elementType.split('-').slice(-2).join('-'),
    elementType.split('-').pop() || elementType,
    elementType.replace(/-/g, ''),
  ];
  return bases[(variant - 1) % bases.length];
}

export function useSeedLayout() {
  const [seed, setSeed] = useState(1);
  const [layout, setLayout] = useState(getSeedLayout(1));
  const [isDynamicEnabledState, setIsDynamicEnabledState] = useState(false);

  useEffect(() => {
    // Check if dynamic HTML is enabled
    const dynamicEnabled = isDynamicEnabled();
    setIsDynamicEnabledState(dynamicEnabled);
    
    // Get seed from URL parameters or localStorage (prefer seed-structure)
    const searchParams = new URLSearchParams(window.location.search);
    const seedStructureParam = searchParams.get('seed-structure');
    const seedParam = seedStructureParam ?? searchParams.get('seed');
    
    let rawSeed = 1;
    
    if (seedParam) {
      // Priority 1: URL parameter
      rawSeed = parseInt(seedParam);
    } else {
      // Priority 2: localStorage
      try {
        const storedStructure = localStorage.getItem('autodriveSeedStructure');
        const stored = storedStructure ?? localStorage.getItem('autodriveSeed');
        if (stored) {
          rawSeed = parseInt(stored);
        }
      } catch (e) {
        // Ignore localStorage errors
      }
      // Priority 3: env default
      if (!Number.isFinite(rawSeed)) {
        const envDefault = parseInt(process.env.NEXT_PUBLIC_DEFAULT_SEED_STRUCTURE as string);
        if (Number.isFinite(envDefault)) rawSeed = envDefault as unknown as number;
      }
    }
    
    // Get effective seed (validates range and respects dynamic HTML setting)
    const effectiveSeed = getEffectiveSeed(rawSeed);
    setSeed(effectiveSeed);
    
    // Save to localStorage
    try {
      localStorage.setItem('autodriveSeedStructure', effectiveSeed.toString());
      localStorage.setItem('autodriveSeed', effectiveSeed.toString());
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Update layout only if dynamic HTML is enabled
    if (dynamicEnabled) {
      setLayout(getLayoutConfig(effectiveSeed));
    } else {
      // Use default layout when dynamic HTML is disabled
      setLayout(getLayoutConfig(1));
    }
  }, []);

  // Function to generate element attributes for a specific element type
  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    const baseAttrs = { 
      id: `${elementType}-${index}`, 
      'data-element-type': elementType 
    };
    
    if (!isDynamicEnabledState) {
      return baseAttrs;
    }
    
    // Generate dynamic attributes based on seed (semantic id)
    return { 
      ...baseAttrs,
      id: generateElementId(seed, elementType, index), 
      'data-seed': seed.toString(),
      'data-variant': (seed % 10).toString(),
      'data-xpath': `//${elementType}[@data-seed='${seed}']`
    };
  }, [seed, isDynamicEnabledState]);

  // Function to get XPath selector for an element
  const getElementXPath = useCallback((elementType: string) => {
    if (!isDynamicEnabledState) {
      return `//${elementType}[@id='${elementType}-0']`;
    }
    // Generate dynamic XPath based on seed
    return `//${elementType}[@data-seed='${seed}']`;
  }, [seed, isDynamicEnabledState]);

  // Function to reorder elements
  const reorderElements = useCallback(<T extends { id?: string; name?: string; type?: string }>(elements: T[]) => {
    if (!isDynamicEnabledState) {
      return elements;
    }
    // Simple reordering based on seed (cycle through elements)
    const reordered = [...elements];
    for (let i = 0; i < seed % elements.length; i++) {
      reordered.push(reordered.shift()!);
    }
    return reordered;
  }, [seed, isDynamicEnabledState]);

  // Function to generate element ID
  const generateId = useCallback((context: string, index: number = 0) => {
    if (!isDynamicEnabledState) {
      return `${context}-${index}`;
    }
    return generateElementId(seed, context, index);
  }, [seed, isDynamicEnabledState]);

  // Function to get layout classes for specific element types
  const getLayoutClasses = useCallback((elementType: 'container' | 'item' | 'button' | 'ride-card' | 'driver-card') => {
    if (!isDynamicEnabledState) {
      return '';
    }
    // Generate dynamic classes based on seed
    return `dynamic-${elementType} seed-${seed}`;
  }, [seed, isDynamicEnabledState]);

  // Function to apply CSS variables to an element
  const applyCSSVariables = useCallback((element: HTMLElement) => {
    if (!isDynamicEnabledState) {
      return;
    }
    // Apply basic dynamic CSS variables
    element.style.setProperty('--seed', seed.toString());
    element.style.setProperty('--variant', (seed % 10).toString());
  }, [seed, isDynamicEnabledState]);

  // Function to get current layout information
  const getLayoutInfo = useCallback(() => {
    return {
      seed,
      layout,
      isDynamicEnabled: isDynamicEnabledState,
      layoutName: layout.name,
      structure: layout.structure,
      sections: layout.structure.main.sections
    };
  }, [seed, layout, isDynamicEnabledState]);

  // Function to generate a unique class name based on seed
  const generateSeedClass = useCallback((baseClass: string) => {
    if (!isDynamicEnabledState) {
      return baseClass;
    }
    return `${baseClass}-seed-${seed}`;
  }, [seed, isDynamicEnabledState]);

  // Function to create a dynamic style object
  const createDynamicStyles = useCallback((baseStyles: React.CSSProperties = {}) => {
    if (!isDynamicEnabledState) {
      return baseStyles;
    }
    return {
      ...baseStyles,
      '--seed': seed.toString(),
      '--variant': (seed % 10).toString()
    };
  }, [seed, isDynamicEnabledState]);

  // Function to get dynamic text for an element type with fallback
  const getText = useCallback((key: ElementKey, fallback: string): string => {
    if (!isDynamicEnabledState) return fallback;
    return getTextForElement(seed, key, fallback);
  }, [seed, isDynamicEnabledState]);

  // Helper function to generate navigation URLs with seed parameter
  const getNavigationUrl = useCallback((path: string): string => {
    // If path already has query params
    if (path.includes('?')) {
      // Check if seed already exists in the URL
      if (path.includes('seed-structure=') || path.includes('seed=')) {
        return path;
      }
      return `${path}&seed-structure=${seed}`;
    }
    // Add seed as first query param
    return `${path}?seed-structure=${seed}`;
  }, [seed]);

  return {
    seed,
    layout,
    isDynamicEnabled: isDynamicEnabledState,
    getElementAttributes,
    getElementXPath,
    reorderElements,
    generateId,
    getLayoutClasses,
    applyCSSVariables,
    getLayoutInfo,
    generateSeedClass,
    createDynamicStyles,
    getNavigationUrl,
    getText,
  };
}
