export interface Email {
  id: string;
  from: {
    name: string;
    email: string;
    avatar?: string;
  };
  to: {
    name: string;
    email: string;
  }[];
  cc?: {
    name: string;
    email: string;
  }[];
  bcc?: {
    name: string;
    email: string;
  }[];
  subject: string;
  body: string;
  htmlBody?: string;
  snippet: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  isSnoozed: boolean;
  isDraft: boolean;
  isImportant: boolean;
  labels: Label[];
  category: EmailCategory;
  attachments?: Attachment[];
  threadId: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  type: 'system' | 'user';
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export type EmailCategory =
  | 'primary'
  | 'social'
  | 'promotions'
  | 'updates'
  | 'forums'
  | 'support';

export type EmailFolder =
  | 'inbox'
  | 'starred'
  | 'snoozed'
  | 'sent'
  | 'drafts'
  | 'archive'
  | 'spam'
  | 'trash'
  | 'important';

export interface EmailFilter {
  folder: EmailFolder;
  category?: EmailCategory;
  label?: string;
  search?: string;
  isRead?: boolean;
  isStarred?: boolean;
}

export interface ComposeEmailData {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: File[];
  action?: "compose" | "reply" | "reply_all" | "forward" | "edit_draft";
  forwardedEmailId?: string | null;
  forwardedFrom?: string | null;
  forwardedSubject?: string | null;
}
