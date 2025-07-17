"use client";
import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const DEFAULTS = [
  {
    key: "adults",
    label: "Adults",
    sub: "Ages 13 or above",
    min: 0,
    max: 10,
  },
  {
    key: "children",
    label: "Children",
    sub: "Ages 2 – 12",
    min: 0,
    max: 10,
  },
  {
    key: "infants",
    label: "Infants",
    sub: "Under 2",
    min: 0,
    max: 5,
  },
  {
    key: "pets",
    label: "Pets",
    sub: "Bringing a service animal?",
    min: 0,
    max: 5,
  },
] as const;

type GuestCounts = { adults: number; children: number; infants: number; pets: number };

export function GuestSelectorPopover({
  counts,
  setCounts,
  children,
}: {
  counts: GuestCounts,
  setCounts: (g: GuestCounts) => void,
  children: React.ReactNode,
}) {
  const [open, setOpen] = React.useState(false);

  const changeCount = (key: keyof GuestCounts, delta: number) => {
    setCounts({ ...counts, [key]: Math.max(0, counts[key] + delta) });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent sideOffset={12} align="end" className="min-w-[370px] p-0 pt-2 bg-white rounded-3xl border shadow-xl">
        <div className="p-6 w-full flex flex-col gap-1">
          {DEFAULTS.map((row) => (
            <div className="flex items-center justify-between py-3" key={row.key}>
              <div className="flex flex-col">
                <span className="font-semibold text-[17px]">{row.label}</span>
                <span className="text-sm text-neutral-400">{row.sub}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full border text-xl bg-white disabled:opacity-40"
                  onClick={() => changeCount(row.key as keyof GuestCounts, -1)}
                  disabled={counts[row.key as keyof GuestCounts] <= row.min}
                  aria-label={`Decrease ${row.label}`}
                >–</button>
                <span className="min-w-[16px] text-neutral-700 tabular-nums text-lg text-center">{counts[row.key as keyof GuestCounts]}</span>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full border text-xl bg-white disabled:opacity-40"
                  onClick={() => changeCount(row.key as keyof GuestCounts, 1)}
                  disabled={counts[row.key as keyof GuestCounts] >= row.max}
                  aria-label={`Increase ${row.label}`}
                >+</button>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
