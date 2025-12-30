"use client";
import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useMemo } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP } from "@/dynamic/v3";
import { EVENT_TYPES, logEvent } from "@/library/events";

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
  const dyn = useDynamicSystem();
  const dynamicV3TextVariants: Record<string, string[]> = {
    adults_label: ["Adults", "Grown-ups", "Primary guests"],
    adults_sub: ["Ages 13 or above", "13+ years", "Teens & adults"],
    children_label: ["Children", "Kids", "Young guests"],
    children_sub: ["Ages 2 – 12", "2 to 12 years", "Young travelers"],
    infants_label: ["Infants", "Babies", "Little ones"],
    infants_sub: ["Under 2", "0-2 years", "Tiny travelers"],
    pets_label: ["Pets", "Animals", "Companions"],
    pets_sub: ["Bringing a service animal?", "Service animals?", "Traveling with pets?"],
    decrease: ["Decrease", "Reduce", "Minus"],
    increase: ["Increase", "Add", "Plus"],
  };

  const rowOrder = useMemo(
    () => dyn.v1.changeOrderElements("guest-rows", DEFAULTS.length),
    [dyn.seed]
  );

  const changeCount = (key: keyof GuestCounts, delta: number) => {
    const nextValue = Math.max(0, counts[key] + delta);
    setCounts({ ...counts, [key]: nextValue });
    if (delta > 0) {
      logEvent(EVENT_TYPES.INCREASE_NUMBER_OF_GUESTS, {
        guestType: key,
        from: counts[key],
        to: nextValue,
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        sideOffset={12}
        align="end"
        id={dyn.v3.getVariant("guests_popover", ID_VARIANTS_MAP, "guests-popover")}
        className={`min-w-[370px] p-0 pt-2 bg-white rounded-3xl border shadow-xl ${dyn.v3.getVariant("popover_content", CLASS_VARIANTS_MAP, "")}`}
      >
        <div className="p-6 w-full flex flex-col gap-1">
          {rowOrder.map((rowIndex) => {
            const row = DEFAULTS[rowIndex];
            const labelText = dyn.v3.getVariant(row.labelKey, dynamicV3TextVariants, row.key);
            const subText = dyn.v3.getVariant(row.subKey, dynamicV3TextVariants, "");
            return dyn.v1.addWrapDecoy(`guest-row-${row.key}`, (
              <div className="flex items-center justify-between py-3" key={row.key}>
                <div className="flex flex-col">
                  <span className="font-semibold text-[17px]">{labelText}</span>
                  <span className="text-sm text-neutral-400">{subText}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full border text-xl bg-white disabled:opacity-40"
                    onClick={() => changeCount(row.key as keyof GuestCounts, -1)}
                    disabled={counts[row.key as keyof GuestCounts] <= row.min}
                    aria-label={`${dyn.v3.getVariant("decrease", dynamicV3TextVariants, "Decrease")} ${labelText}`}
                  >–</button>
                  <span className="min-w-[16px] text-neutral-700 tabular-nums text-lg text-center">{counts[row.key as keyof GuestCounts]}</span>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full border text-xl bg-white disabled:opacity-40"
                    onClick={() => changeCount(row.key as keyof GuestCounts, 1)}
                    disabled={counts[row.key as keyof GuestCounts] >= row.max}
                    aria-label={`${dyn.v3.getVariant("increase", dynamicV3TextVariants, "Increase")} ${labelText}`}
                  >+</button>
                </div>
              </div>
            ));
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
