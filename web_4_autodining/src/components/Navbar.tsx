"use client";

import { useSeed } from "@/context/SeedContext";
import { SeedLink } from "@/components/ui/SeedLink";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

interface NavbarProps {
  showSearch?: boolean;
  searchInputId?: string;
  searchButtonId?: string;
  onSearchClick?: () => void;
}

export default function Navbar({
  showSearch = false,
  searchInputId,
  searchButtonId,
  onSearchClick
}: NavbarProps) {
  const dyn = useDynamicSystem();

  const navLinks = [
    { href: "/help", label: "Help", key: "nav-help", textKey: "nav_help" },
    { href: "/about", label: "About", key: "nav-about", textKey: "nav_about" },
    { href: "/contact", label: "Contact", key: "nav-contact", textKey: "nav_contact" },
    ...(showSearch ? [{ href: "/faqs", label: "FAQs", key: "nav-faqs", textKey: "nav_faqs" }] : []),
  ];
  const navOrder = dyn.v1.changeOrderElements("navbar-links", navLinks.length);
  const orderedNavLinks = navOrder.map((idx) => navLinks[idx]);

  return (
    <nav
      className="w-full sticky top-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl"
      id={dyn.v3.getVariant("navbar", ID_VARIANTS_MAP, "navbar")}
    >
      {dyn.v1.addWrapDecoy("navbar-container", (
        <div className="w-full flex items-center h-16 px-8 gap-6 max-w-[1400px] mx-auto">
          {dyn.v1.addWrapDecoy("navbar-logo", (
            <div className="flex items-center gap-3 ml-0">
              <SeedLink href="/">
                {dyn.v1.addWrapDecoy("navbar-logo-link", (
                  <div className="flex items-center h-9 gap-2.5" id={dyn.v3.getVariant("navbar-logo", ID_VARIANTS_MAP, "navbar-logo")}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20"><span className="text-white font-black text-xs tracking-tighter">AD</span></div>
                    <span className="font-bold text-white/90 text-lg tracking-tight">Auto<span className="text-amber-500">Dining</span></span>
                  </div>
                ))}
              </SeedLink>
            </div>
          ), "navbar-logo-wrap")}
          <div className="flex-1" />
          {dyn.v1.addWrapDecoy("navbar-links-container", (
            <div className="flex items-center gap-1 mr-0" id={dyn.v3.getVariant("navbar-links", ID_VARIANTS_MAP, "navbar-links")}>
              {orderedNavLinks.map((link) => (
                <SeedLink
                  key={link.key}
                  className={cn(
                    dyn.v3.getVariant("nav-link", CLASS_VARIANTS_MAP, "nav-link"),
                    "text-[13px] text-white/50 hover:text-amber-400 px-4 py-2 rounded-full hover:bg-white/[0.06] transition-all duration-300 font-medium tracking-wide"
                  )}
                  href={link.href}
                  id={dyn.v3.getVariant(link.key, ID_VARIANTS_MAP, link.key)}
                >
                  {dyn.v1.addWrapDecoy(link.key, dyn.v3.getVariant(link.textKey, TEXT_VARIANTS_MAP, link.label))}
                </SeedLink>
              ))}
            </div>
          ), "navbar-links-wrap")}
        </div>
      ), "navbar-main-wrap")}
    </nav>
  );
}
