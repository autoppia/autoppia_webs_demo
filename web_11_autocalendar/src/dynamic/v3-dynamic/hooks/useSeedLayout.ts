// src/library/useSeedLayout.ts
import { useMemo, useCallback } from 'react';
import { getSeedLayout } from '@/dynamic/v1-layouts';
import { isDynamicModeEnabled } from '@/dynamic/v2-data';
import { getTextForElement, type ElementKey } from '../utils/textVariants';
import { useSeed as useSeedContext } from '@/context/SeedContext';

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
  // Use SeedContext for unified seed management
  const { resolvedSeeds } = useSeedContext();
  
  // Use resolved v1 seed for layout (or v3 if enabled, otherwise v1)
  const layoutSeed = useMemo(() => {
    return resolvedSeeds.v3 ?? resolvedSeeds.v1 ?? resolvedSeeds.base;
  }, [resolvedSeeds.v3, resolvedSeeds.v1, resolvedSeeds.base]);
  
  // Check if dynamic mode is enabled
  const isDynamicEnabled = isDynamicModeEnabled();
  
  // LAYOUT FIJO - Siempre usar seed=1 para layout (V1)
  // La seed se mantiene en URL para V2 (datos) y V3 (texto)
  const seed = useMemo(() => {
    return 1; // Siempre fijo para layout
  }, []);
  
  const layout = useMemo(() => {
    return getSeedLayout(1); // Siempre layout de seed=1
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
    
    // Use semantic seed-based ID
    const dynamicId = generateElementId(seed, elementType, index);
    
    // Generate dynamic attributes based on seed
    return { 
      ...baseAttrs,
      id: dynamicId, 
      'data-seed': seed.toString(),
      'data-variant': (seed % 10).toString()
    };
  }, [seed, isDynamicEnabled]);

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
      id: layout.id,
      name: layout.name,
      description: layout.description,
      isDynamic: isDynamicEnabled,
      seed: seed
    };
  }, [layout, isDynamicEnabled, seed]);

  // Function to create dynamic styles
  const createDynamicStyles = useCallback(() => {
    if (!isDynamicEnabled) {
      return {};
    }
    
    return {
      // Dynamic properties based on seed
      '--dynamic-seed': seed,
      '--dynamic-variant': (seed % 10),
    } as React.CSSProperties;
  }, [seed, isDynamicEnabled]);

  // Function to generate seed-specific CSS class names
  const generateSeedClass = useCallback((baseClass: string) => {
    if (!isDynamicEnabled) {
      return baseClass;
    }
    return `${baseClass} seed-${seed}`;
  }, [seed, isDynamicEnabled]);

  // Get dynamic text
  const getText = useCallback((key: ElementKey, fallback: string): string => {
    if (!isDynamicEnabled) return fallback;
    return getTextForElement(seed, key, fallback);
  }, [seed, isDynamicEnabled]);

  return {
    seed,
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
