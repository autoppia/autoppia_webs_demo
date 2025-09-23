export interface SeedLayoutConfig {
  // Header layout
  headerOrder: string[];
  searchPosition: 'left' | 'center' | 'right' | 'full-width';
  navbarStyle: 'top' | 'side' | 'hidden-top' | 'floating';
  
  // Main content layout
  contentGrid: 'default' | 'reverse' | 'centered' | 'wide' | 'narrow';
  cardLayout: 'grid' | 'row' | 'column' | 'masonry';
  buttonStyle: 'default' | 'rounded' | 'outlined' | 'minimal';
  
  // Footer layout
  footerStyle: 'default' | 'minimal' | 'expanded' | 'centered';
  
  // Spacing and styling
  spacing: 'tight' | 'normal' | 'loose';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  
  // Color scheme variations
  colorScheme: 'default' | 'inverted' | 'monochrome' | 'accent';
}

export function getSeedLayout(seed?: number): SeedLayoutConfig {
  // If no seed provided or dynamic HTML is disabled, return default
  if (!seed || seed < 1 || seed > 10) {
    return getDefaultLayout();
  }

  switch (seed) {
    case 1:
      return {
        headerOrder: ['logo', 'search', 'nav'],
        searchPosition: 'center',
        navbarStyle: 'top',
        contentGrid: 'default',
        cardLayout: 'grid',
        buttonStyle: 'default',
        footerStyle: 'default',
        spacing: 'normal',
        borderRadius: 'medium',
        colorScheme: 'default',
      };

    case 2:
      return {
        headerOrder: ['nav', 'search', 'logo'],
        searchPosition: 'right',
        navbarStyle: 'side',
        contentGrid: 'reverse',
        cardLayout: 'row',
        buttonStyle: 'rounded',
        footerStyle: 'minimal',
        spacing: 'tight',
        borderRadius: 'large',
        colorScheme: 'inverted',
      };

    case 3:
      return {
        headerOrder: ['search', 'logo', 'nav'],
        searchPosition: 'left',
        navbarStyle: 'hidden-top',
        contentGrid: 'centered',
        cardLayout: 'column',
        buttonStyle: 'outlined',
        footerStyle: 'expanded',
        spacing: 'loose',
        borderRadius: 'small',
        colorScheme: 'monochrome',
      };

    case 4:
      return {
        headerOrder: ['logo', 'nav', 'search'],
        searchPosition: 'full-width',
        navbarStyle: 'floating',
        contentGrid: 'wide',
        cardLayout: 'masonry',
        buttonStyle: 'minimal',
        footerStyle: 'centered',
        spacing: 'normal',
        borderRadius: 'none',
        colorScheme: 'accent',
      };

    case 5:
      return {
        headerOrder: ['nav', 'logo', 'search'],
        searchPosition: 'center',
        navbarStyle: 'top',
        contentGrid: 'narrow',
        cardLayout: 'grid',
        buttonStyle: 'rounded',
        footerStyle: 'default',
        spacing: 'tight',
        borderRadius: 'large',
        colorScheme: 'default',
      };

    case 6:
      return {
        headerOrder: ['search', 'nav', 'logo'],
        searchPosition: 'right',
        navbarStyle: 'side',
        contentGrid: 'reverse',
        cardLayout: 'row',
        buttonStyle: 'outlined',
        footerStyle: 'minimal',
        spacing: 'loose',
        borderRadius: 'medium',
        colorScheme: 'inverted',
      };

    case 7:
      return {
        headerOrder: ['logo', 'search', 'nav'],
        searchPosition: 'left',
        navbarStyle: 'hidden-top',
        contentGrid: 'centered',
        cardLayout: 'column',
        buttonStyle: 'minimal',
        footerStyle: 'expanded',
        spacing: 'normal',
        borderRadius: 'small',
        colorScheme: 'monochrome',
      };

    case 8:
      return {
        headerOrder: ['nav', 'search', 'logo'],
        searchPosition: 'full-width',
        navbarStyle: 'floating',
        contentGrid: 'wide',
        cardLayout: 'masonry',
        buttonStyle: 'default',
        footerStyle: 'centered',
        spacing: 'tight',
        borderRadius: 'none',
        colorScheme: 'accent',
      };

    case 9:
      return {
        headerOrder: ['search', 'logo', 'nav'],
        searchPosition: 'center',
        navbarStyle: 'top',
        contentGrid: 'narrow',
        cardLayout: 'grid',
        buttonStyle: 'rounded',
        footerStyle: 'default',
        spacing: 'loose',
        borderRadius: 'large',
        colorScheme: 'default',
      };

    case 10:
      return {
        headerOrder: ['logo', 'nav', 'search'],
        searchPosition: 'right',
        navbarStyle: 'side',
        contentGrid: 'reverse',
        cardLayout: 'row',
        buttonStyle: 'outlined',
        footerStyle: 'minimal',
        spacing: 'normal',
        borderRadius: 'medium',
        colorScheme: 'inverted',
      };

    default:
      return getDefaultLayout();
  }
}

