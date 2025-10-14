"use client";

import type React from "react";
import { cn } from "@/library/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useEmail } from "@/contexts/EmailContext";
// import { systemLabels } from "@/library/dataset";
import { CreateLabelDialog } from "@/components/CreateLabelDialog";
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

export function Sidebar() {
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
          !email.labels.some((l) => ["sent", "spam", "trash"].includes(l.id))
      ).length,
      starred: emails.filter(
        (email) =>
          email.isStarred &&
          !email.labels.some((l) => ["spam", "trash"].includes(l.id))
      ).length,
      snoozed: emails.filter(
        (email) =>
          email.isSnoozed &&
          !email.labels.some((l) => ["spam", "trash"].includes(l.id))
      ).length,
      sent: emails.filter(
        (email) =>
          email.from.email === "me@gmail.com" &&
          !email.isDraft &&
          !email.labels.some((l) => ["trash"].includes(l.id))
      ).length,
      drafts: emails.filter(
        (email) =>
          email.isDraft && !email.labels.some((l) => ["trash"].includes(l.id))
      ).length,
      important: emails.filter(
        (email) =>
          email.isImportant &&
          !email.labels.some((l) => ["spam", "trash"].includes(l.id))
      ).length,
      spam: emails.filter((email) => email.labels.some((l) => l.id === "spam"))
        .length,
      trash: emails.filter((email) =>
        email.labels.some((l) => l.id === "trash")
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
    { id: "inbox", label: "Inbox", icon: Inbox, count: counts.inbox, type: "folder" },
    { id: "starred", label: "Starred", icon: Star, count: counts.starred, type: "folder" },
    { id: "snoozed", label: "Snoozed", icon: Clock, count: counts.snoozed, type: "folder" },
    { id: "sent", label: "Sent", icon: Send, count: counts.sent, type: "folder" },
    { id: "drafts", label: "Drafts", icon: FileText, count: counts.drafts, type: "folder" },
    { id: "important", label: "Important", icon: AlertTriangle, count: counts.important, type: "folder" },
    { id: "spam", label: "Spam", icon: Mail, count: counts.spam, type: "folder" },
    { id: "trash", label: "Trash", icon: Trash2, count: counts.trash, type: "folder" },
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

  return (
    <div className="w-64 h-full sidebar-gradient border-r border-border/60 flex flex-col">
      <div className="p-4">
        <Button
          onClick={() => toggleCompose(true)}
          className="w-full justify-start gap-3 h-12 text-sm font-medium btn-primary-gradient rounded-xl animate-bounce-in"
          size="lg"
        >
          <PenTool className="h-4 w-4" />
          Compose
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Button
                id={item.id}
                key={item.id}
                variant={active ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-3 h-9 px-3 text-sm font-normal rounded-lg sidebar-item-hover", active && "sidebar-item-active")}
                onClick={() => handleItemClick(item)}
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
            <CreateLabelDialog />
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
    </div>
  );
}
