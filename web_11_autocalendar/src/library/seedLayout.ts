// src/library/seedLayout.ts
// Updated interface to include 'none' position for all components

export interface LayoutConfig {
  sidebar: {
    position: 'left' | 'right' | 'top' | 'bottom' | 'none';
    order: number;
  };
  navigation: {
    position: 'top' | 'bottom' | 'left' | 'right' | 'none';
    order: number;
  };
  search: {
    position: 'top' | 'bottom' | 'left' | 'right' | 'none';
    order: number;
  };
  calendar: {
    position: 'center' | 'left' | 'right' | 'top' | 'bottom';
    order: number;
  };
  userProfile: {
    position: 'top' | 'bottom' | 'left' | 'right' | 'none';
    order: number;
  };
  createButton: {
    position: 'sidebar' | 'navigation' | 'floating' | 'none';
    order: number;
  };
  miniCalendar: {
    position: 'sidebar' | 'navigation' | 'floating' | 'none';
    order: number;
  };
  myCalendars: {
    position: 'sidebar' | 'navigation' | 'floating' | 'none';
    order: number;
  };
}

export function getSeedLayout(seed?: number): LayoutConfig {
  // If no seed or invalid seed, return default layout
  if (!seed || seed < 1 || seed > 10) {
    return {
      sidebar: { position: 'left', order: 1 },
      navigation: { position: 'top', order: 2 },
      search: { position: 'top', order: 3 },
      calendar: { position: 'center', order: 4 },
      userProfile: { position: 'top', order: 5 },
      createButton: { position: 'sidebar', order: 1 },
      miniCalendar: { position: 'sidebar', order: 2 },
      myCalendars: { position: 'sidebar', order: 3 },
    };
  }

  // Define 10 different layout configurations
  const layouts: LayoutConfig[] = [
    {
      sidebar: { position: 'left', order: 1 },
      navigation: { position: 'top', order: 2 },
      search: { position: 'top', order: 3 },
      calendar: { position: 'center', order: 4 },
      userProfile: { position: 'top', order: 5 },
      createButton: { position: 'sidebar', order: 1 },
      miniCalendar: { position: 'sidebar', order: 2 },
      myCalendars: { position: 'sidebar', order: 3 },
    },
    {
      sidebar: { position: 'right', order: 2 },
      navigation: { position: 'left', order: 1 },
      search: { position: 'top', order: 3 },
      calendar: { position: 'right', order: 4 },
      userProfile: { position: 'top', order: 5 },
      createButton: { position: 'navigation', order: 1 },
      miniCalendar: { position: 'navigation', order: 2 },
      myCalendars: { position: 'navigation', order: 3 },
    },
    {
      sidebar: { position: 'bottom', order: 3 },
      navigation: { position: 'top', order: 2 },
      search: { position: 'top', order: 1 },
      calendar: { position: 'center', order: 4 },
      userProfile: { position: 'top', order: 5 },
      createButton: { position: 'floating', order: 1 },
      miniCalendar: { position: 'sidebar', order: 2 },
      myCalendars: { position: 'sidebar', order: 3 },
    },
    {
      sidebar: { position: 'right', order: 1 },
      navigation: { position: 'bottom', order: 2 },
      search: { position: 'top', order: 3 },
      calendar: { position: 'left', order: 4 },
      userProfile: { position: 'bottom', order: 5 },
      createButton: { position: 'sidebar', order: 1 },
      miniCalendar: { position: 'sidebar', order: 2 },
      myCalendars: { position: 'sidebar', order: 3 },
    },
    {
      sidebar: { position: 'left', order: 2 },
      navigation: { position: 'top', order: 1 },
      search: { position: 'top', order: 2 },
      calendar: { position: 'center', order: 3 },
      userProfile: { position: 'top', order: 4 },
      createButton: { position: 'navigation', order: 1 },
      miniCalendar: { position: 'floating', order: 2 },
      myCalendars: { position: 'sidebar', order: 3 },
    },
    {
      sidebar: { position: 'top', order: 1 },
      navigation: { position: 'top', order: 2 },
      search: { position: 'top', order: 3 },
      calendar: { position: 'bottom', order: 4 },
      userProfile: { position: 'top', order: 5 },
      createButton: { position: 'sidebar', order: 1 },
      miniCalendar: { position: 'sidebar', order: 2 },
      myCalendars: { position: 'sidebar', order: 3 },
    },
    {
      sidebar: { position: 'left', order: 1 },
      navigation: { position: 'right', order: 2 },
      search: { position: 'right', order: 3 },
      calendar: { position: 'center', order: 4 },
      userProfile: { position: 'right', order: 5 },
      createButton: { position: 'sidebar', order: 1 },
      miniCalendar: { position: 'sidebar', order: 2 },
      myCalendars: { position: 'sidebar', order: 3 },
    },
    {
      sidebar: { position: 'left', order: 1 },
      navigation: { position: 'bottom', order: 2 },
      search: { position: 'top', order: 3 },
      calendar: { position: 'center', order: 4 },
      userProfile: { position: 'bottom', order: 5 },
      createButton: { position: 'floating', order: 1 },
      miniCalendar: { position: 'floating', order: 2 },
      myCalendars: { position: 'sidebar', order: 3 },
    },
    {
      sidebar: { position: 'right', order: 2 },
      navigation: { position: 'left', order: 1 },
      search: { position: 'left', order: 3 },
      calendar: { position: 'center', order: 4 },
      userProfile: { position: 'left', order: 5 },
      createButton: { position: 'navigation', order: 1 },
      miniCalendar: { position: 'navigation', order: 2 },
      myCalendars: { position: 'sidebar', order: 3 },
    },
    {
      sidebar: { position: 'top', order: 2 },
      navigation: { position: 'top', order: 1 },
      search: { position: 'bottom', order: 3 },
      calendar: { position: 'center', order: 4 },
      userProfile: { position: 'top', order: 5 },
      createButton: { position: 'navigation', order: 1 },
      miniCalendar: { position: 'sidebar', order: 2 },
      myCalendars: { position: 'sidebar', order: 3 },
    },
  ];

  return layouts[seed - 1];
}

// Helper function to get URL search params
export function getSeedFromUrl(): number | undefined {
  if (typeof window === 'undefined') return undefined;

  const urlParams = new URLSearchParams(window.location.search);
  const seedParam = urlParams.get('seed-structure') ?? urlParams.get('seed');

  if (seedParam) {
    const seed = parseInt(seedParam, 10);
    if (seed >= 1 && seed <= 300) {
      return seed;
    }
  }

  return undefined;
}
