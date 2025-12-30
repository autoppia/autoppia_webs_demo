"use client";
import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP } from "@/dynamic/v3";

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
  const dyn = useDynamicSystem();
  const dynamicV3TextVariants: Record<string, string[]> = {
    add_dates: ["Add dates", "Select dates", "Choose dates"],
    date_range: ["Dates", "Stay dates", "Check dates"],
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{React.cloneElement(children as React.ReactElement, { id: dyn.v3.getVariant("date_popover_trigger", ID_VARIANTS_MAP, "date-popover-trigger") })}</PopoverTrigger>
      <PopoverContent
        id={dyn.v3.getVariant("date_popover_content", ID_VARIANTS_MAP, "date-popover-content")}
        sideOffset={12}
        align="start"
        className={`w-[520px] p-6 bg-white rounded-3xl border shadow-xl ${dyn.v3.getVariant("popover_content", CLASS_VARIANTS_MAP, "")}`}
      >
        {dyn.v1.addWrapDecoy("date-picker-content", (
          <div className="flex flex-col items-center">
            <div className="flex flex-row gap-8">
              {/* First month */}
              <Calendar
                id={dyn.v3.getVariant("date_calendar", ID_VARIANTS_MAP, "date-calendar")}
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
        ))}
      </PopoverContent>
    </Popover>
  );
}
