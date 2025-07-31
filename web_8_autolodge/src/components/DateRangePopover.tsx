"use client";
import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addMonths, addDays, isAfter } from "date-fns";

export function DateRangePopover({
  placeholder = "Add dates",
  selectedRange,
  setSelectedRange,
  children,
}: {
  placeholder?: string;
  selectedRange: { from: Date | null; to: Date | null };
  setSelectedRange: (v: { from: Date | null; to: Date | null }) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);

  // Handles click on a calendar cell to set range
  const handleSelect = (date: Date) => {
    if (!selectedRange.from || (selectedRange.from && selectedRange.to)) {
      setSelectedRange({ from: date, to: null });
    } else if (selectedRange.from && !selectedRange.to) {
      if (isAfter(date, selectedRange.from)) {
        setSelectedRange({ from: selectedRange.from, to: date });
        setOpen(false);
      } else {
        setSelectedRange({ from: date, to: null });
      }
    }
  };

  // Highlights range in calendar
  const isInRange = (date: Date) => {
    const { from, to } = selectedRange;
    if (!from) return false;
    if (from && !to && hoveredDate) {
      return (
        (isAfter(date, from) && isAfter(hoveredDate, date)) ||
        (isAfter(from, date) && isAfter(date, hoveredDate))
      );
    }
    if (from && to) {
      return isAfter(date, from) && isAfter(to, date);
    }
    return false;
  };

  // Labels
  let label = placeholder;
  if (selectedRange.from && selectedRange.to) {
    label = `${selectedRange.from.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })} - ${selectedRange.to.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })}`;
  } else if (selectedRange.from) {
    label = selectedRange.from.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  // Today for reference
  const today = new Date();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{React.cloneElement(children as React.ReactElement, { id: "dateRangePopoverTrigger" })}</PopoverTrigger>
      <PopoverContent
        id="dateRangePopoverContent"
        sideOffset={12}
        align="start"
        className="w-[520px] p-6 bg-white rounded-3xl border shadow-xl"
      >
        <div className="flex flex-col items-center">
          <div className="flex flex-row gap-8">
            {/* First month */}
            <Calendar
              id="dateRangeCalendar"
              mode="range"
              numberOfMonths={2}
              selected={{
                from: selectedRange.from ?? undefined,
                to: selectedRange.to ?? undefined,
              }}
              onSelect={(range) => {
                if (!range) return;
                setSelectedRange({
                  from: range.from ?? null,
                  to: range.to ?? null,
                });
                if (range.from && range.to) setOpen(false);
              }}
            />
           
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
