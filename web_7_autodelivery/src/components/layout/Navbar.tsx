"use client";

import { SeedLink } from "@/components/ui/SeedLink";
import CartNavIcon from "@/components/cart/CartNavIcon";
import { Button } from "@/components/ui/button";
import { EVENT_TYPES, logEvent } from "@/components/library/events";
import { useSeedLayout } from "@/hooks/use-seed-layout";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

export default function Navbar() {
  const layout = useSeedLayout();
  const dyn = useDynamicSystem();

  return (
    <>
      {dyn.v1.addWrapDecoy("navbar", (
        <nav className={`sticky top-0 z-40 border-b border-emerald-950/10 bg-white/90 backdrop-blur-xl ${layout.navbar?.containerClass || ""}`}>
          <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
            <div className="justify-self-start">
              <SeedLink
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-950 to-emerald-700 px-4 py-2 text-white shadow-sm"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">Auto</span>
                <span className="text-base font-extrabold tracking-tight">Delivery</span>
              </SeedLink>
            </div>

            <div className="flex items-center justify-self-end gap-2 sm:gap-3">
              <SeedLink
                href="/restaurants"
                id={dyn.v3.getVariant("nav-link", ID_VARIANTS_MAP, "nav-link")}
                className="hidden items-center text-sm font-semibold text-emerald-900 transition-colors hover:text-emerald-700 md:inline-flex"
                aria-label={dyn.v3.getVariant("nav_menu", undefined, "Main navigation")}
              >
                {dyn.v3.getVariant("menu_restaurants", TEXT_VARIANTS_MAP, "Restaurants")}
              </SeedLink>
              <CartNavIcon />
              <Button
                id={dyn.v3.getVariant("quick-order-header", ID_VARIANTS_MAP, "quick-order-header")}
                className={`h-10 rounded-full bg-emerald-600 px-4 text-white hover:bg-emerald-700 sm:px-5 ${dyn.v3.getVariant("quick-order-button", CLASS_VARIANTS_MAP, "")}`}
                onClick={() => {
                  logEvent(EVENT_TYPES.QUICK_ORDER_STARTED, { source: "navbar" });
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("autodelivery:openQuickOrder"));
                  }
                }}
                aria-label={dyn.v3.getVariant("quick_order_header", undefined, dyn.v3.getVariant("quick_order_button", TEXT_VARIANTS_MAP, "Quick Order"))}
              >
                {dyn.v3.getVariant("quick_order_button", TEXT_VARIANTS_MAP, "Quick Order")}
              </Button>
            </div>
          </div>
        </nav>
      ))}
    </>
  );
}
