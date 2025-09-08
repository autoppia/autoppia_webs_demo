// Layout utility for dynamic site arrangement based on seed value
export interface LayoutConfig {
  name: string;
  description: string;
  structure: {
    header: { position: 'top' | 'left' | 'right' | 'bottom' | 'floating' };
    main: { 
      layout: 'default' | 'sidebar' | 'split' | 'columns' | 'masonry' | 'stacked';
      sections: string[];
    };
    footer: { position: 'bottom' | 'top' | 'left' | 'right' | 'sticky' };
  };
  className: string;
}

export function getSeedLayout(seed?: number): LayoutConfig {
  if (!seed || seed < 1 || seed > 10) {
    // Default layout (unchanged)
    return {
      name: "Default",
      description: "Standard layout with header top, content center, footer bottom",
      structure: {
        header: { position: 'top' },
        main: { 
          layout: 'default',
          sections: ['hero', 'booking', 'map', 'rides']
        },
        footer: { position: 'bottom' }
      },
      className: "layout-default"
    };
  }

  const layouts: LayoutConfig[] = [
    // Seed 1 - Default (already handled above)
    {
      name: "Default",
      description: "Standard layout with header top, content center, footer bottom",
      structure: {
        header: { position: 'top' },
        main: { 
          layout: 'default',
          sections: ['hero', 'booking', 'map', 'rides']
        },
        footer: { position: 'bottom' }
      },
      className: "layout-default"
    },
    
    // Seed 2 - Sidebar left with ride steps, header top, map/content right
    {
      name: "Sidebar Left",
      description: "Sidebar left with ride steps, header top, map/content right",
      structure: {
        header: { position: 'top' },
        main: { 
          layout: 'sidebar',
          sections: ['booking', 'rides', 'map', 'hero']
        },
        footer: { position: 'bottom' }
      },
      className: "layout-sidebar-left"
    },
    
    // Seed 3 - Header vertical left, content full width, footer bottom
    {
      name: "Vertical Header",
      description: "Header vertical left, content full width, footer bottom",
      structure: {
        header: { position: 'left' },
        main: { 
          layout: 'default',
          sections: ['hero', 'booking', 'map', 'rides']
        },
        footer: { position: 'bottom' }
      },
      className: "layout-vertical-header"
    },
    
    // Seed 4 - Footer at top, booking section middle, map right, header bottom
    {
      name: "Inverted Layout",
      description: "Footer at top, booking section middle, map right, header bottom",
      structure: {
        header: { position: 'bottom' },
        main: { 
          layout: 'split',
          sections: ['booking', 'map', 'hero', 'rides']
        },
        footer: { position: 'top' }
      },
      className: "layout-inverted"
    },
    
    // Seed 5 - Ride search first, then car options, then trip details stacked
    {
      name: "Stacked Flow",
      description: "Ride search first, then car options, then trip details stacked",
      structure: {
        header: { position: 'top' },
        main: { 
          layout: 'stacked',
          sections: ['booking', 'rides', 'hero', 'map']
        },
        footer: { position: 'bottom' }
      },
      className: "layout-stacked"
    },
    
    // Seed 6 - Split screen: left = booking, right = ride options + reserve
    {
      name: "Split Screen",
      description: "Split screen: left = booking, right = ride options + reserve",
      structure: {
        header: { position: 'top' },
        main: { 
          layout: 'split',
          sections: ['booking', 'rides', 'map', 'hero']
        },
        footer: { position: 'bottom' }
      },
      className: "layout-split"
    },
    
    // Seed 7 - Car selection sidebar, search/location top, reserve button bottom
    {
      name: "Car Sidebar",
      description: "Car selection sidebar, search/location top, reserve button bottom",
      structure: {
        header: { position: 'top' },
        main: { 
          layout: 'sidebar',
          sections: ['booking', 'map', 'rides', 'hero']
        },
        footer: { position: 'bottom' }
      },
      className: "layout-car-sidebar"
    },
    
    // Seed 8 - Footer sticky left, header floating top, ride info center
    {
      name: "Floating Header",
      description: "Footer sticky left, header floating top, ride info center",
      structure: {
        header: { position: 'floating' },
        main: { 
          layout: 'default',
          sections: ['hero', 'booking', 'rides', 'map']
        },
        footer: { position: 'left' }
      },
      className: "layout-floating"
    },
    
    // Seed 9 - Multi-column layout: col1 = location/destination, col2 = features/options, col3 = reservation/trip
    {
      name: "Multi Column",
      description: "Multi-column layout: col1 = location/destination, col2 = features/options, col3 = reservation/trip",
      structure: {
        header: { position: 'top' },
        main: { 
          layout: 'columns',
          sections: ['booking', 'rides', 'hero', 'map']
        },
        footer: { position: 'bottom' }
      },
      className: "layout-multi-column"
    },
    
    // Seed 10 - Masonry/grid arrangement mixing header, booking, car selection, footer
    {
      name: "Masonry Grid",
      description: "Masonry/grid arrangement mixing header, booking, car selection, footer",
      structure: {
        header: { position: 'top' },
        main: { 
          layout: 'masonry',
          sections: ['hero', 'booking', 'rides', 'map']
        },
        footer: { position: 'bottom' }
      },
      className: "layout-masonry"
    }
  ];

  return layouts[seed - 1] || layouts[0];
}

// Helper function to get CSS classes for different layout types
export function getLayoutClasses(layout: LayoutConfig): {
  container: string;
  header: string;
  main: string;
  footer: string;
} {
  const baseClasses = {
    container: "min-h-screen w-full",
    header: "",
    main: "",
    footer: ""
  };

  switch (layout.structure.main.layout) {
    case 'sidebar':
      return {
        ...baseClasses,
        container: "min-h-screen w-full flex",
        header: layout.structure.header.position === 'left' ? "w-64 flex-shrink-0" : "w-full",
        main: "flex-1 flex",
        footer: layout.structure.footer.position === 'left' ? "w-64 flex-shrink-0" : "w-full"
      };
    
    case 'split':
      return {
        ...baseClasses,
        container: "min-h-screen w-full",
        header: "w-full",
        main: "flex-1 flex flex-col lg:flex-row",
        footer: "w-full"
      };
    
    case 'columns':
      return {
        ...baseClasses,
        container: "min-h-screen w-full",
        header: "w-full",
        main: "flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        footer: "w-full"
      };
    
    case 'masonry':
      return {
        ...baseClasses,
        container: "min-h-screen w-full",
        header: "w-full",
        main: "flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
        footer: "w-full"
      };
    
    case 'stacked':
      return {
        ...baseClasses,
        container: "min-h-screen w-full flex flex-col",
        header: "w-full",
        main: "flex-1 flex flex-col space-y-6",
        footer: "w-full"
      };
    
    default:
      return {
        ...baseClasses,
        container: "min-h-screen w-full",
        header: "w-full",
        main: "flex-1",
        footer: "w-full"
      };
  }
}
