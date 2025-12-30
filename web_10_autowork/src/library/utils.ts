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
  if (!seed || seed < 1 || seed > 300) {
    return defaultLayout;
  }

  // Seed-based layouts
  const layouts: Record<number, LayoutConfig> = {
    1: {
      mainSections: ['experts', 'jobs', 'hires'],
      postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
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
      postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
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
      postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
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
      postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
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
      postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
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
      postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
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
      postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
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
      postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
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
      postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
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
      postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
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
    },
    11: {
      mainSections: ['jobs', 'hires', 'experts'],
      postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
      expertSections: ['profile', 'sidebar', 'stats', 'about', 'reviews'],
      hireFormSections: ['jobDetails', 'expertSummary', 'contractTerms'],
      formFields: {
        skills: ['selected', 'popular', 'search'],
        budget: ['type', 'increase', 'rate'],
        scope: ['size', 'duration'],
      },
      buttonPositions: {
        postJob: 'center',
        back: 'right',
        submit: 'left',
        close: 'top-right',
        hire: 'center',
        cancel: 'left',
      }
    },
    12: {
      mainSections: ['hires', 'jobs', 'experts'],
      postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
      expertSections: ['stats', 'profile', 'reviews', 'about', 'sidebar'],
      hireFormSections: ['contractTerms', 'jobDetails', 'expertSummary'],
      formFields: {
        skills: ['popular', 'search', 'selected'],
        budget: ['increase', 'rate', 'type'],
        scope: ['duration', 'size'],
      },
      buttonPositions: {
        postJob: 'right',
        back: 'center',
        submit: 'center',
        close: 'bottom-left',
        hire: 'right',
        cancel: 'center',
      }
    },
    13: {
      mainSections: ['experts', 'jobs', 'hires'],
      postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
      expertSections: ['about', 'reviews', 'profile', 'stats', 'sidebar'],
      hireFormSections: ['expertSummary', 'contractTerms', 'jobDetails'],
      formFields: {
        skills: ['search', 'selected', 'popular'],
        budget: ['rate', 'increase', 'type'],
        scope: ['size', 'duration'],
      },
      buttonPositions: {
        postJob: 'left',
        back: 'left',
        submit: 'right',
        close: 'top-left',
        hire: 'left',
        cancel: 'center',
      }
    },
    14: {
      mainSections: ['jobs', 'experts', 'hires'],
      postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
      expertSections: ['reviews', 'stats', 'sidebar', 'about', 'profile'],
      hireFormSections: ['jobDetails', 'expertSummary', 'contractTerms'],
      formFields: {
        skills: ['selected', 'search', 'popular'],
        budget: ['increase', 'type', 'rate'],
        scope: ['duration', 'size'],
      },
      buttonPositions: {
        postJob: 'center',
        back: 'center',
        submit: 'right',
        close: 'bottom-right',
        hire: 'center',
        cancel: 'right',
      }
    },
    15: {
      mainSections: ['hires', 'experts', 'jobs'],
      postJobSections: ['title', 'skills', 'scope', 'budget', 'description'],
      expertSections: ['stats', 'profile', 'about', 'sidebar', 'reviews'],
      hireFormSections: ['contractTerms', 'expertSummary', 'jobDetails'],
      formFields: {
        skills: ['popular', 'selected', 'search'],
        budget: ['type', 'rate', 'increase'],
        scope: ['size', 'duration'],
      },
      buttonPositions: {
        postJob: 'right',
        back: 'left',
        submit: 'center',
        close: 'top-right',
        hire: 'right',
        cancel: 'left',
      }
    }
  };

  const layoutKeys = Object.keys(layouts)
    .map((key) => Number.parseInt(key, 10))
    .filter((num) => !Number.isNaN(num))
    .sort((a, b) => a - b);

  if (layoutKeys.length === 0) {
    return defaultLayout;
  }

  const normalizedSeed = seed && seed > 0 ? seed : 1;
  const mappedKey = layoutKeys[(normalizedSeed - 1) % layoutKeys.length];

  return layouts[mappedKey] || defaultLayout;
}
