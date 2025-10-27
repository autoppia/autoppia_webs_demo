"use client";

import type React from "react";
import { cn } from "@/library/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEmail } from "@/contexts/EmailContext";
import { useLayout } from "@/contexts/LayoutContext";
import { useDynamicStructure } from "@/contexts/DynamicStructureContext";
import { LabelSelector } from "@/components/LabelSelector";
import type { Email } from "@/types/email";
import { EVENT_TYPES, logEvent } from "@/library/events";
import {
  Star,
  Archive,
  Trash2,
  Paperclip,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Mail,
  Shield,
  Tag,
} from "lucide-react";

export function EmailList() {
  const { currentVariant } = useLayout();
  const { getText, getId } = useDynamicStructure();
  const {
    paginatedEmails,
    filteredEmails,
    selectedEmails,
    currentEmail,
    selectEmail,
    selectAllVisible,
    clearSelection,
    setCurrentEmail,
    toggleStar,
    markAsRead,
    markAsUnread,
    markAsSpam,
    moveToTrash,
    currentFilter,
    searchQuery,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = useEmail();

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (diffInHours < 48) {
      return "Yesterday";
    }
    if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const allSelected =
    paginatedEmails.length > 0 &&
    selectedEmails.length === paginatedEmails.length;
  const someSelected =
    selectedEmails.length > 0 && selectedEmails.length < paginatedEmails.length;

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      const visibleIds = paginatedEmails.map((email) => email.id);
      selectAllVisible(visibleIds);
    }
  };

  const handleEmailClick = (email: Email) => {
    setCurrentEmail(email);
    if (!email.isRead) {
      markAsRead(email.id);
    }
    logEvent(EVENT_TYPES.VIEW_EMAIL, {
      email_id: email.id,
      subject: email.subject,
      from: email.from.email,
    });
  };

  const handleStarClick = (e: React.MouseEvent, email: Email) => {
    e.stopPropagation();
    toggleStar(email.id);
    logEvent(EVENT_TYPES.STAR_AN_EMAIL, {
      email_id: email.id,
      subject: email.subject,
      from: email.from.email,
      is_star: !email.isStarred,
    });
  };

  const handleCheckboxClick = (e: React.MouseEvent, email: Email) => {
    e.stopPropagation();
    selectEmail(email.id);
  };

  const handleBulkDelete = () => {
    moveToTrash(selectedEmails);
  };

  const handleBulkMarkAsUnread = () => {
    for (const emailId of selectedEmails) {
      markAsUnread(emailId);
    }
    clearSelection();
  };

  const handleBulkMarkAsSpam = () => {
    markAsSpam(selectedEmails);
    clearSelection();
  };

  const getFolderTitle = () => {
    if (searchQuery) {
      return "Search Results";
    }

    switch (currentFilter.folder) {
      case "inbox":
        return getText("inbox");
      case "starred":
        return getText("starred");
      case "snoozed":
        return "Snoozed";
      case "sent":
        return getText("sent");
      case "drafts":
        return getText("drafts");
      case "important":
        return "Important";
      case "spam":
        return "Spam";
      case "trash":
        return getText("trash");
      default:
        return getText("inbox");
    }
  };

  const unreadCount = filteredEmails.filter((email) => !email.isRead).length;

  // Function to highlight search terms
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <mark
            key={`highlight-${index}-${part}`}
            className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <div
      className="flex flex-col h-full bg-background"
      data-testid="email-list"
      suppressHydrationWarning
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{getFolderTitle()}</h1>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} unread</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>
              {filteredEmails.length === 0 ? "0" : `1-${filteredEmails.length}`}{" "}
              of {filteredEmails.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={prevPage}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={nextPage}
              disabled={!hasNextPage}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {selectedEmails.length > 0 && (
        <div className={cn(
          "flex items-center gap-2 p-3 bg-muted/50 border-b border-border",
          currentVariant.id === 2 && "action-bar",
          currentVariant.id === 3 && "action-nav",
          currentVariant.id === 4 && "bulk-actions",
          currentVariant.id === 5 && "card-actions",
          currentVariant.id === 6 && "action-list",
          currentVariant.id === 7 && "widget-actions",
          currentVariant.id === 8 && "mobile-actions",
          currentVariant.id === 9 && "terminal-actions",
          currentVariant.id === 10 && "magazine-actions"
        )}>
          <span className="text-sm text-muted-foreground">
            {selectedEmails.length} selected
          </span>
          <Separator orientation="vertical" className="h-4" />
          <Button 
            id="bulk-delete-button" 
            variant="ghost" 
            size="sm" 
            onClick={handleBulkDelete}
            className={cn(
              currentVariant.id === 2 && "delete-element",
              currentVariant.id === 3 && "delete-btn",
              currentVariant.id === 4 && "delete-element",
              currentVariant.id === 5 && "card-delete",
              currentVariant.id === 6 && "delete-item",
              currentVariant.id === 7 && "widget-delete",
              currentVariant.id === 8 && "mobile-delete",
              currentVariant.id === 9 && "action-delete",
              currentVariant.id === 10 && "action-delete"
            )}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button id="bulk-archive-button" variant="ghost" size="sm">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
          <Button id="bulk-mark-unread-button" variant="ghost" size="sm" onClick={handleBulkMarkAsUnread}>
            <Mail className="h-4 w-4 mr-2" />
            Mark as unread
          </Button>
          <Button id="bulk-mark-spam-button" variant="ghost" size="sm" onClick={handleBulkMarkAsSpam}>
            <Shield className="h-4 w-4 mr-2" />
            Mark as spam
          </Button>
          <LabelSelector
            emailIds={selectedEmails}
            trigger={
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  currentVariant.id === 2 && "label-panel",
                  currentVariant.id === 3 && "label-btn",
                  currentVariant.id === 4 && "label-element",
                  currentVariant.id === 5 && "card-label",
                  currentVariant.id === 6 && "label-item",
                  currentVariant.id === 7 && "widget-label",
                  currentVariant.id === 8 && "mobile-label",
                  currentVariant.id === 9 && "action-label",
                  currentVariant.id === 10 && "action-label"
                )}
              >
                <Tag className="h-4 w-4 mr-2" />
                Labels
              </Button>
            }
          />
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            Clear Selection
          </Button>
        </div>
      )}

      {/* Email List Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border bg-muted/30">
        <div className="flex items-center">
          <Checkbox
            checked={allSelected}
            ref={(el) => {
              if (el) {
                const checkbox = el.querySelector(
                  'input[type="checkbox"]'
                ) as HTMLInputElement;
                if (checkbox) checkbox.indeterminate = someSelected;
              }
            }}
            onCheckedChange={handleSelectAll}
          />
        </div>
        <div className="flex-1 grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="col-span-1" />
          <div className="col-span-3">Sender</div>
          <div className="col-span-6">Subject</div>
          <div className="col-span-2 text-right">Time</div>
        </div>
      </div>

      {/* Email List */}
      <ScrollArea className="flex-1">
        {paginatedEmails.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-center">
            <div>
              {searchQuery ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground">
                    No emails found
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No emails match your search for "{searchQuery}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Try different keywords or check your spelling
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium text-muted-foreground">
                    No emails found
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your filters or search terms
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedEmails.map((email) => (
              <EmailItem
                key={email.id}
                email={email}
                isSelected={selectedEmails.includes(email.id)}
                isActive={currentEmail?.id === email.id}
                onSelect={(e) => handleCheckboxClick(e, email)}
                onClick={() => handleEmailClick(email)}
                onStarClick={(e) => handleStarClick(e, email)}
                formatTimestamp={formatTimestamp}
                highlightSearchTerm={highlightSearchTerm}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface EmailItemProps {
  email: Email;
  isSelected: boolean;
  isActive: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onClick: () => void;
  onStarClick: (e: React.MouseEvent) => void;
  formatTimestamp: (date: Date) => string;
  highlightSearchTerm: (text: string, searchTerm: string) => React.ReactNode;
  searchQuery: string;
}

function EmailItem({
  email,
  isSelected,
  isActive,
  onSelect,
  onClick,
  onStarClick,
  formatTimestamp,
  highlightSearchTerm,
  searchQuery,
}: EmailItemProps) {
  const { currentVariant } = useLayout();
  
  // Get CSS classes based on layout variant
  const getEmailItemClasses = () => {
    switch (currentVariant.id) {
      case 1: // Classic Gmail
        return cn(
          "group flex items-center gap-3 p-3 cursor-pointer email-item-hover",
          isActive && "bg-muted",
          !email.isRead && "email-item-unread",
          isSelected && "email-item-selected"
        );
      case 2: // Right Sidebar
        return cn(
          "group flex items-center gap-3 p-3 cursor-pointer email-container",
          isActive && "bg-muted",
          !email.isRead && "email-item-unread",
          isSelected && "email-item-selected"
        );
      case 3: // Top Navigation
        return cn(
          "group flex items-center gap-3 p-3 cursor-pointer email-card",
          isActive && "bg-muted",
          !email.isRead && "email-item-unread",
          isSelected && "email-item-selected"
        );
      case 4: // Split View
        return cn(
          "group flex items-center gap-3 p-3 cursor-pointer email-entry",
          isActive && "bg-muted",
          !email.isRead && "email-item-unread",
          isSelected && "email-item-selected"
        );
      case 5: // Card Layout
        return cn(
          "group flex flex-col gap-2 p-4 cursor-pointer email-card rounded-lg border",
          isActive && "bg-muted",
          !email.isRead && "email-item-unread",
          isSelected && "email-item-selected"
        );
      case 6: // Minimalist
        return cn(
          "group flex items-center gap-3 p-2 cursor-pointer email-row",
          isActive && "bg-muted",
          !email.isRead && "email-item-unread",
          isSelected && "email-item-selected"
        );
      case 7: // Dashboard Style
        return cn(
          "group flex items-center gap-3 p-3 cursor-pointer widget-email",
          isActive && "bg-muted",
          !email.isRead && "email-item-unread",
          isSelected && "email-item-selected"
        );
      case 8: // Mobile First
        return cn(
          "group flex items-center gap-3 p-3 cursor-pointer mobile-email",
          isActive && "bg-muted",
          !email.isRead && "email-item-unread",
          isSelected && "email-item-selected"
        );
      case 9: // Terminal Style
        return cn(
          "group flex items-center gap-3 p-2 cursor-pointer terminal-line font-mono",
          isActive && "bg-muted",
          !email.isRead && "email-item-unread",
          isSelected && "email-item-selected"
        );
      case 10: // Magazine Layout
        return cn(
          "group flex flex-col gap-2 p-4 cursor-pointer magazine-article rounded-lg border",
          isActive && "bg-muted",
          !email.isRead && "email-item-unread",
          isSelected && "email-item-selected"
        );
      default:
        return cn(
          "group flex items-center gap-3 p-3 cursor-pointer email-item-hover",
          isActive && "bg-muted",
          !email.isRead && "email-item-unread",
          isSelected && "email-item-selected"
        );
    }
  };

  return (
    <div
      className={getEmailItemClasses()}
      onClick={onClick}
      suppressHydrationWarning
    >
      {/* Selection Checkbox */}
      <div className={cn(
        "flex items-center",
        currentVariant.id === 2 && "select-box",
        currentVariant.id === 3 && "select-icon",
        currentVariant.id === 4 && "check-element",
        currentVariant.id === 5 && "card-check",
        currentVariant.id === 6 && "row-check",
        currentVariant.id === 7 && "widget-check",
        currentVariant.id === 8 && "mobile-check",
        currentVariant.id === 9 && "line-check",
        currentVariant.id === 10 && "article-check"
      )}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect({} as React.MouseEvent)}
          onClick={onSelect}
        />
      </div>

      {/* Star */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
          currentVariant.id === 2 && "star-container",
          currentVariant.id === 3 && "star-icon",
          currentVariant.id === 4 && "star-element",
          currentVariant.id === 5 && "card-star",
          currentVariant.id === 6 && "star-icon",
          currentVariant.id === 7 && "widget-star",
          currentVariant.id === 8 && "mobile-star",
          currentVariant.id === 9 && "line-star",
          currentVariant.id === 10 && "article-star"
        )}
        onClick={onStarClick}
      >
        <Star
          className={cn(
            "h-4 w-4",
            email.isStarred && "fill-yellow-400 text-yellow-400"
          )}
        />
      </Button>

      {/* Email Content */}
      <div
      id="view-email"
      className="flex-1 grid grid-cols-12 gap-4 min-w-0">
        {/* Sender */}
        <div className="col-span-3 min-w-0 mt-3">
          <p
            className={cn("text-sm truncate", !email.isRead && "font-semibold")}
          >
            {highlightSearchTerm(email.from.name, searchQuery)}
          </p>
        </div>

        {/* Subject and Snippet */}
        <div className="col-span-7 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "text-sm truncate flex-1",
                !email.isRead && "font-semibold"
              )}
            >
              {highlightSearchTerm(email.subject, searchQuery)}
            </p>
            {email.attachments && email.attachments.length > 0 && (
              <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {highlightSearchTerm(email.snippet, searchQuery)}
          </p>

          {/* Labels */}
          {email.labels.length > 0 && (
            <div className="flex gap-1 mt-1">
              {email.labels.slice(0, 3).map((label) => (
                <Badge
                  key={label.id}
                  variant="outline"
                  className="text-xs px-1.5 py-0"
                  style={{ borderColor: label.color }}
                >
                  {label.name}
                </Badge>
              ))}
              {email.labels.length > 3 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  +{email.labels.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="col-span-2 text-right">
          <p className="text-xs text-muted-foreground">
            {formatTimestamp(email.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}
