export interface SeedLayoutConfig {
  // Header layout
  headerOrder: string[];
  searchPosition: 'left' | 'center' | 'right' | 'full-width';
  navbarStyle: 'top' | 'side' | 'hidden-top' | 'floating';
  
  // Main content layout
  contentGrid: 'default' | 'reverse' | 'centered' | 'wide' | 'narrow';
  cardLayout: 'grid' | 'row' | 'column' | 'masonry';
  buttonStyle: 'default' | 'rounded' | 'outlined' | 'minimal';
  
  // Email-specific layout
  emailLayout: 'list' | 'card' | 'compact' | 'preview' | 'split';
  sidebarPosition: 'left' | 'right' | 'top' | 'bottom' | 'hidden';
  emailDensity: 'compact' | 'comfortable' | 'cozy';
  threadView: 'single' | 'conversation' | 'split';
  
  // Footer layout
  footerStyle: 'default' | 'minimal' | 'expanded' | 'centered';
  
  // Spacing and styling
  spacing: 'tight' | 'normal' | 'loose';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  
  // Color scheme variations
  colorScheme: 'default' | 'inverted' | 'monochrome' | 'accent';
  
  // Email-specific styling
  emailPreview: 'inline' | 'popup' | 'sidebar' | 'fullscreen';
  attachmentDisplay: 'list' | 'grid' | 'preview' | 'hidden';
  labelDisplay: 'inline' | 'badges' | 'chips' | 'hidden';
}

export function getSeedLayout(seed?: number): SeedLayoutConfig {
  // If no seed provided or dynamic HTML is disabled, return default
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

  // Special cases: New unique layouts for specific seeds
  const specialLayouts: { [key: number]: number } = {
    180: 11, // New Layout 11 - Ultra-wide layout
    190: 18, // New Layout 18 - Split-screen layout
    200: 20, // New Layout 20 - Asymmetric layout
    210: 14, // New Layout 14 - Dashboard-style layout
    250: 15, // New Layout 15 - Magazine-style layout
    260: 19, // New Layout 19 - Card-stack layout
    270: 17, // New Layout 17 - Premium showcase layout
  };

  if (specialLayouts[seed]) {
    return getLayoutByIndex(specialLayouts[seed]);
  }

  // Map seed (1-300) to layout index (1-10) using modulo for less obvious pattern
  // Examples: 300 -> 300%30=0 -> 0+1=1, 31 -> 31%30=1 -> 1+1=2, 76 -> 76%30=16 -> 16+1=17 -> 17%10=7
  // Use modulo 30 to get 0-29 range, then add 1 for 1-30, then modulo 10 for 1-10 range
  const layoutIndex = ((seed % 30) + 1) % 10 || 10;

  return getLayoutByIndex(layoutIndex);
}

