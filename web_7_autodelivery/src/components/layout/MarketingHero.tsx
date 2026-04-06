import type { HTMLAttributes } from "react";

import { cn } from "@/components/library/utils";

type MarketingHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  chips: string[];
  className?: string;
  /** Optional attributes for instrumentation (e.g. data-element-type on the hero). */
  sectionProps?: HTMLAttributes<HTMLElement>;
};

/**
 * Shared hero band so home, /restaurants, and similar routes share one visual language.
 */
export function MarketingHero({
  eyebrow,
  title,
  description,
  chips,
  className = "",
  sectionProps,
}: MarketingHeroProps) {
  return (
    <section
      {...sectionProps}
      className={cn(
        "mb-10 rounded-2xl border-2 border-zinc-800/40 bg-gradient-to-r from-[#0f1e1b] via-[#0b442c] to-[#0a8a43] px-8 py-10 text-white shadow-lg ring-1 ring-white/10",
        sectionProps?.className,
        className,
      )}
    >
      <div className="max-w-3xl space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-white/80">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-extrabold leading-tight">{title}</h1>
        <p className="text-lg text-white/90">{description}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          {chips.map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-sm text-white"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
