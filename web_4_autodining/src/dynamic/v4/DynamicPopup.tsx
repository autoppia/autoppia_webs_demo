"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { PopupVariant } from "./useDynamicPopup";

/** Above navbar and app UI so overlay and dialog are always visible. */
const POPUP_LAYER_Z = 2147483646;

interface DynamicPopupProps {
  variant: PopupVariant;
  onClose: () => void;
}

const FIXED_PLACEMENTS = ["bottom-right", "bottom-left", "banner", "top-right", "top-left", "top-banner", "middle-right", "middle-left"] as const;

function getPlacementStyle(placement: string): React.CSSProperties {
  switch (placement) {
    case "bottom-right":
      return { position: "fixed" as const, bottom: 24, right: 24, left: "auto", top: "auto" };
    case "bottom-left":
      return { position: "fixed" as const, bottom: 24, left: 24, right: "auto", top: "auto" };
    case "banner":
      return { position: "fixed" as const, bottom: 24, left: "50%", right: "auto", top: "auto", transform: "translateX(-50%)" };
    case "top-right":
      return { position: "fixed" as const, top: 24, right: 24, left: "auto", bottom: "auto" };
    case "top-left":
      return { position: "fixed" as const, top: 24, left: 24, right: "auto", bottom: "auto" };
    case "top-banner":
      return { position: "fixed" as const, top: 24, left: "50%", right: "auto", bottom: "auto", transform: "translateX(-50%)" };
    case "middle-right":
      return { position: "fixed" as const, top: "50%", right: 24, left: "auto", bottom: "auto", transform: "translateY(-50%)" };
    case "middle-left":
      return { position: "fixed" as const, top: "50%", left: 24, right: "auto", bottom: "auto", transform: "translateY(-50%)" };
    default:
      return {};
  }
}

function getPlacementClasses(placement: string): string {
  switch (placement) {
    case "bottom-right":
    case "bottom-left":
    case "top-right":
    case "top-left":
    case "middle-right":
    case "middle-left":
      // Fixed placements should never use full width; keep a stable responsive width.
      return "w-[min(30rem,calc(100vw-2rem))] lg:w-[min(46rem,calc(100vw-4rem))]";
    case "banner":
    case "top-banner":
      return "w-[min(46rem,calc(100vw-2rem))]";
    default:
      return "";
  }
}

export function DynamicPopup({ variant, onClose }: DynamicPopupProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      const target = e.target as Node;
      if (dialogRef.current && !dialogRef.current.contains(target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  const isCenter = !FIXED_PLACEMENTS.includes(variant.placement as (typeof FIXED_PLACEMENTS)[number]);
  const placementStyle = isCenter ? undefined : getPlacementStyle(variant.placement);
  const content = (
    <dialog
      className={`fixed inset-0 m-0 h-screen w-screen max-h-none max-w-none overflow-visible border-0 p-0 text-inherit backdrop-blur-sm ${isCenter ? "flex items-center justify-center p-4" : ""}`}
      style={{
        zIndex: POPUP_LAYER_Z,
        backgroundColor: "rgba(0,0,0,0.80)",
        isolation: "isolate",
      }}
      data-v4="true"
      aria-modal="true"
      aria-label={variant.title}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.target === e.currentTarget) { e.preventDefault(); e.stopPropagation(); }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
      open
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`max-w-none rounded-xl border-2 border-[#dc2626] bg-zinc-950 text-white shadow-2xl shadow-black/40 ${getPlacementClasses(variant.placement)}`}
        style={{
          ...placementStyle,
          position: (placementStyle?.position as React.CSSProperties["position"]) ?? "relative",
        }}
        data-popup-id={variant.popupId}
        >
        <div className="absolute left-0 right-0 top-0 h-1.5 rounded-t-xl bg-gradient-to-r from-[#dc2626] via-red-500 to-[#dc2626]" />
        <div className="flex flex-col gap-5 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:gap-8">
          <div className="min-w-0 flex-1">
            <h2 className="pr-8 text-xl font-semibold leading-tight text-white sm:text-2xl">
              {variant.title}
            </h2>
            {variant.body && (
              <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:mt-4 sm:text-base">
                {variant.body}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-[#dc2626] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:ring-offset-2 focus:ring-offset-white lg:w-auto"
            >
              {variant.cta}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-slate-500 transition hover:bg-red-950 hover:text-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:ring-offset-2 focus:ring-offset-white"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </dialog>
  );
  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
