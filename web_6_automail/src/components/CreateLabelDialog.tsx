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

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="h-7 w-full justify-start gap-2 text-xs">
      <Plus className="h-3 w-3" />
      Create label
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Label</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label-name">Label name</Label>
            <Input
              id="label-name"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              placeholder="Enter label name..."
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {LABEL_COLORS.map((color) => (
                <button
                  key={color}
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!labelName.trim()}
            className="btn-primary-gradient"
          >
            Create Label
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
