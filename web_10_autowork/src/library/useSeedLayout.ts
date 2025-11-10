// src/library/useSeedLayout.ts
import { useState, useEffect, useCallback } from 'react';
import { getLayoutVariant } from './layoutVariants';
import { getEffectiveSeed, getLayoutConfig, isDynamicModeEnabled } from '@/utils/dynamicDataProvider';
import { getLayoutClasses } from '@/utils/seedLayout';
import { getSeedLayout, LayoutConfig } from './utils';
import { getTextForElement, type ElementKey } from './textVariants';

// Semantic ID mappings (10 variations per type, selected by mapped seed 1-10)
const SEMANTIC_ID_MAP: Record<string, string[]> = {
  'book-consultation-button': [
    'book-consultation-btn',
    'schedule-consultation',
    'start-consultation',
    'get-consultation',
    'consultation-button',
    'book-session-btn',
    'schedule-session',
    'start-session',
    'consultation-link',
    'book-now-button'
  ],
  'post-job-button': [
    'post-job-btn',
    'create-job',
    'add-job-button',
    'new-job-btn',
    'post-position',
    'create-position',
    'add-position-btn',
    'new-position',
    'job-post-button',
    'create-job-btn'
  ],
  'expert-hire-button': [
    'hire-expert-btn',
    'hire-now',
    'book-expert-button',
    'hire-professional-btn',
    'engage-expert',
    'hire-talent-btn',
    'book-expert',
    'hire-now-button',
    'engage-button',
    'hire-btn'
  ],
  'expert-message-button': [
    'message-expert',
    'contact-expert-btn',
    'message-button',
    'contact-btn',
    'send-message',
    'contact-expert',
    'message-professional',
    'contact-button',
    'send-message-btn',
    'reach-out'
  ],
  'add-skill-button': [
    'add-skill-btn',
    'add-skill',
    'skill-add-button',
    'add-skill-now',
    'skill-button',
    'add-tag-btn',
    'add-tag',
    'skill-tag-button',
    'add-skill-tag',
    'skill-add-btn'
  ],
  'remove-skill-button': [
    'remove-skill-btn',
    'remove-skill',
    'skill-remove-button',
    'delete-skill-btn',
    'remove-tag',
    'skill-delete-btn',
    'remove-tag-button',
    'delete-skill',
    'skill-remove',
    'remove-btn'
  ],
  'popular-skill-button': [
    'popular-skill-btn',
    'popular-skill',
    'trending-skill-button',
    'popular-tag-btn',
    'trending-skill',
    'popular-tag',
    'skill-trending-btn',
    'popular-skill-tag',
    'trending-tag-button',
    'popular-btn'
  ],
  'attach-file-button': [
    'attach-file-btn',
    'attach-file',
    'upload-file-button',
    'file-attach-btn',
    'upload-button',
    'attach-document',
    'file-upload-btn',
    'attach-document-btn',
    'upload-file',
    'file-button'
  ],
  'back-button': [
    'back-btn',
    'go-back',
    'back-button',
    'previous-btn',
    'back-step',
    'previous-button',
    'go-back-btn',
    'back-arrow-btn',
    'previous-step',
    'back-nav'
  ],
  'next-button': [
    'next-btn',
    'next-step',
    'continue-button',
    'next-page-btn',
    'continue-btn',
    'next-step-button',
    'proceed-btn',
    'continue-step',
    'next-page',
    'proceed-button'
  ],
  'submit-job-button': [
    'submit-job-btn',
    'submit-job',
    'post-job-button',
    'create-job-btn',
    'submit-position',
    'post-position-btn',
    'create-job',
    'submit-btn',
    'post-job',
    'job-submit-button'
  ],
  'close-post-job-button': [
    'close-modal-btn',
    'close-button',
    'dismiss-modal',
    'close-dialog',
    'close-btn',
    'dismiss-button',
    'close-job-modal',
    'cancel-button',
    'close-modal',
    'dismiss-btn'
  ]
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
  // Fallback derive a semantic-looking id when no explicit mapping exists
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
  const [seed, setSeed] = useState(36);
  const [layout, setLayout] = useState<LayoutConfig>(getSeedLayout(36));
  const [isDynamicEnabled, setIsDynamicEnabled] = useState(false);

  useEffect(() => {
    // Check if dynamic HTML is enabled
    const dynamicEnabled = isDynamicModeEnabled();
    setIsDynamicEnabled(dynamicEnabled);
    
    // Get seed from URL parameters or localStorage (prefer seed-structure)
    const searchParams = new URLSearchParams(window.location.search);
    const seedStructureParam = searchParams.get('seed-structure');
    const seedParam = seedStructureParam ?? searchParams.get('seed');
    
    let rawSeed = 36;
    
    if (seedParam) {
      // Priority 1: URL parameter
      rawSeed = parseInt(seedParam);
    } else {
      // Priority 2: localStorage
      try {
        const storedStructure = localStorage.getItem('autoworkSeedStructure');
        const stored = storedStructure ?? localStorage.getItem('autoworkSeed');
        if (stored) rawSeed = parseInt(stored);
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    // Priority 3: default from env
    if (!seedParam && !Number.isFinite(rawSeed)) {
      const envDefault = parseInt(process.env.NEXT_PUBLIC_DEFAULT_SEED_STRUCTURE as string);
      if (Number.isFinite(envDefault)) rawSeed = envDefault as unknown as number;
    }
    
    // Get effective seed (validates range and respects dynamic HTML setting)
    const effectiveSeed = getEffectiveSeed(rawSeed);
    setSeed(effectiveSeed);
    
    // Save to localStorage (both keys for compatibility)
    try {
      localStorage.setItem('autoworkSeedStructure', effectiveSeed.toString());
      localStorage.setItem('autoworkSeed', effectiveSeed.toString());
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Update layout only if dynamic HTML is enabled
    if (dynamicEnabled) {
      setLayout(getSeedLayout(effectiveSeed));
    } else {
      // Use default layout when dynamic HTML is disabled
      setLayout(getSeedLayout(36));
    }
  }, []);

  // Function to generate element attributes for a specific element type
  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    const baseAttrs = { 
      id: `${elementType}-${index}`, 
      'data-element-type': elementType 
    } as Record<string, string>;
    
    if (!isDynamicEnabled) {
      return baseAttrs;
    }
    
    // Use semantic ID pattern based on seed (like web5)
    const dynamicId = generateElementId(seed, elementType, index);
    
    // Dynamic attributes
    return { 
      ...baseAttrs,
      id: dynamicId, 
      'data-seed': seed.toString(),
      'data-variant': (seed % 10).toString(),
      'data-xpath': `//*[@data-element-type='${elementType}' and @data-seed='${seed}']`
    };
  }, [seed, isDynamicEnabled]);

  // Function to get XPath selector for an element
  const getXPathSelector = useCallback((elementType: string) => {
    if (!isDynamicEnabled) {
      return `//*[@data-element-type='${elementType}']`;
    }
    
    // Generate XPath with dynamic attributes for scraper confusion
    return `//*[@data-element-type='${elementType}' and @data-seed='${seed}']`;
  }, [seed, isDynamicEnabled]);

  // Function to get layout classes based on current seed
  const getLayoutClassesForSeed = useCallback(() => {
    if (!isDynamicEnabled) {
      return getLayoutClasses(getLayoutConfig(36));
    }
    return getLayoutClasses(getLayoutConfig(seed));
  }, [seed, isDynamicEnabled]);

  // Function to get dynamic text for an element type with fallback
  const getText = useCallback((key: ElementKey, fallback: string): string => {
    if (!isDynamicEnabled) return fallback;
    return getTextForElement(seed, key, fallback);
  }, [seed, isDynamicEnabled]);

  // Helper function to generate navigation URLs with seed parameter (prefer seed-structure)
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
    setSeed,
    isDynamicEnabled,
    getElementAttributes,
    getXPathSelector,
    getLayoutClassesForSeed,
    getText,
    getNavigationUrl,
  };
} 