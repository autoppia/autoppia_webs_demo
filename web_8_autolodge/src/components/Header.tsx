"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";
import { SeedLink } from "./ui/SeedLink";

export default function Header() {
  const pathname = usePathname();
  const dyn = useDynamicSystem();

  const navItems = useMemo(
    () => [
      { key: "nav-stays", name: dyn.v3.getVariant("nav_stays", TEXT_VARIANTS_MAP, "Stays"), href: "/" },
      { key: "nav-popular", name: dyn.v3.getVariant("nav_popular", TEXT_VARIANTS_MAP, "Popular"), href: "/popular" },
      { key: "nav-help", name: dyn.v3.getVariant("nav_help", TEXT_VARIANTS_MAP, "Help"), href: "/help" },
      { key: "nav-wishlist", name: dyn.v3.getVariant("nav_wishlist", TEXT_VARIANTS_MAP, "Wishlist"), href: "/wishlist" },
    ],
    [dyn.v3]
  );

  const navOrder = useMemo(
    () => dyn.v1.changeOrderElements("header-nav-links", navItems.length),
    [dyn.seed, navItems.length]
  );

  return (
    <>
      {dyn.v1.addWrapDecoy("header", (
      <header className="w-full flex flex-col items-center border-b border-neutral-200 bg-white sticky top-0 z-20">
        <nav
          id={dyn.v3.getVariant("nav_bar", ID_VARIANTS_MAP, "nav-bar")}
          className={cn(
            "w-full max-w-7xl flex items-center justify-between py-3 px-3 md:px-0 gap-6",
            dyn.v3.getVariant("nav_shell", CLASS_VARIANTS_MAP, "")
          )}
        >
          <div className="flex items-center gap-2 min-w-[130px]">
            <SeedLink
              id={dyn.v3.getVariant("nav_logo_link", ID_VARIANTS_MAP, "nav-logo-link")}
              href="/"
              className="flex items-center gap-1 select-none"
            >
              <span className="font-logo font-bold text-2xl text-[#18181b] tracking-tight">
                Auto
              </span>
              <span
                className="bg-[#616882] rounded-full text-white text-2xl font-bold py-1 px-3"
                style={{ lineHeight: 1.1, letterSpacing: "-0.5px" }}
              >
                Lodge
              </span>
            </SeedLink>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2">
              {navOrder.map((idx) => {
                const item = navItems[idx];
                const isActive = pathname === item.href || (item.href === "/" && pathname === "/");
                return (
                  <SeedLink
                    key={item.key}
                    href={item.href}
                    id={dyn.v3.getVariant(`${item.key}_id`, ID_VARIANTS_MAP, item.key)}
                    className={cn(
                      "px-3 py-2 font-medium text-lg rounded-full transition",
                      isActive ? "text-neutral-900 bg-neutral-100" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/80",
                      dyn.v3.getVariant("nav_link_class", CLASS_VARIANTS_MAP, "")
                    )}
                  >
                    {item.name}
                  </SeedLink>
                );
              })}
            </div>
          </div>
          <div className="min-w-[130px] flex justify-end" />
        </nav>
      </header>
      ), "header-wrap")}
    </>
  );
}
