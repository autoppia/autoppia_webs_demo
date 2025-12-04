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

// LAYOUT FIJO - Layout 16 (correspondiente a seed 36)
// Mobile-first layout - responsive design
const FIXED_LAYOUT: SeedLayoutConfig = {
  headerOrder: ['search', 'nav', 'logo'],
  searchPosition: 'center',
  navbarStyle: 'top',
  contentGrid: 'default',
  cardLayout: 'column',
  buttonStyle: 'rounded',
  footerStyle: 'default',
  spacing: 'normal',
  borderRadius: 'medium',
  colorScheme: 'default',
};

export function getSeedLayout(seed?: number): SeedLayoutConfig {
  // LAYOUT FIJO - Siempre devolver Layout 16 (correspondiente a seed 36)
  return FIXED_LAYOUT;
}

function getLayoutByIndex(layoutIndex: number): SeedLayoutConfig {
  // LAYOUT FIJO - Siempre devolver Layout 16 (correspondiente a seed 36)
  return FIXED_LAYOUT;
}

function getDefaultLayout(): SeedLayoutConfig {
  // LAYOUT FIJO - Siempre devolver Layout 16 (correspondiente a seed 36)
  return FIXED_LAYOUT;
}

// Helper function to check if dynamic HTML is enabled
export function isDynamicEnabled(): boolean {
  return false; // Siempre deshabilitado - el layout nunca cambia (fijado a seed 36, layout 16)
}

// Helper function to get effective layout config
export function getEffectiveLayoutConfig(seed?: number): SeedLayoutConfig {
  // LAYOUT FIJO - Siempre devolver Layout 16 (correspondiente a seed 36)
  return FIXED_LAYOUT;
}

export function applyLayoutOverrides(
  config: SeedLayoutConfig,
  baseSeed?: number
): SeedLayoutConfig {
  // LAYOUT FIJO - Ya no se aplican overrides, siempre retornar el config original
  // (layout fijado a seed 36, layout 16)
  return config;
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
