// Layout configuration types
export interface LayoutConfig {
  name: string;
  description: string;
  container: {
    type: 'flex' | 'grid' | 'block';
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    gridTemplate?: string;
    className: string;
  };
  elements: {
    header: {
      order: number;
      position: 'static' | 'fixed' | 'sticky' | 'absolute';
      className: string;
    };
    sidebar: {
      order: number;
      position: 'static' | 'fixed' | 'sticky' | 'absolute';
      className: string;
      placement: 'left' | 'right' | 'top' | 'bottom' | 'floating';
    };
    content: {
      order: number;
      className: string;
    };
    footer: {
      order: number;
      position: 'static' | 'fixed' | 'sticky' | 'absolute';
      className: string;
    };
  };
}

// 10 distinct layout configurations
const LAYOUTS: Record<number, LayoutConfig> = {
  1: {
    name: "Default Layout",
    description: "Header top, sidebar left, content center, footer bottom",
    container: {
      type: 'flex',
      direction: 'row',
      className: 'flex min-h-screen bg-white'
    },
    elements: {
      header: {
        order: 1,
        position: 'fixed',
        className: 'fixed top-0 left-[280px] right-0 bg-white border-b border-gray-200 shadow-sm z-40'
      },
      sidebar: {
        order: 2,
        position: 'fixed',
        className: 'w-[280px] bg-[#f8f6f2] border-r border-gray-200 min-h-screen flex flex-col justify-between fixed top-16 left-0 h-[calc(100vh-4rem)] px-4 pb-4 pt-2 z-30',
        placement: 'left'
      },
      content: {
        order: 3,
        className: 'flex-1 ml-[280px] flex flex-col min-h-screen pt-16 mt-0'
      },
      footer: {
        order: 4,
        position: 'static',
        className: 'mt-auto p-4 bg-gray-50 border-t border-gray-200'
      }
    }
  },

  2: {
    name: "Sidebar Right Layout",
    description: "Sidebar right, header top, footer bottom",
    container: {
      type: 'flex',
      direction: 'row-reverse',
      className: 'flex min-h-screen bg-white'
    },
    elements: {
      header: {
        order: 1,
        position: 'fixed',
        className: 'fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-10'
      },
      sidebar: {
        order: 2,
        position: 'fixed',
        className: 'w-[280px] bg-[#f8f6f2] border-l border-gray-200 min-h-screen flex flex-col justify-between fixed top-0 right-0 h-full px-4 pb-4 pt-2 z-30',
        placement: 'right'
      },
      content: {
        order: 3,
        className: 'flex-1 mr-[280px] flex flex-col min-h-screen pt-16'
      },
      footer: {
        order: 4,
        position: 'static',
        className: 'mt-auto p-4 bg-gray-50 border-t border-gray-200'
      }
    }
  },

  3: {
    name: "Vertical Header Layout",
    description: "Header left vertically, sidebar next, content full width",
    container: {
      type: 'flex',
      direction: 'row',
      className: 'flex min-h-screen bg-white'
    },
    elements: {
      header: {
        order: 1,
        position: 'fixed',
        className: 'fixed top-0 left-0 bottom-0 w-16 bg-white border-r border-gray-200 shadow-sm z-40 flex flex-col items-center py-4'
      },
      sidebar: {
        order: 2,
        position: 'fixed',
        className: 'w-[280px] bg-[#f8f6f2] border-r border-gray-200 min-h-screen flex flex-col justify-between fixed top-0 left-16 h-full px-4 pb-4 pt-2 z-30',
        placement: 'left'
      },
      content: {
        order: 3,
        className: 'flex-1 ml-[296px] flex flex-col min-h-screen pt-4'
      },
      footer: {
        order: 4,
        position: 'static',
        className: 'mt-auto p-4 bg-gray-50 border-t border-gray-200'
      }
    }
  },

  4: {
    name: "Footer Top Layout",
    description: "Footer at top, header bottom, sidebar left",
    container: {
      type: 'flex',
      direction: 'column-reverse',
      className: 'flex min-h-screen bg-white'
    },
    elements: {
      header: {
        order: 2,
        position: 'fixed',
        className: 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm z-10'
      },
      sidebar: {
        order: 3,
        position: 'fixed',
        className: 'w-[280px] bg-[#f8f6f2] border-r border-gray-200 min-h-screen flex flex-col justify-between fixed top-0 left-0 h-full px-4 pb-4 pt-2 z-30',
        placement: 'left'
      },
      content: {
        order: 1,
        className: 'flex-1 ml-[280px] flex flex-col min-h-screen pb-16'
      },
      footer: {
        order: 4,
        position: 'static',
        className: 'p-4 bg-gray-50 border-b border-gray-200'
      }
    }
  },

  5: {
    name: "Content First Layout",
    description: "Content first, then header, then sidebar",
    container: {
      type: 'flex',
      direction: 'row',
      className: 'flex min-h-screen bg-white'
    },
    elements: {
      header: {
        order: 1,
        position: 'fixed',
        className: 'fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40'
      },
      sidebar: {
        order: 2,
        position: 'fixed',
        className: 'w-[280px] bg-[#f8f6f2] border-r border-gray-200 min-h-screen flex flex-col justify-between fixed top-16 left-0 h-[calc(100vh-4rem)] px-4 pb-4 pt-2 z-30',
        placement: 'left'
      },
      content: {
        order: 3,
        className: 'flex-1 ml-[280px] flex flex-col min-h-screen pt-16'
      },
      footer: {
        order: 4,
        position: 'static',
        className: 'mt-auto p-4 bg-gray-50 border-t border-gray-200'
      }
    }
  },

  6: {
    name: "Floating Sidebar Layout",
    description: "Sidebar floating on right, header sticky top",
    container: {
      type: 'block',
      className: 'min-h-screen bg-white relative'
    },
    elements: {
      header: {
        order: 1,
        position: 'sticky',
        className: 'sticky top-0 bg-white border-b border-gray-200 shadow-sm z-50'
      },
      sidebar: {
        order: 2,
        position: 'absolute',
        className: 'absolute top-20 right-4 w-[280px] bg-[#f8f6f2] border border-gray-200 rounded-lg shadow-lg flex flex-col justify-between px-4 pb-4 pt-2 z-40 max-h-[calc(100vh-6rem)] overflow-y-auto',
        placement: 'floating'
      },
      content: {
        order: 3,
        className: 'flex-1 flex flex-col min-h-screen pr-[300px] pt-4'
      },
      footer: {
        order: 4,
        position: 'static',
        className: 'mt-auto p-4 bg-gray-50 border-t border-gray-200'
      }
    }
  },

  7: {
    name: "Split Screen Layout",
    description: "Split screen: left = sidebar, right = content",
    container: {
      type: 'grid',
      gridTemplate: 'auto 1fr auto / 280px 1fr',
      className: 'grid min-h-screen bg-white'
    },
    elements: {
      header: {
        order: 1,
        position: 'static',
        className: 'bg-white border-b border-gray-200 shadow-sm z-10 col-span-2'
      },
      sidebar: {
        order: 2,
        position: 'static',
        className: 'w-full bg-[#f8f6f2] border-r border-gray-200 flex flex-col justify-between px-4 pb-4 pt-2 min-h-[calc(100vh-4rem)]',
        placement: 'left'
      },
      content: {
        order: 3,
        className: 'flex-1 flex flex-col min-h-screen pt-4'
      },
      footer: {
        order: 4,
        position: 'static',
        className: 'mt-auto p-4 bg-gray-50 border-t border-gray-200 col-span-2'
      }
    }
  },

  8: {
    name: "Hidden Sidebar Layout",
    description: "Sidebar hidden in DOM order last, footer sticky left",
    container: {
      type: 'flex',
      direction: 'column',
      className: 'flex min-h-screen bg-white'
    },
    elements: {
      header: {
        order: 1,
        position: 'static',
        className: 'bg-white border-b border-gray-200 shadow-sm'
      },
      sidebar: {
        order: 4,
        position: 'static',
        className: 'w-[280px] bg-[#f8f6f2] border-r border-gray-200 min-h-screen flex flex-col justify-between px-4 pb-4 pt-2',
        placement: 'left'
      },
      content: {
        order: 2,
        className: 'flex-1 flex flex-col min-h-screen'
      },
      footer: {
        order: 3,
        position: 'sticky',
        className: 'sticky left-0 p-4 bg-gray-50 border-t border-gray-200'
      }
    }
  },

  9: {
    name: "Split Header Layout",
    description: "Header split into top + bottom, sidebar right",
    container: {
      type: 'flex',
      direction: 'column',
      className: 'flex min-h-screen bg-white'
    },
    elements: {
      header: {
        order: 1,
        position: 'static',
        className: 'bg-white border-b border-gray-200 shadow-sm flex'
      },
      sidebar: {
        order: 3,
        position: 'fixed',
        className: 'w-[280px] bg-[#f8f6f2] border-l border-gray-200 min-h-screen flex flex-col justify-between fixed top-0 right-0 h-full px-4 pb-4 pt-2 z-30',
        placement: 'right'
      },
      content: {
        order: 2,
        className: 'flex-1 mr-[280px] flex flex-col min-h-screen'
      },
      footer: {
        order: 4,
        position: 'static',
        className: 'mt-auto p-4 bg-gray-50 border-t border-gray-200'
      }
    }
  },

  10: {
    name: "Masonry Grid Layout",
    description: "Grid-style placement of header, sidebar, content, footer",
    container: {
      type: 'grid',
      gridTemplate: 'auto 1fr auto / 280px 1fr',
      className: 'grid min-h-screen bg-white',
      direction: undefined
    },
    elements: {
      header: {
        order: 1,
        position: 'static',
        className: 'bg-white border-b border-gray-200 shadow-sm z-10 col-span-2'
      },
      sidebar: {
        order: 2,
        position: 'static',
        className: 'w-full bg-[#f8f6f2] border-r border-gray-200 flex flex-col justify-between px-4 pb-4 pt-2 min-h-[calc(100vh-4rem)]',
        placement: 'left'
      },
      content: {
        order: 3,
        className: 'flex-1 flex flex-col min-h-screen pt-4'
      },
      footer: {
        order: 4,
        position: 'static',
        className: 'p-4 bg-gray-50 border-t border-gray-200 col-span-2'
      }
    }
  }
};

