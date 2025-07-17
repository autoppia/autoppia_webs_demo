"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import type {
  Email,
  EmailFilter,
  ComposeEmailData,
  EmailFolder,
  Label,
} from "@/types/email";
import {
  generateMockEmails,
  generateDraftEmails,
  userLabels,
  systemLabels,
} from "@/library/dataset";
import { EVENT_TYPES, logEvent } from "@/library/events";

interface EmailState {
  emails: Email[];
  selectedEmails: string[];
  currentFilter: EmailFilter;
  currentEmail: Email | null;
  isComposeOpen: boolean;
  composeData: ComposeEmailData;
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  customLabels: Label[];
}

type EmailAction =
  | { type: "SET_EMAILS"; payload: Email[] }
  | { type: "ADD_EMAIL"; payload: Email }
  | { type: "UPDATE_EMAIL"; payload: { id: string; updates: Partial<Email> } }
  | { type: "DELETE_EMAIL"; payload: string }
  | { type: "MOVE_TO_TRASH"; payload: string[] }
  | { type: "MOVE_TO_SPAM"; payload: string[] }
  | {
      type: "ADD_LABEL_TO_EMAILS";
      payload: { emailIds: string[]; label: Label };
    }
  | {
      type: "REMOVE_LABEL_FROM_EMAILS";
      payload: { emailIds: string[]; labelId: string };
    }
  | { type: "CREATE_LABEL"; payload: Label }
  | { type: "DELETE_LABEL"; payload: string }
  | {
      type: "BULK_UPDATE_EMAILS";
      payload: { ids: string[]; updates: Partial<Email> };
    }
  | { type: "SELECT_EMAIL"; payload: string }
  | { type: "SELECT_EMAILS"; payload: string[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_CURRENT_EMAIL"; payload: Email | null }
  | { type: "SET_FILTER"; payload: EmailFilter }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "TOGGLE_COMPOSE"; payload?: boolean }
  | { type: "SET_COMPOSE_DATA"; payload: Partial<ComposeEmailData> }
  | { type: "RESET_COMPOSE_DATA" };

const initialComposeData: ComposeEmailData = {
  to: [],
  cc: [],
  bcc: [],
  subject: "",
  body: "",
  attachments: [],
};

const initialState: EmailState = {
  emails: [],
  selectedEmails: [],
  currentFilter: { folder: "inbox" },
  currentEmail: null,
  isComposeOpen: false,
  composeData: initialComposeData,
  searchQuery: "",
  currentPage: 1,
  itemsPerPage: 50, // Show all emails on one page since we only have 10
  customLabels: [...userLabels], // Start with default Work and Personal labels
};

function emailReducer(state: EmailState, action: EmailAction): EmailState {
  switch (action.type) {
    case "SET_EMAILS":
      return { ...state, emails: action.payload };

    case "ADD_EMAIL":
      return { ...state, emails: [action.payload, ...state.emails] };

    case "UPDATE_EMAIL":
      return {
        ...state,
        emails: state.emails.map((email) =>
          email.id === action.payload.id
            ? { ...email, ...action.payload.updates }
            : email
        ),
        currentEmail:
          state.currentEmail?.id === action.payload.id
            ? { ...state.currentEmail, ...action.payload.updates }
            : state.currentEmail,
      };

    case "DELETE_EMAIL":
      return {
        ...state,
        emails: state.emails.filter((email) => email.id !== action.payload),
        selectedEmails: state.selectedEmails.filter(
          (id) => id !== action.payload
        ),
        currentEmail:
          state.currentEmail?.id === action.payload ? null : state.currentEmail,
      };

    case "MOVE_TO_TRASH":
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.payload.includes(email.id)
            ? {
                ...email,
                labels: [
                  ...email.labels.filter((l) => l.id !== "trash"),
                  {
                    id: "trash",
                    name: "Trash",
                    color: "#5f6368",
                    type: "system",
                  },
                ],
              }
            : email
        ),
        selectedEmails: [],
      };

    case "MOVE_TO_SPAM":
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.payload.includes(email.id)
            ? {
                ...email,
                labels: [
                  ...email.labels.filter((l) => l.id !== "spam"),
                  {
                    id: "spam",
                    name: "Spam",
                    color: "#ea4335",
                    type: "system",
                  },
                ],
              }
            : email
        ),
        selectedEmails: [],
      };

    case "ADD_LABEL_TO_EMAILS":
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.payload.emailIds.includes(email.id)
            ? {
                ...email,
                labels: [
                  ...email.labels.filter(
                    (l) => l.id !== action.payload.label.id
                  ),
                  action.payload.label,
                ],
              }
            : email
        ),
      };

    case "REMOVE_LABEL_FROM_EMAILS":
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.payload.emailIds.includes(email.id)
            ? {
                ...email,
                labels: email.labels.filter(
                  (l) => l.id !== action.payload.labelId
                ),
              }
            : email
        ),
      };

    case "CREATE_LABEL":
      return {
        ...state,
        customLabels: [...state.customLabels, action.payload],
      };

    case "DELETE_LABEL":
      return {
        ...state,
        customLabels: state.customLabels.filter(
          (label) => label.id !== action.payload
        ),
        emails: state.emails.map((email) => ({
          ...email,
          labels: email.labels.filter((l) => l.id !== action.payload),
        })),
      };

    case "BULK_UPDATE_EMAILS":
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.payload.ids.includes(email.id)
            ? { ...email, ...action.payload.updates }
            : email
        ),
      };

    case "SELECT_EMAIL":
      return {
        ...state,
        selectedEmails: state.selectedEmails.includes(action.payload)
          ? state.selectedEmails.filter((id) => id !== action.payload)
          : [...state.selectedEmails, action.payload],
      };

    case "SELECT_EMAILS":
      return { ...state, selectedEmails: action.payload };

    case "CLEAR_SELECTION":
      return { ...state, selectedEmails: [] };

    case "SET_CURRENT_EMAIL":
      return { ...state, currentEmail: action.payload };

    case "SET_FILTER":
      return {
        ...state,
        currentFilter: action.payload,
        selectedEmails: [],
        currentPage: 1,
        currentEmail: null,
      };

    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload, currentPage: 1 };

    case "SET_PAGE":
      return { ...state, currentPage: action.payload };

    case "TOGGLE_COMPOSE":
      return {
        ...state,
        isComposeOpen: action.payload ?? !state.isComposeOpen,
        composeData:
          action.payload === false ? initialComposeData : state.composeData,
      };

    case "SET_COMPOSE_DATA":
      return {
        ...state,
        composeData: { ...state.composeData, ...action.payload },
      };

    case "RESET_COMPOSE_DATA":
      return { ...state, composeData: initialComposeData };

    default:
      return state;
  }
}

