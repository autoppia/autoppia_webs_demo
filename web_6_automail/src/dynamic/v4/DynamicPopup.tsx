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
      return "w-full max-w-md sm:max-w-lg";
    case "banner":
    case "top-banner":
      return "w-full max-w-xl";
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
    <div
      className={`fixed inset-0 backdrop-blur-sm ${isCenter ? "flex items-center justify-center p-4" : ""}`}
      style={{
        zIndex: POPUP_LAYER_Z,
        backgroundColor: "rgba(0,0,0,0.88)",
        isolation: "isolate",
      }}
      data-v4="true"
      role="dialog"
      aria-modal="true"
      aria-label={variant.title}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.target === e.currentTarget) { e.preventDefault(); e.stopPropagation(); }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`w-full max-w-md rounded-xl border-2 border-amber-400/90 bg-neutral-900 text-white shadow-2xl shadow-black/50 px-6 py-6 sm:max-w-lg sm:px-8 sm:py-8 ${getPlacementClasses(variant.placement)}`}
        style={{
          ...placementStyle,
          position: (placementStyle?.position as React.CSSProperties["position"]) ?? "relative",
        }}
        data-popup-id={variant.popupId}
      >
        <div className="absolute left-0 right-0 top-0 h-1.5 rounded-t-xl bg-gradient-to-r from-amber-400 to-orange-500" />
        <h2 className="pr-8 text-xl font-semibold leading-tight text-white sm:text-2xl">{variant.title}</h2>
        {variant.body && <p className="mt-3 text-sm leading-relaxed text-neutral-200 sm:mt-4 sm:text-base">{variant.body}</p>}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-3 sm:mt-6">
          <button type="button" onClick={onClose} className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-black shadow-lg hover:bg-amber-400 transition focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-neutral-900">{variant.cta}</button>
        </div>
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-md p-1.5 text-neutral-300 transition hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-neutral-900" aria-label="Close">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
