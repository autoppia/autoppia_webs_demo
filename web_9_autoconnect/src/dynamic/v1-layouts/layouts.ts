export interface LayoutConfig {
  mainLayout: 'default' | 'reverse' | 'vertical' | 'horizontal' | 'grid' | 'sidebar-top' | 'sidebar-bottom' | 'center-focus' | 'split-view' | 'masonry';
  headerPosition: 'top' | 'bottom' | 'left' | 'right' | 'hidden';
  sidebarPosition: 'left' | 'right' | 'top' | 'bottom' | 'none';
  postBoxPosition: 'top' | 'bottom' | 'left' | 'right' | 'center';
  feedOrder: 'normal' | 'reverse' | 'shuffled';
  navOrder: 'normal' | 'reverse' | 'shuffled';
  searchPosition: 'header' | 'sidebar' | 'main' | 'floating';
  filtersPosition: 'top' | 'bottom' | 'left' | 'right' | 'sidebar';
  jobCardsLayout: 'list' | 'grid' | 'cards' | 'compact';
  profileLayout: 'standard' | 'compact' | 'expanded' | 'sidebar';
}

export function getSeedLayout(seed?: number): LayoutConfig {
  // If no seed provided or out of range, return default
  if (!seed || seed < 1 || seed > 300) {
    return getDefaultLayout();
  }

  // Special case: Seeds 160-170 should use the same layout as seed 80 (Layout 3)
  if (seed >= 160 && seed <= 170) {
    return getLayoutByIndex(3);
  }

  // Special case: Seeds 5,15,25,35,45,55,65,75...295 should use Layout 2
  if (seed % 10 === 5) {
    return getLayoutByIndex(2);
  }

  // Special case: Seed 8 should use Layout 1
  if (seed === 8) {
    return getLayoutByIndex(1);
  }

  // Special cases: Unique layouts for specific seeds
  const specialLayouts: { [key: number]: number } = {
    180: 11, // Ultra-wide layout
    190: 18, // Split-screen layout
    200: 20, // Asymmetric layout
    210: 14, // Dashboard-style layout
    250: 15, // Magazine-style layout
    260: 19, // Card-stack layout
    270: 17, // Premium showcase layout
  };

  if (specialLayouts[seed]) {
    return getLayoutByIndex(specialLayouts[seed]);
  }

  // Map seed (1-300) to layout index (1-10) using modulo
  // COMMON FORMULA across all webs
  const layoutIndex = ((seed % 30) + 1) % 10 || 10;

  return getLayoutByIndex(layoutIndex);
}

function getDefaultLayout(): LayoutConfig {
  return {
    mainLayout: 'default',
    headerPosition: 'top',
    sidebarPosition: 'left',
    postBoxPosition: 'top',
    feedOrder: 'normal',
    navOrder: 'normal',
    searchPosition: 'header',
    filtersPosition: 'top',
    jobCardsLayout: 'list',
    profileLayout: 'standard'
  };
}