function getLayoutByIndex(layoutIndex: number): SeedLayoutConfig {
  switch (layoutIndex) {
    case 1:
      // Classic Email-style layout - clean and familiar
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
        emailLayout: 'list',
        sidebarPosition: 'left',
        emailDensity: 'comfortable',
        threadView: 'single',
        emailPreview: 'sidebar',
        attachmentDisplay: 'list',
        labelDisplay: 'badges',
      };

    case 2:
      // Modern minimalist layout - clean and spacious
      return {
        headerOrder: ['logo', 'nav', 'search'],
        searchPosition: 'right',
        navbarStyle: 'top',
        contentGrid: 'centered',
        cardLayout: 'grid',
        buttonStyle: 'minimal',
        footerStyle: 'minimal',
        spacing: 'loose',
        borderRadius: 'large',
        colorScheme: 'monochrome',
        emailLayout: 'card',
        sidebarPosition: 'left',
        emailDensity: 'cozy',
        threadView: 'conversation',
        emailPreview: 'inline',
        attachmentDisplay: 'preview',
        labelDisplay: 'chips',
      };

    case 3:
      // Search-focused layout - emphasizes search functionality
      return {
        headerOrder: ['search', 'logo', 'nav'],
        searchPosition: 'full-width',
        navbarStyle: 'top',
        contentGrid: 'wide',
        cardLayout: 'masonry',
        buttonStyle: 'outlined',
        footerStyle: 'expanded',
        spacing: 'normal',
        borderRadius: 'small',
        colorScheme: 'accent',
        emailLayout: 'preview',
        sidebarPosition: 'left',
        emailDensity: 'compact',
        threadView: 'conversation',
        emailPreview: 'inline',
        attachmentDisplay: 'grid',
        labelDisplay: 'chips',
      };

    case 4:
      // Navigation-heavy layout - emphasizes navigation
      return {
        headerOrder: ['nav', 'logo', 'search'],
        searchPosition: 'left',
        navbarStyle: 'top',
        contentGrid: 'reverse',
        cardLayout: 'row',
        buttonStyle: 'rounded',
        footerStyle: 'centered',
        spacing: 'tight',
        borderRadius: 'large',
        colorScheme: 'inverted',
        emailLayout: 'split',
        sidebarPosition: 'top',
        emailDensity: 'compact',
        threadView: 'single',
        emailPreview: 'sidebar',
        attachmentDisplay: 'list',
        labelDisplay: 'inline',
      };

    case 5:
      // Compact layout - space-efficient design
      return {
        headerOrder: ['logo', 'search', 'nav'],
        searchPosition: 'center',
        navbarStyle: 'top',
        contentGrid: 'narrow',
        cardLayout: 'column',
        buttonStyle: 'default',
        footerStyle: 'minimal',
        spacing: 'tight',
        borderRadius: 'small',
        colorScheme: 'default',
        emailLayout: 'compact',
        sidebarPosition: 'left',
        emailDensity: 'compact',
        threadView: 'single',
        emailPreview: 'popup',
        attachmentDisplay: 'hidden',
        labelDisplay: 'inline',
      };

    case 6:
      // Floating header layout - modern floating design
      return {
        headerOrder: ['logo', 'nav', 'search'],
        searchPosition: 'right',
        navbarStyle: 'floating',
        contentGrid: 'default',
        cardLayout: 'grid',
        buttonStyle: 'rounded',
        footerStyle: 'default',
        spacing: 'normal',
        borderRadius: 'medium',
        colorScheme: 'accent',
        emailLayout: 'card',
        sidebarPosition: 'left',
        emailDensity: 'comfortable',
        threadView: 'conversation',
        emailPreview: 'sidebar',
        attachmentDisplay: 'preview',
        labelDisplay: 'badges',
      };

    case 7:
      // Hidden navigation layout - clean content focus
      return {
        headerOrder: ['logo', 'search', 'nav'],
        searchPosition: 'center',
        navbarStyle: 'hidden-top',
        contentGrid: 'centered',
        cardLayout: 'masonry',
        buttonStyle: 'minimal',
        footerStyle: 'expanded',
        spacing: 'loose',
        borderRadius: 'none',
        colorScheme: 'monochrome',
        emailLayout: 'preview',
        sidebarPosition: 'hidden',
        emailDensity: 'cozy',
        threadView: 'conversation',
        emailPreview: 'fullscreen',
        attachmentDisplay: 'grid',
        labelDisplay: 'chips',
      };

    case 8:
      // Wide layout - maximizes content area
      return {
        headerOrder: ['search', 'nav', 'logo'],
        searchPosition: 'full-width',
        navbarStyle: 'top',
        contentGrid: 'wide',
        cardLayout: 'row',
        buttonStyle: 'outlined',
        footerStyle: 'centered',
        spacing: 'normal',
        borderRadius: 'medium',
        colorScheme: 'inverted',
        emailLayout: 'split',
        sidebarPosition: 'right',
        emailDensity: 'comfortable',
        threadView: 'split',
        emailPreview: 'sidebar',
        attachmentDisplay: 'list',
        labelDisplay: 'badges',
      };

    case 9:
      // Side navigation layout - unique sidebar approach
      return {
        headerOrder: ['nav', 'logo', 'search'],
        searchPosition: 'center',
        navbarStyle: 'side',
        contentGrid: 'default',
        cardLayout: 'grid',
        buttonStyle: 'default',
        footerStyle: 'default',
        spacing: 'normal',
        borderRadius: 'medium',
        colorScheme: 'default',
        emailLayout: 'list',
        sidebarPosition: 'left',
        emailDensity: 'comfortable',
        threadView: 'single',
        emailPreview: 'sidebar',
        attachmentDisplay: 'list',
        labelDisplay: 'badges',
      };

    case 10:
      // Premium layout - sophisticated design
      return {
        headerOrder: ['logo', 'search', 'nav'],
        searchPosition: 'right',
        navbarStyle: 'top',
        contentGrid: 'reverse',
        cardLayout: 'masonry',
        buttonStyle: 'rounded',
        footerStyle: 'expanded',
        spacing: 'loose',
        borderRadius: 'large',
        colorScheme: 'accent',
        emailLayout: 'card',
        sidebarPosition: 'left',
        emailDensity: 'cozy',
        threadView: 'conversation',
        emailPreview: 'sidebar',
        attachmentDisplay: 'preview',
        labelDisplay: 'chips',
      };

    case 11:
      // Ultra-wide layout - maximizes screen real estate
      return {
        headerOrder: ['search', 'logo', 'nav'],
        searchPosition: 'full-width',
        navbarStyle: 'top',
        contentGrid: 'wide',
        cardLayout: 'row',
        buttonStyle: 'minimal',
        footerStyle: 'minimal',
        spacing: 'tight',
        borderRadius: 'none',
        colorScheme: 'monochrome',
        emailLayout: 'split',
        sidebarPosition: 'left',
        emailDensity: 'compact',
        threadView: 'split',
        emailPreview: 'sidebar',
        attachmentDisplay: 'list',
        labelDisplay: 'inline',
      };

    case 12:
      // Compact sidebar layout - space-efficient design
      return {
        headerOrder: ['nav', 'logo', 'search'],
        searchPosition: 'left',
        navbarStyle: 'top', // Changed from 'side' to 'top' for better visibility
        contentGrid: 'narrow',
        cardLayout: 'column',
        buttonStyle: 'outlined',
        footerStyle: 'default',
        spacing: 'tight',
        borderRadius: 'small',
        colorScheme: 'default',
        emailLayout: 'compact',
        sidebarPosition: 'left',
        emailDensity: 'compact',
        threadView: 'single',
        emailPreview: 'popup',
        attachmentDisplay: 'hidden',
        labelDisplay: 'inline',
      };

    case 13:
      // Minimalist centered layout - clean and focused
      return {
        headerOrder: ['logo', 'search', 'nav'],
        searchPosition: 'center',
        navbarStyle: 'hidden-top',
        contentGrid: 'centered',
        cardLayout: 'grid',
        buttonStyle: 'minimal',
        footerStyle: 'minimal',
        spacing: 'loose',
        borderRadius: 'large',
        colorScheme: 'monochrome',
        emailLayout: 'preview',
        sidebarPosition: 'hidden',
        emailDensity: 'cozy',
        threadView: 'conversation',
        emailPreview: 'fullscreen',
        attachmentDisplay: 'grid',
        labelDisplay: 'chips',
      };

    case 14:
      // Dashboard-style layout - data-focused design
      return {
        headerOrder: ['nav', 'search', 'logo'],
        searchPosition: 'right',
        navbarStyle: 'top',
        contentGrid: 'reverse',
        cardLayout: 'masonry',
        buttonStyle: 'default',
        footerStyle: 'expanded',
        spacing: 'normal',
        borderRadius: 'medium',
        colorScheme: 'inverted',
        emailLayout: 'card',
        sidebarPosition: 'left',
        emailDensity: 'comfortable',
        threadView: 'conversation',
        emailPreview: 'sidebar',
        attachmentDisplay: 'preview',
        labelDisplay: 'badges',
      };

    case 15:
      // Magazine-style layout - editorial design
      return {
        headerOrder: ['logo', 'nav', 'search'],
        searchPosition: 'full-width',
        navbarStyle: 'top',
        contentGrid: 'wide',
        cardLayout: 'masonry',
        buttonStyle: 'rounded',
        footerStyle: 'expanded',
        spacing: 'loose',
        borderRadius: 'large',
        colorScheme: 'accent',
        emailLayout: 'card',
        sidebarPosition: 'left',
        emailDensity: 'cozy',
        threadView: 'conversation',
        emailPreview: 'sidebar',
        attachmentDisplay: 'preview',
        labelDisplay: 'chips',
      };

    case 16:
      // Mobile-first layout - responsive design
      return {
        headerOrder: ['search', 'nav', 'logo'],
        searchPosition: 'center',
        navbarStyle: 'top', // Changed from 'floating' to 'top' for better visibility
        contentGrid: 'default',
        cardLayout: 'column',
        buttonStyle: 'rounded',
        footerStyle: 'default',
        spacing: 'normal',
        borderRadius: 'medium',
        colorScheme: 'default',
        emailLayout: 'list',
        sidebarPosition: 'bottom',
        emailDensity: 'comfortable',
        threadView: 'single',
        emailPreview: 'popup',
        attachmentDisplay: 'list',
        labelDisplay: 'badges',
      };

    case 17:
      // Premium showcase layout - luxury design
      return {
        headerOrder: ['logo', 'search', 'nav'],
        searchPosition: 'right',
        navbarStyle: 'top',
        contentGrid: 'centered',
        cardLayout: 'grid',
        buttonStyle: 'rounded',
        footerStyle: 'expanded',
        spacing: 'loose',
        borderRadius: 'large',
        colorScheme: 'accent',
        emailLayout: 'card',
        sidebarPosition: 'left',
        emailDensity: 'cozy',
        threadView: 'conversation',
        emailPreview: 'sidebar',
        attachmentDisplay: 'preview',
        labelDisplay: 'chips',
      };

    case 18:
      // Split-screen layout - dual-pane design
      return {
        headerOrder: ['logo', 'nav', 'search'],
        searchPosition: 'right',
        navbarStyle: 'top',
        contentGrid: 'reverse',
        cardLayout: 'row',
        buttonStyle: 'outlined',
        footerStyle: 'minimal',
        spacing: 'normal',
        borderRadius: 'medium',
        colorScheme: 'inverted',
        emailLayout: 'split',
        sidebarPosition: 'left',
        emailDensity: 'comfortable',
        threadView: 'split',
        emailPreview: 'sidebar',
        attachmentDisplay: 'list',
        labelDisplay: 'badges',
      };

    case 19:
      // Card-stack layout - layered design
      return {
        headerOrder: ['search', 'logo', 'nav'],
        searchPosition: 'center',
        navbarStyle: 'top',
        contentGrid: 'wide',
        cardLayout: 'masonry',
        buttonStyle: 'rounded',
        footerStyle: 'expanded',
        spacing: 'loose',
        borderRadius: 'large',
        colorScheme: 'accent',
        emailLayout: 'card',
        sidebarPosition: 'left',
        emailDensity: 'cozy',
        threadView: 'conversation',
        emailPreview: 'sidebar',
        attachmentDisplay: 'preview',
        labelDisplay: 'chips',
      };

    case 20:
      // Asymmetric layout - unbalanced design
      return {
        headerOrder: ['nav', 'search', 'logo'],
        searchPosition: 'left',
        navbarStyle: 'top',
        contentGrid: 'reverse',
        cardLayout: 'grid',
        buttonStyle: 'minimal',
        footerStyle: 'centered',
        spacing: 'tight',
        borderRadius: 'small',
        colorScheme: 'monochrome',
        emailLayout: 'list',
        sidebarPosition: 'right',
        emailDensity: 'compact',
        threadView: 'single',
        emailPreview: 'sidebar',
        attachmentDisplay: 'list',
        labelDisplay: 'inline',
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
    emailLayout: 'list',
    sidebarPosition: 'left',
    emailDensity: 'comfortable',
    threadView: 'single',
    emailPreview: 'sidebar',
    attachmentDisplay: 'list',
    labelDisplay: 'badges',
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
  email: string;
  sidebar: string;
  density: string;
  preview: string;
  attachments: string;
  labels: string;
} {
  return {
    header: getHeaderClasses(config),
    content: getContentClasses(config),
    cards: getCardClasses(config),
    buttons: getButtonClasses(config),
    footer: getFooterClasses(config),
    spacing: getSpacingClasses(config),
    email: getEmailClasses(config),
    sidebar: getSidebarClasses(config),
    density: getDensityClasses(config),
    preview: getPreviewClasses(config),
    attachments: getAttachmentClasses(config),
    labels: getLabelClasses(config),
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

function getEmailClasses(config: SeedLayoutConfig): string {
  const classes = [];
  
  switch (config.emailLayout) {
    case 'card':
      classes.push('email-card');
      break;
    case 'compact':
      classes.push('email-compact');
      break;
    case 'preview':
      classes.push('email-preview');
      break;
    case 'split':
      classes.push('email-split');
      break;
    default:
      classes.push('email-list');
  }
  
  return classes.join(' ');
}

function getSidebarClasses(config: SeedLayoutConfig): string {
  const classes = [];
  
  switch (config.sidebarPosition) {
    case 'right':
      classes.push('sidebar-right');
      break;
    case 'top':
      classes.push('sidebar-top');
      break;
    case 'bottom':
      classes.push('sidebar-bottom');
      break;
    case 'hidden':
      classes.push('sidebar-hidden');
      break;
    default:
      classes.push('sidebar-left');
  }
  
  return classes.join(' ');
}

function getDensityClasses(config: SeedLayoutConfig): string {
  const classes = [];
  
  switch (config.emailDensity) {
    case 'compact':
      classes.push('density-compact');
      break;
    case 'cozy':
      classes.push('density-cozy');
      break;
    default:
      classes.push('density-comfortable');
  }
  
  return classes.join(' ');
}

function getPreviewClasses(config: SeedLayoutConfig): string {
  const classes = [];
  
  switch (config.emailPreview) {
    case 'popup':
      classes.push('preview-popup');
      break;
    case 'sidebar':
      classes.push('preview-sidebar');
      break;
    case 'fullscreen':
      classes.push('preview-fullscreen');
      break;
    default:
      classes.push('preview-inline');
  }
  
  return classes.join(' ');
}

function getAttachmentClasses(config: SeedLayoutConfig): string {
  const classes = [];
  
  switch (config.attachmentDisplay) {
    case 'grid':
      classes.push('attachments-grid');
      break;
    case 'preview':
      classes.push('attachments-preview');
      break;
    case 'hidden':
      classes.push('attachments-hidden');
      break;
    default:
      classes.push('attachments-list');
  }
  
  return classes.join(' ');
}

function getLabelClasses(config: SeedLayoutConfig): string {
  const classes = [];
  
  switch (config.labelDisplay) {
    case 'badges':
      classes.push('labels-badges');
      break;
    case 'chips':
      classes.push('labels-chips');
      break;
    case 'hidden':
      classes.push('labels-hidden');
      break;
    default:
      classes.push('labels-inline');
  }
  
  return classes.join(' ');
}
