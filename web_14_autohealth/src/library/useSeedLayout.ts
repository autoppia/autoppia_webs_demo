import { useCallback, useEffect, useState } from 'react';
import { getEffectiveSeed, isDynamicModeEnabled } from '../utils/dynamicDataProvider';
import { getTextForElement, type ElementKey } from './textVariants';

// Semantic ID mappings for each element type (10 variations per type, one for each seed 1-10)
const semanticIdMappings: Record<string, string[]> = {
  'nav-book-now-button': [
    'book-appointment-btn',
    'schedule-visit-button',
    'start-booking',
    'make-appointment',
    'reserve-slot-btn',
    'book-visit-button',
    'schedule-now-btn',
    'book-time-button',
    'start-visit',
    'appointment-btn'
  ],
  'view-prescription-button': [
    'view-prescription',
    'open-details-btn',
    'show-medication',
    'prescription-details',
    'view-meds-button',
    'open-prescription',
    'medication-info',
    'prescription-view',
    'see-details-btn',
    'view-meds'
  ],
  'presc-request-refill': [
    'request-refill-btn',
    'refill-medication',
    'order-refill-button',
    'get-refill-btn',
    'refill-now',
    'request-meds',
    'refill-button',
    'order-refill',
    'refill-prescription',
    'get-refill'
  ],
  'mr-view-details': [
    'view-record-btn',
    'open-details',
    'record-details-button',
    'see-record',
    'view-file-btn',
    'open-record',
    'details-button',
    'view-document',
    'record-info-btn',
    'show-details'
  ],
  'mr-upload-button': [
    'upload-record-btn',
    'add-document-button',
    'upload-file',
    'add-record-btn',
    'upload-document',
    'add-file-button',
    'upload-btn',
    'add-document',
    'upload-record',
    'file-upload-btn'
  ],
  'apts-book-button': [
    'book-appointment',
    'schedule-visit-btn',
    'make-booking',
    'reserve-slot',
    'book-visit',
    'schedule-appointment',
    'book-time-btn',
    'make-appointment-btn',
    'reserve-visit',
    'appointment-button'
  ],
  'view-profile-button': [
    'view-profile-btn',
    'open-profile',
    'profile-details-button',
    'see-profile',
    'doctor-profile-btn',
    'view-doctor',
    'profile-button',
    'open-details-btn',
    'view-details',
    'doctor-details'
  ],
  'book-now-button': [
    'book-now-btn',
    'schedule-button',
    'make-booking-btn',
    'reserve-now',
    'book-appointment-btn',
    'schedule-visit',
    'book-time',
    'make-appointment',
    'reserve-slot-btn',
    'appointment-button'
  ],
  'apts-modal-cancel': [
    'cancel-button',
    'close-btn',
    'cancel-dialog',
    'close-button',
    'dismiss-btn',
    'cancel-action',
    'close-dialog-btn',
    'dismiss-button',
    'cancel-btn',
    'close-action'
  ],
  'apts-modal-confirm': [
    'confirm-button',
    'submit-btn',
    'book-appointment',
    'confirm-booking',
    'submit-button',
    'confirm-btn',
    'book-visit',
    'submit-appointment',
    'confirm-action-btn',
    'book-now'
  ],
  'presc-modal-close': [
    'close-modal-btn',
    'close-button',
    'dismiss-modal',
    'close-dialog',
    'close-btn',
    'dismiss-button',
    'close-prescription',
    'close-details',
    'close-modal',
    'dismiss-btn'
  ],
  'mr-modal-close': [
    'close-record-modal',
    'close-button',
    'dismiss-modal-btn',
    'close-details',
    'close-record',
    'dismiss-button',
    'close-modal-btn',
    'close-file',
    'close-dialog-btn',
    'dismiss-modal'
  ]
};