function getLayoutByIndex(layoutIndex: number): LayoutConfig {
  const layouts: LayoutConfig[] = [
    // Seed 1: Reverse layout with sidebar on right
    {
      mainLayout: 'reverse',
      headerPosition: 'top',
      sidebarPosition: 'right',
      postBoxPosition: 'top',
      feedOrder: 'normal',
      navOrder: 'reverse',
      searchPosition: 'header',
      filtersPosition: 'top',
      jobCardsLayout: 'list',
      profileLayout: 'standard'
    },
    // Seed 2: Vertical layout with header on left
    {
      mainLayout: 'vertical',
      headerPosition: 'left',
      sidebarPosition: 'top',
      postBoxPosition: 'center',
      feedOrder: 'reverse',
      navOrder: 'normal',
      searchPosition: 'sidebar',
      filtersPosition: 'left',
      jobCardsLayout: 'grid',
      profileLayout: 'compact'
    },
    // Seed 3: Horizontal layout with sidebar on bottom
    {
      mainLayout: 'horizontal',
      headerPosition: 'top',
      sidebarPosition: 'bottom',
      postBoxPosition: 'left',
      feedOrder: 'shuffled',
      navOrder: 'shuffled',
      searchPosition: 'main',
      filtersPosition: 'bottom',
      jobCardsLayout: 'cards',
      profileLayout: 'expanded'
    },
    // Seed 4: Grid layout with floating search
    {
      mainLayout: 'grid',
      headerPosition: 'top',
      sidebarPosition: 'none',
      postBoxPosition: 'right',
      feedOrder: 'normal',
      navOrder: 'reverse',
      searchPosition: 'floating',
      filtersPosition: 'right',
      jobCardsLayout: 'compact',
      profileLayout: 'sidebar'
    },
    // Seed 5: Sidebar-top layout
    {
      mainLayout: 'sidebar-top',
      headerPosition: 'top',
      sidebarPosition: 'top',
      postBoxPosition: 'bottom',
      feedOrder: 'reverse',
      navOrder: 'normal',
      searchPosition: 'header',
      filtersPosition: 'top',
      jobCardsLayout: 'list',
      profileLayout: 'standard'
    },
    // Seed 6: Sidebar-bottom layout
    {
      mainLayout: 'sidebar-bottom',
      headerPosition: 'top',
      sidebarPosition: 'bottom',
      postBoxPosition: 'top',
      feedOrder: 'normal',
      navOrder: 'shuffled',
      searchPosition: 'sidebar',
      filtersPosition: 'left',
      jobCardsLayout: 'grid',
      profileLayout: 'compact'
    },
    // Seed 7: Center-focus layout
    {
      mainLayout: 'center-focus',
      headerPosition: 'top',
      sidebarPosition: 'left',
      postBoxPosition: 'center',
      feedOrder: 'shuffled',
      navOrder: 'normal',
      searchPosition: 'main',
      filtersPosition: 'bottom',
      jobCardsLayout: 'cards',
      profileLayout: 'expanded'
    },
    // Seed 8: Split-view layout
    {
      mainLayout: 'split-view',
      headerPosition: 'top',
      sidebarPosition: 'right',
      postBoxPosition: 'left',
      feedOrder: 'reverse',
      navOrder: 'reverse',
      searchPosition: 'floating',
      filtersPosition: 'right',
      jobCardsLayout: 'compact',
      profileLayout: 'sidebar'
    },
    // Seed 9: Masonry layout
    {
      mainLayout: 'masonry',
      headerPosition: 'top',
      sidebarPosition: 'left',
      postBoxPosition: 'top',
      feedOrder: 'shuffled',
      navOrder: 'shuffled',
      searchPosition: 'header',
      filtersPosition: 'top',
      jobCardsLayout: 'list',
      profileLayout: 'standard'
    },
    // Seed 10: Complete reverse layout
    {
      mainLayout: 'reverse',
      headerPosition: 'bottom',
      sidebarPosition: 'right',
      postBoxPosition: 'bottom',
      feedOrder: 'reverse',
      navOrder: 'reverse',
      searchPosition: 'sidebar',
      filtersPosition: 'bottom',
      jobCardsLayout: 'grid',
      profileLayout: 'compact'
    },
    // Seed 11: Ultra-wide layout
    {
      mainLayout: 'grid',
      headerPosition: 'top',
      sidebarPosition: 'none',
      postBoxPosition: 'top',
      feedOrder: 'normal',
      navOrder: 'normal',
      searchPosition: 'floating',
      filtersPosition: 'top',
      jobCardsLayout: 'grid',
      profileLayout: 'expanded'
    },
    // Seed 12: Compact sidebar layout
    {
      mainLayout: 'default',
      headerPosition: 'top',
      sidebarPosition: 'left',
      postBoxPosition: 'center',
      feedOrder: 'shuffled',
      navOrder: 'reverse',
      searchPosition: 'header',
      filtersPosition: 'sidebar',
      jobCardsLayout: 'compact',
      profileLayout: 'compact'
    },
    // Seed 13: Minimalist centered layout
    {
      mainLayout: 'center-focus',
      headerPosition: 'top',
      sidebarPosition: 'none',
      postBoxPosition: 'top',
      feedOrder: 'normal',
      navOrder: 'normal',
      searchPosition: 'main',
      filtersPosition: 'top',
      jobCardsLayout: 'list',
      profileLayout: 'standard'
    },
    // Seed 14: Dashboard-style layout
    {
      mainLayout: 'grid',
      headerPosition: 'top',
      sidebarPosition: 'right',
      postBoxPosition: 'left',
      feedOrder: 'reverse',
      navOrder: 'shuffled',
      searchPosition: 'header',
      filtersPosition: 'right',
      jobCardsLayout: 'cards',
      profileLayout: 'sidebar'
    },
    // Seed 15: Magazine-style layout
    {
      mainLayout: 'masonry',
      headerPosition: 'top',
      sidebarPosition: 'left',
      postBoxPosition: 'top',
      feedOrder: 'shuffled',
      navOrder: 'normal',
      searchPosition: 'floating',
      filtersPosition: 'top',
      jobCardsLayout: 'grid',
      profileLayout: 'expanded'
    },
    // Seed 16: Mobile-first layout
    {
      mainLayout: 'vertical',
      headerPosition: 'top',
      sidebarPosition: 'top',
      postBoxPosition: 'center',
      feedOrder: 'normal',
      navOrder: 'reverse',
      searchPosition: 'main',
      filtersPosition: 'top',
      jobCardsLayout: 'list',
      profileLayout: 'compact'
    },
    // Seed 17: Premium showcase layout
    {
      mainLayout: 'center-focus',
      headerPosition: 'top',
      sidebarPosition: 'right',
      postBoxPosition: 'center',
      feedOrder: 'shuffled',
      navOrder: 'normal',
      searchPosition: 'header',
      filtersPosition: 'bottom',
      jobCardsLayout: 'cards',
      profileLayout: 'expanded'
    },
    // Seed 18: Split-screen layout
    {
      mainLayout: 'split-view',
      headerPosition: 'top',
      sidebarPosition: 'left',
      postBoxPosition: 'right',
      feedOrder: 'reverse',
      navOrder: 'reverse',
      searchPosition: 'sidebar',
      filtersPosition: 'left',
      jobCardsLayout: 'compact',
      profileLayout: 'sidebar'
    },
    // Seed 19: Card-stack layout
    {
      mainLayout: 'masonry',
      headerPosition: 'top',
      sidebarPosition: 'bottom',
      postBoxPosition: 'top',
      feedOrder: 'shuffled',
      navOrder: 'shuffled',
      searchPosition: 'main',
      filtersPosition: 'bottom',
      jobCardsLayout: 'cards',
      profileLayout: 'standard'
    },
    // Seed 20: Asymmetric layout
    {
      mainLayout: 'reverse',
      headerPosition: 'top',
      sidebarPosition: 'right',
      postBoxPosition: 'left',
      feedOrder: 'reverse',
      navOrder: 'shuffled',
      searchPosition: 'floating',
      filtersPosition: 'right',
      jobCardsLayout: 'grid',
      profileLayout: 'compact'
    }
  ];

  // Return the layout at the correct index (1-based to 0-based)
  if (layoutIndex >= 1 && layoutIndex <= layouts.length) {
    return layouts[layoutIndex - 1];
  }
  
  return getDefaultLayout();
}

