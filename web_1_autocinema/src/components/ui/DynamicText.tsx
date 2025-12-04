"use client";

import type { ComponentProps, ElementType, ReactNode } from "react";
import { cn } from "@/utils/library_utils";
import { useSeedValue, pickVariant, variantId, applyDynamicWrapper } from "./variants";

type BaseProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  variantKey?: string;
} & Omit<ComponentProps<T>, "as" | "children" | "className">;

export function DynamicText<T extends ElementType = "p">({
  as,
  children,
  className,
  variantKey = "text",
  ...props
}: BaseProps<T>) {
  // Dynamic (seed-based) text styling/attrs
  const seed = useSeedValue();
  const element = (as ?? "p") as ElementType;
  const variant = pickVariant(seed, variantKey, 3);

  const Comp = element;
  const node = (
    <Comp
      data-variant={variant}
      id={variantId(seed, variantKey)}
      className={cn(
        className,
        variant === 1 ? "tracking-wide" : "",
        variant === 2 ? "italic" : ""
      )}
      {...props}
    >
      {children}
    </Comp>
  );

  return <>{applyDynamicWrapper(seed, `${variantKey}-wrap`, node)}</>;
}
