// src/library/layoutVariants.ts

export type LayoutVariant = {
  containerClasses: string;
  itemClasses: string;
  buttonClasses: string;
  checkboxPosition: string;
  xpathVariant: number;
  buttonLayout: 'standard' | 'split' | 'stacked' | 'circular' | 'floating' | 'inline' | 'card' | 'minimal';
  labelStyle: 'pill' | 'tag' | 'badge' | 'chip' | 'dot' | 'underline' | 'border' | 'gradient';
  layoutType: 'grid' | 'flex' | 'list' | 'masonry' | 'carousel' | 'table';
  spacing: 'tight' | 'normal' | 'loose' | 'random';
  elementOrder: 'standard' | 'reversed' | 'random';
};

export type ElementPositioning = {
  topLevel: string[];  // Possible positions for top-level elements
  nested: string[];    // Possible positions for nested elements
  attributes: string[];// Possible attribute combinations
  idVariants: string[];// Different ID patterns
};

// Get a consistent but random-looking value based on seed and key
function getSeededValue(seed: number, key: string): number {
  const str = `${seed}-${key}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Different button layouts based on seed
const buttonLayouts = {
  standard: {
    containerClasses: "flex gap-2 items-center",
    buttonClasses: "rounded-lg px-4 py-2",
    xpathStructure: "//button[contains(@class, 'rounded-lg')]"
  },
  split: {
    containerClasses: "grid grid-cols-2 gap-2",
    buttonClasses: "rounded-full px-6 py-2",
    xpathStructure: "//div[contains(@class, 'grid-cols-2')]//button"
  },
  stacked: {
    containerClasses: "flex flex-col gap-2",
    buttonClasses: "rounded-sm px-8 py-3",
    xpathStructure: "//div[contains(@class, 'flex-col')]//button"
  },
  circular: {
    containerClasses: "flex gap-4 justify-center",
    buttonClasses: "rounded-full w-12 h-12",
    xpathStructure: "//button[contains(@class, 'rounded-full') and contains(@class, 'w-12')]"
  },
  floating: {
    containerClasses: "relative",
    buttonClasses: "absolute top-2 right-2 rounded-full shadow-lg",
    xpathStructure: "//button[contains(@class, 'absolute') and contains(@class, 'top-2')]"
  },
  inline: {
    containerClasses: "inline-flex items-center",
    buttonClasses: "text-blue-600 underline hover:no-underline",
    xpathStructure: "//button[contains(@class, 'text-blue-600')]"
  },
  card: {
    containerClasses: "bg-white rounded-lg shadow-md p-4",
    buttonClasses: "w-full rounded-md px-4 py-3",
    xpathStructure: "//div[contains(@class, 'shadow-md')]//button"
  },
  minimal: {
    containerClasses: "border-b border-gray-200",
    buttonClasses: "text-sm text-gray-600 hover:text-black",
    xpathStructure: "//button[contains(@class, 'text-sm') and contains(@class, 'text-gray-600')]"
  }
};

// Different element positioning strategies
const elementPositioning: Record<number, ElementPositioning> = {
  1: {
    topLevel: ["first", "last"],
    nested: ["parent-first", "parent-last"],
    attributes: ["data-testid", "aria-label"],
    idVariants: ["element-#", "el_#"]
  },
  2: {
    topLevel: ["before", "after"],
    nested: ["sibling-before", "sibling-after"],
    attributes: ["data-element", "aria-describedby"],
    idVariants: ["item-#", "i_#"]
  },
  3: {
    topLevel: ["prepend", "append"],
    nested: ["child-first", "child-last"],
    attributes: ["data-ref", "role"],
    idVariants: ["component-#", "c_#"]
  },
  4: {
    topLevel: ["nth-child(2)", "nth-last-child(2)"],
    nested: ["nth-child(1)", "nth-child(3)"],
    attributes: ["data-id", "aria-labelledby"],
    idVariants: ["btn-#", "action_#"]
  },
  5: {
    topLevel: ["nth-child(3)", "nth-last-child(3)"],
    nested: ["first-child", "last-child"],
    attributes: ["data-action", "aria-controls"],
    idVariants: ["link-#", "nav_#"]
  },
  6: {
    topLevel: ["nth-child(4)", "nth-last-child(4)"],
    nested: ["nth-child(2)", "nth-child(4)"],
    attributes: ["data-target", "aria-expanded"],
    idVariants: ["cta-#", "button_#"]
  },
  7: {
    topLevel: ["nth-child(5)", "nth-last-child(5)"],
    nested: ["nth-child(1)", "nth-child(5)"],
    attributes: ["data-type", "aria-pressed"],
    idVariants: ["action-#", "btn_#"]
  },
  8: {
    topLevel: ["nth-child(6)", "nth-last-child(6)"],
    nested: ["nth-child(3)", "nth-child(6)"],
    attributes: ["data-name", "aria-current"],
    idVariants: ["control-#", "ctrl_#"]
  },
  9: {
    topLevel: ["nth-child(7)", "nth-last-child(7)"],
    nested: ["nth-child(4)", "nth-child(7)"],
    attributes: ["data-value", "aria-selected"],
    idVariants: ["widget-#", "wgt_#"]
  },
  10: {
    topLevel: ["nth-child(8)", "nth-last-child(8)"],
    nested: ["nth-child(5)", "nth-child(8)"],
    attributes: ["data-index", "aria-hidden"],
    idVariants: ["element-#", "elem_#"]
  }
};

/**
 * LAYOUT FIJO - Siempre como seed 1
 * Tu sitio web es lo que es, sin variaciones
 */
export function getLayoutVariant(seed: number): LayoutVariant {
  // LAYOUT FIJO - Siempre usar seed 1
  const mappedSeed = 1;
  
  const buttonLayoutTypes = ['standard', 'split', 'stacked', 'circular', 'floating', 'inline', 'card', 'minimal'] as const;
  const labelStyles = ['pill', 'tag', 'badge', 'chip', 'dot', 'underline', 'border', 'gradient'] as const;
  const layoutTypes = ['grid', 'flex', 'list', 'masonry', 'carousel', 'table'] as const;
  const spacingTypes = ['tight', 'normal', 'loose', 'random'] as const;
  const elementOrders = ['standard', 'reversed', 'random'] as const;
  
  // Use mapped seed for different aspects of the layout
  const buttonLayoutIndex = mappedSeed % buttonLayoutTypes.length;
  const labelStyleIndex = mappedSeed % labelStyles.length;
  const layoutTypeIndex = mappedSeed % layoutTypes.length;
  const spacingIndex = mappedSeed % spacingTypes.length;
  const elementOrderIndex = mappedSeed % elementOrders.length;
  const xpathVariant = mappedSeed;

  // Generate layout classes based on seed and layout type
  const containerVariants = {
    grid: [
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
      'grid grid-cols-2 md:grid-cols-4 gap-6',
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8'
    ],
    flex: [
      'flex flex-col gap-4',
      'flex flex-wrap justify-between gap-6',
      'flex flex-row flex-wrap gap-8'
    ],
    list: [
      'space-y-4',
      'divide-y divide-gray-200',
      'space-y-6'
    ],
    masonry: [
      'columns-1 md:columns-2 lg:columns-3 gap-4',
      'columns-2 md:columns-3 lg:columns-4 gap-6',
      'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8'
    ],
    carousel: [
      'flex overflow-x-auto gap-4 pb-4',
      'grid grid-flow-col auto-cols-max gap-6',
      'flex snap-x snap-mandatory gap-8'
    ],
    table: [
      'table w-full border-collapse',
      'grid grid-cols-1 divide-y divide-gray-200',
      'flex flex-col space-y-2'
    ]
  };

  const layoutType = layoutTypes[layoutTypeIndex];
  const containerIndex = mappedSeed % containerVariants[layoutType].length;

  const itemVariants = [
    'rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow',
    'rounded-xl border-2 p-6 shadow-md hover:shadow-lg transition-all',
    'rounded-2xl border-0 p-8 shadow-lg hover:shadow-xl transition-transform',
    'rounded-md border-l-4 border-l-blue-500 p-4 bg-white',
    'rounded-lg border-t-4 border-t-green-500 p-6 bg-gray-50',
    'rounded-xl border-b-4 border-b-purple-500 p-8 bg-gradient-to-r from-blue-50 to-purple-50',
    'rounded-md border-r-4 border-r-red-500 p-4 bg-red-50',
    'rounded-lg border-l-8 border-l-yellow-500 p-6 bg-yellow-50',
    'rounded-2xl border-2 border-dashed border-gray-300 p-8 bg-white',
    ' rounded-md border border-gray-200 p-4 bg-gradient-to-br from-white to-gray-50'
  ];
  const itemIndex = mappedSeed % itemVariants.length;

  const checkboxVariants = [
    'absolute top-2 right-2',
    'absolute bottom-2 left-2',
    'relative self-end',
    'absolute top-4 left-4',
    'absolute bottom-4 right-4',
    'relative self-start',
    'absolute top-2 left-2',
    'absolute bottom-2 right-2',
    'relative self-center',
    'absolute top-6 left-6'
  ];
  const checkboxIndex = mappedSeed % checkboxVariants.length;

  return {
    containerClasses: containerVariants[layoutType][containerIndex],
    itemClasses: itemVariants[itemIndex],
    buttonClasses: buttonLayouts[buttonLayoutTypes[buttonLayoutIndex]].buttonClasses,
    checkboxPosition: checkboxVariants[checkboxIndex],
    xpathVariant,
    buttonLayout: buttonLayoutTypes[buttonLayoutIndex],
    labelStyle: labelStyles[labelStyleIndex],
    layoutType,
    spacing: spacingTypes[spacingIndex],
    elementOrder: elementOrders[elementOrderIndex]
  };
}

export function getElementPositioning(variant: number): ElementPositioning {
  return elementPositioning[variant] || elementPositioning[1];
}

// Generate dynamic IDs and attributes based on the element type and seed
export function generateElementAttributes(
  elementType: string,
  seed: number,
  index: number = 0
): Record<string, string> {
  const positioning = getElementPositioning(getSeededValue(seed, elementType) % 10 + 1);
  const idBase = positioning.idVariants[getSeededValue(seed, 'idPattern') % positioning.idVariants.length];
  const attribute = positioning.attributes[getSeededValue(seed, 'attribute') % positioning.attributes.length];
  
  // Generate multiple attributes for more complexity
  const attributeSets = [
    // Set 1: Standard attributes
    {
      id: idBase.replace('#', `${index}`),
      [attribute]: `${elementType}-${index}-${seed}`,
      'data-seed': `${seed}`,
      'data-variant': `${getSeededValue(seed, elementType) % 10 + 1}`,
      'data-type': elementType,
      'data-index': `${index}`
    },
    // Set 2: ARIA attributes
    {
      id: `aria-${idBase.replace('#', `${index}`)}`,
      [attribute]: `${elementType}-${index}-${seed}`,
      'aria-label': `${elementType} ${index}`,
      'aria-describedby': `desc-${index}`,
      'data-seed': `${seed}`,
      'role': elementType === 'button' ? 'button' : 'generic'
    },
    // Set 3: Custom data attributes
    {
      id: `custom-${idBase.replace('#', `${index}`)}`,
      [attribute]: `${elementType}-${index}-${seed}`,
      'data-component': elementType,
      'data-instance': `${index}`,
      'data-seed': `${seed}`,
      'data-timestamp': `${Date.now()}`
    },
    // Set 4: Semantic attributes
    {
      id: `semantic-${idBase.replace('#', `${index}`)}`,
      [attribute]: `${elementType}-${index}-${seed}`,
      'data-semantic': elementType,
      'data-position': `${index}`,
      'data-seed': `${seed}`,
      'data-layout': `${getSeededValue(seed, 'layout') % 6}`
    },
    // Set 5: Functional attributes
    {
      id: `func-${idBase.replace('#', `${index}`)}`,
      [attribute]: `${elementType}-${index}-${seed}`,
      'data-function': elementType,
      'data-order': `${index}`,
      'data-seed': `${seed}`,
      'data-interactive': 'true'
    },
    // Set 6: Styling attributes
    {
      id: `style-${idBase.replace('#', `${index}`)}`,
      [attribute]: `${elementType}-${index}-${seed}`,
      'data-style': elementType,
      'data-theme': `${getSeededValue(seed, 'theme') % 5}`,
      'data-seed': `${seed}`,
      'data-responsive': 'true'
    },
    // Set 7: Event attributes
    {
      id: `event-${idBase.replace('#', `${index}`)}`,
      [attribute]: `${elementType}-${index}-${seed}`,
      'data-event': elementType,
      'data-handler': `${index}`,
      'data-seed': `${seed}`,
      'data-bubbling': 'true'
    },
    // Set 8: State attributes
    {
      id: `state-${idBase.replace('#', `${index}`)}`,
      [attribute]: `${elementType}-${index}-${seed}`,
      'data-state': elementType,
      'data-active': `${getSeededValue(seed, 'active') % 2}`,
      'data-seed': `${seed}`,
      'data-visible': 'true'
    },
    // Set 9: Performance attributes
    {
      id: `perf-${idBase.replace('#', `${index}`)}`,
      [attribute]: `${elementType}-${index}-${seed}`,
      'data-perf': elementType,
      'data-lazy': `${getSeededValue(seed, 'lazy') % 2}`,
      'data-seed': `${seed}`,
      'data-optimized': 'true'
    },
    // Set 10: Security attributes
    {
      id: `sec-${idBase.replace('#', `${index}`)}`,
      [attribute]: `${elementType}-${index}-${seed}`,
      'data-sec': elementType,
      'data-token': `${getSeededValue(seed, 'token')}`,
      'data-seed': `${seed}`,
      'data-encrypted': 'true'
    }
  ];
  
  const setIndex = getSeededValue(seed, 'attributeSet') % attributeSets.length;
  return attributeSets[setIndex];
}

export function generateButtonLayout(buttonType: string, seed: number): string {
  const variant = getLayoutVariant(seed);
  const buttonLayout = buttonLayouts[variant.buttonLayout];
  
  return `${buttonLayout.containerClasses} ${buttonLayout.buttonClasses}`;
}

export function getXPathSelector(elementType: string, seed: number): string {
  const variant = getLayoutVariant(seed);
  const positioning = getElementPositioning(variant.xpathVariant);
  const attributes = generateElementAttributes(elementType, seed);
  
  // Generate complex XPath patterns based on seed
  const xpathPatterns = [
    // Pattern 1: Direct attribute matching
    () => {
      const attributeSelectors = Object.entries(attributes)
        .map(([key, value]) => `@${key}='${value}'`)
        .join(' and ');
      return `//${elementType}[${attributeSelectors}]`;
    },
    // Pattern 2: Parent-child relationship
    () => {
      const parentTypes = ['div', 'section', 'article', 'main', 'aside'];
      const parentType = parentTypes[getSeededValue(seed, 'parent') % parentTypes.length];
      return `//${parentType}[contains(@class, '${variant.layoutType}')]//${elementType}[${Object.entries(attributes).map(([k, v]) => `@${k}='${v}'`).join(' and ')}]`;
    },
    // Pattern 3: Sibling relationship
    () => {
      const siblingTypes = ['span', 'div', 'button', 'a'];
      const siblingType = siblingTypes[getSeededValue(seed, 'sibling') % siblingTypes.length];
      return `//${siblingType}[contains(@class, '${variant.buttonLayout}')]/following-sibling::${elementType}[${Object.entries(attributes).map(([k, v]) => `@${k}='${v}'`).join(' and ')}]`;
    },
    // Pattern 4: Complex nested structure
    () => {
      const containerTypes = ['div', 'section', 'main'];
      const containerType = containerTypes[getSeededValue(seed, 'container') % containerTypes.length];
      return `//${containerType}[contains(@class, '${variant.containerClasses.split(' ')[0]}')]//${elementType}[${Object.entries(attributes).map(([k, v]) => `@${k}='${v}'`).join(' and ')}]`;
    },
    // Pattern 5: Position-based with class matching
    () => {
      const position = positioning.topLevel[getSeededValue(seed, 'pos') % positioning.topLevel.length];
      const classMatch = variant.buttonClasses.split(' ')[0];
      return `//${elementType}[contains(@class, '${classMatch}')]${position.includes('nth') ? `[${position}]` : position === 'first' ? '[1]' : position === 'last' ? '[last()]' : ''}`;
    },
    // Pattern 6: Multiple attribute combinations
    () => {
      const attr1 = Object.entries(attributes)[0];
      const attr2 = Object.entries(attributes)[1];
      return `//${elementType}[@${attr1[0]}='${attr1[1]}' and contains(@class, '${variant.labelStyle}')]`;
    },
    // Pattern 7: Descendant with specific structure
    () => {
      return `//div[contains(@class, '${variant.spacing}')]//${elementType}[${Object.entries(attributes).map(([k, v]) => `@${k}='${v}'`).join(' and ')}]`;
    },
    // Pattern 8: Ancestor-based selection
    () => {
      return `//${elementType}[${Object.entries(attributes).map(([k, v]) => `@${k}='${v}'`).join(' and ')}]/ancestor::div[contains(@class, '${variant.elementOrder}')]//${elementType}`;
    },
    // Pattern 9: Complex conditional
    () => {
      const conditions = [
        `contains(@class, '${variant.buttonLayout}')`,
        `@${Object.keys(attributes)[0]}='${Object.values(attributes)[0]}'`,
        `contains(text(), '${elementType}')`
      ];
      return `//${elementType}[${conditions.join(' and ')}]`;
    },
    // Pattern 10: Multiple path options
    () => {
      const paths = [
        `//${elementType}[${Object.entries(attributes).map(([k, v]) => `@${k}='${v}'`).join(' and ')}]`,
        `//div[contains(@class, '${variant.layoutType}')]//${elementType}`,
        `//section//${elementType}[contains(@class, '${variant.labelStyle}')]`
      ];
      const pathIndex = getSeededValue(seed, 'path') % paths.length;
      return paths[pathIndex];
    }
  ];
  
  const patternIndex = getSeededValue(seed, 'xpathPattern') % xpathPatterns.length;
  return xpathPatterns[patternIndex]();
}

