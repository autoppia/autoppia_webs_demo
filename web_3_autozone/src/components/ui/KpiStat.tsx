import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/library/utils";
import { BlurCard } from "./BlurCard";

export interface KpiStatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  caption?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export function KpiStat({
  label,
  value,
  delta,
  trend = "up",
  caption,
  icon: Icon,
  className,
  children,
  ...props
}: KpiStatProps) {
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;
  const trendColor =
    trend === "down" ? "text-rose-500" : "text-emerald-500";

  return (
    <BlurCard className={cn("flex flex-col gap-3 p-5", className)} {...props}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
          {label}
        </p>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      </div>
      <div className="text-3xl font-semibold text-slate-900">{value}</div>
      {delta && (
        <div className={cn("flex items-center text-sm font-medium", trendColor)}>
          <TrendIcon className="mr-1 h-4 w-4" />
          {delta}
          {caption && (
            <span className="ml-2 text-slate-500">
              {caption}
            </span>
          )}
        </div>
      )}
      {!delta && caption && (
        <p className="text-sm text-slate-500">{caption}</p>
      )}
      {children}
    </BlurCard>
  );
}

