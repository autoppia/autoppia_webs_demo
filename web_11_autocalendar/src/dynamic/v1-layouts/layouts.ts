// src/utils/seedLayout.ts
// Enhanced seed layout system supporting 1-300 range with calendar-specific layouts

export interface SeedLayoutConfig {
  id: number;
  name: string;
  description: string;
  layout: {
    sidebar: 'left' | 'right' | 'top' | 'bottom' | 'none';
    navigation: 'top' | 'bottom' | 'left' | 'right' | 'none';
    search: 'top' | 'bottom' | 'left' | 'right' | 'none';
    calendar: 'center' | 'left' | 'right' | 'top' | 'bottom';
    userProfile: 'top' | 'bottom' | 'left' | 'right' | 'none';
    createButton: 'sidebar' | 'navigation' | 'floating' | 'none';
    miniCalendar: 'sidebar' | 'navigation' | 'floating' | 'none';
    myCalendars: 'sidebar' | 'navigation' | 'floating' | 'none';
  };
  xpaths: {
    calendarCell: string;
    addEventButton: string;
    eventItem: string;
    searchInput: string;
    calendarSelector: string;
  };
}

const TOTAL_LAYOUT_VARIANTS = 20;

/**
 * LAYOUT FIJO - Siempre como seed 1 (Layout 1)
 * Tu sitio web es lo que es, sin variaciones
 * La seed en la URL se mantiene pero no afecta el layout
 */
export function getSeedLayout(seed?: number): SeedLayoutConfig {
  // LAYOUT FIJO - Siempre devolver Layout 1 (seed 1)
  return getLayoutByIndex(1);
}

export function getLayoutClasses(seed?: number): string {
  const config = getSeedLayout(seed);
  return `layout-${config.id} ${config.name.toLowerCase().replace(/\s+/g, '-')}`;
}

