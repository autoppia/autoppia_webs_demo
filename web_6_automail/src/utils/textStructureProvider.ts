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
  email_content: {
    reply_button: string;
    reply_all_button: string;
    forward_button: string;
    archive_button: string;
    delete_button: string;
    mark_important: string;
    mark_unread: string;
    mark_read: string;
    download_attachment: string;
    view_attachment: string;
    compose_subject: string;
    compose_to: string;
    compose_cc: string;
    compose_bcc: string;
    compose_message: string;
    send_button: string;
    save_draft: string;
    discard_button: string;
    attach_file: string;
    no_emails: string;
    loading_emails: string;
    email_sent: string;
    email_saved: string;
    email_deleted: string;
    email_archived: string;
  };
  email_ids: {
    reply_btn: string;
    reply_all_btn: string;
    forward_btn: string;
    archive_btn: string;
    delete_btn: string;
    spam_btn: string;
    important_btn: string;
    unread_btn: string;
    read_btn: string;
    download_btn: string;
    view_btn: string;
    subject_input: string;
    to_input: string;
    cc_input: string;
    bcc_input: string;
    message_textarea: string;
    send_btn: string;
    save_btn: string;
    discard_btn: string;
    attach_btn: string;
  };
  email_aria_labels: {
    reply_btn: string;
    reply_all_btn: string;
    forward_btn: string;
    archive_btn: string;
    delete_btn: string;
    important_btn: string;
    unread_btn: string;
    read_btn: string;
    download_btn: string;
    view_btn: string;
    subject_input: string;
    to_input: string;
    cc_input: string;
    bcc_input: string;
    message_textarea: string;
    send_btn: string;
    save_btn: string;
    discard_btn: string;
    attach_btn: string;
  };
}

export function getTextStructure(seedStructure?: number): TextStructureConfig {
  // If no seed provided or out of range, return default (variation 1)
  if (!seedStructure || seedStructure < 1 || seedStructure > 300) {
    return textStructureVariations.variations["1"].elements as TextStructureConfig;
  }

  // Map seed-structure (1-300) to variation (1-10) using modulo
  const variationKey = ((seedStructure - 1) % 10) + 1;
  
  if (variationKey in textStructureVariations.variations) {
    return textStructureVariations.variations[variationKey.toString() as keyof typeof textStructureVariations.variations].elements as TextStructureConfig;
  }

  // Fallback to default
  return textStructureVariations.variations["1"].elements as TextStructureConfig;
}

export function getTextStructureName(seedStructure?: number): string {
  if (!seedStructure || seedStructure < 1 || seedStructure > 300) {
    return textStructureVariations.variations["1"].name;
  }

  // Map seed-structure (1-300) to variation (1-10) using modulo
  const variationKey = ((seedStructure - 1) % 10) + 1;
  
  if (variationKey in textStructureVariations.variations) {
    return textStructureVariations.variations[variationKey.toString() as keyof typeof textStructureVariations.variations].name;
  }

  return textStructureVariations.variations["1"].name;
}

// Helper function to check if text structure is enabled
export function isTextStructureEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1_STRUCTURE === 'true';
}

// Helper function to get effective text structure config
export function getEffectiveTextStructure(seedStructure?: number): TextStructureConfig {
  if (!isTextStructureEnabled()) {
    return textStructureVariations.variations["1"].elements as TextStructureConfig;
  }
  return getTextStructure(seedStructure);
}
