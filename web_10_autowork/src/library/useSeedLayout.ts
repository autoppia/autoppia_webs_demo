// src/library/useSeedLayout.ts
import { useState, useEffect, useCallback } from 'react';
import { getLayoutConfig, isDynamicModeEnabled } from '@/utils/dynamicDataProvider';
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

function createSeededRandom(seed: number, salt: string) {
  let h = 1779033703 ^ seed;
  for (let i = 0; i < salt.length; i++) {
    h = Math.imul(h ^ salt.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const result = (h ^= h >>> 16) >>> 0;
    return result / 4294967296;
  };
}

function shuffleWithRandom<T>(items: T[], randomFn: () => number): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const DEFAULT_STRUCTURE_SEED = 36;
const DEFAULT_DYNAMIC_SEED = 36;
const DEFAULT_V2_SEED = 1;
const V2_SEED_STORAGE_KEY = "autowork_v2_seed";

const isV2DbModeEnabled =
  (
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE ||
    process.env.ENABLE_DYNAMIC_V2_DB_MODE ||
    ""
  )
    .toString()
    .toLowerCase() === "true";

const parseSeedValue = (value?: string | null): number => {
  if (!value) return NaN;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const clampSeed = (value: number, fallback: number): number =>
  value >= 1 && value <= 300 ? value : fallback;

export function useSeedLayout() {
  const [structureSeed, setStructureSeed] = useState(DEFAULT_STRUCTURE_SEED);
  const [dynamicSeed, setDynamicSeed] = useState(DEFAULT_DYNAMIC_SEED);
  const [v2Seed, setV2Seed] = useState<number | null>(null);
  const [structureSeedActive, setStructureSeedActive] = useState(false);
  const [dynamicSeedActive, setDynamicSeedActive] = useState(false);
  const [layout, setLayout] = useState<LayoutConfig>(getSeedLayout(DEFAULT_STRUCTURE_SEED));
  const [isDynamicEnabled, setIsDynamicEnabled] = useState(false);

  useEffect(() => {
    // Check if dynamic HTML is enabled
    const dynamicEnabled = isDynamicModeEnabled();
    setIsDynamicEnabled(dynamicEnabled);
    
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    let urlChanged = false;

    const rawStructureSeed = parseSeedValue(url.searchParams.get('seed'));
    const structureActive = dynamicEnabled && Number.isFinite(rawStructureSeed);
    const resolvedStructureSeed = structureActive
      ? clampSeed(rawStructureSeed as number, DEFAULT_STRUCTURE_SEED)
      : DEFAULT_STRUCTURE_SEED;

    const rawDynamicSeed = parseSeedValue(url.searchParams.get('seed-structure'));
    const dynamicActive = dynamicEnabled && Number.isFinite(rawDynamicSeed);
    const resolvedDynamicSeed = dynamicActive
      ? clampSeed(rawDynamicSeed as number, DEFAULT_DYNAMIC_SEED)
      : DEFAULT_DYNAMIC_SEED;

    let storedV2Seed: number | null = null;
    if (isV2DbModeEnabled) {
      try {
        const stored = localStorage.getItem(V2_SEED_STORAGE_KEY);
        if (stored) {
          const parsedStored = parseSeedValue(stored);
          if (Number.isFinite(parsedStored)) {
            storedV2Seed = clampSeed(parsedStored as number, DEFAULT_V2_SEED);
          }
        }
      } catch {
        storedV2Seed = null;
      }
    }

    let resolvedV2Seed: number | null = null;
    if (isV2DbModeEnabled) {
      const rawV2Seed = parseSeedValue(url.searchParams.get('v2-seed'));
      if (Number.isFinite(rawV2Seed)) {
        resolvedV2Seed = clampSeed(rawV2Seed as number, DEFAULT_V2_SEED);
      } else if (storedV2Seed !== null) {
        resolvedV2Seed = storedV2Seed;
      }
    }

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

    if (isV2DbModeEnabled && resolvedV2Seed !== null) {
      const v2SeedString = resolvedV2Seed.toString();
      if (url.searchParams.get('v2-seed') !== v2SeedString) {
        url.searchParams.set('v2-seed', v2SeedString);
        urlChanged = true;
      }
      try {
        localStorage.setItem(V2_SEED_STORAGE_KEY, v2SeedString);
      } catch {
        // ignore storage errors
      }
    } else if (url.searchParams.has('v2-seed')) {
      url.searchParams.delete('v2-seed');
      urlChanged = true;
    }

    setStructureSeed(resolvedStructureSeed);
    setDynamicSeed(resolvedDynamicSeed);
    setV2Seed(isV2DbModeEnabled ? resolvedV2Seed : null);
    setStructureSeedActive(structureActive);
    setDynamicSeedActive(dynamicActive);

    if (dynamicEnabled && structureActive) {
      setLayout(getSeedLayout(resolvedStructureSeed));
    } else {
      setLayout(getSeedLayout(DEFAULT_STRUCTURE_SEED));
    }

    if (urlChanged) {
      window.history.replaceState(null, '', url.toString());
    }
  }, []);

  const isDynamicStructureActive = isDynamicEnabled && structureSeedActive;
  const isDynamicHtmlActive = isDynamicEnabled && dynamicSeedActive;

  // Function to generate element attributes for a specific element type
  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    const baseAttrs = { 
      id: `${elementType}-${index}`, 
      'data-element-type': elementType 
    } as Record<string, string>;
    
    if (!isDynamicHtmlActive) {
      return baseAttrs;
    }
    
    // Use semantic ID pattern based on seed (like web5)
    const dynamicId = generateElementId(dynamicSeed, elementType, index);
    
    // Dynamic attributes
    return { 
      ...baseAttrs,
      id: dynamicId, 
      'data-seed': dynamicSeed.toString(),
      'data-variant': (dynamicSeed % 10).toString(),
      'data-xpath': `//*[@data-element-type='${elementType}' and @data-seed='${dynamicSeed}']`
    };
  }, [dynamicSeed, isDynamicHtmlActive]);

  // Function to get XPath selector for an element
  const getXPathSelector = useCallback((elementType: string) => {
    if (!isDynamicHtmlActive) {
      return `//*[@data-element-type='${elementType}']`;
    }
    
    // Generate XPath with dynamic attributes for scraper confusion
    return `//*[@data-element-type='${elementType}' and @data-seed='${dynamicSeed}']`;
  }, [dynamicSeed, isDynamicHtmlActive]);

  // Function to get layout classes based on current seed
  const getLayoutClassesForSeed = useCallback(() => {
    if (!isDynamicStructureActive) {
      return getLayoutClasses(getLayoutConfig(36));
    }
    return getLayoutClasses(getLayoutConfig(structureSeed));
  }, [structureSeed, isDynamicStructureActive]);

  const getText = useCallback((key: ElementKey, fallback: string): string => {
    if (!isDynamicHtmlActive) return fallback;
    return getTextForElement(dynamicSeed, key, fallback);
  }, [dynamicSeed, isDynamicHtmlActive]);

  const shuffleList = useCallback(<T,>(items: T[], context: string) => {
    if (!isDynamicHtmlActive) {
      return items;
    }
    const random = createSeededRandom(dynamicSeed, context);
    return shuffleWithRandom(items, random);
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
    isDynamicEnabled,
    getElementAttributes,
    getXPathSelector,
    getLayoutClassesForSeed,
    getText,
    shuffleList,
    getNavigationUrl,
  };
} 
