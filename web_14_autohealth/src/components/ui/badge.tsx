import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "ring-1 ring-border text-foreground",
  } as const;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
