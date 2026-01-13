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

export function isDynamicEnabled(): boolean {
  return false; // Siempre deshabilitado - el layout nunca cambia
}

export function getEffectiveLayoutConfig(seed?: number): SeedLayoutConfig {
  // LAYOUT FIJO - Siempre devolver el layout por defecto
  return DEFAULT_LAYOUT;
}

export function getSeedLayout(seed?: number): SeedLayoutConfig {
  // LAYOUT FIJO - Siempre devolver el layout por defecto
  return DEFAULT_LAYOUT;
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
