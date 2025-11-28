"use client";

import type React from "react";
import { cn } from "@/library/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useEmail } from "@/contexts/EmailContext";
import { useLayout } from "@/contexts/LayoutContext";
import { useDynamicStructure } from "@/contexts/DynamicStructureContext";
import { TextStructureConfig } from "@/utils/textStructureProvider";
// import { systemLabels } from "@/library/dataset";
import { CreateLabelDialog } from "@/components/CreateLabelDialog";
import { DynamicElement } from "@/components/DynamicElement";
import type { EmailFolder } from "@/types/email";
// import { EVENT_TYPES, logEvent } from "@/library/events";
import {
  Inbox,
  Star,
  Clock,
  Send,
  FileText,
  AlertTriangle,
  Trash2,
  Mail,
  Settings,
  Users,
  MessageSquare,
  PenTool,
} from "lucide-react";

interface NavigationItem {
  id: EmailFolder | string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  type: "folder" | "label";
}

// const folderEventMap = {
//   inbox: EVENT_TYPES.INBOX_SIDEBAR_CLICKED,
//   starred: EVENT_TYPES.STARRED_SIDEBAR_CLICKED,
//   sent: EVENT_TYPES.SENT_SIDEBAR_CLICKED,
//   drafts: EVENT_TYPES.DRAFT_SIDEBAR_CLICKED,
//   important: EVENT_TYPES.IMPORTANT_SIDEBAR_CLICKED,
//   trash: EVENT_TYPES.TRASH_SIDEBAR_CLICKED,
// } as const;

interface SidebarProps {
  textStructure?: TextStructureConfig;
}

