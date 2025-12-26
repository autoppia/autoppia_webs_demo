"use client";

import type React from "react";
import { cn } from "@/library/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useEmail } from "@/contexts/EmailContext";
import { useLayout } from "@/contexts/LayoutContext";
import { TextStructureConfig } from "@/utils/textStructureProvider";
import { CreateLabelDialog } from "@/components/CreateLabelDialog";
import type { EmailFolder } from "@/types/email";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { usePathname, useRouter } from "next/navigation";
import { Inbox, Star, Clock, Send, AlertTriangle, Trash2, Mail, Settings, Users, MessageSquare, PenTool, FileText } from "lucide-react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { useSeed } from "@/context/SeedContext";

interface NavigationItem {
  id: EmailFolder | string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  type: "folder" | "label" | "route";
  route?: string;
}

interface SidebarProps {
  textStructure?: TextStructureConfig;
}

export function Sidebar({ textStructure }: SidebarProps) {
  const { currentVariant } = useLayout();
  const dyn = useDynamicSystem();
  const { getNavigationUrl } = useSeed();
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentFilter,
    setFilter,
    emails,
    toggleCompose,
    customLabels,
  } = useEmail();

  const counts = {
    inbox: emails.filter((email) => !email.isDraft && email.from.email !== "me@gmail.com" && !email.labels.some((l) => ["sent", "spam", "trash", "archive"].includes(l.id))).length,
    starred: emails.filter((email) => email.isStarred && !email.labels.some((l) => ["spam", "trash", "archive"].includes(l.id))).length,
    snoozed: emails.filter((email) => email.isSnoozed && !email.labels.some((l) => ["spam", "trash", "archive"].includes(l.id))).length,
    sent: emails.filter((email) => email.from.email === "me@gmail.com" && !email.isDraft && !email.labels.some((l) => ["trash", "archive"].includes(l.id))).length,
    drafts: emails.filter((email) => email.isDraft && !email.labels.some((l) => ["trash", "archive"].includes(l.id))).length,
    important: emails.filter((email) => email.isImportant && !email.labels.some((l) => ["spam", "trash", "archive"].includes(l.id))).length,
    spam: emails.filter((email) => email.labels.some((l) => l.id === "spam")).length,
    trash: emails.filter((email) => email.labels.some((l) => l.id === "trash")).length,
    archive: emails.filter((email) => email.labels.some((l) => l.id === "archive")).length,
  };

  const labelCounts: Record<string, number> = customLabels.reduce((acc, label) => {
    acc[label.id] = emails.filter((email) => email.labels.some((l) => l.id === label.id) && !email.labels.some((l) => ["spam", "trash"].includes(l.id))).length;
    return acc;
  }, {} as Record<string, number>);

  const navigationItems: NavigationItem[] = [
    { id: "inbox", label: dyn.v3.getVariant("inbox_label", TEXT_VARIANTS_MAP, textStructure?.inbox_label || "Inbox"), icon: Inbox, count: counts.inbox, type: "folder" },
    { id: "templates", label: dyn.v3.getVariant("templates_nav", TEXT_VARIANTS_MAP, "Templates"), icon: FileText, type: "route", route: "/templates" },
    { id: "starred", label: dyn.v3.getVariant("starred_label", TEXT_VARIANTS_MAP, textStructure?.starred_label || "Starred"), icon: Star, count: counts.starred, type: "folder" },
    { id: "snoozed", label: dyn.v3.getVariant("snoozed_label", TEXT_VARIANTS_MAP, "Snoozed"), icon: Clock, count: counts.snoozed, type: "folder" },
    { id: "sent", label: dyn.v3.getVariant("sent_label", TEXT_VARIANTS_MAP, textStructure?.sent_label || "Sent"), icon: Send, count: counts.sent, type: "folder" },
    { id: "drafts", label: dyn.v3.getVariant("drafts_label", TEXT_VARIANTS_MAP, textStructure?.drafts_label || "Drafts"), icon: FileText, count: counts.drafts, type: "folder" },
    { id: "important", label: dyn.v3.getVariant("important_label", TEXT_VARIANTS_MAP, "Important"), icon: AlertTriangle, count: counts.important, type: "folder" },
    { id: "archive", label: dyn.v3.getVariant("archive_label", TEXT_VARIANTS_MAP, "Archive"), icon: PenTool, count: counts.archive, type: "folder" },
    { id: "spam", label: dyn.v3.getVariant("spam_label", TEXT_VARIANTS_MAP, "Spam"), icon: Mail, count: counts.spam, type: "folder" },
    { id: "trash", label: dyn.v3.getVariant("trash_label", TEXT_VARIANTS_MAP, textStructure?.trash_label || "Trash"), icon: Trash2, count: counts.trash, type: "folder" },
  ];

  const orderedNavigation = dyn.v1.changeOrderElements("sidebar-nav-order", navigationItems.length).map((idx) => navigationItems[idx]);

  const isActive = (item: NavigationItem) => {
    if (item.type === "route") return pathname?.startsWith(item.route ?? "") ?? false;
    if (item.type === "folder") return currentFilter.folder === item.id && !currentFilter.label;
    return currentFilter.label === item.id;
  };

  const sidebarId = dyn.v3.getVariant("sidebar-panel", ID_VARIANTS_MAP, "sidebar");
  const sidebarClass = cn(dyn.v3.getVariant("sidebar-panel", CLASS_VARIANTS_MAP, "w-64 h-full border-r border-border flex flex-col"), "sidebar-gradient flex flex-col");
  const composeId = dyn.v3.getVariant("sidebar-compose", ID_VARIANTS_MAP, "compose-btn");
  const composeText = dyn.v3.getVariant("compose_cta", TEXT_VARIANTS_MAP, textStructure?.compose_button || "Compose");

  const handleItemClick = (item: NavigationItem) => {
    if (item.type === "folder") {
      setFilter({ folder: item.id as EmailFolder });
      logEvent(EVENT_TYPES.NAVIGATION_CLICKED, { id: item.id, label: item.label });
    } else if (item.type === "route" && item.route) {
      logEvent(EVENT_TYPES.VIEW_TEMPLATES, { source: "sidebar" });
      router.push(getNavigationUrl(item.route));
    } else {
      setFilter({ folder: "inbox", label: item.id });
    }
  };

  return dyn.v1.addWrapDecoy("sidebar-shell", (
    <div id={sidebarId} className={sidebarClass} data-dyn-key="sidebar">
      <div className="p-4">
        {dyn.v1.addWrapDecoy("sidebar-compose", (
          <Button
            onClick={() => toggleCompose(true)}
            className={cn("w-full justify-start gap-3 h-12 text-sm font-medium btn-primary-gradient rounded-xl", dyn.v3.getVariant("sidebar-compose", CLASS_VARIANTS_MAP, ""))}
            size="lg"
            id={composeId}
            aria-label={composeText}
          >
            <PenTool className="h-4 w-4" />
            {composeText}
          </Button>
        ))}
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {orderedNavigation.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item);
            const buttonId = dyn.v3.getVariant(`sidebar-${item.id}`, ID_VARIANTS_MAP, String(item.id));
            const buttonClass = cn(
              dyn.v3.getVariant("sidebar-link", CLASS_VARIANTS_MAP, dyn.v3.getVariant("sidebar-folder", CLASS_VARIANTS_MAP, "w-full justify-start gap-3 h-9 px-3 text-sm font-normal rounded-lg")),
              active && "sidebar-item-active"
            );
            return dyn.v1.addWrapDecoy(`nav-${item.id}-${index}`, (
              <Button
                id={buttonId}
                key={item.id}
                variant={active ? "secondary" : "ghost"}
                className={buttonClass}
                onClick={() => handleItemClick(item)}
                aria-label={`Navigate to ${item.label}`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count && item.count > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {item.count > 99 ? "99+" : item.count}
                  </Badge>
                )}
              </Button>
            ));
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1 pb-4">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {dyn.v3.getVariant("label_section", TEXT_VARIANTS_MAP, "Labels")}
            </span>
            {dyn.v1.addWrapDecoy("create-label", (<CreateLabelDialog />))}
          </div>
          {customLabels.map((label, index) => {
            const active = currentFilter.label === label.id;
            const buttonClass = cn(
              dyn.v3.getVariant("sidebar-folder", CLASS_VARIANTS_MAP, "w-full justify-start gap-3 h-9 px-3 text-sm font-normal rounded-lg"),
              active && "sidebar-item-active"
            );
            return dyn.v1.addWrapDecoy(`label-${label.id}-${index}`, (
              <Button
                key={label.id}
                variant={active ? "secondary" : "ghost"}
                className={buttonClass}
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
            ));
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1 pb-4">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {dyn.v3.getVariant("quick_actions", TEXT_VARIANTS_MAP, "More")}
          </div>
          {dyn.v1.changeOrderElements("sidebar-more", 3).map((orderIndex) => {
            const items = [
              { icon: Users, text: "Contacts" },
              { icon: MessageSquare, text: "Chats" },
              { icon: Settings, text: "Settings" },
            ];
            const item = items[orderIndex];
            const ItemIcon = item.icon;
            return dyn.v1.addWrapDecoy(`sidebar-more-${orderIndex}`, (
              <div key={item.text} className={cn(dyn.v3.getVariant("quick-action", CLASS_VARIANTS_MAP, "flex items-center gap-2 px-3 py-1 rounded-md"), "w-full justify-start text-sm font-normal text-muted-foreground flex items-center rounded-lg")}>                
                <ItemIcon className="h-4 w-4" />
                <span>{item.text}</span>
              </div>
            ));
          })}
        </div>

        <div className="px-3 py-4">
          <div className="text-xs text-muted-foreground">
            <div className="flex justify-between mb-1">
              <span>{dyn.v3.getVariant("stats-tile", TEXT_VARIANTS_MAP, "Storage used")}</span>
              <span>2.1 GB of 15 GB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div className="bg-primary h-1 rounded-full" style={{ width: "14%" }} />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  ));
}
