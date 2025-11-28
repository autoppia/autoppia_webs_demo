import * as React from "react";

import { cn } from "@/library/utils";

type SectionHeadingAlign = "left" | "center";

export interface SectionHeadingProps
  extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: SectionHeadingAlign;
  actions?: React.ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  actions,
  className,
  ...props
}: SectionHeadingProps) {
  const alignmentClasses =
    align === "center"
      ? "sm:flex-col sm:items-center sm:text-center"
      : "";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" ? "items-center text-center" : "text-left",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex-1 space-y-3",
          align === "center" && "flex flex-col items-center text-center",
          alignmentClasses
        )}
      >
        {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
        <h2 className="section-title">{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {actions && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-3",
            align === "center" && "justify-center"
          )}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

