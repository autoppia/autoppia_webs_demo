"use client";

import { useState } from "react";
import { useSeed } from "@/context/SeedContext";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

export default function DynamicDebug() {
  const { seed, resolvedSeeds } = useSeed();
  const dyn = useDynamicSystem();
  const [open, setOpen] = useState(false);

  const ids = {
    panel: dyn.v3.getVariant("debug-panel", ID_VARIANTS_MAP),
    badge: dyn.v3.getVariant("debug-badge", ID_VARIANTS_MAP),
    jobs: dyn.v3.getVariant("jobs-section-id", ID_VARIANTS_MAP),
    hires: dyn.v3.getVariant("hires-section-id", ID_VARIANTS_MAP),
    experts: dyn.v3.getVariant("experts-section-id", ID_VARIANTS_MAP),
    wizard: dyn.v3.getVariant("postjob-modal", ID_VARIANTS_MAP),
    hero: dyn.v3.getVariant("hero-banner", ID_VARIANTS_MAP),
    favorites: dyn.v3.getVariant("favorites-section", ID_VARIANTS_MAP),
    profile: dyn.v3.getVariant("profile-header", ID_VARIANTS_MAP),
    hireForm: dyn.v3.getVariant("hire-form", ID_VARIANTS_MAP),
  };

  const classes = {
    panel: dyn.v3.getVariant("debug-panel-class", CLASS_VARIANTS_MAP),
    badge: dyn.v3.getVariant("debug-badge-class", CLASS_VARIANTS_MAP),
    button: dyn.v3.getVariant("debug-button-class", CLASS_VARIANTS_MAP),
    tag: dyn.v3.getVariant("debug-tag", CLASS_VARIANTS_MAP),
    item: dyn.v3.getVariant("debug-item", CLASS_VARIANTS_MAP),
    bar: dyn.v3.getVariant("debug-bar", CLASS_VARIANTS_MAP),
    shell: dyn.v3.getVariant("section-shell", CLASS_VARIANTS_MAP),
  };

  const texts = {
    title: dyn.v3.getVariant("debug_title", TEXT_VARIANTS_MAP, "Dynamic Debug"),
    seedLabel: dyn.v3.getVariant("debug_seed_label", TEXT_VARIANTS_MAP, "Seed"),
    resolvedLabel: dyn.v3.getVariant("debug_resolved_label", TEXT_VARIANTS_MAP, "Resolved"),
    flagsLabel: dyn.v3.getVariant("debug_flags_label", TEXT_VARIANTS_MAP, "Flags"),
    v1Label: dyn.v3.getVariant("debug_v1", TEXT_VARIANTS_MAP, "V1 on"),
    v3Label: dyn.v3.getVariant("debug_v3", TEXT_VARIANTS_MAP, "V3 on"),
    orderLabel: dyn.v3.getVariant("debug_order_label", TEXT_VARIANTS_MAP, "Order keys"),
    info: dyn.v3.getVariant("debug_info", TEXT_VARIANTS_MAP, "Anti-scraping active"),
    sectionLabel: dyn.v3.getVariant("debug_section_label", TEXT_VARIANTS_MAP, "Tracked sections"),
    idsLabel: dyn.v3.getVariant("debug_ids_label", TEXT_VARIANTS_MAP, "Variants"),
  };

  const flags = {
    v1: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 === "true",
    v3: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 === "true",
  };

  return dyn.v1.addWrapDecoy("debug-widget", (
    <div
      id={ids.panel}
      className={`fixed bottom-4 right-4 z-[9999] text-xs text-[#1f2933] ${open ? "w-80" : "w-auto"} ${classes.panel}`}
    >
      <button
        type="button"
        className={`px-3 py-2 rounded-lg shadow border bg-white flex items-center gap-2 ${classes.button}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${classes.badge}`}>
          {texts.title}
        </span>
        <span className="font-semibold">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className={`mt-3 p-3 rounded-lg shadow border bg-white space-y-2 ${classes.shell}`}>
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm">{texts.info}</div>
            <div className={`text-[10px] px-2 py-1 rounded ${classes.tag}`}>
              {texts.flagsLabel}: {flags.v1 ? "V1" : "−"}/{flags.v3 ? "V3" : "−"}
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-2 text-[11px] ${classes.item}`}>
            <div className="flex justify-between"><span>{texts.seedLabel}</span><span>{seed}</span></div>
            <div className="flex justify-between"><span>{texts.resolvedLabel}</span><span>{resolvedSeeds.v1 ?? seed}</span></div>
            <div className="flex justify-between"><span>V2</span><span>{resolvedSeeds.v2 ?? "—"}</span></div>
            <div className="flex justify-between"><span>V3</span><span>{resolvedSeeds.v3 ?? "—"}</span></div>
          </div>

          <div className="pt-1 border-t border-gray-200">
            <div className="text-[11px] font-semibold mb-1">{texts.sectionLabel}</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(ids).map(([key, value]) => (
                <span key={key} className={`px-2 py-1 rounded border bg-gray-50 ${classes.bar}`}>
                  {key}:{value}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-1 border-t border-gray-200">
            <div className="text-[11px] font-semibold mb-1">{texts.idsLabel}</div>
            <div className="flex flex-wrap gap-1">
              <span className={`px-2 py-1 rounded bg-blue-50 border ${classes.tag}`}>{texts.orderLabel}</span>
              <span className={`px-2 py-1 rounded bg-green-50 border ${classes.tag}`}>{texts.v1Label}</span>
              <span className={`px-2 py-1 rounded bg-purple-50 border ${classes.tag}`}>{texts.v3Label}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  ));
}