const TRUE_VALUES = new Set(['true', '1', 'yes', 'on']);
const FALSE_VALUES = new Set(['false', '0', 'no', 'off']);

function parseEnableDynamicFromUrl(): boolean | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('enable_dynamic');
  if (!raw) return null;
  const parts = raw
    .toLowerCase()
    .split(',')
    .map((part) => part.trim());
  if (parts.length === 0) return null;
  if (parts.includes('v1')) return true;
  if (parts.some((part) => FALSE_VALUES.has(part))) return false;
  return false;
}

/**
 * Check if dynamic HTML is enabled
 * @returns boolean indicating if dynamic HTML is enabled
 */
export function isDynamicEnabled(): boolean {
  const fromUrl = parseEnableDynamicFromUrl();
  if (fromUrl !== null) {
    return fromUrl;
  }

  const rawFlag =
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1_STRUCTURE ??
    process.env.NEXT_PUBLIC_DYNAMIC_HTML_STRUCTURE ??
    process.env.ENABLE_DYNAMIC_V1_STRUCTURE ??
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 ??
    process.env.ENABLE_DYNAMIC_V1 ??
    '';

  if (!rawFlag) {
    return true;
  }

  const normalized = rawFlag.toString().trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  return true;
}

/**
 * Get layout configuration based on seed value
 * @param seed - Seed value from URL query param (1-300)
 * @returns Layout configuration object
 */
