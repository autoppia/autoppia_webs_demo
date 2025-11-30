"use client";

import type { ComponentProps, ElementType, ReactNode } from "react";
import { cn } from "@/utils/library_utils";
import { applyDynamicWrapper, pickVariant, useSeedValue, variantId } from "./variants";

type BlockProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  variantKey?: string;
} & Omit<ComponentProps<T>, "as" | "children" | "className">;

export function DynamicSection<T extends ElementType = "section">({
  as,
  children,
  className,
  variantKey = "section",
  ...props
}: BlockProps<T>) {
  const seed = useSeedValue();
  const Comp = (as ?? "section") as ElementType;
  const variant = pickVariant(seed, variantKey, 3);

  const node = (
    <Comp
      data-variant={variant}
      id={variantId(seed, variantKey)}
      className={cn(className, variant === 1 ? "border border-white/10" : "")}
      {...props}
    >
      {children}
    </Comp>
  );

  return <>{applyDynamicWrapper(seed, variantKey, node)}</>;
}

export function DynamicHeading<T extends ElementType = "h2">({
  as,
  children,
  className,
  variantKey = "heading",
  ...props
}: BlockProps<T>) {
  const seed = useSeedValue();
  const Comp = (as ?? "h2") as ElementType;
  const variant = pickVariant(seed, variantKey, 3);

  const node = (
    <Comp
      data-variant={variant}
      id={variantId(seed, variantKey)}
      className={cn(
        className,
        variant === 1 ? "tracking-tight" : "",
        variant === 2 ? "uppercase" : ""
      )}
      {...props}
    >
      {children}
    </Comp>
  );

  return <>{applyDynamicWrapper(seed, variantKey, node)}</>;
}

export function DynamicParagraph<T extends ElementType = "p">({
  as,
  children,
  className,
  variantKey = "paragraph",
  ...props
}: BlockProps<T>) {
  const seed = useSeedValue();
  const Comp = (as ?? "p") as ElementType;
  const variant = pickVariant(seed, variantKey, 3);

  const node = (
    <Comp
      data-variant={variant}
      id={variantId(seed, variantKey)}
      className={cn(className, variant === 1 ? "text-white/70" : "", variant === 2 ? "italic" : "")}
      {...props}
    >
      {children}
    </Comp>
  );

  return <>{applyDynamicWrapper(seed, variantKey, node)}</>;
}
