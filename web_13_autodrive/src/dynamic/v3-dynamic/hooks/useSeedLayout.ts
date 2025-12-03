// src/dynamic/v3-dynamic/hooks/useSeedLayout.ts
import { useMemo, useCallback } from 'react';
import { getSeedLayout } from '../../v1-layouts/layouts';
import { getLayoutConfig } from '../../v2-data/data-provider';
import { getTextForElement, type ElementKey } from '../utils/textVariants';
import { useSeed as useSeedContext } from '@/context/SeedContext';

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
  const { resolvedSeeds, getNavigationUrl: seedGetNavigationUrl } = useSeedContext();
  
  // Force fixed layout/ids; keep base seed for preservation
  const structureSeed = useMemo(() => resolvedSeeds.base, [resolvedSeeds.base]);
  const dynamicSeed = useMemo(() => resolvedSeeds.base, [resolvedSeeds.base]);
  const v2Seed = useMemo(() => resolvedSeeds.v2 ?? null, [resolvedSeeds.v2]);
  
  const isDynamicEnabledState = false;
  const structureSeedActive = false;
  const dynamicSeedActive = false;
  
  const layout = useMemo(() => getLayoutConfig(1), []);

  const isDynamicStructureActive = false;
  const isDynamicHtmlActive = false;

  // Function to generate element attributes for a specific element type
  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    const baseAttrs = { 
      id: `${elementType}-${index}`, 
      'data-element-type': elementType 
    };
    
    return baseAttrs;
  }, []);

  // Function to get XPath selector for an element
  const getElementXPath = useCallback((elementType: string) => {
    return `//${elementType}[@id='${elementType}-0']`;
  }, []);

  // Function to reorder elements
  const reorderElements = useCallback(<T extends { id?: string; name?: string; type?: string }>(elements: T[]) => {
    return elements;
  }, []);

  // Function to generate element ID
  const generateId = useCallback((context: string, index: number = 0) => {
    return `${context}-${index}`;
  }, []);

  // Function to get layout classes for specific element types
  const getLayoutClasses = useCallback((elementType: 'container' | 'item' | 'button' | 'ride-card' | 'driver-card') => {
    return '';
  }, []);

  // Function to apply CSS variables to an element
  const applyCSSVariables = useCallback((element: HTMLElement) => {
    return;
  }, []);

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
    return baseClass;
  }, []);

  // Function to create a dynamic style object
  const createDynamicStyles = useCallback((baseStyles: React.CSSProperties = {}) => {
    return baseStyles;
  }, []);

  // Function to get dynamic text for an element type with fallback
  const getText = useCallback((key: ElementKey, fallback: string): string => {
    return fallback;
  }, []);

  // Helper function to generate navigation URLs with seed parameter
  // Delegates to SeedContext which handles unified seed preservation
  const getNavigationUrl = useCallback((path: string): string => {
    return seedGetNavigationUrl(path);
  }, [seedGetNavigationUrl]);

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
