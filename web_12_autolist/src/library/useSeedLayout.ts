// src/library/useSeedLayout.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSeedLayout } from './layouts';
import { isDynamicModeEnabled } from '@/utils/dynamicDataProvider';
import { getTextForElement, type ElementKey } from '@/library/textVariants';

// Semantic ID mappings (10 per type; chosen by seed mapped to 1-10)
const SEMANTIC_ID_MAP: Record<string, string[]> = {
  // Inputs
  'task-name-input': [
    'task-name', 'title-input', 'name-field', 'todo-title', 'item-name',
    'task-title', 'entry-title', 'name-input', 'todo-name', 'task-name-field'
  ],
  'task-description-input': [
    'task-desc', 'description-input', 'desc-field', 'details-input', 'notes-input',
    'task-notes', 'item-desc', 'desc-box', 'details-field', 'todo-desc'
  ],
  // Pickers
  'date-picker-button': [
    'pick-date', 'date-btn', 'schedule-date', 'choose-date', 'set-date',
    'date-action', 'date-select', 'select-date', 'open-date-picker', 'date-trigger'
  ],
  'priority-picker-button': [
    'pick-priority', 'priority-btn', 'set-priority', 'choose-priority', 'priority-select',
    'priority-action', 'open-priority', 'priority-trigger', 'select-priority', 'priority-choose'
  ],
  // Labels / headings
  'label-inbox': [
    'inbox-label', 'inbox-chip', 'inbox-tag', 'current-inbox', 'inbox-select',
    'inbox-title', 'inbox-control', 'inbox-pill', 'inbox-badge', 'inbox-header'
  ],
  'heading-today': [
    'today-heading', 'today-title', 'today-header', 'tasks-today', 'today-h1',
    'today-section', 'today-head', 'heading-today', 'today-top', 'today-bar'
  ],
  'heading-completed': [
    'completed-heading', 'activity-heading', 'done-title', 'activity-title', 'history-title',
    'completed-title', 'activity-header', 'completed-header', 'done-heading', 'history-heading'
  ],
  'heading-inbox': [
    'inbox-heading', 'inbox-title', 'add-tasks-heading', 'todo-inbox', 'inbox-h1',
    'inbox-section', 'inbox-header', 'inbox-head', 'inbox-top', 'inbox-bar'
  ],
  // Empty state
  'empty-inbox-title': [
    'empty-title', 'capture-title', 'start-title', 'get-started-title', 'welcome-title',
    'start-capturing', 'inbox-empty-title', 'inbox-start-title', 'no-tasks-title', 'first-task-title'
  ],
  'empty-inbox-desc': [
    'empty-desc', 'capture-desc', 'start-desc', 'get-started-desc', 'welcome-desc',
    'inbox-empty-desc', 'howto-desc', 'helper-desc', 'intro-desc', 'inbox-helper'
  ],
  'cta-add-task': [
    'add-task-btn', 'create-task', 'new-task-btn', 'task-add', 'add-item-btn',
    'add-todo', 'create-item', 'start-task', 'add-now', 'new-item-btn'
  ],
  // Footer actions
  'cancel-button': [
    'cancel-btn', 'dismiss-btn', 'close-btn', 'abort-btn', 'reject-btn',
    'back-btn', 'cancel-action', 'cancel-control', 'exit-btn', 'cancel-link'
  ],
  'submit-button': [
    'submit-btn', 'add-btn', 'save-btn', 'confirm-btn', 'apply-btn',
    'create-btn', 'ok-btn', 'proceed-btn', 'done-btn', 'finish-btn'
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

export function useSeedLayout() {
  const [structureSeed, setStructureSeed] = useState(1);
  const [dynamicSeed, setDynamicSeed] = useState(1);
  const [hasStructureSeedParam, setHasStructureSeedParam] = useState(false);
  const [hasDynamicSeedParam, setHasDynamicSeedParam] = useState(false);
  const [layout, setLayout] = useState(getSeedLayout(1));
  const [isDynamicEnabled, setIsDynamicEnabled] = useState(false);
  const [searchSnapshot, setSearchSnapshot] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSearch = () => setSearchSnapshot(window.location.search ?? '');

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const dispatchLocationChange = () => {
      window.dispatchEvent(new Event('locationchange'));
    };

    const patchedPushState: typeof history.pushState = (...args) => {
      originalPushState.apply(window.history, args);
      dispatchLocationChange();
    };
    const patchedReplaceState: typeof history.replaceState = (...args) => {
      originalReplaceState.apply(window.history, args);
      dispatchLocationChange();
    };

    history.pushState = patchedPushState;
    history.replaceState = patchedReplaceState;

    window.addEventListener('popstate', updateSearch);
    window.addEventListener('locationchange', updateSearch);

    updateSearch();

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', updateSearch);
      window.removeEventListener('locationchange', updateSearch);
    };
  }, []);

  const dynamicParamValue = useMemo(() => {
    const params = new URLSearchParams(searchSnapshot);
    return params.get('seed');
  }, [searchSnapshot]);

  const structureParamValue = useMemo(() => {
    const params = new URLSearchParams(searchSnapshot);
    return params.get('seed-structure');
  }, [searchSnapshot]);

  useEffect(() => {
    const dynamicEnabled = isDynamicModeEnabled();
    setIsDynamicEnabled(dynamicEnabled);

    const url = new URL(window.location.href);
    let urlChanged = false;

    const rawStructureSeed = parseSeedValue(dynamicParamValue);
    const structureParamProvided = Number.isFinite(rawStructureSeed);
    setHasStructureSeedParam(dynamicEnabled && structureParamProvided);

    const resolvedStructureSeed = dynamicEnabled && structureParamProvided
      ? clampSeed(rawStructureSeed as number)
      : 1;

    if (structureParamProvided) {
      const structureString = resolvedStructureSeed.toString();
      if (url.searchParams.get('seed') !== structureString) {
        url.searchParams.set('seed', structureString);
        urlChanged = true;
      }
    }

    setStructureSeed(resolvedStructureSeed);
    setLayout(dynamicEnabled ? getSeedLayout(resolvedStructureSeed) : getSeedLayout(1));

    const rawDynamicSeed = parseSeedValue(structureParamValue);
    const dynamicParamProvided = Number.isFinite(rawDynamicSeed);
    const resolvedDynamicSeed = dynamicEnabled && dynamicParamProvided
      ? clampSeed(rawDynamicSeed as number)
      : 1;

    setHasDynamicSeedParam(dynamicEnabled && dynamicParamProvided);
    setDynamicSeed(resolvedDynamicSeed);

    if (dynamicParamProvided) {
      const dynamicString = resolvedDynamicSeed.toString();
      if (url.searchParams.get('seed-structure') !== dynamicString) {
        url.searchParams.set('seed-structure', dynamicString);
        urlChanged = true;
      }
    }

    if (urlChanged) {
      window.history.replaceState(null, '', url.toString());
    }
  }, [dynamicParamValue, structureParamValue, isDynamicEnabled]);

  const isDynamicStructureActive = isDynamicEnabled && hasStructureSeedParam;
  const isDynamicHtmlActive = isDynamicEnabled && hasDynamicSeedParam;

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
  const reorderElements = useCallback(<T extends { id?: string; name?: string }>(elements: T[]) => {
    if (!isDynamicHtmlActive || elements.length === 0) {
      return elements;
    }

    const rotations = dynamicSeed > 1 ? ((dynamicSeed - 1) % elements.length) : 0;
    if (rotations === 0) {
      return elements;
    }

    const reordered = [...elements];
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
  const getLayoutClasses = useCallback((elementType: 'container' | 'item' | 'button' | 'checkbox') => {
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
      isDynamicEnabled,
      layoutType: layout.container.type,
      elementOrder: layout.elements
    };
  }, [structureSeed, dynamicSeed, layout, isDynamicEnabled]);

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

    const query = params.toString();
    const rebuilt = `${basePath}${query ? `?${query}` : ''}`;
    return hashFragment ? `${rebuilt}#${hashFragment}` : rebuilt;
  }, [structureSeed, dynamicSeed, isDynamicStructureActive, isDynamicHtmlActive]);

  return {
    seed: dynamicSeed,
    structureSeed,
    dynamicSeed,
    hasStructureSeedParam: isDynamicStructureActive,
    hasDynamicSeedParam: isDynamicHtmlActive,
    isDynamicStructureActive,
    isDynamicHtmlActive,
    layout,
    isDynamicEnabled,
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
    getText: (key: ElementKey, fallback: string) => {
      if (!isDynamicHtmlActive) return fallback;
      return getTextForElement(dynamicSeed, key, fallback);
    },
  };
}