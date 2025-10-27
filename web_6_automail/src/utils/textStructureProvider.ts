import textStructureVariations from '@/data/textStructureVariations.json';

export interface TextStructureConfig {
  app_name: string;
  search_placeholder: string;
  compose_button: string;
  inbox_label: string;
  starred_label: string;
  sent_label: string;
  drafts_label: string;
  trash_label: string;
  settings_label: string;
  theme_light: string;
  theme_dark: string;
  theme_system: string;
  user_account: string;
  sign_out: string;
  select_email: string;
  storage_used: string;
  labels_section: string;
  more_section: string;
  contacts: string;
  chats: string;
  ids: {
    search_input: string;
    compose_button: string;
    user_menu: string;
    theme_light_btn: string;
    theme_dark_btn: string;
    theme_system_btn: string;
    inbox_btn: string;
    starred_btn: string;
    sent_btn: string;
    drafts_btn: string;
    trash_btn: string;
    settings_btn: string;
    contacts_btn: string;
    chats_btn: string;
  };
  aria_labels: {
    search_input: string;
    compose_button: string;
    user_menu: string;
    theme_toggle: string;
    inbox_nav: string;
    starred_nav: string;
    sent_nav: string;
    drafts_nav: string;
    trash_nav: string;
    settings_nav: string;
    contacts_nav: string;
    chats_nav: string;
  };
}

export function getTextStructure(seedStructure?: number): TextStructureConfig {
  // If no seed provided or out of range, return default (variation 1)
  if (!seedStructure || seedStructure < 1 || seedStructure > 10) {
    return textStructureVariations.variations["1"].elements as TextStructureConfig;
  }

  // Map seed-structure to variation (1-10)
  const variationKey = seedStructure.toString();
  
  if (variationKey in textStructureVariations.variations) {
    return textStructureVariations.variations[variationKey as keyof typeof textStructureVariations.variations].elements as TextStructureConfig;
  }

  // Fallback to default
  return textStructureVariations.variations["1"].elements as TextStructureConfig;
}

export function getTextStructureName(seedStructure?: number): string {
  if (!seedStructure || seedStructure < 1 || seedStructure > 10) {
    return textStructureVariations.variations["1"].name;
  }

  const variationKey = seedStructure.toString();
  
  if (variationKey in textStructureVariations.variations) {
    return textStructureVariations.variations[variationKey as keyof typeof textStructureVariations.variations].name;
  }

  return textStructureVariations.variations["1"].name;
}

// Helper function to check if text structure is enabled
export function isTextStructureEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE === 'true';
}

// Helper function to get effective text structure config
export function getEffectiveTextStructure(seedStructure?: number): TextStructureConfig {
  if (!isTextStructureEnabled()) {
    return textStructureVariations.variations["1"].elements as TextStructureConfig;
  }
  return getTextStructure(seedStructure);
}
