export interface LayoutVariant {
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
  cssClasses: {
    sidebar: string;
    navigation: string;
    search: string;
    calendar: string;
    calendarGrid: string;
    calendarAgenda: string;
    calendarWeek: string;
    calendarDashboard: string;
    eventList: string;
    eventItem: string;
    addEventButton: string;
    searchInput: string;
    calendarSelector: string;
  };
}

export const LAYOUT_VARIANTS: LayoutVariant[] = [
  {
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
    cssClasses: {
      sidebar: 'classic-sidebar',
      navigation: 'classic-nav',
      search: 'classic-search',
      calendar: 'classic-calendar',
      calendarGrid: 'calendar-grid',
      calendarAgenda: 'calendar-agenda',
      calendarWeek: 'calendar-weekly',
      calendarDashboard: 'calendar-dashboard',
      eventList: 'event-list',
      eventItem: 'event-item',
      addEventButton: 'add-event-btn',
      searchInput: 'search-input',
      calendarSelector: 'calendar-selector'
    }
  },
  {
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
    cssClasses: {
      sidebar: 'agenda-sidebar',
      navigation: 'agenda-nav',
      search: 'agenda-search',
      calendar: 'agenda-calendar',
      calendarGrid: 'agenda-grid',
      calendarAgenda: 'agenda-items',
      calendarWeek: 'agenda-week',
      calendarDashboard: 'agenda-dashboard',
      eventList: 'agenda-list',
      eventItem: 'agenda-event',
      addEventButton: 'agenda-add-btn',
      searchInput: 'agenda-search-input',
      calendarSelector: 'agenda-selector'
    }
  },
  {
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
    cssClasses: {
      sidebar: 'split-sidebar',
      navigation: 'split-nav',
      search: 'split-search',
      calendar: 'split-calendar',
      calendarGrid: 'split-grid',
      calendarAgenda: 'split-agenda',
      calendarWeek: 'split-week',
      calendarDashboard: 'split-dashboard',
      eventList: 'split-list',
      eventItem: 'split-event',
      addEventButton: 'split-add-btn',
      searchInput: 'split-search-input',
      calendarSelector: 'split-selector'
    }
  },
  {
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
    cssClasses: {
      sidebar: 'minimal-sidebar',
      navigation: 'minimal-nav',
      search: 'minimal-search',
      calendar: 'minimal-calendar',
      calendarGrid: 'minimal-grid',
      calendarAgenda: 'minimal-agenda',
      calendarWeek: 'minimal-week',
      calendarDashboard: 'minimal-dashboard',
      eventList: 'minimal-list',
      eventItem: 'minimal-event',
      addEventButton: 'minimal-add-btn',
      searchInput: 'minimal-search-input',
      calendarSelector: 'minimal-selector'
    }
  },
  {
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
    cssClasses: {
      sidebar: 'dashboard-sidebar',
      navigation: 'dashboard-nav',
      search: 'dashboard-search',
      calendar: 'dashboard-calendar',
      calendarGrid: 'dashboard-grid',
      calendarAgenda: 'dashboard-agenda',
      calendarWeek: 'dashboard-week',
      calendarDashboard: 'dashboard-widget',
      eventList: 'dashboard-list',
      eventItem: 'dashboard-event',
      addEventButton: 'dashboard-add-btn',
      searchInput: 'dashboard-search-input',
      calendarSelector: 'dashboard-selector'
    }
  },
  {
    id: 6,
    name: "Weekly Focus",
    description: "Focus on weekly view layout",
    layout: {
      sidebar: 'top',
      navigation: 'top',
      search: 'top',
      calendar: 'bottom',
      userProfile: 'top',
      createButton: 'sidebar',
      miniCalendar: 'sidebar',
      myCalendars: 'sidebar'
    },
    cssClasses: {
      sidebar: 'weekly-sidebar',
      navigation: 'weekly-nav',
      search: 'weekly-search',
      calendar: 'weekly-calendar',
      calendarGrid: 'weekly-grid',
      calendarAgenda: 'weekly-agenda',
      calendarWeek: 'weekly-focus',
      calendarDashboard: 'weekly-dashboard',
      eventList: 'weekly-list',
      eventItem: 'weekly-event',
      addEventButton: 'weekly-add-btn',
      searchInput: 'weekly-search-input',
      calendarSelector: 'weekly-selector'
    }
  },
  {
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
    cssClasses: {
      sidebar: 'ultra-sidebar',
      navigation: 'ultra-nav',
      search: 'ultra-search',
      calendar: 'ultra-calendar',
      calendarGrid: 'ultra-grid',
      calendarAgenda: 'ultra-agenda',
      calendarWeek: 'ultra-week',
      calendarDashboard: 'ultra-dashboard',
      eventList: 'ultra-list',
      eventItem: 'ultra-event',
      addEventButton: 'ultra-add-btn',
      searchInput: 'ultra-search-input',
      calendarSelector: 'ultra-selector'
    }
  },
  {
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
    cssClasses: {
      sidebar: 'kanban-sidebar',
      navigation: 'kanban-nav',
      search: 'kanban-search',
      calendar: 'kanban-calendar',
      calendarGrid: 'kanban-grid',
      calendarAgenda: 'kanban-agenda',
      calendarWeek: 'kanban-week',
      calendarDashboard: 'kanban-dashboard',
      eventList: 'kanban-list',
      eventItem: 'kanban-event',
      addEventButton: 'kanban-add-btn',
      searchInput: 'kanban-search-input',
      calendarSelector: 'kanban-selector'
    }
  },
  {
    id: 9,
    name: "Mobile-first",
    description: "Touch-optimized mobile layout",
    layout: {
      sidebar: 'right',
      navigation: 'left',
      search: 'left',
      calendar: 'center',
      userProfile: 'left',
      createButton: 'navigation',
      miniCalendar: 'navigation',
      myCalendars: 'sidebar'
    },
    cssClasses: {
      sidebar: 'mobile-sidebar',
      navigation: 'mobile-nav',
      search: 'mobile-search',
      calendar: 'mobile-calendar',
      calendarGrid: 'mobile-grid',
      calendarAgenda: 'mobile-agenda',
      calendarWeek: 'mobile-week',
      calendarDashboard: 'mobile-dashboard',
      eventList: 'mobile-list',
      eventItem: 'mobile-event',
      addEventButton: 'mobile-add-btn',
      searchInput: 'mobile-search-input',
      calendarSelector: 'mobile-selector'
    }
  },
  {
    id: 10,
    name: "Magazine Style Agenda",
    description: "Article-style agenda layout",
    layout: {
      sidebar: 'top',
      navigation: 'top',
      search: 'bottom',
      calendar: 'center',
      userProfile: 'top',
      createButton: 'navigation',
      miniCalendar: 'sidebar',
      myCalendars: 'sidebar'
    },
    cssClasses: {
      sidebar: 'magazine-sidebar',
      navigation: 'magazine-nav',
      search: 'magazine-search',
      calendar: 'magazine-calendar',
      calendarGrid: 'magazine-grid',
      calendarAgenda: 'magazine-agenda',
      calendarWeek: 'magazine-week',
      calendarDashboard: 'magazine-dashboard',
      eventList: 'magazine-list',
      eventItem: 'magazine-event',
      addEventButton: 'magazine-add-btn',
      searchInput: 'magazine-search-input',
      calendarSelector: 'magazine-selector'
    }
  }
];

// Helper function to get layout variant by index
export function getLayoutVariant(index: number): LayoutVariant {
  const variant = LAYOUT_VARIANTS.find(v => v.id === index);
  return variant || LAYOUT_VARIANTS[0]; // Default to first layout
}