// Utility function to reorder elements based on seed
export function getElementOrder<T extends { id?: string; name?: string }>(seed: number, elements: T[]): T[] {
  const orderType = getSeededValue(seed, 'orderType') % 3;
  
  switch (orderType) {
    case 0: // Standard order
      return elements;
    case 1: // Reversed order
      return [...elements].reverse();
    case 2: // Random-like order based on seed
      return elements.sort((a, b) => {
        const aHash = getSeededValue(seed, a.id || a.name || 'a');
        const bHash = getSeededValue(seed, b.id || b.name || 'b');
        return aHash - bHash;
      });
    default:
      return elements;
  }
}

// Generate CSS classes based on layout variant
export function generateLayoutClasses(seed: number, elementType: 'container' | 'item' | 'button' | 'checkbox'): string {
  const variant = getLayoutVariant(seed);
  
  switch (elementType) {
    case 'container':
      return variant.containerClasses;
    case 'item':
      return variant.itemClasses;
    case 'button':
      return variant.buttonClasses;
    case 'checkbox':
      return variant.checkboxPosition;
    default:
      return '';
  }
}

// Generate a unique identifier for each element based on seed and context
export function generateElementId(seed: number, context: string, index: number = 0): string {
  const idPatterns = [
    `el-${context}-${index}-${seed}`,
    `${context}_${index}_${seed}`,
    `component-${context}-${index}-${getSeededValue(seed, context)}`,
    `${context}-item-${index}-${getSeededValue(seed, 'item')}`,
    `widget-${context}-${index}-${seed}`,
    `${context}${index}${seed}`,
    `ui-${context}-${index}-${getSeededValue(seed, 'ui')}`,
    `${context}-${getSeededValue(seed, context)}-${index}`,
    `element-${context}-${index}-${getSeededValue(seed, 'element')}`,
    `${context}-${index}-${getSeededValue(seed, 'id')}`
  ];
  
  const patternIndex = getSeededValue(seed, 'idPattern') % idPatterns.length;
  return idPatterns[patternIndex];
}