interface EmailContextValue extends EmailState {
  // Email actions
  toggleStar: (emailId: string) => void;
  markAsRead: (emailId: string, isRead?: boolean) => void;
  markAsUnread: (emailId: string) => void;
  markAsImportant: (emailId: string, isImportant?: boolean) => void;
  markAsSpam: (emailIds: string[]) => void;
  deleteEmail: (emailId: string) => void;
  deleteEmails: (emailIds: string[]) => void;
  moveToTrash: (emailIds: string[]) => void;

  // Label actions
  addLabelToEmails: (emailIds: string[], label: Label) => void;
  removeLabelFromEmails: (emailIds: string[], labelId: string) => void;
  createLabel: (name: string, color: string) => void;
  deleteLabel: (labelId: string) => void;
  getAllLabels: () => Label[];

  // Selection actions
  selectEmail: (emailId: string) => void;
  selectAllVisible: (emailIds: string[]) => void;
  clearSelection: () => void;

  // Navigation actions
  setCurrentEmail: (email: Email | null) => void;
  setFilter: (filter: EmailFilter) => void;
  setSearchQuery: (query: string) => void;

  // Pagination actions
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Compose actions
  toggleCompose: (open?: boolean) => void;
  updateComposeData: (data: Partial<ComposeEmailData>) => void;
  sendEmail: () => void;
  saveDraft: () => void;

  // Computed values
  filteredEmails: Email[];
  paginatedEmails: Email[];
  unreadCount: number;
  starredCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const EmailContext = createContext<EmailContextValue | undefined>(undefined);

export function EmailProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(emailReducer, initialState);

  // Initialize emails on client side to avoid hydration mismatch
  useEffect(() => {
    if (state.emails.length === 0) {
      // Generate only 10 emails for inbox - no other folder emails
      const mockEmails = generateMockEmails(50);
      dispatch({ type: "SET_EMAILS", payload: mockEmails });
    }
  }, [state.emails.length]);

