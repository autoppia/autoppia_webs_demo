export interface SeedLayoutConfig {
  headerOrder: string[];
  contentGrid: "default" | "reverse" | "centered" | "wide" | "narrow";
  buttonStyle: "default" | "rounded" | "outlined" | "minimal";
  spacing: "tight" | "normal" | "loose";
}

const DEFAULT_LAYOUT: SeedLayoutConfig = {
  headerOrder: ["logo", "nav", "search"],
  contentGrid: "default",
  buttonStyle: "default",
  spacing: "normal",
};

const truthy = (value?: string | null) =>
  typeof value === "string" &&
  ["true", "1", "yes", "on"].includes(value.toLowerCase());

const isDynamicFlagEnabled = (): boolean => {
  return (
    truthy(process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1) ||
    truthy(process.env.ENABLE_DYNAMIC_V1) ||
    truthy(process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3) ||
    truthy(process.env.ENABLE_DYNAMIC_V3) ||
    truthy(process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE) ||
    truthy(process.env.DYNAMIC_HTML_STRUCTURE)
  );
};

const TOTAL_LAYOUT_VARIANTS = 10;

export function isDynamicEnabled(): boolean {
  return isDynamicFlagEnabled();
}

export function getEffectiveLayoutConfig(seed?: number): SeedLayoutConfig {
  if (!isDynamicEnabled()) {
    return DEFAULT_LAYOUT;
  }
  return getSeedLayout(seed);
}

export function getSeedLayout(seed?: number): SeedLayoutConfig {
  if (!seed || seed < 1 || seed > 300) {
    return DEFAULT_LAYOUT;
  }

  if (seed % 10 === 5) {
    return getLayoutByIndex(2);
  }

  const layoutIndex = ((Math.floor(seed) - 1) % TOTAL_LAYOUT_VARIANTS) + 1;
  return getLayoutByIndex(layoutIndex);
}

function getLayoutByIndex(layoutIndex: number): SeedLayoutConfig {
  switch (layoutIndex) {
    case 1:
      return {
        headerOrder: ["logo", "nav", "search"],
        contentGrid: "default",
        buttonStyle: "default",
        spacing: "normal",
      };
    case 2:
      return {
        headerOrder: ["logo", "search", "nav"],
        contentGrid: "centered",
        buttonStyle: "minimal",
        spacing: "loose",
      };
    case 3:
      return {
        headerOrder: ["search", "logo", "nav"],
        contentGrid: "wide",
        buttonStyle: "outlined",
        spacing: "normal",
      };
    case 4:
      return {
        headerOrder: ["nav", "logo", "search"],
        contentGrid: "reverse",
        buttonStyle: "rounded",
        spacing: "tight",
      };
    case 5:
      return {
        headerOrder: ["logo", "nav", "cta"],
        contentGrid: "centered",
        buttonStyle: "rounded",
        spacing: "normal",
      };
    case 6:
      return {
        headerOrder: ["logo", "nav", "support"],
        contentGrid: "wide",
        buttonStyle: "minimal",
        spacing: "loose",
      };
    case 7:
      return {
        headerOrder: ["nav", "search", "logo"],
        contentGrid: "reverse",
        buttonStyle: "outlined",
        spacing: "normal",
      };
    case 8:
      return {
        headerOrder: ["logo", "cta", "nav"],
        contentGrid: "default",
        buttonStyle: "default",
        spacing: "tight",
      };
    case 9:
      return {
        headerOrder: ["cta", "logo", "nav"],
        contentGrid: "centered",
        buttonStyle: "rounded",
        spacing: "normal",
      };
    case 10:
      return {
        headerOrder: ["support", "logo", "nav"],
        contentGrid: "wide",
        buttonStyle: "minimal",
        spacing: "loose",
      };
    default:
      return DEFAULT_LAYOUT;
  }
}

export function getLayoutClasses(config: SeedLayoutConfig): {
  header: string;
  content: string;
  buttons: string;
  spacing: string;
} {
  return {
    header: `header-${config.headerOrder.join("-")}`,
    content: `content-${config.contentGrid}`,
    buttons: `buttons-${config.buttonStyle}`,
    spacing: `spacing-${config.spacing}`,
  };
}
