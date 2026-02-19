"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSeed } from "@/context/SeedContext";
import { selectVariantIndex } from "@/dynamic/shared/core";
import { isV4Enabled } from "@/dynamic/shared/flags";
import { POPUPS, type PopupDef } from "./config";

export interface PopupVariant {
  placement: string;
  title: string;
  body?: string;
  cta: string;
  popupId?: string;
}

export interface UseDynamicPopupResult {
  shouldShow: boolean;
  variant: PopupVariant | null;
  dismiss: () => void;
}

/** Max popups to show on a single page (initial + re-shows after dismiss) */
const MAX_POPUPS_PER_PAGE = 5;

function pickPopup(seed: number, pageKey: string, showIndex: number): PopupDef | null {
  if (POPUPS.length === 0) return null;
  const key = showIndex === 0 ? pageKey : `${pageKey}-again-${showIndex}`;
  return POPUPS[selectVariantIndex(seed, `${key}-popup`, POPUPS.length)];
}

function buildVariant(seed: number, pageKey: string, showIndex: number, popup: PopupDef): PopupVariant {
  const key = showIndex === 0 ? pageKey : `${pageKey}-again-${showIndex}`;
  const placementIndex = selectVariantIndex(seed, `${key}-placement`, popup.placements.length);
  const placement = popup.placements[placementIndex] ?? popup.placements[0];
  const titleArr = popup.texts.title ?? ["Message"];
  const ctaArr = popup.texts.cta ?? ["OK"];
  const bodyArr = popup.texts.body;
  const titleIndex = selectVariantIndex(seed, `${key}-title`, titleArr.length);
  const ctaIndex = selectVariantIndex(seed, `${key}-cta`, ctaArr.length);
  const bodyIndex = bodyArr ? selectVariantIndex(seed, `${key}-body`, bodyArr.length) : 0;
  return {
    placement,
    title: titleArr[titleIndex] ?? titleArr[0],
    body: bodyArr?.[bodyIndex] ?? bodyArr?.[0],
    cta: ctaArr[ctaIndex] ?? ctaArr[0],
    popupId: popup.id,
  };
}

function jitter([min, max]: [number, number], seed: number, key: string): number {
  const range = max - min + 1;
  const n = selectVariantIndex(seed, key, range);
  return min + n;
}

const noop = () => {};

const RE_SHOW_DELAY_MS: [number, number] = [3000, 8000];

export function useDynamicPopup(pageKey: string): UseDynamicPopupResult {
  const { seed } = useSeed();
  const [show, setShow] = useState(false);
  const [showIndex, setShowIndex] = useState(0);
  const [doneForThisPage, setDoneForThisPage] = useState(false);
  const reShowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** When popup is open, keep showing variant for this page until dismissed (so nav doesn't change content). */
  const lastShownPageKeyRef = useRef<string>(pageKey);
  const lastShowIndexRef = useRef<number>(0);

  useEffect(() => {
    setShowIndex(0);
    setDoneForThisPage(false);
    if (reShowTimeoutRef.current) {
      clearTimeout(reShowTimeoutRef.current);
      reShowTimeoutRef.current = null;
    }
    // Do not setShow(false) on nav so popup stays visible until user dismisses
  }, [pageKey]);

  const dismiss = useCallback(() => {
    const wasPageKey = lastShownPageKeyRef.current;
    setShow(false);
    if (reShowTimeoutRef.current) {
      clearTimeout(reShowTimeoutRef.current);
      reShowTimeoutRef.current = null;
    }
    if (pageKey !== wasPageKey) {
      lastShownPageKeyRef.current = pageKey;
      lastShowIndexRef.current = 0;
      setShowIndex(0);
      setDoneForThisPage(false);
      return;
    }
    if (showIndex + 1 >= MAX_POPUPS_PER_PAGE) {
      setDoneForThisPage(true);
      return;
    }
    const delay = jitter(RE_SHOW_DELAY_MS, seed, `${pageKey}-reshow-${showIndex}`);
    reShowTimeoutRef.current = setTimeout(() => {
      reShowTimeoutRef.current = null;
      const nextIndex = showIndex + 1;
      lastShownPageKeyRef.current = pageKey;
      lastShowIndexRef.current = nextIndex;
      setShowIndex(nextIndex);
      setShow(true);
    }, delay);
  }, [seed, pageKey, showIndex]);

  useEffect(() => {
    if (typeof window === "undefined" || !isV4Enabled() || seed === 1 || doneForThisPage) return;

    const popup = pickPopup(seed, pageKey, showIndex);
    if (!popup) return;

    const delay = jitter(popup.delayMs, seed, `${pageKey}-delay-${showIndex}`);
    const t = setTimeout(() => {
      lastShownPageKeyRef.current = pageKey;
      lastShowIndexRef.current = showIndex;
      setShow(true);
    }, delay);
    return () => clearTimeout(t);
  }, [seed, pageKey, showIndex, doneForThisPage]);

  if (!show) {
    return { shouldShow: false, variant: null, dismiss: noop };
  }

  const displayPageKey = lastShownPageKeyRef.current;
  const displayShowIndex = lastShowIndexRef.current;
  const popup = pickPopup(seed, displayPageKey, displayShowIndex);
  if (!popup) {
    return { shouldShow: false, variant: null, dismiss: noop };
  }

  const variant = buildVariant(seed, displayPageKey, displayShowIndex, popup);
  return { shouldShow: true, variant, dismiss };
}
