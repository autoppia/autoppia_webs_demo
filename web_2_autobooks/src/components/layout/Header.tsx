"use client";

import { BookOpen, Bookmark, ShoppingCart, Home, Search, Info, Mail } from "lucide-react";
import { usePathname } from "next/navigation";
import { SeedLink } from "@/components/ui/SeedLink";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { cn } from "@/library/utils";
import { useDynamicSystem } from "@/dynamic/shared";
import { TEXT_VARIANTS_MAP } from "@/dynamic/v3";

const NAV_LINKS = [
  { label: "Home", href: "/", preserveSeed: true, icon: Home },
  { label: "Search", href: "/search", preserveSeed: true, icon: Search },
  { label: "Wishlist", href: "/wishlist", preserveSeed: true, icon: Bookmark },
  { label: "Cart", href: "/cart", preserveSeed: true, icon: ShoppingCart },
  { label: "About", href: "/about", preserveSeed: true, icon: Info },
  { label: "Contact", href: "/contact", preserveSeed: true, icon: Mail },
];

export function Header() {
  const { currentUser, logout } = useAuth();
  const { state: cartState } = useCart();
  const pathname = usePathname();
  const readingListCount = currentUser?.readingList?.length ?? 0;
  const cartCount = cartState.totalItems ?? 0;
  const dyn = useDynamicSystem();

  const isActive = (href: string) => {
    if (!pathname) return false;
    // Remove query parameters for comparison
    const cleanPathname = pathname.split("?")[0];
    
    if (href === "/") {
      return cleanPathname === "/";
    }
    // For exact matches like /login, /register, /search, etc.
    return cleanPathname === href || cleanPathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex w-full flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SeedLink href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-secondary" />
            <div>
              <p className="text-lg font-semibold uppercase tracking-widest">Autobooks</p>
              <p className="text-xs uppercase text-white/50">AI Reading Room</p>
            </div>
          </SeedLink>
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-sm text-white/70">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            const showBadge =
              link.href === "/wishlist"
                ? readingListCount > 0
                : link.href === "/cart"
                  ? cartCount > 0
                  : false;
            const badgeValue =
              link.href === "/wishlist" ? readingListCount : link.href === "/cart" ? cartCount : 0;
            const Icon = link.icon;
            return (
              <SeedLink
                key={link.label}
                href={link.href}
                preserveSeed={link.preserveSeed}
                className={cn(
                  "relative inline-flex items-center gap-2 transition-colors hover:text-white",
                  active ? "font-semibold text-secondary" : "text-white/70"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active ? "text-secondary" : "text-white/50 group-hover:text-white"
                  )}
                  aria-hidden="true"
                />
                {dyn.v3.getVariant(`nav_${link.label.toLowerCase()}`, TEXT_VARIANTS_MAP, link.label)}
                {showBadge && (
                  <span
                    className={cn(
                      "ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      active ? "bg-secondary/30 text-secondary" : "bg-secondary/20 text-secondary"
                    )}
                  >
                    {badgeValue}
                  </span>
                )}
              </SeedLink>
            );
          })}
          {currentUser ? (
            <>
              <SeedLink 
                href="/profile" 
                className={cn(
                  "font-semibold transition",
                  isActive("/profile") ? "text-secondary" : "text-secondary/80 hover:text-secondary"
                )}
              >
                {currentUser.username}
              </SeedLink>
              <button
                type="button"
                onClick={logout}
                className="text-xs uppercase tracking-wide text-white/60 hover:text-white transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <SeedLink 
                href="/signup" 
                className={cn(
                  "transition",
                  isActive("/signup") ? "font-semibold text-secondary" : "text-white/70 hover:text-white"
                )}
              >
                Register
              </SeedLink>
              <SeedLink 
                href="/login"
                className={cn(
                  "transition",
                  isActive("/login") ? "font-semibold text-secondary" : "text-white/70 hover:text-white"
                )}
              >
                Login
              </SeedLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