  // Email actions
  const toggleStar = useCallback(
    (emailId: string) => {
      const email = state.emails.find((e) => e.id === emailId);
      if (email) {
        dispatch({
          type: "UPDATE_EMAIL",
          payload: { id: emailId, updates: { isStarred: !email.isStarred } },
        });
      }
    },
    [state.emails]
  );

  const markAsRead = useCallback((emailId: string, isRead = true) => {
    dispatch({
      type: "UPDATE_EMAIL",
      payload: { id: emailId, updates: { isRead } },
    });
  }, []);

  const markAsUnread = useCallback((emailId: string) => {
    dispatch({
      type: "UPDATE_EMAIL",
      payload: { id: emailId, updates: { isRead: false } },
    });
    // Return to inbox after marking as unread
    dispatch({ type: "SET_CURRENT_EMAIL", payload: null });
    dispatch({ type: "SET_FILTER", payload: { folder: "inbox" } });
  }, []);

  const markAsSpam = useCallback((emailIds: string[]) => {
    dispatch({ type: "MOVE_TO_SPAM", payload: emailIds });
  }, []);

  // Label actions
  const addLabelToEmails = useCallback((emailIds: string[], label: Label) => {
    dispatch({ type: "ADD_LABEL_TO_EMAILS", payload: { emailIds, label } });
  }, []);

  const removeLabelFromEmails = useCallback(
    (emailIds: string[], labelId: string) => {
      dispatch({
        type: "REMOVE_LABEL_FROM_EMAILS",
        payload: { emailIds, labelId },
      });
    },
    []
  );

