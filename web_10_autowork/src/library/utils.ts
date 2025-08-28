import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface LayoutConfig {
  // Main page sections order
  mainSections: string[];
  // Post job wizard sections order
  postJobSections: string[];
  // Expert page sections order
  expertSections: string[];
  // Hire form sections order
  hireFormSections: string[];
  // Form field orders within sections
  formFields: Record<string, string[]>;
  // Button positions
  buttonPositions: Record<string, 'left' | 'right' | 'center' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>;
}

export function getSeedLayout(seed?: number): LayoutConfig {
  // Default layout (when no seed or invalid seed)
  const defaultLayout: LayoutConfig = {
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
  };

  // If no seed or invalid seed, return default
  if (!seed || seed < 1 || seed > 10) {
    return defaultLayout;
  }

  // Seed-based layouts
  const layouts: Record<number, LayoutConfig> = {
    1: {
      mainSections: ['experts', 'jobs', 'hires'],
      postJobSections: ['skills', 'title', 'scope', 'budget', 'description'],
      expertSections: ['stats', 'profile', 'about', 'reviews', 'sidebar'],
      hireFormSections: ['expertSummary', 'jobDetails', 'contractTerms'],
      formFields: {
        skills: ['popular', 'search', 'selected'],
        budget: ['rate', 'type', 'increase'],
        scope: ['duration', 'size'],
      },
      buttonPositions: {
        postJob: 'left',
        back: 'right',
        submit: 'left',
        close: 'top-left',
        hire: 'left',
        cancel: 'right',
      }
    },
    2: {
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
    3: {
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
    4: {
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
    5: {
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
    6: {
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
    7: {
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
    8: {
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
    9: {
      mainSections: ['jobs', 'experts', 'hires'],
      postJobSections: ['budget', 'scope', 'title', 'skills', 'description'],
      expertSections: ['sidebar', 'reviews', 'profile', 'stats', 'about'],
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
        close: 'top-left',
        hire: 'right',
        cancel: 'left',
      }
    },
    10: {
      mainSections: ['experts', 'hires', 'jobs'],
      postJobSections: ['title', 'budget', 'skills', 'description', 'scope'],
      expertSections: ['stats', 'sidebar', 'profile', 'about', 'reviews'],
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
        close: 'bottom-right',
        hire: 'left',
        cancel: 'right',
      }
    }
  };

  return layouts[seed] || defaultLayout;
}

// Helper function to get URL search params
export function getSeedFromURL(): number | undefined {
  if (typeof window === 'undefined') return undefined;
  
  const urlParams = new URLSearchParams(window.location.search);
  const seedParam = urlParams.get('seed');
  
  if (seedParam) {
    const seed = parseInt(seedParam, 10);
    if (seed >= 1 && seed <= 10) {
      return seed;
    }
  }
  
  return undefined;
}

// Helper function to reorder array based on layout config
export function reorderArray<T>(array: T[], order: string[], keyMap: Record<string, T>): T[] {
  const result: T[] = [];
  
  for (const key of order) {
    if (keyMap[key] !== undefined) {
      result.push(keyMap[key]);
    }
  }
  
  // Add any remaining items that weren't in the order
  for (const item of array) {
    if (!result.includes(item)) {
      result.push(item);
    }
  }
  
  return result;
}