export function getSeedLayout(seed?: number): LayoutConfig {
  // If dynamic HTML is disabled, always return layout index 1 (Default Layout)
  // Default Layout has navbar at top of page
  if (!isDynamicEnabled()) {
    return LAYOUTS[1];
  }
  
  // Validate seed range (1-300) - when dynamic HTML is enabled
  // When no seed is provided, return layout index 1 (Default Layout)
  // Default Layout has navbar at top of page
  if (!seed || seed < 1 || seed > 300) {
    return LAYOUTS[1];
  }

  // Apply the seed mapping formula: ((seed % 30) + 1) % 10 || 10
  // Special-case: seed=3 should use the Default Layout (layout 1)
  if (seed === 3) return LAYOUTS[1];
  const mappedSeed = ((seed % 30) + 1) % 10 || 10;
  
  const baseLayout = LAYOUTS[mappedSeed];
  
  // Layouts that should NOT have their sidebar placement changed
  // These layouts have specific positioning requirements that would break if changed
  const layoutsWithFixedPlacement = [3, 6, 7, 10]; // Vertical Header, Floating Sidebar, Split Screen, Masonry Grid
  
  // If this layout has fixed placement, return it as-is
  if (layoutsWithFixedPlacement.includes(mappedSeed)) {
    return baseLayout;
  }
  
  // Dynamically adjust sidebar placement based on seed for layouts that can handle it
  // Use seed to determine placement: left, right, top, bottom, or floating
  // This creates more variety in sidebar positioning
  const placementOptions: Array<'left' | 'right' | 'top' | 'bottom' | 'floating'> = ['left', 'right', 'top', 'bottom', 'floating'];
  const placementIndex = seed % placementOptions.length;
  const targetPlacement = placementOptions[placementIndex];
  
  const currentPlacement = baseLayout.elements.sidebar.placement;
  
  // If placement is already what we want, return base layout
  if (currentPlacement === targetPlacement) {
    return baseLayout;
  }
  
  // Helper function to generate sidebar className based on placement
  const getSidebarClassName = (placement: 'left' | 'right' | 'top' | 'bottom' | 'floating'): string => {
    const baseStyles = 'bg-[#f8f6f2] flex flex-col justify-between px-4 pb-4 pt-2 z-30';
    
    switch (placement) {
      case 'left':
        return `w-[280px] ${baseStyles} min-h-screen border-r border-gray-200 fixed top-0 left-0 h-full`;
      case 'right':
        return `w-[280px] ${baseStyles} min-h-screen border-l border-gray-200 fixed top-0 right-0 h-full`;
      case 'top':
        return `w-full ${baseStyles} border-b border-gray-200 fixed top-0 left-0 right-0 h-auto max-h-[300px]`;
      case 'bottom':
        return `w-full ${baseStyles} border-t border-gray-200 fixed bottom-0 left-0 right-0 h-auto max-h-[300px]`;
      case 'floating':
        return `w-[280px] ${baseStyles} border border-gray-200 rounded-lg shadow-lg absolute top-4 right-4 max-h-[calc(100vh-2rem)]`;
      default:
        return baseLayout.elements.sidebar.className;
    }
  };
  
  // Helper function to adjust content margins based on sidebar placement
  const getContentClassName = (placement: 'left' | 'right' | 'top' | 'bottom' | 'floating', currentContentClass: string): string => {
    // Remove existing margin and padding classes that depend on sidebar position
    let adjusted = currentContentClass
      .replace(/\bml-\[280px\]/g, '')
      .replace(/\bmr-\[280px\]/g, '')
      .replace(/\bml-\[296px\]/g, '')
      .replace(/\bmr-\[296px\]/g, '')
      .replace(/\bpt-\[300px\]/g, '')
      .replace(/\bpb-\[300px\]/g, '')
      .replace(/\bpr-\[300px\]/g, '')
      .replace(/\bpt-16/g, '')
      .replace(/\bpt-4/g, '')
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .trim();
    
    // Add appropriate margins/padding based on sidebar placement
    switch (placement) {
      case 'left':
        // Only add left margin if not already present
        if (!adjusted.includes('ml-')) {
          adjusted = (adjusted + ' ml-[280px]').trim();
        }
        break;
      case 'right':
        // Only add right margin if not already present
        if (!adjusted.includes('mr-')) {
          adjusted = (adjusted + ' mr-[280px]').trim();
        }
        break;
      case 'top':
        // Only add top padding if not already present
        if (!adjusted.includes('pt-')) {
          adjusted = (adjusted + ' pt-[300px]').trim();
        }
        break;
      case 'bottom':
        // Only add bottom padding if not already present
        if (!adjusted.includes('pb-')) {
          adjusted = (adjusted + ' pb-[300px]').trim();
        }
        break;
      case 'floating':
        // Floating sidebar needs right padding to prevent content overlap
        if (!adjusted.includes('pr-')) {
          adjusted = (adjusted + ' pr-[300px]').trim();
        }
        break;
    }
    
    // Add top padding for header if not already present and sidebar is not on top
    // Only if there's no existing padding-top
    if (!adjusted.includes('pt-') && placement !== 'top') {
      // Check if header is fixed/sticky - if so, add padding
      adjusted = (adjusted + ' pt-16').trim();
    }
    
    return adjusted.replace(/\s+/g, ' ').trim();
  };
  
  // Determine sidebar position and order based on placement
  const getSidebarPosition = (placement: 'left' | 'right' | 'top' | 'bottom' | 'floating'): 'static' | 'fixed' | 'sticky' | 'absolute' => {
    switch (placement) {
      case 'floating':
        return 'absolute';
      case 'left':
      case 'right':
      case 'top':
      case 'bottom':
        return 'fixed';
      default:
        return baseLayout.elements.sidebar.position;
    }
  };
  
  // Adjust element orders based on sidebar placement
  // When sidebar is top, it should be first; when bottom, it should be last
  // This affects the visual order when elements are shuffled
  const getElementOrders = (placement: 'left' | 'right' | 'top' | 'bottom' | 'floating') => {
    const baseOrders = {
      header: baseLayout.elements.header.order,
      sidebar: baseLayout.elements.sidebar.order,
      content: baseLayout.elements.content.order,
      footer: baseLayout.elements.footer.order,
    };
    
    switch (placement) {
      case 'top':
        // Sidebar on top should appear first in DOM order for proper stacking
        return {
          header: Math.max(1, baseOrders.header - 1), // Move header down
          sidebar: 0, // Sidebar first when on top
          content: baseOrders.content,
          footer: baseOrders.footer,
        };
      case 'bottom':
        // Sidebar on bottom should appear last in DOM order
        return {
          header: baseOrders.header,
          sidebar: 100, // Sidebar last when on bottom
          content: baseOrders.content,
          footer: Math.min(99, baseOrders.footer), // Move footer up
        };
      default:
        // For left/right/floating, keep original orders but may be shuffled by reorderElements
        return baseOrders;
    }
  };
  
  const elementOrders = getElementOrders(targetPlacement);
  
  // Create a modified layout with adjusted sidebar placement
  const modifiedLayout: LayoutConfig = {
    ...baseLayout,
    elements: {
      ...baseLayout.elements,
      header: {
        ...baseLayout.elements.header,
        order: elementOrders.header,
      },
      sidebar: {
        ...baseLayout.elements.sidebar,
        placement: targetPlacement,
        position: getSidebarPosition(targetPlacement),
        className: getSidebarClassName(targetPlacement),
        order: elementOrders.sidebar,
      },
      content: {
        ...baseLayout.elements.content,
        className: getContentClassName(targetPlacement, baseLayout.elements.content.className),
        order: elementOrders.content,
      },
      footer: {
        ...baseLayout.elements.footer,
        order: elementOrders.footer,
      },
    },
  };
  
  return modifiedLayout;
}

export function getLayoutClasses(config: LayoutConfig): {
  container: string;
  header: string;
  sidebar: string;
  content: string;
  footer: string;
} {
  return {
    container: config.container.className,
    header: config.elements.header.className,
    sidebar: config.elements.sidebar.className,
    content: config.elements.content.className,
    footer: config.elements.footer.className,
  };
}

/**
 * Get all available layout configurations
 * @returns Array of all layout configurations
 */
export function getAllLayouts(): LayoutConfig[] {
  return Object.values(LAYOUTS);
}

/**
 * Get layout configuration by name
 * @param name - Layout name
 * @returns Layout configuration object or null if not found
 */
export function getLayoutByName(name: string): LayoutConfig | null {
  const layout = Object.values(LAYOUTS).find(l => l.name === name);
  return layout || null;
}

/**
 * Get effective layout configuration based on seed
 * Alias for getSeedLayout for compatibility
 * @param seed - Optional seed value
 * @returns Layout configuration object
 */
export function getEffectiveLayoutConfig(seed?: number): LayoutConfig {
  return getSeedLayout(seed);
}