export function getLayoutClasses(layout: LayoutConfig, component: keyof LayoutConfig): string {
  const classes: Record<string, Record<string, string>> = {
    mainLayout: {
      'default': 'w-full flex gap-2 justify-center min-h-screen',
      'reverse': 'w-full flex gap-2 justify-center min-h-screen flex-row-reverse',
      'vertical': 'w-full flex flex-col gap-2 justify-center min-h-screen',
      'horizontal': 'w-full flex flex-row gap-2 justify-center min-h-screen',
      'grid': 'w-full grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-screen',
      'sidebar-top': 'w-full flex flex-col gap-2 justify-center min-h-screen',
      'sidebar-bottom': 'w-full flex flex-col gap-2 justify-center min-h-screen',
      'center-focus': 'w-full flex gap-2 justify-center min-h-screen',
      'split-view': 'w-full grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-screen',
      'masonry': 'w-full columns-1 md:columns-2 lg:columns-3 gap-4 min-h-screen'
    },
    headerPosition: {
      'top': 'sticky top-0 z-30',
      'bottom': 'sticky bottom-0 z-30',
      'left': 'fixed left-0 top-0 h-full z-30',
      'right': 'fixed right-0 top-0 h-full z-30',
      'hidden': 'hidden'
    },
    sidebarPosition: {
      'left': 'order-1',
      'right': 'order-3',
      'top': 'order-1 w-full',
      'bottom': 'order-3 w-full',
      'none': 'hidden'
    },
    postBoxPosition: {
      'top': 'order-1',
      'bottom': 'order-3',
      'left': 'order-1',
      'right': 'order-3',
      'center': 'order-2'
    },
    searchPosition: {
      'header': 'flex-1 max-w-lg',
      'sidebar': 'w-full',
      'main': 'w-full mb-4',
      'floating': 'fixed top-20 right-4 z-40'
    },
    filtersPosition: {
      'top': 'mb-6',
      'bottom': 'mt-6',
      'left': 'mr-6',
      'right': 'ml-6',
      'sidebar': 'w-full'
    },
    jobCardsLayout: {
      'list': 'flex flex-col gap-4',
      'grid': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
      'cards': 'grid grid-cols-1 md:grid-cols-2 gap-4',
      'compact': 'flex flex-col gap-2'
    },
    profileLayout: {
      'standard': 'space-y-6',
      'compact': 'space-y-4',
      'expanded': 'space-y-8',
      'sidebar': 'grid grid-cols-1 lg:grid-cols-3 gap-6'
    }
  };

  return classes[component]?.[layout[component]] || '';
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getShuffledItems<T>(items: T[], order: 'normal' | 'reverse' | 'shuffled'): T[] {
  switch (order) {
    case 'normal':
      return items;
    case 'reverse':
      return [...items].reverse();
    case 'shuffled':
      return shuffleArray(items);
    default:
      return items;
  }
}

// Helper function to check if dynamic HTML is enabled
export function isDynamicEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 === 'true';
}

// Helper function to get effective layout config
export function getEffectiveLayoutConfig(seed?: number): LayoutConfig {
  if (!isDynamicEnabled()) {
    return getDefaultLayout();
  }
  return getSeedLayout(seed);
} 