  const createLabel = useCallback((name: string, color: string) => {
    const newLabel: Label = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      color,
      type: "user",
    };
    dispatch({ type: "CREATE_LABEL", payload: newLabel });
  }, []);

  const deleteLabel = useCallback((labelId: string) => {
    dispatch({ type: "DELETE_LABEL", payload: labelId });
  }, []);

  const getAllLabels = useCallback(() => {
    return [...systemLabels, ...state.customLabels];
  }, [state.customLabels]);

  const markAsImportant = useCallback((emailId: string, isImportant = true) => {
    dispatch({
      type: "UPDATE_EMAIL",
      payload: { id: emailId, updates: { isImportant } },
    });
  }, []);

  const deleteEmail = useCallback((emailId: string) => {
    dispatch({ type: "DELETE_EMAIL", payload: emailId });
  }, []);

  const deleteEmails = useCallback((emailIds: string[]) => {
    for (const id of emailIds) {
      dispatch({ type: "DELETE_EMAIL", payload: id });
    }
  }, []);

  const moveToTrash = useCallback((emailIds: string[]) => {
    dispatch({ type: "MOVE_TO_TRASH", payload: emailIds });
  }, []);

  // Selection actions
  const selectEmail = useCallback((emailId: string) => {
    dispatch({ type: "SELECT_EMAIL", payload: emailId });
  }, []);

  const selectAllVisible = useCallback((emailIds: string[]) => {
    dispatch({ type: "SELECT_EMAILS", payload: emailIds });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTION" });
  }, []);

  // Navigation actions
  const setCurrentEmail = useCallback(
    (email: Email | null) => {
      if (email && !email.isRead) {
        markAsRead(email.id);
      }
      dispatch({ type: "SET_CURRENT_EMAIL", payload: email });
    },
    [markAsRead]
  );

  const setFilter = useCallback((filter: EmailFilter) => {
    dispatch({ type: "SET_FILTER", payload: filter });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  }, []);

  // Pagination actions
  const setPage = useCallback((page: number) => {
    dispatch({ type: "SET_PAGE", payload: page });
  }, []);

  const nextPage = useCallback(() => {
    dispatch({ type: "SET_PAGE", payload: state.currentPage + 1 });
  }, [state.currentPage]);

  const prevPage = useCallback(() => {
    dispatch({ type: "SET_PAGE", payload: Math.max(1, state.currentPage - 1) });
  }, [state.currentPage]);

  // Compose actions
  const toggleCompose = useCallback((open?: boolean) => {
    dispatch({ type: "TOGGLE_COMPOSE", payload: open });
    if (open) {
      logEvent(EVENT_TYPES.COMPOSE_EMAIL, {
        action: "opened_compose",
      });
    }
  }, []);

  const updateComposeData = useCallback((data: Partial<ComposeEmailData>) => {
    dispatch({ type: "SET_COMPOSE_DATA", payload: data });
  }, []);

  const sendEmail = useCallback(() => {
    // In a real app, this would send the email via API
    const newEmail: Email = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      from: { name: "Me", email: "me@gmail.com" },
      to: state.composeData.to.map((email) => ({ name: email, email })),
      subject: state.composeData.subject,
      body: state.composeData.body,
      snippet: `${state.composeData.body.substring(0, 120)}...`,
      timestamp: new Date(),
      isRead: true,
      isStarred: false,
      isSnoozed: false,
      isDraft: false,
      isImportant: false,
      labels: [],
      category: "primary",
      threadId:
        Math.random().toString(36).substring(2) + Date.now().toString(36),
    };

    dispatch({ type: "ADD_EMAIL", payload: newEmail });
    dispatch({ type: "RESET_COMPOSE_DATA" });
    dispatch({ type: "TOGGLE_COMPOSE", payload: false });
  }, [state.composeData]);

  const saveDraft = useCallback(() => {
    if (
      !state.composeData.to.length &&
      !state.composeData.subject &&
      !state.composeData.body
    ) {
      return; // Don't save empty drafts
    }

    const draftEmail: Email = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      from: { name: "Me", email: "me@gmail.com" },
      to: state.composeData.to.map((email) => ({ name: email, email })),
      cc: state.composeData.cc?.map((email) => ({ name: email, email })),
      bcc: state.composeData.bcc?.map((email) => ({ name: email, email })),
      subject: state.composeData.subject || "(no subject)",
      body: state.composeData.body,
      snippet: `${state.composeData.body.substring(0, 120)}...`,
      timestamp: new Date(),
      isRead: true,
      isStarred: false,
      isSnoozed: false,
      isDraft: true,
      isImportant: false,
      labels: [],
      category: "primary",
      threadId:
        Math.random().toString(36).substring(2) + Date.now().toString(36),
    };

    dispatch({ type: "ADD_EMAIL", payload: draftEmail });
    dispatch({ type: "RESET_COMPOSE_DATA" });
    dispatch({ type: "TOGGLE_COMPOSE", payload: false });
  }, [state.composeData]);

  // Computed values
  const filteredEmails = useMemo(() => {
    let filtered = state.emails;

    // If filtering by a custom label, show emails from all folders (except trash/spam) that have that label
    if (state.currentFilter.label) {
      filtered = filtered.filter(
        (email) =>
          email.labels.some((l) => l.id === state.currentFilter.label) &&
          !email.labels.some((l) => ["spam", "trash"].includes(l.id))
      );
    } else {
      // Filter by folder only if no label filter is active
      switch (state.currentFilter.folder) {
        case "inbox":
          // Inbox shows emails that are not in trash, spam, sent, or drafts
          filtered = filtered.filter(
            (email) =>
              !email.isDraft &&
              email.from.email !== "me@gmail.com" &&
              !email.labels.some((l) =>
                ["sent", "spam", "trash"].includes(l.id)
              )
          );
          break;
        case "starred":
          // Starred emails that are not in trash or spam
          filtered = filtered.filter(
            (email) =>
              email.isStarred &&
              !email.labels.some((l) => ["spam", "trash"].includes(l.id))
          );
          break;
        case "snoozed":
          // Snoozed emails that are not in trash or spam
          filtered = filtered.filter(
            (email) =>
              email.isSnoozed &&
              !email.labels.some((l) => ["spam", "trash"].includes(l.id))
          );
          break;
        case "sent":
          // Emails sent by the user that are not in trash
          filtered = filtered.filter(
            (email) =>
              email.from.email === "me@gmail.com" &&
              !email.isDraft &&
              !email.labels.some((l) => ["trash"].includes(l.id))
          );
          break;
        case "drafts":
          // Draft emails that are not in trash
          filtered = filtered.filter(
            (email) =>
              email.isDraft &&
              !email.labels.some((l) => ["trash"].includes(l.id))
          );
          break;
        case "important":
          // Important emails that are not in trash or spam
          filtered = filtered.filter(
            (email) =>
              email.isImportant &&
              !email.labels.some((l) => ["spam", "trash"].includes(l.id))
          );
          break;
        case "spam":
          // Only emails marked as spam
          filtered = filtered.filter((email) =>
            email.labels.some((l) => l.id === "spam")
          );
          break;
        case "trash":
          // Only emails marked as trash
          filtered = filtered.filter((email) =>
            email.labels.some((l) => l.id === "trash")
          );
          break;
      }
    }

    // Filter by category
    if (state.currentFilter.category) {
      filtered = filtered.filter(
        (email) => email.category === state.currentFilter.category
      );
    }

    // Filter by read status
    if (typeof state.currentFilter.isRead === "boolean") {
      filtered = filtered.filter(
        (email) => email.isRead === state.currentFilter.isRead
      );
    }

    // Filter by starred status
    if (typeof state.currentFilter.isStarred === "boolean") {
      filtered = filtered.filter(
        (email) => email.isStarred === state.currentFilter.isStarred
      );
    }

    // Filter by search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase().trim();

      // Support advanced search operators
      if (query.startsWith("from:")) {
        const fromQuery = query.replace("from:", "").trim();
        filtered = filtered.filter(
          (email) =>
            email.from.name.toLowerCase().includes(fromQuery) ||
            email.from.email.toLowerCase().includes(fromQuery)
        );
      } else if (query.startsWith("to:")) {
        const toQuery = query.replace("to:", "").trim();
        filtered = filtered.filter((email) =>
          email.to.some(
            (recipient) =>
              recipient.name.toLowerCase().includes(toQuery) ||
              recipient.email.toLowerCase().includes(toQuery)
          )
        );
      } else if (query.startsWith("subject:")) {
        const subjectQuery = query.replace("subject:", "").trim();
        filtered = filtered.filter((email) =>
          email.subject.toLowerCase().includes(subjectQuery)
        );
      } else if (query.startsWith("has:attachment")) {
        filtered = filtered.filter(
          (email) => email.attachments && email.attachments.length > 0
        );
      } else if (query.startsWith("is:unread")) {
        filtered = filtered.filter((email) => !email.isRead);
      } else if (query.startsWith("is:read")) {
        filtered = filtered.filter((email) => email.isRead);
      } else if (query.startsWith("is:starred")) {
        filtered = filtered.filter((email) => email.isStarred);
      } else if (query.startsWith("is:important")) {
        filtered = filtered.filter((email) => email.isImportant);
      } else {
        // General search across multiple fields
        filtered = filtered.filter(
          (email) =>
            email.subject.toLowerCase().includes(query) ||
            email.from.name.toLowerCase().includes(query) ||
            email.from.email.toLowerCase().includes(query) ||
            email.body.toLowerCase().includes(query) ||
            email.to.some(
              (recipient) =>
                recipient.name.toLowerCase().includes(query) ||
                recipient.email.toLowerCase().includes(query)
            ) ||
            email.labels.some((label) =>
              label.name.toLowerCase().includes(query)
            )
        );
      }
    }

    // Sort by timestamp (newest first)
    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [state.emails, state.currentFilter, state.searchQuery]);

  const unreadCount = useMemo(() => {
    return state.emails.filter((email) => !email.isRead && !email.isDraft)
      .length;
  }, [state.emails]);

  const starredCount = useMemo(() => {
    return state.emails.filter((email) => email.isStarred).length;
  }, [state.emails]);

  // Pagination computed values
  const totalPages = useMemo(() => {
    return Math.ceil(filteredEmails.length / state.itemsPerPage);
  }, [filteredEmails.length, state.itemsPerPage]);

  const paginatedEmails = useMemo(() => {
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    return filteredEmails.slice(startIndex, endIndex);
  }, [filteredEmails, state.currentPage, state.itemsPerPage]);

  const hasNextPage = useMemo(() => {
    return state.currentPage < totalPages;
  }, [state.currentPage, totalPages]);

  const hasPrevPage = useMemo(() => {
    return state.currentPage > 1;
  }, [state.currentPage]);

  const value: EmailContextValue = {
    ...state,
    toggleStar,
    markAsRead,
    markAsUnread,
    markAsImportant,
    markAsSpam,
    deleteEmail,
    deleteEmails,
    moveToTrash,
    addLabelToEmails,
    removeLabelFromEmails,
    createLabel,
    deleteLabel,
    getAllLabels,
    selectEmail,
    selectAllVisible,
    clearSelection,
    setCurrentEmail,
    setFilter,
    setSearchQuery,
    setPage,
    nextPage,
    prevPage,
    toggleCompose,
    updateComposeData,
    sendEmail,
    saveDraft,
    filteredEmails,
    paginatedEmails,
    unreadCount,
    starredCount,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };

  return (
    <EmailContext.Provider value={value}>{children}</EmailContext.Provider>
  );
}

export function useEmail() {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error("useEmail must be used within an EmailProvider");
  }
  return context;
}
