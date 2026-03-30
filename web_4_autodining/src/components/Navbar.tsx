"use client";
import { useState, useEffect } from "react";

import { useSeed } from "@/context/SeedContext";
import { SeedLink } from "@/components/ui/SeedLink";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";
import { ArrowLeft, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparent]);

  const dyn = useDynamicSystem();
  const { currentUser, isAuthenticated } = useAuth();

  // V1: Order navigation links dynamically
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
        transparent
          ? (isScrolled ? "bg-[#dc2626] border-b border-red-700 shadow-lg text-white" : "bg-transparent border-transparent text-white")
          : "bg-[#dc2626] border-b border-red-700 text-white shadow-lg"
      )}
      id={dyn.v3.getVariant("navbar", ID_VARIANTS_MAP, "navbar")}
    >
      {dyn.v1.addWrapDecoy("navbar-container", (
        <div className="w-full flex items-center h-20 px-6 gap-6">
          {/* Logo section - always on left */}
          <div className="flex items-center gap-4">
            {showBack && (
              <SeedLink
                href="/"
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
                  transparent ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-gray-600"
                )}
                id="navbar-back-button"
              >
                <ArrowLeft className="w-6 h-6" />
              </SeedLink>
            )}
            
            {dyn.v1.addWrapDecoy("navbar-logo", (
              <div className="flex items-center gap-3 ml-0">
                <SeedLink href="/">
                  {dyn.v1.addWrapDecoy("navbar-logo-link", (
                    <div
                      className="bg-white px-3 py-1 rounded flex items-center h-9"
                      id={dyn.v3.getVariant("navbar-logo", ID_VARIANTS_MAP, "navbar-logo")}
                    >
                      <span className="font-bold text-[#dc2626] text-lg">
                        AutoDining
                      </span>
                    </div>
                  ))}
                </SeedLink>
              </div>
            ), "navbar-logo-wrap")}
          </div>

          <div className="flex-1" />

          {/* Navigation links - right */}
          {dyn.v1.addWrapDecoy("navbar-links-container", (
            <div
              className="flex items-center gap-6 mr-0"
              id={dyn.v3.getVariant("navbar-links", ID_VARIANTS_MAP, "navbar-links")}
            >
              {orderedNavLinks.map((link) => (
                <SeedLink
                  key={link.key}
                  className={cn(
                    dyn.v3.getVariant("nav-link", CLASS_VARIANTS_MAP, "nav-link"),
                    "text-sm transition-colors",
                    "text-white/90 hover:text-white"
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
                      "text-sm font-semibold flex items-center gap-2 px-4 py-2 rounded-full transition-all border",
                      isAuthenticated
                        ? "bg-white/20 text-white border-white/30 hover:bg-white/30"
                        : "bg-white/10 text-white border-white/20 hover:bg-white/30"
                    )}
                    id="navbar-account-button"
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

