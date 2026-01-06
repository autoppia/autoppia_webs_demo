'use client';

import type React from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEmail } from '@/contexts/EmailContext';
import { Plus } from 'lucide-react';
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { TEXT_VARIANTS_MAP, ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3/utils/variant-selector";
import { cn } from "@/library/utils";

const LABEL_COLORS = [
  '#4285f4', // Blue
  '#0f9d58', // Green
  '#ff9800', // Orange
  '#9c27b0', // Purple
  '#f44336', // Red
  '#009688', // Teal
  '#795548', // Brown
  '#607d8b', // Blue Grey
  '#e91e63', // Pink
  '#ff5722', // Deep Orange
];

interface CreateLabelDialogProps {
  trigger?: React.ReactNode;
}

export function CreateLabelDialog({ trigger }: CreateLabelDialogProps) {
  const dyn = useDynamicSystem();
  const { createLabel } = useEmail();
  const [open, setOpen] = useState(false);
  const [labelName, setLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0]);

  const handleCreate = () => {
    if (labelName.trim()) {
      createLabel(labelName.trim(), selectedColor);
      logEvent(EVENT_TYPES.CREATE_LABEL, {
        label_name: labelName.trim(),
        label_color: selectedColor
      });  
      setLabelName('');
      setSelectedColor(LABEL_COLORS[0]);
      setOpen(false);
    }
  };

  const defaultTrigger = dyn.v1.addWrapDecoy("create-label-trigger", (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        dyn.v3.getVariant("create-label-button", CLASS_VARIANTS_MAP, "h-7 w-full justify-start gap-2 text-xs"),
        "h-7 w-full justify-start gap-2 text-xs"
      )}
      id={dyn.v3.getVariant("label-selector-trigger", ID_VARIANTS_MAP, "create-label-btn")}
      onClick={() => setOpen(true)}
    >
      <Plus className="h-3 w-3" />
      {dyn.v3.getVariant("create_label", TEXT_VARIANTS_MAP, "Create label")}
    </Button>
  ));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md" id={dyn.v3.getVariant("label-selector-menu", ID_VARIANTS_MAP, "create-label-dialog")}>
        <DialogHeader>
          <DialogTitle>{dyn.v3.getVariant("create_label", TEXT_VARIANTS_MAP, "Create New Label")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label-name">{dyn.v3.getVariant("label_section", TEXT_VARIANTS_MAP, "Label name")}</Label>
            <Input
              id={dyn.v3.getVariant("label-selector-trigger", ID_VARIANTS_MAP, "label-name")}
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              placeholder={dyn.v3.getVariant("create_label", TEXT_VARIANTS_MAP, "Enter label name...")}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className={cn(
                dyn.v3.getVariant("label-name-input", CLASS_VARIANTS_MAP, "!bg-muted/30 border rounded-md px-3 py-2 !text-foreground"),
                "border rounded-md px-3 py-2"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {LABEL_COLORS.map((color) => (
                <button
                  key={color}
                  id={`label-color-${color.replace('#', '')}`}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? 'border-foreground scale-110'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            id={dyn.v3.getVariant("cancel-create-label", ID_VARIANTS_MAP, "cancel-create-label-button")}
            className={cn(
              dyn.v3.getVariant("cancel-button", CLASS_VARIANTS_MAP, "variant-outline"),
              "variant-outline"
            )}
          >
            Cancel
          </Button>
          <Button
            id={dyn.v3.getVariant("create-label-button", ID_VARIANTS_MAP, "create-label-button")}
            onClick={handleCreate}
            className={cn(
              dyn.v3.getVariant("create-button", CLASS_VARIANTS_MAP, "btn-primary-gradient"),
              "btn-primary-gradient"
            )}
          >
            Create Label
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
