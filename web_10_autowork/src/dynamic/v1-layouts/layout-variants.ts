export interface LayoutVariant {
  id: number;
  name: string;
  description: string;
  layout: {
    sidebar: 'left' | 'right' | 'top' | 'bottom' | 'hidden';
    toolbar: 'top' | 'bottom' | 'left' | 'right' | 'floating';
    jobList: 'left' | 'right' | 'top' | 'bottom' | 'center';
    jobView: 'right' | 'left' | 'bottom' | 'modal' | 'fullscreen' | 'center';
    postJobButton: 'top-right' | 'bottom-right' | 'center' | 'floating' | 'sidebar' | 'top-left';
  };
  xpaths: {
    jobItem: string;
    hireButton: string;
    checkbox: string;
    deleteButton: string;
    postJobButton: string;
    searchInput: string;
    themeToggle: string;
    skillSelector: string;
    submitButton: string;
    saveDraftButton: string;
  };
  styles: {
    container: string;
    sidebar: string;
    toolbar: string;
    jobList: string;
    jobView: string;
  };
  // Section ordering for different pages
  mainSections: string[];
  postJobSections: string[];
  expertSections: string[];
  hireFormSections: string[];
  formFields: Record<string, string[]>;
  buttonPositions: Record<string, 'left' | 'right' | 'center' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>;
}

