"use client";

import { SeedLink } from "@/components/ui/SeedLink";
import CartNavIcon from "@/components/cart/CartNavIcon";
import { Button } from "@/components/ui/button";
import { EVENT_TYPES, logEvent } from "@/components/library/events";
import { useSeedLayout } from "@/hooks/use-seed-layout";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

export default function Navbar() {
  const layout = useSeedLayout();
  const { getText, getId, getAria } = useV3Attributes();

  return (
    <nav className={`sticky top-0 z-30 bg-white border-b border-zinc-200 shadow-sm h-20 flex items-center px-6 gap-6 justify-between ${layout.navbar?.containerClass || ''}`}>
      <SeedLink
        href="/"
        className="font-extrabold text-xl text-zinc-800 tracking-tight flex items-center"
      >
        {getText("brand_name", "Auto")}<span className="text-green-600">{getText("brand_suffix", "Delivery")}</span>
      </SeedLink>

      <div className="flex items-center gap-4">
        <h1
          className="text-zinc-700 hover:text-green-600 font-medium px-3 py-1"
          aria-label={getAria("nav_menu", "Main navigation")}
        >
          {getText("menu_restaurants", "Restaurants")}
        </h1>
        <div className="hidden md:block w-px h-6 bg-zinc-200" />
        <CartNavIcon />
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => {
            logEvent(EVENT_TYPES.QUICK_ORDER_STARTED, { source: "navbar" });
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("autodelivery:openQuickOrder"));
            }
          }}
          id={getId("quick_order_header", "quick-order-header")}
          aria-label={getAria("quick_order_header", getText("quick_order_button", "Quick Order"))}
          {...layout.getElementAttributes('quick-order-header', 0)}
        >
          {getText("quick_order_button", "Quick Order")}
        </Button>
      </div>
    </nav>
  );
}
