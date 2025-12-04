"use client";

import type { ReactNode } from "react";
import { Fragment, useMemo } from "react";
import { useSeed } from "@/context/SeedContext";

const hashString = (value: string): number =>
  value.split("").reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7);

export const useSeedValue = () => {
  const { seed } = useSeed();
  return seed;
};

export const pickVariant = (seed: number, key: string, count: number): number => {
  if (count <= 1) return 0;
  return Math.abs(seed + hashString(key)) % count;
};

export const useVariant = (key: string, count: number): number => {
  const seed = useSeedValue();
  return useMemo(() => pickVariant(seed, key, count), [seed, key, count]);
};

export const variantId = (seed: number, key: string, prefix = "dyn"): string =>
  `${prefix}-${key}-${Math.abs(seed + hashString(key)) % 9999}`;

export const applyDynamicWrapper = (
  seed: number,
  key: string,
  children: ReactNode,
  reactKey?: string
): ReactNode => {
  const wrap = pickVariant(seed, `${key}-wrap`, 2) === 1;
  const decoyPos = pickVariant(seed, `${key}-decoy`, 3); // 0 none, 1 before, 2 after

  const core = wrap ? <span data-dyn-wrap={key}>{children}</span> : children;
  const decoy =
    decoyPos === 0 ? null : (
      <span
        data-decoy={variantId(seed, key, "decoy")}
        className="hidden"
        aria-hidden="true"
      />
    );

  if (decoyPos === 1) {
    return (
      <Fragment key={reactKey ?? variantId(seed, key, "wrap")}>
        {decoy}
        {core}
      </Fragment>
    );
  }
  if (decoyPos === 2) {
    return (
      <Fragment key={reactKey ?? variantId(seed, key, "wrap")}>
        {core}
        {decoy}
      </Fragment>
    );
  }
  return <Fragment key={reactKey ?? variantId(seed, key, "wrap")}>{core}</Fragment>;
};
