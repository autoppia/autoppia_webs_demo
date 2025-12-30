"use client";

import type React from "react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateLabelDialog } from "@/components/CreateLabelDialog";
import { useEmail } from "@/contexts/EmailContext";
import { Tag, Plus } from "lucide-react";
import type { Email, Label } from "@/types/email";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3/utils/variant-selector";

interface LabelSelectorProps {
  email?: Email;
  emailIds?: string[];
  trigger?: React.ReactNode;
}

export function LabelSelector({
  email,
  emailIds,
  trigger,
}: LabelSelectorProps) {
  const dyn = useDynamicSystem();
  const {
    getAllLabels,
    addLabelToEmails,
    removeLabelFromEmails,
    setFilter,
    setCurrentEmail,
  } = useEmail();
  const [open, setOpen] = useState(false);
  const [optimisticStates, setOptimisticStates] = useState<
    Record<string, boolean>
  >({});

  const allLabels = getAllLabels();

  // Only allow user labels and a couple of system labels
  const assignableLabels = allLabels.filter(
    (label) =>
      label.type === "user" || ["starred", "important"].includes(label.id)
  );

  const targetEmailIds = emailIds || (email ? [email.id] : []);
  const currentLabels = email?.labels || [];

  const isLabelApplied = (label: Label) => {
    // Check optimistic state first for immediate feedback
    if (Object.hasOwn(optimisticStates, label.id)) {
      return optimisticStates[label.id];
    }

    if (email) {
      // Single email case
      return currentLabels.some((l) => l.id === label.id);
    }
    // For bulk operations, we don't track checked state
    return false;
  };

  const handleLabelToggle = (label: Label, checked: boolean) => {
    try {
      // Set optimistic state for immediate feedback
      setOptimisticStates((prev) => ({
        ...prev,
        [label.id]: checked,
      }));

      if (targetEmailIds.length > 0) {
        if (checked) {
          addLabelToEmails(targetEmailIds, label);
        } else {
          removeLabelFromEmails(targetEmailIds, label.id);
        }

        // Log differently based on single email vs. bulk operation
        const logData = {
          label_id: label.id,
          label_name: label.name,
          action: checked ? "added" : "removed",
          ...(email
            ? {
                emails: [
                  { subject: email.subject || "", body: email.body || "" },
                ],
              }
            : { email_ids: targetEmailIds }),
        };

        logEvent(EVENT_TYPES.ADD_LABEL, logData);
      }

      // Close the dropdown
      setOpen(false);

      // Navigate back to inbox after applying label
      setTimeout(() => {
        setCurrentEmail(null); // Close email view if open
        setFilter({ folder: "inbox" }); // Return to inbox

        // Clear optimistic state
        setOptimisticStates((prev) => {
          const newStates = { ...prev };
          delete newStates[label.id];
          return newStates;
        });
      }, 100);
    } catch (error) {
      console.error("Error toggling label:", error);
      // Revert optimistic state on error
      setOptimisticStates((prev) => ({
        ...prev,
        [label.id]: !checked,
      }));
    }
  };

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      id={dyn.v3.getVariant("label-selector", ID_VARIANTS_MAP, "label-selector-trigger")}
      className={dyn.v3.getVariant("label-selector", CLASS_VARIANTS_MAP, "")}
    >
      <Tag className="h-5 w-5" />
    </Button>
  );

  if (targetEmailIds.length === 0) {
    return null;
  }

  return dyn.v1.addWrapDecoy("label-selector", (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56"
        id={dyn.v3.getVariant("label-selector", ID_VARIANTS_MAP, "label-selector-menu")}
      >
        <div className="px-2 py-1.5 text-sm font-medium">
          {emailIds ? `Label ${emailIds.length} emails` : dyn.v3.getVariant("label_section", TEXT_VARIANTS_MAP, "Label email")}
        </div>
        <DropdownMenuSeparator />

        {assignableLabels.map((label) => (
          <DropdownMenuItem
            key={label.id}
            className="flex items-center gap-3 cursor-pointer"
            onSelect={(e) => e.preventDefault()}
          >
            <Checkbox
              checked={isLabelApplied(label)}
              onCheckedChange={(checked) =>
                handleLabelToggle(label, checked as boolean)
              }
            />
            <div
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: label.color }}
            />
            <span className="flex-1">{label.name}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <CreateLabelDialog
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 h-auto p-0"
              >
                <Plus className="h-3 w-3" />
                {dyn.v3.getVariant("label_section", TEXT_VARIANTS_MAP, "Create new label")}
              </Button>
            }
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ));
}
