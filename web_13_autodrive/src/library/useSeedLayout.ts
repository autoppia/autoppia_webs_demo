// src/library/useSeedLayout.ts
import { useState, useEffect, useCallback } from 'react';
import { getSeedLayout, isDynamicEnabled } from './layouts';
import { getLayoutConfig } from '@/utils/dynamicDataProvider';
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

const parseSeedValue = (value?: string | null): number => {
  if (!value) return NaN;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const clampSeed = (value: number): number => (value >= 1 && value <= 300 ? value : 1);
const V2_STORAGE_KEY = 'autodrive_v2_seed';
const isV2DbModeEnabled = (
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE ||
  process.env.ENABLE_DYNAMIC_V2_DB_MODE ||
  ''
)
  .toString()
  .toLowerCase() === 'true';

export function useSeedLayout() {
  const [structureSeed, setStructureSeed] = useState(1);
  const [dynamicSeed, setDynamicSeed] = useState(1);
  const [structureSeedActive, setStructureSeedActive] = useState(false);
  const [dynamicSeedActive, setDynamicSeedActive] = useState(false);
  const [layout, setLayout] = useState(getSeedLayout(1));
  const [isDynamicEnabledState, setIsDynamicEnabledState] = useState(false);
  const [v2Seed, setV2Seed] = useState<number | null>(null);

  useEffect(() => {
    // Check if dynamic HTML is enabled
    const dynamicEnabled = isDynamicEnabled();
    setIsDynamicEnabledState(dynamicEnabled);
    
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    let urlChanged = false;

    const rawStructureSeed = parseSeedValue(url.searchParams.get('seed'));
    const structureActive = dynamicEnabled && Number.isFinite(rawStructureSeed);
    const resolvedStructureSeed = structureActive ? clampSeed(rawStructureSeed as number) : 1;

    const rawDynamicSeed = parseSeedValue(url.searchParams.get('seed-structure'));
    const dynamicActive = dynamicEnabled && Number.isFinite(rawDynamicSeed);
    const resolvedDynamicSeed = dynamicActive ? clampSeed(rawDynamicSeed as number) : 1;

    if (structureActive) {
      const structureString = resolvedStructureSeed.toString();
      if (url.searchParams.get('seed') !== structureString) {
        url.searchParams.set('seed', structureString);
        urlChanged = true;
      }
    }

    if (dynamicActive) {
      const dynamicString = resolvedDynamicSeed.toString();
      if (url.searchParams.get('seed-structure') !== dynamicString) {
        url.searchParams.set('seed-structure', dynamicString);
        urlChanged = true;
      }
    }

    let resolvedV2Seed: number | null = null;
    if (isV2DbModeEnabled) {
      const rawV2 = parseSeedValue(url.searchParams.get('v2-seed'));
      if (Number.isFinite(rawV2)) {
        resolvedV2Seed = clampSeed(rawV2 as number);
      } else {
        try {
          const stored = localStorage.getItem(V2_STORAGE_KEY);
          if (stored) {
            const parsedStored = parseSeedValue(stored);
            if (Number.isFinite(parsedStored)) {
              resolvedV2Seed = clampSeed(parsedStored as number);
            }
          }
        } catch {
          resolvedV2Seed = null;
        }
      }
      if (resolvedV2Seed !== null) {
        const v2String = resolvedV2Seed.toString();
        if (url.searchParams.get('v2-seed') !== v2String) {
          url.searchParams.set('v2-seed', v2String);
          urlChanged = true;
        }
        try {
          localStorage.setItem(V2_STORAGE_KEY, v2String);
        } catch {
          // ignore storage errors
        }
      } else if (url.searchParams.has('v2-seed')) {
        url.searchParams.delete('v2-seed');
        urlChanged = true;
        try {
          localStorage.removeItem(V2_STORAGE_KEY);
        } catch {}
      }
    } else if (url.searchParams.has('v2-seed')) {
      url.searchParams.delete('v2-seed');
      urlChanged = true;
      try {
        localStorage.removeItem(V2_STORAGE_KEY);
      } catch {}
    }

    setStructureSeed(resolvedStructureSeed);
    setDynamicSeed(resolvedDynamicSeed);
    setV2Seed(isV2DbModeEnabled ? resolvedV2Seed : null);
    setStructureSeedActive(structureActive);
    setDynamicSeedActive(dynamicActive);

    if (dynamicEnabled && structureActive) {
      setLayout(getLayoutConfig(resolvedStructureSeed));
    } else {
      setLayout(getLayoutConfig(1));
    }

    if (urlChanged) {
      window.history.replaceState(null, '', url.toString());
    }
  }, []);

  const isDynamicStructureActive = isDynamicEnabledState && structureSeedActive;
  const isDynamicHtmlActive = isDynamicEnabledState && dynamicSeedActive;

  // Function to generate element attributes for a specific element type
  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    const baseAttrs = { 
      id: `${elementType}-${index}`, 
      'data-element-type': elementType 
    };
    
    if (!isDynamicHtmlActive) {
      return baseAttrs;
    }
    
    // Generate dynamic attributes based on seed (semantic id)
    return { 
      ...baseAttrs,
      id: generateElementId(dynamicSeed, elementType, index), 
      'data-seed': dynamicSeed.toString(),
      'data-variant': (dynamicSeed % 10).toString(),
      'data-xpath': `//${elementType}[@data-seed='${dynamicSeed}']`
    };
  }, [dynamicSeed, isDynamicHtmlActive]);

  // Function to get XPath selector for an element
  const getElementXPath = useCallback((elementType: string) => {
    if (!isDynamicHtmlActive) {
      return `//${elementType}[@id='${elementType}-0']`;
    }
    // Generate dynamic XPath based on seed
    return `//${elementType}[@data-seed='${dynamicSeed}']`;
  }, [dynamicSeed, isDynamicHtmlActive]);

  // Function to reorder elements
  const reorderElements = useCallback(<T extends { id?: string; name?: string; type?: string }>(elements: T[]) => {
    if (!isDynamicHtmlActive || elements.length === 0) {
      return elements;
    }
    // Simple reordering based on seed (cycle through elements)
    const reordered = [...elements];
    const rotations = (dynamicSeed - 1 + elements.length) % elements.length;
    if (rotations === 0) {
      return elements;
    }
    for (let i = 0; i < rotations; i++) {
      reordered.push(reordered.shift()!);
    }
    return reordered;
  }, [dynamicSeed, isDynamicHtmlActive]);

  // Function to generate element ID
  const generateId = useCallback((context: string, index: number = 0) => {
    if (!isDynamicHtmlActive) {
      return `${context}-${index}`;
    }
    return generateElementId(dynamicSeed, context, index);
  }, [dynamicSeed, isDynamicHtmlActive]);

  // Function to get layout classes for specific element types
  const getLayoutClasses = useCallback((elementType: 'container' | 'item' | 'button' | 'ride-card' | 'driver-card') => {
    if (!isDynamicHtmlActive) {
      return '';
    }
    // Generate dynamic classes based on seed
    return `dynamic-${elementType} seed-${dynamicSeed}`;
  }, [dynamicSeed, isDynamicHtmlActive]);

  // Function to apply CSS variables to an element
  const applyCSSVariables = useCallback((element: HTMLElement) => {
    if (!isDynamicHtmlActive) {
      return;
    }
    // Apply basic dynamic CSS variables
    element.style.setProperty('--seed', dynamicSeed.toString());
    element.style.setProperty('--variant', (dynamicSeed % 10).toString());
  }, [dynamicSeed, isDynamicHtmlActive]);

  // Function to get current layout information
  const getLayoutInfo = useCallback(() => {
    return {
      structureSeed,
      dynamicSeed,
      seed: dynamicSeed,
      layout,
      isDynamicEnabled: isDynamicEnabledState,
      layoutName: layout.name,
      structure: layout.structure,
      sections: layout.structure.main.sections
    };
  }, [structureSeed, dynamicSeed, layout, isDynamicEnabledState]);

  // Function to generate a unique class name based on seed
  const generateSeedClass = useCallback((baseClass: string) => {
    if (!isDynamicHtmlActive) {
      return baseClass;
    }
    return `${baseClass}-seed-${dynamicSeed}`;
  }, [dynamicSeed, isDynamicHtmlActive]);

  // Function to create a dynamic style object
  const createDynamicStyles = useCallback((baseStyles: React.CSSProperties = {}) => {
    if (!isDynamicHtmlActive) {
      return baseStyles;
    }
    return {
      ...baseStyles,
      '--seed': dynamicSeed.toString(),
      '--variant': (dynamicSeed % 10).toString()
    };
  }, [dynamicSeed, isDynamicHtmlActive]);

  // Function to get dynamic text for an element type with fallback
  const getText = useCallback((key: ElementKey, fallback: string): string => {
    if (!isDynamicHtmlActive) return fallback;
    return getTextForElement(dynamicSeed, key, fallback);
  }, [dynamicSeed, isDynamicHtmlActive]);

  // Helper function to generate navigation URLs with seed parameter
  const getNavigationUrl = useCallback((path: string): string => {
    const [pathWithoutHash, hashFragment] = path.split('#', 2);
    const [basePath, queryString] = pathWithoutHash.split('?', 2);
    const params = new URLSearchParams(queryString || '');

    if (isDynamicStructureActive) {
      params.set('seed', structureSeed.toString());
    } else {
      params.delete('seed');
    }

    if (isDynamicHtmlActive) {
      params.set('seed-structure', dynamicSeed.toString());
    } else {
      params.delete('seed-structure');
    }

    if (isV2DbModeEnabled && v2Seed !== null) {
      params.set('v2-seed', v2Seed.toString());
    } else {
      params.delete('v2-seed');
    }

    const query = params.toString();
    const rebuilt = `${basePath}${query ? `?${query}` : ''}`;
    return hashFragment ? `${rebuilt}#${hashFragment}` : rebuilt;
  }, [structureSeed, dynamicSeed, v2Seed, isDynamicStructureActive, isDynamicHtmlActive]);

  return {
    seed: dynamicSeed,
    structureSeed,
    dynamicSeed,
    v2Seed,
    isDynamicStructureActive,
    isDynamicHtmlActive,
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
