"use client";

import { Star } from "lucide-react";

interface RatingStarsProps {
  value: number; // 0..5
  onChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function RatingStars({ value, onChange, disabled = false, className }: RatingStarsProps) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={["inline-flex items-center gap-1", className ?? ""].join(" ")}>
      {stars.map((n) => {
        const active = n <= Math.round(value);
        return (
          <button
            key={n}
            type="button"
            className={[
              "inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 transition",
              disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10",
              active ? "bg-yellow-400/20" : "bg-white/5",
            ].join(" ")}
            onClick={() => !disabled && onChange?.(n)}
            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          >
            <Star className={`h-4 w-4 ${active ? "text-yellow-400" : "text-white/60"}`} fill={active ? "currentColor" : "none"} />
          </button>
        );
      })}
    </div>
  );
}


