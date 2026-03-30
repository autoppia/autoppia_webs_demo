"use client";

import { useEffect, useState } from "react";

import { SeedLink } from "@/components/ui/SeedLink";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";
import { ArrowLeft, User } from "lucide-react";

interface NavbarProps {
  showSearch?: boolean;
  showBack?: boolean;
  transparent?: boolean;
  searchInputId?: string;
  searchButtonId?: string;
  onSearchClick?: () => void;
}

export default function Navbar({
  showSearch = false,
  showBack = false,
  transparent = false,
  searchInputId,
  searchButtonId,
  onSearchClick
}: NavbarProps) {
  const dyn = useDynamicSystem();
  const { currentUser, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparent]);

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
      className={cn(
        "w-full sticky top-0 z-50 transition-all duration-300",
        transparent && !isScrolled
          ? "border-transparent bg-transparent"
          : "border-b border-white/[0.06] bg-background/80 backdrop-blur-xl"
      )}
      id={dyn.v3.getVariant("navbar", ID_VARIANTS_MAP, "navbar")}
    >
      {dyn.v1.addWrapDecoy("navbar-container", (
        <div className="w-full flex items-center h-16 px-8 gap-6 max-w-[1400px] mx-auto">
          {showBack && (
            <SeedLink
              href="/"
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/[0.06] transition-colors text-white/70 hover:text-white"
              id="navbar-back-button"
            >
              <ArrowLeft className="w-5 h-5" />
            </SeedLink>
          )}

          {dyn.v1.addWrapDecoy("navbar-logo", (
            <div className="flex items-center gap-3 ml-0">
              <SeedLink href="/">
                {dyn.v1.addWrapDecoy("navbar-logo-link", (
                  <div className="flex items-center h-9 gap-2.5" id={dyn.v3.getVariant("navbar-logo", ID_VARIANTS_MAP, "navbar-logo")}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <span className="text-white font-black text-xs tracking-tighter">AD</span>
                    </div>
                    <span className="font-bold text-white/90 text-lg tracking-tight">
                      Auto<span className="text-amber-500">Dining</span>
                    </span>
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

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "text-[13px] font-semibold flex items-center gap-2 px-4 py-2 rounded-full transition-all border",
                      isAuthenticated
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                        : "bg-white/[0.04] text-white/70 border-white/[0.08] hover:bg-white/[0.06]"
                    )}
                    id="navbar-account-button"
                    type="button"
                  >
                    <User className="w-4 h-4" />
                    {isAuthenticated && currentUser ? currentUser.username : "Account"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none mr-6 mt-2" align="end">
                  <AuthModal />
                </PopoverContent>
              </Popover>
            </div>
          ), "navbar-links-wrap")}
        </div>
      ), "navbar-main-wrap")}
    </nav>
  );
}
