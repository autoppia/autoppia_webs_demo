// src/library/useSeedLayout.ts
import { useMemo, useCallback } from 'react';
import { getSeedLayout } from './layouts';
import { isDynamicModeEnabled } from '@/utils/dynamicDataProvider';
import { getTextForElement, type ElementKey } from '@/library/textVariants';
import { useSeed as useSeedContext } from '@/context/SeedContext';

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

export function useSeedLayout() {
  // Use SeedContext for unified seed management
  const { resolvedSeeds, getNavigationUrl: seedGetNavigationUrl } = useSeedContext();
  
  // Use resolved v1 seed for structure (layout)
  const structureSeed = useMemo(() => {
    return resolvedSeeds.v1 ?? resolvedSeeds.base;
  }, [resolvedSeeds.v1, resolvedSeeds.base]);
  
  // Use resolved v3 seed for dynamic (HTML/text), or v1 if v3 not enabled
  const dynamicSeed = useMemo(() => {
    return resolvedSeeds.v3 ?? resolvedSeeds.v1 ?? resolvedSeeds.base;
  }, [resolvedSeeds.v3, resolvedSeeds.v1, resolvedSeeds.base]);
  
  const v2Seed = useMemo(() => {
    return resolvedSeeds.v2 ?? null;
  }, [resolvedSeeds.v2]);
  
  // Check if dynamic mode is enabled
  const isDynamicEnabled = isDynamicModeEnabled();
  
  // Determine if structure and dynamic are active based on resolved seeds
  const hasStructureSeedParam = useMemo(() => {
    return isDynamicEnabled && resolvedSeeds.v1 !== null;
  }, [isDynamicEnabled, resolvedSeeds.v1]);
  
  const hasDynamicSeedParam = useMemo(() => {
    return isDynamicEnabled && (resolvedSeeds.v3 !== null || resolvedSeeds.v1 !== null);
  }, [isDynamicEnabled, resolvedSeeds.v3, resolvedSeeds.v1]);
  
  // Calculate layout based on structure seed
  const layout = useMemo(() => {
    if (isDynamicEnabled && hasStructureSeedParam) {
      return getSeedLayout(structureSeed);
    }
    return getSeedLayout(1);
  }, [isDynamicEnabled, hasStructureSeedParam, structureSeed]);

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
  // Delegates to SeedContext which handles unified seed preservation
  const getNavigationUrl = useCallback((path: string): string => {
    return seedGetNavigationUrl(path);
  }, [seedGetNavigationUrl]);

  return {
    seed: dynamicSeed,
    structureSeed,
    dynamicSeed,
    v2Seed,
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