function getDefaultLayout(): SeedLayoutConfig {
  return {
    headerOrder: ['logo', 'search', 'nav'],
    searchPosition: 'center',
    navbarStyle: 'top',
    contentGrid: 'default',
    cardLayout: 'grid',
    buttonStyle: 'default',
    footerStyle: 'default',
    spacing: 'normal',
    borderRadius: 'medium',
    colorScheme: 'default',
  };
}

// Helper function to check if dynamic HTML is enabled
export function isDynamicEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML === 'true';
}

// Helper function to get effective layout config
export function getEffectiveLayoutConfig(seed?: number): SeedLayoutConfig {
  if (!isDynamicEnabled()) {
    return getDefaultLayout();
  }
  return getSeedLayout(seed);
}

// Helper function to generate CSS classes based on layout config
export function getLayoutClasses(config: SeedLayoutConfig): {
  header: string;
  content: string;
  cards: string;
  buttons: string;
  footer: string;
  spacing: string;
} {
  return {
    header: getHeaderClasses(config),
    content: getContentClasses(config),
    cards: getCardClasses(config),
    buttons: getButtonClasses(config),
    footer: getFooterClasses(config),
    spacing: getSpacingClasses(config),
  };
}

function getHeaderClasses(config: SeedLayoutConfig): string {
  const classes = [];
  
  // Search position
  switch (config.searchPosition) {
    case 'left':
      classes.push('search-left');
      break;
    case 'right':
      classes.push('search-right');
      break;
    case 'full-width':
      classes.push('search-full-width');
      break;
    default:
      classes.push('search-center');
  }
  
  // Navbar style
  switch (config.navbarStyle) {
    case 'side':
      classes.push('navbar-side');
      break;
    case 'hidden-top':
      classes.push('navbar-hidden-top');
      break;
    case 'floating':
      classes.push('navbar-floating');
      break;
    default:
      classes.push('navbar-top');
  }
  
  return classes.join(' ');
}

function getContentClasses(config: SeedLayoutConfig): string {
  const classes = [];
  
  switch (config.contentGrid) {
    case 'reverse':
      classes.push('content-reverse');
      break;
    case 'centered':
      classes.push('content-centered');
      break;
    case 'wide':
      classes.push('content-wide');
      break;
    case 'narrow':
      classes.push('content-narrow');
      break;
    default:
      classes.push('content-default');
  }
  
  return classes.join(' ');
}

function getCardClasses(config: SeedLayoutConfig): string {
  const classes = [];
  
  switch (config.cardLayout) {
    case 'row':
      classes.push('cards-row');
      break;
    case 'column':
      classes.push('cards-column');
      break;
    case 'masonry':
      classes.push('cards-masonry');
      break;
    default:
      classes.push('cards-grid');
  }
  
  return classes.join(' ');
}

function getButtonClasses(config: SeedLayoutConfig): string {
  const classes = [];
  
  switch (config.buttonStyle) {
    case 'rounded':
      classes.push('buttons-rounded');
      break;
    case 'outlined':
      classes.push('buttons-outlined');
      break;
    case 'minimal':
      classes.push('buttons-minimal');
      break;
    default:
      classes.push('buttons-default');
  }
  
  return classes.join(' ');
}

function getFooterClasses(config: SeedLayoutConfig): string {
  const classes = [];
  
  switch (config.footerStyle) {
    case 'minimal':
      classes.push('footer-minimal');
      break;
    case 'expanded':
      classes.push('footer-expanded');
      break;
    case 'centered':
      classes.push('footer-centered');
      break;
    default:
      classes.push('footer-default');
  }
  
  return classes.join(' ');
}

function getSpacingClasses(config: SeedLayoutConfig): string {
  const classes = [];
  
  switch (config.spacing) {
    case 'tight':
      classes.push('spacing-tight');
      break;
    case 'loose':
      classes.push('spacing-loose');
      break;
    default:
      classes.push('spacing-normal');
  }
  
  return classes.join(' ');
}
