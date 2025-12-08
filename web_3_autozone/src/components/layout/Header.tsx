"use client";

import { useEffect, useRef, useState } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import {
  Search,
  ChevronDown,
  ShoppingCart,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useSeed } from "@/context/SeedContext";
import { logEvent, EVENT_TYPES } from "@/events";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { cn } from "@/library/utils";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useSeedRouter();

  const categories = [
    { label: "All categories", value: "all" },
    { label: "Kitchen", value: "kitchen" },
    { label: "Technology", value: "technology" },
    { label: "Home", value: "home" },
    { label: "Electronics", value: "electronics" },
    { label: "Fitness", value: "fitness" },
  ];
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const buildSearchUrl = (value: string, category?: string) => {
    const trimmed = value.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    if (category && category !== "all") {
      params.set("category", category);
    }
    if ([...params.keys()].length === 0) return "/search";
    return `/search?${params.toString()}`;
  };

  const { state } = useCart();
  const cartItemCount = isMounted ? state.totalItems : 0;
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleCategorySelect = (category: (typeof categories)[number]) => {
    setSelectedCategory(category);
    setIsCategoryOpen(false);
    const destination = buildSearchUrl(searchQuery, category.value);
    logEvent(EVENT_TYPES.CATEGORY_FILTER, {
      category: category.value,
      destination,
      query: searchQuery.trim() || null,
      source: "header_dropdown",
    });
    router.push(destination);
  };

  const triggerSearch = () => {
    logEvent(EVENT_TYPES.SEARCH_PRODUCT, {
      query: searchQuery,
      category: selectedCategory.value,
    });
    router.push(buildSearchUrl(searchQuery, selectedCategory.value));
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl">
        <nav className="w-full mx-auto max-w-[1360px] px-4 pb-4 pt-4 sm:px-6 md:px-8">
          <div className="glass-panel w-full rounded-[28px] border-white/60 bg-white/85 shadow-lg px-4 py-3 shadow-elevated md:px-6 md:py-4">
            <div className="flex w-full flex-wrap items-center gap-4 md:flex-nowrap md:gap-6 justify-between">
              {/* Logo */}
              <SeedLink
                href="/"
                className="flex items-center rounded-2xl bg-slate-900 px-3 py-2 text-white shadow-lg"
              >
                <span className="text-lg font-semibold tracking-wide">
                  AUTOZONE
                </span>
                <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.25em]">
                  WEB3
                </span>
              </SeedLink>

              {/* Search Bar */}
              <div className="flex min-w-[320px] flex-1 items-stretch gap-0 rounded-full border border-slate-200 bg-white shadow-inner md:min-w-[420px] mx-1 md:mx-4">
                <div ref={categoryRef} className="relative flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen((prev) => !prev)}
                    className="flex h-full items-center gap-1.5 rounded-full bg-slate-100 px-4 py-3 text-[13px] font-semibold text-slate-700"
                  >
                    {selectedCategory.label}
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>
                  {isCategoryOpen && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-52 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl">
                      {categories.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => handleCategorySelect(category)}
                          className={cn(
                            "block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50",
                            category.value === selectedCategory.value &&
                              "bg-slate-900/5 font-semibold text-slate-900"
                          )}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") triggerSearch();
                  }}
                  placeholder="Search products, brands, and categories"
                  className="h-full min-h-[48px] flex-1 border-none bg-transparent px-4 text-sm focus-visible:ring-0"
                />
                <Button
                  aria-label="Search"
                  className="h-full min-h-[48px] rounded-l-none rounded-r-full bg-gradient-to-r from-indigo-500 to-sky-500 px-6 text-white shadow-md"
                  onClick={triggerSearch}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
                <SeedLink
                  href="/wishlist"
                  className="h-11 rounded-full border border-slate-200 px-4 inline-flex items-center text-xs font-semibold text-slate-600 hover:border-slate-400"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </SeedLink>

                <SeedLink
                  href="/cart"
                  className="relative inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-slate-700 shadow-sm"
                  onClick={() => logEvent(EVENT_TYPES.VIEW_CART)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="ml-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-semibold text-white">
                    {cartItemCount}
                  </span>
                </SeedLink>
              </div>

              {/* Mobile Actions */}
              <div className="ml-auto flex items-center gap-2 md:hidden">
                <SeedLink
                  href="/cart"
                  className="relative rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 shadow-sm"
                  onClick={() => logEvent(EVENT_TYPES.VIEW_CART)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                    {cartItemCount}
                  </span>
                </SeedLink>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 shadow-sm"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-4/5 max-w-sm flex-col bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                  Menu
                </p>
                <p className="text-base font-semibold text-slate-900">
                  Navigate Autozone
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-600"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Menu Links */}
            <nav className="flex flex-col gap-2">
              <SeedLink
                href="/"
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </SeedLink>
              <SeedLink
                href="/search"
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Products
              </SeedLink>
              <SeedLink
                href="/wishlist"
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wishlist
              </SeedLink>
              <SeedLink
                href="/cart"
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shopping Cart
              </SeedLink>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