// Generate dynamic CSS custom properties based on seed
export function generateCSSVariables(seed: number): Record<string, string> {
  const colors = [
    'hsl(210, 100%, 50%)', 'hsl(120, 100%, 40%)', 'hsl(280, 100%, 60%)',
    'hsl(0, 100%, 50%)', 'hsl(45, 100%, 50%)', 'hsl(180, 100%, 40%)',
    'hsl(300, 100%, 50%)', 'hsl(60, 100%, 50%)', 'hsl(240, 100%, 60%)',
    'hsl(30, 100%, 50%)'
  ];
  
  const spacing = ['0.25rem', '0.5rem', '1rem', '1.5rem', '2rem', '3rem', '4rem', '6rem', '8rem', '12rem'];
  const borderRadius = ['0.125rem', '0.25rem', '0.5rem', '0.75rem', '1rem', '1.5rem', '2rem', '9999px'];
  
  return {
    '--primary-color': colors[getSeededValue(seed, 'primary') % colors.length],
    '--secondary-color': colors[getSeededValue(seed, 'secondary') % colors.length],
    '--accent-color': colors[getSeededValue(seed, 'accent') % colors.length],
    '--spacing-base': spacing[getSeededValue(seed, 'spacing') % spacing.length],
    '--border-radius': borderRadius[getSeededValue(seed, 'radius') % borderRadius.length],
    '--shadow-intensity': `${getSeededValue(seed, 'shadow') % 5 + 1}`,
    '--animation-duration': `${getSeededValue(seed, 'animation') % 1000 + 200}ms`,
    '--opacity-level': `${(getSeededValue(seed, 'opacity') % 10 + 5) / 10}`,
  };
}