function getLayoutByIndex(layoutIndex: number): SeedLayoutConfig {
  switch (layoutIndex) {
    case 1:
      return {
        id: 1,
        name: "Classic Month Grid",
        description: "Traditional calendar grid layout",
        layout: {
          sidebar: 'left',
          navigation: 'top',
          search: 'top',
          calendar: 'center',
          userProfile: 'top',
          createButton: 'sidebar',
          miniCalendar: 'sidebar',
          myCalendars: 'sidebar'
        },
        xpaths: {
          calendarCell: "//div[contains(@class, 'calendar-cell')]",
          addEventButton: "//button[contains(@class, 'add-event-btn')]",
          eventItem: "//div[contains(@class, 'event-item')]",
          searchInput: "//input[@placeholder='Search events']",
          calendarSelector: "//button[contains(@class, 'calendar-selector')]"
        }
      };

    case 2:
      return {
        id: 2,
        name: "Agenda View",
        description: "Focus on agenda-style list layout",
        layout: {
          sidebar: 'right',
          navigation: 'left',
          search: 'top',
          calendar: 'right',
          userProfile: 'top',
          createButton: 'navigation',
          miniCalendar: 'navigation',
          myCalendars: 'navigation'
        },
        xpaths: {
          calendarCell: "//div[@data-view='agenda']",
          addEventButton: "//button[@data-action='create-event']",
          eventItem: "//li[@class='agenda-event']",
          searchInput: "//input[@data-search='events']",
          calendarSelector: "//select[@name='calendar-filter']"
        }
      };

    case 3:
      return {
        id: 3,
        name: "Split View",
        description: "Split screen with month and agenda",
        layout: {
          sidebar: 'bottom',
          navigation: 'top',
          search: 'top',
          calendar: 'center',
          userProfile: 'top',
          createButton: 'floating',
          miniCalendar: 'sidebar',
          myCalendars: 'sidebar'
        },
        xpaths: {
          calendarCell: "//div[@data-mode='split']",
          addEventButton: "//button[@id='floating-add']",
          eventItem: "//div[@data-type='event']",
          searchInput: "//input[@id='event-search']",
          calendarSelector: "//div[@class='calendar-picker']"
        }
      };

    case 4:
      return {
        id: 4,
        name: "Minimalist",
        description: "Clean minimal design focus",
        layout: {
          sidebar: 'right',
          navigation: 'bottom',
          search: 'top',
          calendar: 'left',
          userProfile: 'bottom',
          createButton: 'sidebar',
          miniCalendar: 'sidebar',
          myCalendars: 'sidebar'
        },
        xpaths: {
          calendarCell: "//td[@role='gridcell']",
          addEventButton: "//button[text()='+']",
          eventItem: "//span[@class='event-title']",
          searchInput: "//input[@type='search']",
          calendarSelector: "//button[@aria-label='Choose calendar']"
        }
      };

    case 5:
      return {
        id: 5,
        name: "Dashboard-style",
        description: "Widget-based layout with calendar",
        layout: {
          sidebar: 'left',
          navigation: 'top',
          search: 'top',
          calendar: 'center',
          userProfile: 'top',
          createButton: 'navigation',
          miniCalendar: 'floating',
          myCalendars: 'sidebar'
        },
        xpaths: {
          calendarCell: "//div[@data-widget='calendar']",
          addEventButton: "//button[@data-dashboard='action']",
          eventItem: "//div[@class='widget-event']",
          searchInput: "//input[@data-widget='search']",
          calendarSelector: "//div[@data-widget='selector']"
        }
      };

    case 6:
      return {
        id: 6,
        name: "Minimalist",
        description: "Clean minimal design focus",
        layout: {
          sidebar: 'right',
          navigation: 'bottom',
          search: 'top',
          calendar: 'left',
          userProfile: 'bottom',
          createButton: 'sidebar',
          miniCalendar: 'sidebar',
          myCalendars: 'sidebar'
        },
        xpaths: {
          calendarCell: "//td[@role='gridcell']",
          addEventButton: "//button[text()='+']",
          eventItem: "//span[@class='event-title']",
          searchInput: "//input[@type='search']",
          calendarSelector: "//button[@aria-label='Choose calendar']"
        }
      };

    case 7:
      return {
        id: 7,
        name: "Ultra-wide Timeline",
        description: "Extra wide timeline view",
        layout: {
          sidebar: 'left',
          navigation: 'right',
          search: 'right',
          calendar: 'center',
          userProfile: 'right',
          createButton: 'sidebar',
          miniCalendar: 'sidebar',
          myCalendars: 'sidebar'
        },
        xpaths: {
          calendarCell: "//div[@data-timeline='wide']",
          addEventButton: "//button[@data-wide='add']",
          eventItem: "//div[@data-timeline-event]",
          searchInput: "//input[@data-timeline='search']",
          calendarSelector: "//div[@data-timeline='selector']"
        }
      };

    case 8:
      return {
        id: 8,
        name: "Kanban-Style Events",
        description: "Kanban board for events",
        layout: {
          sidebar: 'left',
          navigation: 'bottom',
          search: 'top',
          calendar: 'center',
          userProfile: 'bottom',
          createButton: 'floating',
          miniCalendar: 'floating',
          myCalendars: 'sidebar'
        },
        xpaths: {
          calendarCell: "//div[@data-kanban='true']",
          addEventButton: "//button[@data-kanban-add]",
          eventItem: "//div[@class='kanban-event']",
          searchInput: "//input[@data-kanban-search]",
          calendarSelector: "//button[@data-kanban-cal]"
        }
      };

    case 9:
      return {
        id: 9,
        name: "Minimalist",
        description: "Clean minimal design focus",
        layout: {
          sidebar: 'right',
          navigation: 'bottom',
          search: 'top',
          calendar: 'left',
          userProfile: 'bottom',
          createButton: 'sidebar',
          miniCalendar: 'sidebar',
          myCalendars: 'sidebar'
        },
        xpaths: {
          calendarCell: "//td[@role='gridcell']",
          addEventButton: "//button[text()='+']",
          eventItem: "//span[@class='event-title']",
          searchInput: "//input[@type='search']",
          calendarSelector: "//button[@aria-label='Choose calendar']"
        }
      };

    case 10:
      return {
        id: 10,
        name: "Minimalist",
        description: "Clean minimal design focus",
        layout: {
          sidebar: 'right',
          navigation: 'bottom',
          search: 'top',
          calendar: 'left',
          userProfile: 'bottom',
          createButton: 'sidebar',
          miniCalendar: 'sidebar',
          myCalendars: 'sidebar'
        },
        xpaths: {
          calendarCell: "//td[@role='gridcell']",
          addEventButton: "//button[text()='+']",
          eventItem: "//span[@class='event-title']",
          searchInput: "//input[@type='search']",
          calendarSelector: "//button[@aria-label='Choose calendar']"
        }
      };

    case 11: // Ultra-wide Timeline
      return {
        id: 11,
        name: "Ultra-wide Timeline",
        description: "Wide timeline for detailed planning",
        layout: {
          sidebar: 'none',
          navigation: 'top',
          search: 'top',
          calendar: 'center',
          userProfile: 'top',
          createButton: 'floating',
          miniCalendar: 'floating',
          myCalendars: 'floating'
        },
        xpaths: {
          calendarCell: "//div[@data-ultra-wide='true']",
          addEventButton: "//button[@data-ultra-add]",
          eventItem: "//div[@data-ultra-event]",
          searchInput: "//input[@data-ultra-search]",
          calendarSelector: "//div[@data-ultra-selector]"
        }
      };

    case 14: // Dashboard-style
      return {
        id: 14,
        name: "Dashboard Calendar",
        description: "Widget-based dashboard layout",
        layout: {
          sidebar: 'left',
          navigation: 'top',
          search: 'top',
          calendar: 'center',
          userProfile: 'top',
          createButton: 'navigation',
          miniCalendar: 'sidebar',
          myCalendars: 'sidebar'
        },
        xpaths: {
          calendarCell: "//div[@data-dashboard='calendar']",
          addEventButton: "//button[@data-dashboard-add]",
          eventItem: "//div[@data-dashboard-event]",
          searchInput: "//input[@data-dashboard-search]",
          calendarSelector: "//div[@data-dashboard-picker]"
        }
      };

    case 15: // Magazine-style
      return {
        id: 15,
        name: "Magazine Agenda",
        description: "Article-style event layout",
        layout: {
          sidebar: 'right',
          navigation: 'top',
          search: 'top',
          calendar: 'center',
          userProfile: 'top',
          createButton: 'floating',
          miniCalendar: 'sidebar',
          myCalendars: 'sidebar'
        },
        xpaths: {
          calendarCell: "//article[@data-magazine='calendar']",
          addEventButton: "//button[@data-magazine-add]",
          eventItem: "//article[@data-magazine-event]",
          searchInput: "//input[@data-magazine-search]",
          calendarSelector: "//nav[@data-magazine-nav]"
        }
      };

    case 17: // Premium showcase
      return {
        id: 17,
        name: "Premium Calendar Showcase",
        description: "High-end calendar interface",
        layout: {
          sidebar: 'right',
          navigation: 'top',
          search: 'top',
          calendar: 'center',
          userProfile: 'top',
          createButton: 'floating',
          miniCalendar: 'sidebar',
          myCalendars: 'sidebar'
        },
        xpaths: {
          calendarCell: "//div[@data-premium='calendar']",
          addEventButton: "//button[@data-premium-add]",
          eventItem: "//div[@data-premium-event]",
          searchInput: "//input[@data-premium-search]",
          calendarSelector: "//div[@data-premium-selector]"
        }
      };

    case 18: // Split View with Events
      return {
        id: 18,
        name: "Split Events View",
        description: "Split screen for events management",
        layout: {
          sidebar: 'left',
          navigation: 'top',
          search: 'top',
          calendar: 'center',
          userProfile: 'top',
          createButton: 'sidebar',
          miniCalendar: 'sidebar',
          myCalendars: 'sidebar'
        },
        xpaths: {
          calendarCell: "//div[@data-split='calendar']",
          addEventButton: "//button[@data-split-add]",
          eventItem: "//div[@data-split-event]",
          searchInput: "//input[@data-split-search]",
          calendarSelector: "//div[@data-split-picker]"
        }
      };

    case 19: // Kanban-style
      return {
        id: 19,
        name: "Kanban Events Board",
        description: "Kanban board for event management",
        layout: {
          sidebar: 'left',
          navigation: 'top',
          search: 'top',
          calendar: 'center',
          userProfile: 'top',
          createButton: 'floating',
          miniCalendar: 'sidebar',
          myCalendars: 'sidebar'
        },
        xpaths: {
          calendarCell: "//div[@data-kanban-board='calendar']",
          addEventButton: "//button[@data-kanban-board-add]",
          eventItem: "//div[@data-kanban-board-event]",
          searchInput: "//input[@data-kanban-board-search]",
          calendarSelector: "//div[@data-kanban-board-picker]"
        }
      };

    case 20: // Asymmetric Calendar
      return {
        id: 20,
        name: "Asymmetric Calendar",
        description: "Asymmetric layout for unique design",
        layout: {
          sidebar: 'right',
          navigation: 'top',
          search: 'top',
          calendar: 'center',
          userProfile: 'top',
          createButton: 'floating',
          miniCalendar: 'sidebar',
          myCalendars: 'sidebar'
        },
        xpaths: {
          calendarCell: "//div[@data-asymmetric='calendar']",
          addEventButton: "//button[@data-asymmetric-add]",
          eventItem: "//div[@data-asymmetric-event]",
          searchInput: "//input[@data-asymmetric-search]",
          calendarSelector: "//div[@data-asymmetric-selector]"
        }
      };

    default:
      return getDefaultLayout();
  }
}

