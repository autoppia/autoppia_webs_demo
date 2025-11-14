// src/library/useSeedLayout.ts
import { useState, useEffect, useCallback } from 'react';
import { getSeedLayout } from '@/utils/seedLayout';
import { getEffectiveSeed, getLayoutConfig, isDynamicModeEnabled, isLayoutDynamicActive, isStructureDynamicActive } from '@/utils/dynamicDataProvider';
import { getTextForElement, type ElementKey } from '@/library/textVariants';

// Semantic ID mappings (10 per type; selected by seed mapped to 1-10)
const SEMANTIC_ID_MAP: Record<string, string[]> = {
  // Top actions
  'create-button': [
    'create-btn', 'new-button', 'add-action', 'create-action', 'new-entry',
    'add-button', 'open-create', 'start-create', 'launch-create', 'begin-create'
  ],
  'today-button': [
    'today-btn', 'goto-today', 'jump-today', 'view-today', 'focus-today',
    'today-action', 'set-today', 'scroll-today', 'center-today', 'now-button'
  ],
  'search-input': [
    'search-input', 'query-box', 'filter-input', 'calendar-search', 'event-search',
    'search-field', 'lookup-input', 'find-input', 'type-to-search', 'search-box'
  ],
  // Add calendar modal
  'add-calendar-modal': [
    'add-cal-modal', 'new-calendar-dialog', 'calendar-modal', 'create-calendar-modal', 'calendar-add-dialog',
    'modal-add-calendar', 'dialog-new-calendar', 'calendar-create-modal', 'calendar-dialog', 'calendar-new-modal'
  ],
  'add-calendar-name-input': [
    'calendar-name', 'cal-name', 'name-input', 'calendar-title', 'title-input',
    'name-field', 'calendar-name-input', 'new-cal-name', 'calendar-name-field', 'calendar-name-box'
  ],
  'add-calendar-description-input': [
    'calendar-desc', 'cal-desc', 'desc-input', 'calendar-notes', 'notes-input',
    'description-field', 'calendar-description', 'new-cal-desc', 'calendar-desc-field', 'calendar-desc-box'
  ],
  'add-calendar-submit-button': [
    'save-calendar', 'create-calendar', 'add-calendar', 'submit-calendar', 'confirm-calendar',
    'save-cal', 'add-cal', 'create-cal', 'submit-cal', 'confirm-cal'
  ],
  // Add/Edit event modal
  'add-event-modal': [
    'event-modal', 'new-event-dialog', 'event-dialog', 'create-event-modal', 'event-editor',
    'modal-add-event', 'dialog-new-event', 'event-create-modal', 'event-editor-modal', 'event-new-modal'
  ],
  'event-wizard-step': [
    'wizard-step', 'event-step', 'step-dot', 'step-pill', 'progress-step',
    'step-item', 'wizard-dot', 'step-link', 'goto-step', 'step-control'
  ],
  'event-title-input': [
    'event-title', 'title-input', 'title-field', 'event-name', 'name-input',
    'event-title-input', 'title-box', 'event-name-input', 'event-title-field', 'name-field'
  ],
  'event-date-input': [
    'event-date', 'date-input', 'date-field', 'pick-date', 'event-date-picker',
    'date-box', 'date-picker', 'event-date-field', 'select-date', 'date-control'
  ],
  'event-location-input': [
    'event-location', 'location-input', 'place-input', 'where-input', 'location-field',
    'event-place', 'venue-input', 'loc-input', 'event-location-field', 'address-input'
  ],
  'attendee-add-button': [
    'add-attendee', 'attendee-add', 'add-person', 'invite-person', 'add-participant',
    'invite-attendee', 'add-guest', 'guest-add', 'participant-add', 'add-invitee'
  ],
  'event-wizard-back': [
    'wizard-back', 'step-back', 'back-btn', 'prev-step', 'go-back',
    'previous-step', 'back-button', 'wizard-prev', 'step-prev', 'prev-btn'
  ],
  'event-wizard-next': [
    'wizard-next', 'step-next', 'next-btn', 'next-step', 'continue-btn',
    'wizard-continue', 'proceed-btn', 'step-continue', 'forward-step', 'continue-next'
  ],
  'event-wizard-save': [
    'wizard-save', 'save-event', 'save-btn', 'confirm-event', 'submit-event',
    'event-save', 'save-changes', 'confirm-save', 'apply-changes', 'save-action'
  ],
  'event-wizard-delete': [
    'wizard-delete', 'delete-event', 'remove-event', 'trash-event', 'delete-btn',
    'remove-btn', 'delete-action', 'event-delete', 'trash-btn', 'remove-action'
  ],
  'event-modal-close': [
    'modal-close', 'close-btn', 'dialog-close', 'cancel-modal', 'close-dialog',
    'dismiss-modal', 'dismiss-btn', 'close-action', 'close-x', 'close-control'
  ],
  // Generic wrappers from Dynamic* helpers
  'container': [
    'container', 'section', 'block', 'wrap', 'panel', 'group', 'grid', 'stack', 'area', 'region'
  ],
  'item': [
    'item', 'cell', 'card', 'row', 'col', 'entry', 'unit', 'node', 'piece', 'elem'
  ],
  'button': [
    'button', 'btn', 'action', 'cta', 'control', 'trigger', 'press', 'tap', 'click', 'go'
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
  const [seed, setSeed] = useState(1); // For layout (from seed parameter)
  const [structureSeed, setStructureSeed] = useState(1); // For HTML structure (from seed-structure parameter)
  const [layout, setLayout] = useState(getSeedLayout(1));
  const [isDynamicEnabled, setIsDynamicEnabled] = useState(false);

  useEffect(() => {
    // Check if dynamic HTML is enabled (environment variable)
    const dynamicEnabled = isDynamicModeEnabled();
    setIsDynamicEnabled(dynamicEnabled);
    
    // Check if layout is dynamic (requires seed in URL)
    const layoutActive = isLayoutDynamicActive();
    
    // Check if HTML structure is dynamic (requires seed-structure in URL)
    const structureActive = isStructureDynamicActive();
    
    // Get seed parameter from URL (for layout)
    const searchParams = new URLSearchParams(window.location.search);
    const seedParam = searchParams.get('seed');
    let rawSeed = seedParam ? parseInt(seedParam) : 1;
    if (!seedParam) {
      try {
        const stored = localStorage.getItem('autocalendarSeed');
        if (stored) rawSeed = parseInt(stored);
      } catch {}
      if (!Number.isFinite(rawSeed)) {
        const envDefault = parseInt(process.env.NEXT_PUBLIC_DEFAULT_SEED_STRUCTURE as string);
        if (Number.isFinite(envDefault)) rawSeed = envDefault as unknown as number;
      }
    }
    
    // Get seed-structure parameter from URL (for HTML structure)
    const seedStructureParam = searchParams.get('seed-structure');
    let rawStructureSeed = seedStructureParam ? parseInt(seedStructureParam) : 1;
    if (!seedStructureParam) {
      try {
        const storedStructure = localStorage.getItem('autocalendarSeedStructure');
        if (storedStructure) rawStructureSeed = parseInt(storedStructure);
      } catch {}
      if (!Number.isFinite(rawStructureSeed)) {
        rawStructureSeed = 1;
      }
    }
    
    // Get effective seeds (validates range and respects dynamic HTML setting)
    const effectiveSeed = getEffectiveSeed(rawSeed);
    const effectiveStructureSeed = getEffectiveSeed(rawStructureSeed);
    setSeed(effectiveSeed);
    setStructureSeed(effectiveStructureSeed);
    
    // Save for compatibility
    try {
      localStorage.setItem('autocalendarSeed', effectiveSeed.toString());
      localStorage.setItem('autocalendarSeedStructure', effectiveStructureSeed.toString());
    } catch {}
    
    // Update layout only if layout is dynamic (both env var enabled AND seed in URL)
    if (layoutActive) {
      setLayout(getSeedLayout(effectiveSeed));
    } else {
      // Use default layout when layout is not dynamic
      setLayout(getSeedLayout(1));
    }
  }, []);

  // Function to generate element attributes for a specific element type
  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    const baseAttrs = { 
      id: `${elementType}-${index}`, 
      'data-element-type': elementType 
    } as Record<string, string>;
    
    // Check if HTML structure is dynamic (requires seed-structure in URL)
    const structureActive = isStructureDynamicActive();
    if (!structureActive) {
      return baseAttrs;
    }
    
    // Use semantic seed-based ID (use structureSeed for HTML structure)
    const dynamicId = generateElementId(structureSeed, elementType, index);
    
    // Generate dynamic attributes based on structureSeed
    return { 
      ...baseAttrs,
      id: dynamicId, 
      'data-seed': structureSeed.toString(),
      'data-variant': (structureSeed % 10).toString()
    };
  }, [structureSeed]);

  const getElementXPath = useCallback((elementType: string) => {
    const structureActive = isStructureDynamicActive();
    if (!structureActive) {
      return `//${elementType}[@id='${elementType}-0']`;
    }
    // Generate dynamic XPath based on structureSeed
    return `//${elementType}[@data-seed='${structureSeed}']`;
  }, [structureSeed]);

  // Function to reorder elements
  const reorderElements = useCallback(<T extends { id?: string; name?: string }>(elements: T[]) => {
    const structureActive = isStructureDynamicActive();
    if (!structureActive) {
      return elements;
    }
    // Simple reordering based on structureSeed
    const reordered = [...elements];
    for (let i = 0; i < structureSeed % elements.length; i++) {
      reordered.push(reordered.shift()!);
    }
    return reordered;
  }, [structureSeed]);

  // Function to generate element ID
  const generateId = useCallback((context: string, index: number = 0) => {
    const structureActive = isStructureDynamicActive();
    if (!structureActive) {
      return `${context}-${index}`;
    }
    return generateElementId(structureSeed, context, index);
  }, [structureSeed]);

  // Function to get layout classes for specific element types
  const getLayoutClasses = useCallback((elementType: 'container' | 'item' | 'button' | 'checkbox') => {
    const structureActive = isStructureDynamicActive();
    if (!structureActive) {
      return '';
    }
    // Generate dynamic classes based on structureSeed
    return `dynamic-${elementType} seed-${structureSeed}`;
  }, [structureSeed]);

  // Function to apply CSS variables to an element
  const applyCSSVariables = useCallback((element: HTMLElement) => {
    const structureActive = isStructureDynamicActive();
    if (!structureActive) {
      return;
    }
    // Apply basic dynamic CSS variables
    element.style.setProperty('--seed', structureSeed.toString());
    element.style.setProperty('--variant', (structureSeed % 10).toString());
  }, [structureSeed]);

  // Function to get current layout information
  const getLayoutInfo = useCallback(() => {
    const layoutActive = isLayoutDynamicActive();
    const structureActive = isStructureDynamicActive();
    return {
      id: layout.id,
      name: layout.name,
      description: layout.description,
      isLayoutDynamic: layoutActive,
      isStructureDynamic: structureActive,
      seed: seed,
      structureSeed: structureSeed
    };
  }, [layout, seed, structureSeed]);

  // Function to create dynamic styles
  const createDynamicStyles = useCallback(() => {
    const structureActive = isStructureDynamicActive();
    if (!structureActive) {
      return {};
    }
    
    return {
      // Dynamic properties based on structureSeed
      '--dynamic-seed': structureSeed,
      '--dynamic-variant': (structureSeed % 10),
    } as React.CSSProperties;
  }, [structureSeed]);

  // Function to generate seed-specific CSS class names
  const generateSeedClass = useCallback((baseClass: string) => {
    const structureActive = isStructureDynamicActive();
    if (!structureActive) {
      return baseClass;
    }
    return `${baseClass} seed-${structureSeed}`;
  }, [structureSeed]);

  // Get dynamic text
  const getText = useCallback((key: ElementKey, fallback: string): string => {
    const structureActive = isStructureDynamicActive();
    if (!structureActive) return fallback;
    return getTextForElement(structureSeed, key, fallback);
  }, [structureSeed]);

  return {
    seed, // For layout
    structureSeed, // For HTML structure
    layout,
    isDynamicEnabled,
    getElementAttributes,
    getElementXPath,
    getLayoutClasses,
    generateId,
    generateSeedClass,
    applyCSSVariables,
    createDynamicStyles,
    getLayoutInfo,
    reorderElements,
    getText
  };
}