// Generate semantic ID based on element type and seed
function generateElementId(seed: number, elementType: string, index: number = 0): string {
  // Map seed to 1-10 range
  const variant = ((seed - 1) % 10) + 1;
  
  // Check if we have semantic mappings for this element type
  if (semanticIdMappings[elementType]) {
    const mapping = semanticIdMappings[elementType];
    const idIndex = (variant - 1) % mapping.length;
    return mapping[idIndex];
  }
  
  // Fallback: Generate semantic-like IDs from elementType
  const fallbackPatterns = [
    elementType.replace(/-/g, '-'),
    elementType.replace(/-button$/, '-btn').replace(/-button/, '-btn'),
    elementType.replace(/^nav-/, '').replace(/^presc-/, '').replace(/^mr-/, '').replace(/^apts-/, ''),
    elementType.replace(/-/g, '_'),
    elementType.split('-').slice(-2).join('-'),
    elementType.split('-').pop() || elementType,
    elementType.replace(/-button$/, '').replace(/-btn$/, ''),
    elementType.replace(/^[^-]+-/, ''),
    elementType.replace(/-/g, ''),
    elementType.split('-').reverse().slice(0, 2).reverse().join('-')
  ];
  
  const patternIndex = (variant - 1) % fallbackPatterns.length;
  return fallbackPatterns[patternIndex];
}

export function useSeedLayout() {
  const [seed, setSeed] = useState(1);
  const [isDynamicEnabled, setIsDynamicEnabled] = useState(false);

  useEffect(() => {
    const enabled = isDynamicModeEnabled();
    setIsDynamicEnabled(enabled);

    const searchParams = new URLSearchParams(window.location.search);
    const seedStructure = searchParams.get('seed-structure');
    const rawSeed = seedStructure ?? searchParams.get('seed');
    const effective = getEffectiveSeed(rawSeed ? parseInt(rawSeed) : 1);
    setSeed(effective);
  }, []);

  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    const base = { id: `${elementType}-${index}`, 'data-element-type': elementType } as Record<string, string>;
    if (!isDynamicEnabled) return base;
    const dynamicId = generateElementId(seed, elementType, index);
    return {
      ...base,
      id: dynamicId,
      'data-seed': String(seed),
      'data-variant': String(seed % 10),
      'data-xpath': `//${elementType}[@data-seed='${seed}']`
    };
  }, [seed, isDynamicEnabled]);

  const getElementXPath = useCallback((elementType: string) => {
    if (!isDynamicEnabled) return `//${elementType}[@id='${elementType}-0']`;
    return `//${elementType}[@data-seed='${seed}']`;
  }, [seed, isDynamicEnabled]);

  const reorderElements = useCallback(<T>(items: T[]) => {
    if (!isDynamicEnabled || items.length === 0) return items;
    const times = seed % items.length;
    if (times === 0) return items;
    const copy = [...items];
    for (let i = 0; i < times; i++) {
      // rotate right by 1 each step
      copy.unshift(copy.pop() as T);
    }
    return copy;
  }, [seed, isDynamicEnabled]);

  const generateId = useCallback((context: string, index: number = 0) => {
    if (!isDynamicEnabled) return `${context}-${index}`;
    return generateElementId(seed, context, index);
  }, [seed, isDynamicEnabled]);

  const generateSeedClass = useCallback((baseClass: string) => {
    if (!isDynamicEnabled) return baseClass;
    return `${baseClass}-seed-${seed}`;
  }, [seed, isDynamicEnabled]);

  const createDynamicStyles = useCallback((base: React.CSSProperties = {}) => {
    if (!isDynamicEnabled) return base;
    return { ...base, '--seed': String(seed), '--variant': String(seed % 10) } as React.CSSProperties;
  }, [seed, isDynamicEnabled]);

  const applyCSSVariables = useCallback((el: HTMLElement) => {
    if (!isDynamicEnabled) return;
    el.style.setProperty('--seed', String(seed));
    el.style.setProperty('--variant', String(seed % 10));
  }, [seed, isDynamicEnabled]);

  return {
    seed,
    isDynamicEnabled,
    getElementAttributes,
    getElementXPath,
    reorderElements,
    generateId,
    generateSeedClass,
    createDynamicStyles,
    applyCSSVariables,
    getText: (key: ElementKey, fallback: string) => {
      if (!isDynamicEnabled) return fallback;
      return getTextForElement(seed, key, fallback);
    },
  };
}