export function Sidebar({ textStructure }: SidebarProps) {
  const { currentVariant } = useLayout();
  const { getText, getId } = useDynamicStructure();
  const {
    currentFilter,
    setFilter,
    unreadCount,
    starredCount,
    emails,
    toggleCompose,
    customLabels,
    createLabel,
  } = useEmail();

  const getCounts = () => {
    return {
      inbox: emails.filter(
        (email) =>
          !email.isDraft &&
          email.from.email !== "me@gmail.com" &&
          !email.labels.some((l) => ["sent", "spam", "trash", "archive"].includes(l.id))
      ).length,
      starred: emails.filter(
        (email) =>
          email.isStarred &&
          !email.labels.some((l) => ["spam", "trash", "archive"].includes(l.id))
      ).length,
      snoozed: emails.filter(
        (email) =>
          email.isSnoozed &&
          !email.labels.some((l) => ["spam", "trash", "archive"].includes(l.id))
      ).length,
      sent: emails.filter(
        (email) =>
          email.from.email === "me@gmail.com" &&
          !email.isDraft &&
          !email.labels.some((l) => ["trash", "archive"].includes(l.id))
      ).length,
      drafts: emails.filter(
        (email) =>
          email.isDraft && !email.labels.some((l) => ["trash", "archive"].includes(l.id))
      ).length,
      important: emails.filter(
        (email) =>
          email.isImportant &&
          !email.labels.some((l) => ["spam", "trash", "archive"].includes(l.id))
      ).length,
      spam: emails.filter((email) => email.labels.some((l) => l.id === "spam"))
        .length,
      trash: emails.filter((email) =>
        email.labels.some((l) => l.id === "trash")
      ).length,
      archive: emails.filter((email) =>
        email.labels.some((l) => l.id === "archive")
      ).length,
    };
  };

  const getLabelCounts = () => {
    const labelCounts: Record<string, number> = {};
    for (const email of emails) {
      const isInTrashOrSpam = email.labels.some((l) =>
        ["spam", "trash"].includes(l.id)
      );
      if (!isInTrashOrSpam) {
        for (const label of email.labels) {
          if (label.type === "user") {
            labelCounts[label.id] = (labelCounts[label.id] || 0) + 1;
          }
        }
      }
    }
    return labelCounts;
  };

  const counts = getCounts();
  const labelCounts = getLabelCounts();

  const navigationItems: NavigationItem[] = [
    { id: "inbox", label: textStructure?.inbox_label || getText("inbox"), icon: Inbox, count: counts.inbox, type: "folder" },
    { id: "starred", label: textStructure?.starred_label || getText("starred"), icon: Star, count: counts.starred, type: "folder" },
    { id: "snoozed", label: "Snoozed", icon: Clock, count: counts.snoozed, type: "folder" },
    { id: "sent", label: textStructure?.sent_label || getText("sent"), icon: Send, count: counts.sent, type: "folder" },
    { id: "drafts", label: textStructure?.drafts_label || getText("drafts"), icon: FileText, count: counts.drafts, type: "folder" },
    { id: "important", label: "Important", icon: AlertTriangle, count: counts.important, type: "folder" },
    { id: "archive", label: "Archive", icon: PenTool, count: counts.archive, type: "folder" },
    { id: "spam", label: "Spam", icon: Mail, count: counts.spam, type: "folder" },
    { id: "trash", label: textStructure?.trash_label || getText("trash"), icon: Trash2, count: counts.trash, type: "folder" },
  ];

  const handleItemClick = (item: NavigationItem) => {
    if (item.type === "folder") {
      setFilter({ folder: item.id as EmailFolder });
      // if (item.type === "folder" && item.id in folderEventMap) {
      //   const eventName = folderEventMap[item.id as keyof typeof folderEventMap];
      //   logEvent(eventName, { label: item.label, id: item.id });
      // }
    } else {
      setFilter({ folder: "inbox", label: item.id });
    }
  };

  const isActive = (item: NavigationItem) => {
    if (item.type === "folder") return currentFilter.folder === item.id && !currentFilter.label;
    return currentFilter.label === item.id;
  };

  // Get sidebar styling based on layout variant
  const getSidebarClasses = () => {
    switch (currentVariant.id) {
      case 1: // Classic Gmail
        return "w-64 h-full sidebar-gradient border-r border-border/60 flex flex-col";
      case 2: // Right Sidebar
        return "w-64 h-full sidebar-gradient border-l border-border/60 flex flex-col settings-panel";
      case 3: // Top Navigation
        return "w-full h-16 border-b border-border flex flex-row items-center justify-between px-4 floating-compose";
      case 4: // Split View
        return "w-64 h-full sidebar-gradient border-r border-border/60 flex flex-col sidebar-panel";
      case 5: // Card Layout
        return "w-64 h-full sidebar-gradient border-r border-border/60 flex flex-col header-actions";
      case 6: // Minimalist
        return "w-48 h-full sidebar-gradient border-r border-border/60 flex flex-col center-actions";
      case 7: // Dashboard Style
        return "w-72 h-full sidebar-gradient border-r border-border/60 flex flex-col floating-widget";
      case 8: // Mobile First
        return "w-64 h-full sidebar-gradient border-l border-border/60 flex flex-col mobile-fab";
      case 9: // Terminal Style
        return "w-64 h-full sidebar-gradient border-l border-border/60 flex flex-col terminal-header";
      case 10: // Magazine Layout
        return "w-full h-20 border-b border-border flex flex-row items-center justify-between px-4 floating-magazine";
      default:
        return "w-64 h-full sidebar-gradient border-r border-border/60 flex flex-col";
    }
  };

  // Get compose button styling based on layout variant
  const getComposeButtonClasses = () => {
    switch (currentVariant.id) {
      case 1: // Classic Gmail
        return "w-full justify-start gap-3 h-12 text-sm font-medium btn-primary-gradient rounded-xl animate-bounce-in";
      case 2: // Right Sidebar
        return "w-full justify-start gap-3 h-12 text-sm font-medium btn-primary-gradient rounded-xl animate-bounce-in compose-fab";
      case 3: // Top Navigation
        return "h-10 px-4 text-sm font-medium btn-primary-gradient rounded-lg floating-compose";
      case 4: // Split View
        return "w-full justify-start gap-3 h-12 text-sm font-medium btn-primary-gradient rounded-xl animate-bounce-in compose-element";
      case 5: // Card Layout
        return "w-full justify-start gap-3 h-12 text-sm font-medium btn-primary-gradient rounded-xl animate-bounce-in header-compose";
      case 6: // Minimalist
        return "w-full justify-start gap-3 h-12 text-sm font-medium btn-primary-gradient rounded-xl animate-bounce-in center-compose";
      case 7: // Dashboard Style
        return "w-full justify-start gap-3 h-12 text-sm font-medium btn-primary-gradient rounded-xl animate-bounce-in widget-compose";
      case 8: // Mobile First
        return "w-full justify-start gap-3 h-12 text-sm font-medium btn-primary-gradient rounded-xl animate-bounce-in fab-compose";
      case 9: // Terminal Style
        return "w-full justify-start gap-3 h-12 text-sm font-medium btn-primary-gradient rounded-xl animate-bounce-in header-compose";
      case 10: // Magazine Layout
        return "h-10 px-4 text-sm font-medium btn-primary-gradient rounded-lg magazine-compose";
      default:
        return "w-full justify-start gap-3 h-12 text-sm font-medium btn-primary-gradient rounded-xl animate-bounce-in";
    }
  };

  return (
    <div className={getSidebarClasses()}>
      {currentVariant.id === 3 || currentVariant.id === 10 ? (
        // Horizontal layout for Top Navigation and Magazine Layout
        <div className="flex items-center gap-4 px-4">
          <Button
            onClick={() => toggleCompose(true)}
            className={getComposeButtonClasses()}
            size="lg"
          >
            <PenTool className="h-4 w-4" />
            Compose
          </Button>
          
          <div className="flex items-center gap-2 flex-wrap">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Button
                  id={textStructure?.ids[`${item.id}_btn` as keyof typeof textStructure.ids] || item.id}
                  key={item.id}
                  variant={active ? "secondary" : "ghost"}
                  className="h-8 px-3 text-sm font-normal rounded-lg"
                  onClick={() => handleItemClick(item)}
                  aria-label={textStructure?.aria_labels[`${item.id}_nav` as keyof typeof textStructure.aria_labels] || `Navigate to ${item.label}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="ml-2">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Labels section for horizontal layout */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Labels
            </span>
            <div className="!block !visible !opacity-100">
              <DynamicElement elementType="create-label-button" index={0}>
                <CreateLabelDialog />
              </DynamicElement>
            </div>
          </div>
        </div>
      ) : (
        // Vertical layout for other variants
        <>
          <div className="p-4">
            <Button
              onClick={() => toggleCompose(true)}
              className={getComposeButtonClasses()}
              size="lg"
              id={textStructure?.ids.compose_button || getId("compose_button")}
              aria-label={textStructure?.aria_labels.compose_button || "Compose new email"}
            >
              <PenTool className="h-4 w-4" />
              {textStructure?.compose_button || 'Compose'}
            </Button>
          </div>

          <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Button
                id={textStructure?.ids[`${item.id}_btn` as keyof typeof textStructure.ids] || item.id}
                key={item.id}
                variant={active ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-3 h-9 px-3 text-sm font-normal rounded-lg sidebar-item-hover", active && "sidebar-item-active")}
                onClick={() => handleItemClick(item)}
                aria-label={textStructure?.aria_labels[`${item.id}_nav` as keyof typeof textStructure.aria_labels] || `Navigate to ${item.label}`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count && item.count > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {item.count > 99 ? "99+" : item.count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1 pb-4">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Labels
            </span>
            <div className="!block !visible !opacity-100">
              <DynamicElement elementType="create-label-button" index={0}>
                <CreateLabelDialog />
              </DynamicElement>
            </div>
          </div>
          {customLabels.map((label) => (
            <Button
              key={label.id}
              variant={currentFilter.label === label.id ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-3 h-9 px-3 text-sm font-normal rounded-lg sidebar-item-hover", currentFilter.label === label.id && "sidebar-item-active")}
              onClick={() => setFilter({ folder: "inbox", label: label.id })}
            >
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: label.color }} />
              <span className="flex-1 text-left">{label.name}</span>
              {labelCounts[label.id] && labelCounts[label.id] > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {labelCounts[label.id] > 99 ? "99+" : labelCounts[label.id]}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1 pb-4">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            More
          </div>
          <Button id="contacts-button" variant="ghost" className="w-full justify-start gap-3 h-8 px-3 text-sm font-normal">
            <Users className="h-4 w-4" />
            Contacts
          </Button>
          <Button id="chats-button" variant="ghost" className="w-full justify-start gap-3 h-8 px-3 text-sm font-normal">
            <MessageSquare className="h-4 w-4" />
            Chats
          </Button>
          <Button id="settings-button" variant="ghost" className="w-full justify-start gap-3 h-8 px-3 text-sm font-normal">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Storage used</span>
            <span>2.1 GB of 15 GB</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1">
            <div className="bg-primary h-1 rounded-full" style={{ width: "14%" }} />
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
