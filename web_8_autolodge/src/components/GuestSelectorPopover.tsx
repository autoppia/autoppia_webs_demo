"use client";
import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useDynamicStructure } from "@/context/DynamicStructureContext";

const DEFAULTS = [
  { key: "adults", labelKey: "adults_label", subKey: "adults_sub", min: 0, max: 10 },
  { key: "children", labelKey: "children_label", subKey: "children_sub", min: 0, max: 10 },
  { key: "infants", labelKey: "infants_label", subKey: "infants_sub", min: 0, max: 5 },
  { key: "pets", labelKey: "pets_label", subKey: "pets_sub", min: 0, max: 5 },
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
  const { getText } = useDynamicStructure();

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
                <span className="font-semibold text-[17px]">{getText(row.labelKey)}</span>
                <span className="text-sm text-neutral-400">{getText(row.subKey)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full border text-xl bg-white disabled:opacity-40"
                  onClick={() => changeCount(row.key as keyof GuestCounts, -1)}
                  disabled={counts[row.key as keyof GuestCounts] <= row.min}
                  aria-label={`${getText("decrease")} ${getText(row.labelKey)}`}
                >–</button>
                <span className="min-w-[16px] text-neutral-700 tabular-nums text-lg text-center">{counts[row.key as keyof GuestCounts]}</span>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full border text-xl bg-white disabled:opacity-40"
                  onClick={() => changeCount(row.key as keyof GuestCounts, 1)}
                  disabled={counts[row.key as keyof GuestCounts] >= row.max}
                  aria-label={`${getText("increase")} ${getText(row.labelKey)}`}
                >+</button>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
