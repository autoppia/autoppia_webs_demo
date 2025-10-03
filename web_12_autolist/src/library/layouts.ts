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
        className: 'fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-10'
      },
      sidebar: {
        order: 2,
        position: 'fixed',
        className: 'w-[280px] bg-[#f8f6f2] border-r border-gray-200 min-h-screen flex flex-col justify-between fixed top-0 left-0 h-full px-4 pb-4 pt-2 z-30',
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
    description: "Header left vertically, content full width, footer bottom",
    container: {
      type: 'flex',
      direction: 'row',
      className: 'flex min-h-screen bg-white'
    },
    elements: {
      header: {
        order: 1,
        position: 'fixed',
        className: 'fixed top-0 left-0 bottom-0 w-16 bg-white border-r border-gray-200 shadow-sm z-10 flex flex-col items-center py-4'
      },
      sidebar: {
        order: 2,
        position: 'fixed',
        className: 'w-[280px] bg-[#f8f6f2] border-r border-gray-200 min-h-screen flex flex-col justify-between fixed top-0 left-16 h-full px-4 pb-4 pt-2 z-30',
        placement: 'left'
      },
      content: {
        order: 3,
        className: 'flex-1 ml-[296px] flex flex-col min-h-screen'
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
      direction: 'column',
      className: 'flex min-h-screen bg-white'
    },
    elements: {
      header: {
        order: 2,
        position: 'static',
        className: 'bg-white border-b border-gray-200 shadow-sm'
      },
      sidebar: {
        order: 3,
        position: 'static',
        className: 'w-[280px] bg-[#f8f6f2] border-r border-gray-200 min-h-screen flex flex-col justify-between px-4 pb-4 pt-2',
        placement: 'left'
      },
      content: {
        order: 1,
        className: 'flex-1 flex flex-col min-h-screen'
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
        className: 'sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10'
      },
      sidebar: {
        order: 2,
        position: 'absolute',
        className: 'absolute top-4 right-4 w-[280px] bg-[#f8f6f2] border border-gray-200 rounded-lg shadow-lg flex flex-col justify-between px-4 pb-4 pt-2 z-30 max-h-[calc(100vh-2rem)]',
        placement: 'floating'
      },
      content: {
        order: 3,
        className: 'flex-1 flex flex-col min-h-screen pr-[300px]'
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
    description: "Split screen: left = tasks, right = teams",
    container: {
      type: 'grid',
      gridTemplate: '1fr 1fr',
      className: 'grid grid-cols-2 min-h-screen bg-white'
    },
    elements: {
      header: {
        order: 1,
        position: 'fixed',
        className: 'fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-10 col-span-2'
      },
      sidebar: {
        order: 2,
        position: 'static',
        className: 'w-full bg-[#f8f6f2] border-r border-gray-200 flex flex-col justify-between px-4 pb-4 pt-2',
        placement: 'left'
      },
      content: {
        order: 3,
        className: 'flex-1 flex flex-col min-h-screen pt-16'
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
    description: "Masonry/grid-style placement of header, sidebar, content, footer",
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
        className: 'bg-white border-b border-gray-200 shadow-sm col-span-2'
      },
      sidebar: {
        order: 2,
        position: 'static',
        className: 'w-full bg-[#f8f6f2] border-r border-gray-200 flex flex-col justify-between px-4 pb-4 pt-2',
        placement: 'left'
      },
      content: {
        order: 3,
        className: 'flex-1 flex flex-col min-h-screen'
      },
      footer: {
        order: 4,
        position: 'static',
        className: 'p-4 bg-gray-50 border-t border-gray-200 col-span-2'
      }
    }
  }
};

/**
 * Check if dynamic HTML is enabled
 * @returns boolean indicating if dynamic HTML is enabled
 */
export function isDynamicEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML === 'true';
}

/**
 * Get layout configuration based on seed value
 * @param seed - Seed value from URL query param (1-300)
 * @returns Layout configuration object
 */
export function getSeedLayout(seed?: number): LayoutConfig {
  // If dynamic HTML is disabled, always return default layout regardless of seed
  if (!isDynamicEnabled()) {
    return LAYOUTS[1];
  }
  
  // Validate seed range (1-300) - when dynamic HTML is enabled
  if (!seed || seed < 1 || seed > 300) {
    return LAYOUTS[1];
  }

  // Apply the seed mapping formula: ((seed % 30) + 1) % 10 || 10
  const mappedSeed = ((seed % 30) + 1) % 10 || 10;
  
  return LAYOUTS[mappedSeed];
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