function getDefaultLayout(): SeedLayoutConfig {
  return {
    id: 1,
    name: "Classic Month Grid",
    description: "Default traditional calendar layout",
    layout: {
      sidebar: 'left',
      navigation: 'top',
      search: 'top',
      calendar: 'center',
      userProfile: 'top',
      createButton: 'sidebar',
      miniCalendar: 'sidebar',
      myCalendars: 'sidebar'
    },
    xpaths: {
      calendarCell: "//div[contains(@class, 'calendar-cell')]",
      addEventButton: "//button[contains(@class, 'add-event-btn')]",
      eventItem: "//div[contains(@class, 'event-item')]",
      searchInput: "//input[@placeholder='Search events']",
      calendarSelector: "//button[contains(@class, 'calendar-selector')]"
    }
  };
}

// Helper function to check if dynamic HTML is enabled
export function isDynamicEnabled(): boolean {
  return false; // Siempre deshabilitado - el layout nunca cambia
}

// Helper function to get effective layout config
export function getEffectiveLayoutConfig(seed?: number): SeedLayoutConfig {
  // Siempre devolver el layout fijo de seed 1, ignorando la seed
  return getLayoutByIndex(1);
}

// Helper function to get URL search params with seed validation
export function getSeedFromUrl(): number {
  if (typeof window === 'undefined') return 1;

  const urlParams = new URLSearchParams(window.location.search);
  const seedParam = urlParams.get('seed-structure') ?? urlParams.get('seed');

  if (seedParam) {
    const seed = parseInt(seedParam, 10);
    if (seed >= 1 && seed <= 300) {
      return seed;
    }
  }

  return 1;
}
