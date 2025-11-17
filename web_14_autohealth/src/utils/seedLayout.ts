export interface SeedLayoutConfig {
  headerOrder: string[];
  contentGrid: 'default' | 'reverse' | 'centered' | 'wide' | 'narrow';
  buttonStyle: 'default' | 'rounded' | 'outlined' | 'minimal';
  spacing: 'tight' | 'normal' | 'loose';
}

export function isDynamicEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 === 'true';
}

export function getEffectiveLayoutConfig(seed?: number): SeedLayoutConfig {
  if (!isDynamicEnabled()) {
    return getDefaultLayout();
  }
  return getSeedLayout(seed);
}

export function getSeedLayout(seed?: number): SeedLayoutConfig {
  if (!seed || seed < 1 || seed > 300) {
    return getDefaultLayout();
  }

  if (seed % 10 === 5) {
    return getLayoutByIndex(2);
  }

  const layoutIndex = ((seed % 30) + 1) % 10 || 10;
  return getLayoutByIndex(layoutIndex);
}

function getLayoutByIndex(layoutIndex: number): SeedLayoutConfig {
  switch (layoutIndex) {
    case 1:
      return {
        headerOrder: ['logo', 'nav', 'search'],
        contentGrid: 'default',
        buttonStyle: 'default',
        spacing: 'normal'
      };
    case 2:
      return {
        headerOrder: ['logo', 'search', 'nav'],
        contentGrid: 'centered',
        buttonStyle: 'minimal',
        spacing: 'loose'
      };
    case 3:
      return {
        headerOrder: ['search', 'logo', 'nav'],
        contentGrid: 'wide',
        buttonStyle: 'outlined',
        spacing: 'normal'
      };
    case 4:
      return {
        headerOrder: ['nav', 'logo', 'search'],
        contentGrid: 'reverse',
        buttonStyle: 'rounded',
        spacing: 'tight'
      };
    default:
      return getDefaultLayout();
  }
}

function getDefaultLayout(): SeedLayoutConfig {
  return {
    headerOrder: ['logo', 'nav', 'search'],
    contentGrid: 'default',
    buttonStyle: 'default',
    spacing: 'normal'
  };
}

export function getLayoutClasses(config: SeedLayoutConfig): {
  header: string;
  content: string;
  buttons: string;
  spacing: string;
} {
  return {
    header: `header-${config.headerOrder.join('-')}`,
    content: `content-${config.contentGrid}`,
    buttons: `buttons-${config.buttonStyle}`,
    spacing: `spacing-${config.spacing}`
  };
}


