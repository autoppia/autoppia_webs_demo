// src/library/useSeedLayout.ts
import { useState, useEffect, useCallback } from 'react';
import { getSeedLayout } from './layouts';
import { getEffectiveSeed, getLayoutConfig, isDynamicModeEnabled } from '@/utils/dynamicDataProvider';
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

export function useSeedLayout() {
  const [seed, setSeed] = useState(1);
  const [layout, setLayout] = useState(getSeedLayout(1));
  const [isDynamicEnabled, setIsDynamicEnabled] = useState(false);

  useEffect(() => {
    // Check if dynamic HTML is enabled
    const dynamicEnabled = isDynamicModeEnabled();
    setIsDynamicEnabled(dynamicEnabled);
    
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
        const storedStructure = localStorage.getItem('autolistSeedStructure');
        const stored = storedStructure ?? localStorage.getItem('autolistSeed');
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
      localStorage.setItem('autolistSeedStructure', effectiveSeed.toString());
      localStorage.setItem('autolistSeed', effectiveSeed.toString());
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Update layout only if dynamic HTML is enabled
    if (dynamicEnabled) {
      setLayout(getSeedLayout(effectiveSeed));
    } else {
      // Use default layout when dynamic HTML is disabled
      setLayout(getSeedLayout(1));
    }
  }, []);

  // Function to generate element attributes for a specific element type
  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    const baseAttrs = { 
      id: `${elementType}-${index}`, 
      'data-element-type': elementType 
    };
    
    if (!isDynamicEnabled) {
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
  }, [seed, isDynamicEnabled]);

  // Function to get XPath selector for an element
  const getElementXPath = useCallback((elementType: string) => {
    if (!isDynamicEnabled) {
      return `//${elementType}[@id='${elementType}-0']`;
    }
    // Generate dynamic XPath based on seed
    return `//${elementType}[@data-seed='${seed}']`;
  }, [seed, isDynamicEnabled]);

  // Function to reorder elements
  const reorderElements = useCallback(<T extends { id?: string; name?: string }>(elements: T[]) => {
    if (!isDynamicEnabled) {
      return elements;
    }
    // Simple reordering based on seed
    const reordered = [...elements];
    for (let i = 0; i < seed % elements.length; i++) {
      reordered.push(reordered.shift()!);
    }
    return reordered;
  }, [seed, isDynamicEnabled]);

  // Function to generate element ID
  const generateId = useCallback((context: string, index: number = 0) => {
    if (!isDynamicEnabled) {
      return `${context}-${index}`;
    }
    return generateElementId(seed, context, index);
  }, [seed, isDynamicEnabled]);

  // Function to get layout classes for specific element types
  const getLayoutClasses = useCallback((elementType: 'container' | 'item' | 'button' | 'checkbox') => {
    if (!isDynamicEnabled) {
      return '';
    }
    // Generate dynamic classes based on seed
    return `dynamic-${elementType} seed-${seed}`;
  }, [seed, isDynamicEnabled]);

  // Function to apply CSS variables to an element
  const applyCSSVariables = useCallback((element: HTMLElement) => {
    if (!isDynamicEnabled) {
      return;
    }
    // Apply basic dynamic CSS variables
    element.style.setProperty('--seed', seed.toString());
    element.style.setProperty('--variant', (seed % 10).toString());
  }, [seed, isDynamicEnabled]);

  // Function to get current layout information
  const getLayoutInfo = useCallback(() => {
    return {
      seed,
      layout,
      isDynamicEnabled,
      layoutType: layout.container.type,
      elementOrder: layout.elements
    };
  }, [seed, layout, isDynamicEnabled]);

  // Function to generate a unique class name based on seed
  const generateSeedClass = useCallback((baseClass: string) => {
    if (!isDynamicEnabled) {
      return baseClass;
    }
    return `${baseClass}-seed-${seed}`;
  }, [seed, isDynamicEnabled]);

  // Function to create a dynamic style object
  const createDynamicStyles = useCallback((baseStyles: React.CSSProperties = {}) => {
    if (!isDynamicEnabled) {
      return baseStyles;
    }
    return {
      ...baseStyles,
      '--seed': seed.toString(),
      '--variant': (seed % 10).toString()
    };
  }, [seed, isDynamicEnabled]);

  // Helper function to generate navigation URLs with seed parameter
  const getNavigationUrl = useCallback((path: string): string => {
    // If path already has query params
    if (path.includes('?')) {
      // Check if seed already exists in the URL
      if (path.includes('seed=')) {
        return path;
      }
      return `${path}&seed=${seed}`;
    }
    // Add seed as first query param
    return `${path}?seed=${seed}`;
  }, [seed]);

  return {
    seed,
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
      if (!isDynamicEnabled) return fallback;
      return getTextForElement(seed, key, fallback);
    },
  };
}