export const LAYOUT_VARIANTS: LayoutVariant[] = [
  {
    id: 1,
    name: "Classic Work Platform",
    description: "Traditional work platform layout",
    layout: {
      sidebar: 'left',
      toolbar: 'top',
      jobList: 'left',
      jobView: 'right',
      postJobButton: 'top-right'
    },
    xpaths: {
      jobItem: "//div[contains(@class, 'job-item-hover')]",
      hireButton: "//button[contains(@class, 'opacity-0')]//*[name()='svg']",
      checkbox: "//input[@type='checkbox']",
      deleteButton: "//button[contains(text(), 'Delete')]",
      postJobButton: "//button[contains(text(), 'Post a job')]",
      searchInput: "//input[@placeholder*='Search']",
      themeToggle: "//button[contains(@class, 'theme-toggle')]",
      skillSelector: "//button[contains(text(), 'Skills')]",
      submitButton: "//button[contains(text(), 'Submit')]",
      saveDraftButton: "//button[contains(text(), 'Save')]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "fixed inset-y-0 left-0 z-40 w-64",
      toolbar: "border-b border-border",
      jobList: "flex-1",
      jobView: "flex-1"
    },
    mainSections: ['jobs', 'hires', 'experts'],
    postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
    expertSections: ['profile', 'stats', 'about', 'reviews', 'sidebar'],
    hireFormSections: ['jobDetails', 'contractTerms', 'expertSummary'],
    formFields: {
      skills: ['search', 'popular', 'selected'],
      budget: ['type', 'rate', 'increase'],
      scope: ['size', 'duration'],
    },
    buttonPositions: {
      postJob: 'right',
      back: 'left',
      submit: 'right',
      close: 'top-right',
      hire: 'right',
      cancel: 'left',
    }
  },
  {
    id: 2,
    name: "Right Sidebar",
    description: "Sidebar on the right side",
    layout: {
      sidebar: 'right',
      toolbar: 'top',
      jobList: 'left',
      jobView: 'center',
      postJobButton: 'bottom-right'
    },
    xpaths: {
      jobItem: "//div[contains(@class, 'job-container')]",
      hireButton: "//div[contains(@class, 'hire-container')]//*[name()='svg']",
      checkbox: "//div[contains(@class, 'select-box')]//input",
      deleteButton: "//div[contains(@class, 'action-bar')]//button[1]",
      postJobButton: "//div[contains(@class, 'post-job-fab')]//button",
      searchInput: "//div[contains(@class, 'search-container')]//input",
      themeToggle: "//div[contains(@class, 'settings-panel')]//button[2]",
      skillSelector: "//div[contains(@class, 'skill-panel')]//button",
      submitButton: "//div[contains(@class, 'submit-actions')]//button[1]",
      saveDraftButton: "//div[contains(@class, 'submit-actions')]//button[2]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "fixed inset-y-0 right-0 z-40 w-64",
      toolbar: "border-b border-border",
      jobList: "flex-1 mr-64",
      jobView: "flex-1 mr-64"
    },
    mainSections: ['hires', 'experts', 'jobs'],
    postJobSections: ['description', 'title', 'skills', 'scope', 'budget'],
    expertSections: ['about', 'profile', 'stats', 'sidebar', 'reviews'],
    hireFormSections: ['contractTerms', 'expertSummary', 'jobDetails'],
    formFields: {
      skills: ['selected', 'popular', 'search'],
      budget: ['increase', 'rate', 'type'],
      scope: ['size', 'duration'],
    },
    buttonPositions: {
      postJob: 'center',
      back: 'center',
      submit: 'center',
      close: 'bottom-right',
      hire: 'center',
      cancel: 'center',
    }
  },
  {
    id: 3,
    name: "Top Navigation",
    description: "Navigation at the top with floating sidebar",
    layout: {
      sidebar: 'top',
      toolbar: 'top',
      jobList: 'center',
      jobView: 'bottom',
      postJobButton: 'floating'
    },
    xpaths: {
      jobItem: "//section[contains(@class, 'job-card')]",
      hireButton: "//section[contains(@class, 'job-card')]//div[contains(@class, 'hire-icon')]",
      checkbox: "//section[contains(@class, 'job-card')]//div[contains(@class, 'select-icon')]",
      deleteButton: "//nav[contains(@class, 'action-nav')]//button[contains(@class, 'delete-btn')]",
      postJobButton: "//div[contains(@class, 'floating-post-job')]//button",
      searchInput: "//header[contains(@class, 'search-header')]//input",
      themeToggle: "//header[contains(@class, 'search-header')]//button[contains(@class, 'theme-btn')]",
      skillSelector: "//nav[contains(@class, 'action-nav')]//button[contains(@class, 'skill-btn')]",
      submitButton: "//div[contains(@class, 'submit-footer')]//button[contains(@class, 'submit-btn')]",
      saveDraftButton: "//div[contains(@class, 'submit-footer')]//button[contains(@class, 'save-btn')]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "w-full h-16 border-b border-border",
      toolbar: "border-b border-border",
      jobList: "flex-1 mt-16",
      jobView: "flex-1 mt-16"
    },
    mainSections: ['jobs', 'experts', 'hires'],
    postJobSections: ['scope', 'skills', 'title', 'budget', 'description'],
    expertSections: ['reviews', 'stats', 'profile', 'about', 'sidebar'],
    hireFormSections: ['jobDetails', 'contractTerms', 'expertSummary'],
    formFields: {
      skills: ['search', 'selected', 'popular'],
      budget: ['type', 'increase', 'rate'],
      scope: ['duration', 'size'],
    },
    buttonPositions: {
      postJob: 'right',
      back: 'left',
      submit: 'right',
      close: 'bottom-left',
      hire: 'right',
      cancel: 'left',
    }
  },
  {
    id: 4,
    name: "Split View",
    description: "Three-panel split layout",
    layout: {
      sidebar: 'left',
      toolbar: 'top',
      jobList: 'center',
      jobView: 'right',
      postJobButton: 'sidebar'
    },
    xpaths: {
      jobItem: "//article[contains(@class, 'job-entry')]",
      hireButton: "//article[contains(@class, 'job-entry')]//span[contains(@class, 'hire-element')]",
      checkbox: "//article[contains(@class, 'job-entry')]//span[contains(@class, 'check-element')]",
      deleteButton: "//div[contains(@class, 'bulk-actions')]//span[contains(@class, 'delete-element')]",
      postJobButton: "//aside[contains(@class, 'sidebar-panel')]//span[contains(@class, 'post-job-element')]",
      searchInput: "//header[contains(@class, 'toolbar-header')]//span[contains(@class, 'search-element')]",
      themeToggle: "//header[contains(@class, 'toolbar-header')]//span[contains(@class, 'theme-element')]",
      skillSelector: "//div[contains(@class, 'bulk-actions')]//span[contains(@class, 'skill-element')]",
      submitButton: "//div[contains(@class, 'submit-panel')]//span[contains(@class, 'submit-element')]",
      saveDraftButton: "//div[contains(@class, 'submit-panel')]//span[contains(@class, 'save-element')]"
    },
    styles: {
      container: "h-screen flex bg-background",
      sidebar: "w-64 border-r border-border",
      toolbar: "absolute top-0 left-0 right-0 h-16 border-b border-border z-10",
      jobList: "w-1/2 border-r border-border",
      jobView: "w-1/2"
    },
    mainSections: ['experts', 'hires', 'jobs'],
    postJobSections: ['budget', 'description', 'title', 'skills', 'scope'],
    expertSections: ['sidebar', 'about', 'profile', 'stats', 'reviews'],
    hireFormSections: ['expertSummary', 'jobDetails', 'contractTerms'],
    formFields: {
      skills: ['popular', 'selected', 'search'],
      budget: ['rate', 'type', 'increase'],
      scope: ['size', 'duration'],
    },
    buttonPositions: {
      postJob: 'left',
      back: 'right',
      submit: 'left',
      close: 'top-right',
      hire: 'left',
      cancel: 'right',
    }
  },
  {
    id: 5,
    name: "Card Layout",
    description: "Job items as cards in a grid",
    layout: {
      sidebar: 'hidden',
      toolbar: 'top',
      jobList: 'center',
      jobView: 'modal',
      postJobButton: 'top-right'
    },
    xpaths: {
      jobItem: "//div[contains(@class, 'job-card')]",
      hireButton: "//div[contains(@class, 'job-card')]//div[contains(@class, 'card-hire')]",
      checkbox: "//div[contains(@class, 'job-card')]//div[contains(@class, 'card-check')]",
      deleteButton: "//div[contains(@class, 'card-actions')]//div[contains(@class, 'card-delete')]",
      postJobButton: "//div[contains(@class, 'header-actions')]//div[contains(@class, 'header-post-job')]",
      searchInput: "//div[contains(@class, 'search-wrapper')]//div[contains(@class, 'search-field')]",
      themeToggle: "//div[contains(@class, 'header-actions')]//div[contains(@class, 'header-theme')]",
      skillSelector: "//div[contains(@class, 'card-actions')]//div[contains(@class, 'card-skill')]",
      submitButton: "//div[contains(@class, 'modal-actions')]//div[contains(@class, 'modal-submit')]",
      saveDraftButton: "//div[contains(@class, 'modal-actions')]//div[contains(@class, 'modal-save')]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "hidden",
      toolbar: "border-b border-border",
      jobList: "flex-1 p-4",
      jobView: "fixed inset-0 z-50 bg-background"
    },
    mainSections: ['hires', 'jobs', 'experts'],
    postJobSections: ['title', 'description', 'skills', 'scope', 'budget'],
    expertSections: ['profile', 'reviews', 'stats', 'about', 'sidebar'],
    hireFormSections: ['contractTerms', 'expertSummary', 'jobDetails'],
    formFields: {
      skills: ['selected', 'search', 'popular'],
      budget: ['increase', 'type', 'rate'],
      scope: ['duration', 'size'],
    },
    buttonPositions: {
      postJob: 'center',
      back: 'center',
      submit: 'center',
      close: 'top-left',
      hire: 'center',
      cancel: 'center',
    }
  },
  {
    id: 6,
    name: "Minimalist",
    description: "Clean, minimal interface",
    layout: {
      sidebar: 'left',
      toolbar: 'bottom',
      jobList: 'center',
      jobView: 'right',
      postJobButton: 'center'
    },
    xpaths: {
      jobItem: "//li[contains(@class, 'job-row')]",
      hireButton: "//li[contains(@class, 'job-row')]//i[contains(@class, 'hire-icon')]",
      checkbox: "//li[contains(@class, 'job-row')]//input[contains(@class, 'row-check')]",
      deleteButton: "//ul[contains(@class, 'action-list')]//li[contains(@class, 'delete-item')]",
      postJobButton: "//div[contains(@class, 'center-actions')]//button[contains(@class, 'center-post-job')]",
      searchInput: "//div[contains(@class, 'bottom-toolbar')]//input[contains(@class, 'bottom-search')]",
      themeToggle: "//div[contains(@class, 'bottom-toolbar')]//button[contains(@class, 'bottom-theme')]",
      skillSelector: "//ul[contains(@class, 'action-list')]//li[contains(@class, 'skill-item')]",
      submitButton: "//div[contains(@class, 'submit-controls')]//button[contains(@class, 'control-submit')]",
      saveDraftButton: "//div[contains(@class, 'submit-controls')]//button[contains(@class, 'control-save')]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "w-48 border-r border-border",
      toolbar: "border-t border-border",
      jobList: "flex-1 ml-48",
      jobView: "flex-1 ml-48"
    },
    mainSections: ['jobs', 'hires', 'experts'],
    postJobSections: ['skills', 'scope', 'title', 'budget', 'description'],
    expertSections: ['stats', 'about', 'profile', 'reviews', 'sidebar'],
    hireFormSections: ['jobDetails', 'expertSummary', 'contractTerms'],
    formFields: {
      skills: ['search', 'popular', 'selected'],
      budget: ['type', 'rate', 'increase'],
      scope: ['size', 'duration'],
    },
    buttonPositions: {
      postJob: 'right',
      back: 'left',
      submit: 'right',
      close: 'bottom-right',
      hire: 'right',
      cancel: 'left',
    }
  },
  {
    id: 7,
    name: "Dashboard Style",
    description: "Dashboard-like layout with widgets",
    layout: {
      sidebar: 'left',
      toolbar: 'top',
      jobList: 'center',
      jobView: 'right',
      postJobButton: 'floating'
    },
    xpaths: {
      jobItem: "//div[contains(@class, 'widget-job')]",
      hireButton: "//div[contains(@class, 'widget-job')]//div[contains(@class, 'widget-hire')]",
      checkbox: "//div[contains(@class, 'widget-job')]//div[contains(@class, 'widget-check')]",
      deleteButton: "//div[contains(@class, 'widget-actions')]//div[contains(@class, 'widget-delete')]",
      postJobButton: "//div[contains(@class, 'floating-widget')]//div[contains(@class, 'widget-post-job')]",
      searchInput: "//div[contains(@class, 'dashboard-header')]//div[contains(@class, 'header-search')]",
      themeToggle: "//div[contains(@class, 'dashboard-header')]//div[contains(@class, 'header-theme')]",
      skillSelector: "//div[contains(@class, 'widget-actions')]//div[contains(@class, 'widget-skill')]",
      submitButton: "//div[contains(@class, 'submit-widget')]//div[contains(@class, 'widget-submit')]",
      saveDraftButton: "//div[contains(@class, 'submit-widget')]//div[contains(@class, 'widget-save')]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "w-72 border-r border-border",
      toolbar: "border-b border-border",
      jobList: "flex-1 ml-72",
      jobView: "flex-1 ml-72"
    },
    mainSections: ['experts', 'jobs', 'hires'],
    postJobSections: ['description', 'skills', 'title', 'scope', 'budget'],
    expertSections: ['about', 'stats', 'profile', 'sidebar', 'reviews'],
    hireFormSections: ['expertSummary', 'contractTerms', 'jobDetails'],
    formFields: {
      skills: ['popular', 'search', 'selected'],
      budget: ['rate', 'increase', 'type'],
      scope: ['duration', 'size'],
    },
    buttonPositions: {
      postJob: 'left',
      back: 'right',
      submit: 'left',
      close: 'bottom-left',
      hire: 'left',
      cancel: 'right',
    }
  },
  {
    id: 8,
    name: "Mobile First",
    description: "Mobile-optimized layout",
    layout: {
      sidebar: 'bottom',
      toolbar: 'top',
      jobList: 'center',
      jobView: 'fullscreen',
      postJobButton: 'bottom-right'
    },
    xpaths: {
      jobItem: "//div[contains(@class, 'mobile-job')]",
      hireButton: "//div[contains(@class, 'mobile-job')]//div[contains(@class, 'mobile-hire')]",
      checkbox: "//div[contains(@class, 'mobile-job')]//div[contains(@class, 'mobile-check')]",
      deleteButton: "//div[contains(@class, 'mobile-actions')]//div[contains(@class, 'mobile-delete')]",
      postJobButton: "//div[contains(@class, 'mobile-fab')]//div[contains(@class, 'fab-post-job')]",
      searchInput: "//div[contains(@class, 'mobile-header')]//div[contains(@class, 'header-search')]",
      themeToggle: "//div[contains(@class, 'mobile-header')]//div[contains(@class, 'header-theme')]",
      skillSelector: "//div[contains(@class, 'mobile-actions')]//div[contains(@class, 'mobile-skill')]",
      submitButton: "//div[contains(@class, 'mobile-submit')]//div[contains(@class, 'submit-submit')]",
      saveDraftButton: "//div[contains(@class, 'mobile-submit')]//div[contains(@class, 'submit-save')]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "fixed bottom-0 left-0 right-0 h-16 border-t border-border",
      toolbar: "border-b border-border",
      jobList: "flex-1 mb-16",
      jobView: "fixed inset-0 z-50 bg-background"
    },
    mainSections: ['hires', 'experts', 'jobs'],
    postJobSections: ['scope', 'title', 'skills', 'budget', 'description'],
    expertSections: ['reviews', 'profile', 'stats', 'about', 'sidebar'],
    hireFormSections: ['contractTerms', 'jobDetails', 'expertSummary'],
    formFields: {
      skills: ['selected', 'popular', 'search'],
      budget: ['increase', 'rate', 'type'],
      scope: ['size', 'duration'],
    },
    buttonPositions: {
      postJob: 'center',
      back: 'center',
      submit: 'center',
      close: 'top-right',
      hire: 'center',
      cancel: 'center',
    }
  },
  {
    id: 9,
    name: "Terminal Style",
    description: "Command-line inspired interface",
    layout: {
      sidebar: 'right',
      toolbar: 'top',
      jobList: 'left',
      jobView: 'center',
      postJobButton: 'top-left'
    },
    xpaths: {
      jobItem: "//div[contains(@class, 'terminal-line')]",
      hireButton: "//div[contains(@class, 'terminal-line')]//span[contains(@class, 'line-hire')]",
      checkbox: "//div[contains(@class, 'terminal-line')]//span[contains(@class, 'line-check')]",
      deleteButton: "//div[contains(@class, 'terminal-actions')]//span[contains(@class, 'action-delete')]",
      postJobButton: "//div[contains(@class, 'terminal-header')]//span[contains(@class, 'header-post-job')]",
      searchInput: "//div[contains(@class, 'terminal-header')]//span[contains(@class, 'header-search')]",
      themeToggle: "//div[contains(@class, 'terminal-header')]//span[contains(@class, 'header-theme')]",
      skillSelector: "//div[contains(@class, 'terminal-actions')]//span[contains(@class, 'action-skill')]",
      submitButton: "//div[contains(@class, 'terminal-submit')]//span[contains(@class, 'submit-submit')]",
      saveDraftButton: "//div[contains(@class, 'terminal-submit')]//span[contains(@class, 'submit-save')]"
    },
    styles: {
      container: "h-screen flex bg-background font-mono",
      sidebar: "w-64 border-l border-border",
      toolbar: "border-b border-border",
      jobList: "w-1/3 border-r border-border",
      jobView: "flex-1"
    },
    mainSections: ['jobs', 'hires', 'experts'],
    postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
    expertSections: ['profile', 'stats', 'about', 'reviews', 'sidebar'],
    hireFormSections: ['jobDetails', 'contractTerms', 'expertSummary'],
    formFields: {
      skills: ['search', 'popular', 'selected'],
      budget: ['type', 'rate', 'increase'],
      scope: ['size', 'duration'],
    },
    buttonPositions: {
      postJob: 'right',
      back: 'left',
      submit: 'right',
      close: 'top-right',
      hire: 'right',
      cancel: 'left',
    }
  },
  {
    id: 10,
    name: "Magazine Layout",
    description: "Magazine-style grid layout",
    layout: {
      sidebar: 'top',
      toolbar: 'top',
      jobList: 'center',
      jobView: 'right',
      postJobButton: 'floating'
    },
    xpaths: {
      jobItem: "//article[contains(@class, 'magazine-article')]",
      hireButton: "//article[contains(@class, 'magazine-article')]//div[contains(@class, 'article-hire')]",
      checkbox: "//article[contains(@class, 'magazine-article')]//div[contains(@class, 'article-check')]",
      deleteButton: "//div[contains(@class, 'magazine-actions')]//div[contains(@class, 'action-delete')]",
      postJobButton: "//div[contains(@class, 'floating-magazine')]//div[contains(@class, 'magazine-post-job')]",
      searchInput: "//div[contains(@class, 'magazine-header')]//div[contains(@class, 'header-search')]",
      themeToggle: "//div[contains(@class, 'magazine-header')]//div[contains(@class, 'header-theme')]",
      skillSelector: "//div[contains(@class, 'magazine-actions')]//div[contains(@class, 'action-skill')]",
      submitButton: "//div[contains(@class, 'magazine-submit')]//div[contains(@class, 'submit-submit')]",
      saveDraftButton: "//div[contains(@class, 'magazine-submit')]//div[contains(@class, 'submit-save')]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "w-full h-20 border-b border-border",
      toolbar: "border-b border-border",
      jobList: "flex-1 mt-20",
      jobView: "flex-1 mt-20"
    },
    mainSections: ['experts', 'jobs', 'hires'],
    postJobSections: ['description', 'title', 'skills', 'scope', 'budget'],
    expertSections: ['about', 'profile', 'stats', 'reviews', 'sidebar'],
    hireFormSections: ['expertSummary', 'jobDetails', 'contractTerms'],
    formFields: {
      skills: ['search', 'selected', 'popular'],
      budget: ['type', 'increase', 'rate'],
      scope: ['duration', 'size'],
    },
    buttonPositions: {
      postJob: 'center',
      back: 'center',
      submit: 'center',
      close: 'bottom-left',
      hire: 'center',
      cancel: 'center',
    }
  }
];

export function getLayoutVariant(seed: number): LayoutVariant {
  return LAYOUT_VARIANTS[0]; // Static layout
}

export function getSeedFromUrl(): number {
  if (typeof window === 'undefined') return 1;
  
  const urlParams = new URLSearchParams(window.location.search);
  const seedParam = urlParams.get('seed');
  
  if (seedParam) {
    const seed = parseInt(seedParam, 10);
    if (seed >= 1 && seed <= 300) {
      return seed;
    }
  }
  
  // No seed parameter or invalid seed - return 1 (default variant)
  return 1;
}
