import type * as React from "react";

import { cn } from "@/library/utils";

type BlurCardVariant = "default" | "muted" | "highlight";

export interface BlurCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BlurCardVariant;
  interactive?: boolean;
}

const variantClassMap: Record<BlurCardVariant, string> = {
  default: "",
  muted: "bg-white/75 border-white/40",
  highlight:
    "border-transparent bg-gradient-to-br from-indigo-500/90 via-sky-400/80 to-emerald-300/80 text-white shadow-elevated",
};

export function BlurCard({
  className,
  variant = "default",
  interactive = false,
  ...props
}: BlurCardProps) {
  return (
    <div
      className={cn(
        "glass-panel",
        variantClassMap[variant],
        interactive &&
          "card-hover focus-within:-translate-y-1 focus-within:shadow-elevated",
        interactive && "transition-transform duration-200",
        className
      )}
      {...props}
    />
  );
}
