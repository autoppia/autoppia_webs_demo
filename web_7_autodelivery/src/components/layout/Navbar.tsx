"use client";

import { SeedLink } from "@/components/ui/SeedLink";
import CartNavIcon from "@/components/cart/CartNavIcon";
import { Button } from "@/components/ui/button";
import { EVENT_TYPES, logEvent } from "@/components/library/events";
import { useSeedLayout } from "@/hooks/use-seed-layout";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

export default function Navbar() {
  const layout = useSeedLayout();
  const dyn = useDynamicSystem();

  return (
    <>
      {dyn.v1.addWrapDecoy("navbar", (
        <nav className={`sticky top-0 z-30 bg-white border-b border-zinc-200 shadow-sm h-20 ${layout.navbar?.containerClass || ''}`}>
          <div className="max-w-7xl mx-auto h-full px-6 flex items-center gap-6 justify-between">
            <SeedLink
              href="/"
              className="font-extrabold text-xl text-zinc-800 tracking-tight flex items-center"
            >
              {dyn.v3.getVariant("brand_name", undefined, "Auto")}<span className="text-green-600">{dyn.v3.getVariant("brand_suffix", undefined, "Delivery")}</span>
            </SeedLink>

            <div className="flex items-center gap-4">
              <h1
                id={dyn.v3.getVariant("nav-link", ID_VARIANTS_MAP, "nav-link")}
                className="text-zinc-700 hover:text-green-600 font-medium px-3 py-1"
                aria-label={dyn.v3.getVariant("nav_menu", undefined, "Main navigation")}
              >
                {dyn.v3.getVariant("menu_restaurants", TEXT_VARIANTS_MAP, "Restaurants")}
              </h1>
              <div className="hidden md:block w-px h-6 bg-zinc-200" />
              <CartNavIcon />
              <Button
                id={dyn.v3.getVariant("quick_order_header", ID_VARIANTS_MAP, "quick-order-header")}
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  logEvent(EVENT_TYPES.QUICK_ORDER_STARTED, { source: "navbar" });
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("autodelivery:openQuickOrder"));
                  }
                }}
                aria-label={dyn.v3.getVariant("quick_order_header", undefined, dyn.v3.getVariant("quick_order_button", TEXT_VARIANTS_MAP, "Quick Order"))}
                {...layout.getElementAttributes('quick-order-header', 0)}
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
