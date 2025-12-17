"use client";

import { useEffect, useRef, useState, useMemo } from "react";
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
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useSeedRouter();
  const dyn = useDynamicSystem();

  const categories = [
    { label: "All categories", value: "all" },
    { label: "Kitchen", value: "kitchen" },
    { label: "Technology", value: "technology" },
    { label: "Home", value: "home" },
    { label: "Electronics", value: "electronics" },
    { label: "Fitness", value: "fitness" },
  ];
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  // Dynamic ordering for categories
  const orderedCategories = useMemo(() => {
    const order = dyn.v1.changeOrderElements("header-categories", categories.length);
    return order.map((idx) => categories[idx]);
  }, [dyn.seed]);

  // Local text variants
  const dynamicV3TextVariants: Record<string, string[]> = {
    search_placeholder: [
      "Search products, brands, and categories",
      "Find products, brands, categories",
      "Search for products"
    ],
    wishlist: ["Wishlist", "Saved Items", "Favorites"],
    cart: ["Cart", "Shopping Cart", "Basket"],
    menu: ["Menu", "Navigation", "Options"],
    navigate_autozone: [
      "Navigate Autozone",
      "Menu",
      "Navigation"
    ],
    home: ["Home", "Homepage", "Main"],
    browse_products: [
      "Browse Products",
      "Search",
      "All Products"
    ],
    shopping_cart: [
      "Shopping Cart",
      "Cart",
      "Basket"
    ]
  };

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
      {dyn.v1.addWrapDecoy("header-container", (
        <header 
          id={dyn.v3.getVariant("header", ID_VARIANTS_MAP, "header")}
          className={dyn.v3.getVariant("header", CLASS_VARIANTS_MAP, "sticky top-0 z-50 w-full backdrop-blur-xl")}
        >
          {dyn.v1.addWrapDecoy("header-nav", (
            <nav 
              id={dyn.v3.getVariant("nav-menu", ID_VARIANTS_MAP, "main-nav")}
              className={dyn.v3.getVariant("nav-menu", CLASS_VARIANTS_MAP, "w-full mx-auto max-w-[1360px] px-4 pb-4 pt-4 sm:px-6 md:px-8")}
            >
              {dyn.v1.addWrapDecoy("header-nav-content", (
                <div className="glass-panel w-full rounded-[28px] border-white/60 bg-white/85 shadow-lg px-4 py-3 shadow-elevated md:px-6 md:py-4">
                  <div className="flex w-full flex-wrap items-center gap-4 md:flex-nowrap md:gap-6 justify-between">
                    {/* Logo */}
                    {dyn.v1.addWrapDecoy("header-logo", (
                      <SeedLink
                        href="/"
                        id={dyn.v3.getVariant("logo-link", ID_VARIANTS_MAP)}
                        className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "flex items-center rounded-2xl bg-slate-900 px-3 py-2 text-white shadow-lg")}
                      >
                        <span className="text-lg font-semibold tracking-wide">
                          AUTOZONE
                        </span>
                        <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.25em]">
                          WEB3
                        </span>
                      </SeedLink>
                    ))}

                    {/* Search Bar */}
                    {dyn.v1.addWrapDecoy("header-search-bar", (
                      <div 
                        id={dyn.v3.getVariant("search-input", ID_VARIANTS_MAP, "search-container")}
                        className={dyn.v3.getVariant("search-input", CLASS_VARIANTS_MAP, "flex min-w-[320px] flex-1 items-stretch gap-0 rounded-full border border-slate-200 bg-white shadow-inner md:min-w-[420px] mx-1 md:mx-4")}
                      >
                        {dyn.v1.addWrapDecoy("header-category-dropdown", (
                          <div ref={categoryRef} className="relative flex items-center">
                            {dyn.v1.addWrapDecoy("header-category-button", (
                              <button
                                type="button"
                                onClick={() => setIsCategoryOpen((prev) => !prev)}
                                id={dyn.v3.getVariant("category-link", ID_VARIANTS_MAP)}
                                className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "flex h-full items-center gap-1.5 rounded-full bg-slate-100 px-4 py-3 text-[13px] font-semibold text-slate-700")}
                              >
                                {selectedCategory.label}
                                <ChevronDown size={14} className="text-slate-400" />
                              </button>
                            ))}
                            {isCategoryOpen && (
                              dyn.v1.addWrapDecoy("header-category-menu", (
                                <div className="absolute left-0 top-full z-50 mt-2 w-52 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl">
                                  {orderedCategories.map((category) => (
                                    dyn.v1.addWrapDecoy(`header-category-item-${category.value}`, (
                                      <button
                                        key={category.value}
                                        type="button"
                                        onClick={() => handleCategorySelect(category)}
                                        id={dyn.v3.getVariant("category-link", ID_VARIANTS_MAP, `category-${category.value}`)}
                                        className={cn(
                                          dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"),
                                          category.value === selectedCategory.value &&
                                            "bg-slate-900/5 font-semibold text-slate-900"
                                        )}
                                      >
                                        {category.label}
                                      </button>
                                    ), category.value)
                                  ))}
                                </div>
                              ))
                            )}
                          </div>
                        ))}
                        {dyn.v1.addWrapDecoy("header-search-input", (
                          <Input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") triggerSearch();
                            }}
                            id={dyn.v3.getVariant("search-input", ID_VARIANTS_MAP)}
                            placeholder={dyn.v3.getVariant("search_placeholder", dynamicV3TextVariants, "Search products, brands, and categories")}
                            className={dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, "h-full min-h-[48px] flex-1 border-none bg-transparent px-4 text-sm focus-visible:ring-0")}
                          />
                        ))}
                        {dyn.v1.addWrapDecoy("header-search-button", (
                          <Button
                            aria-label={dyn.v3.getVariant("search_button", TEXT_VARIANTS_MAP, "Search")}
                            id={dyn.v3.getVariant("search-button", ID_VARIANTS_MAP)}
                            className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "h-full min-h-[48px] rounded-l-none rounded-r-full bg-gradient-to-r from-indigo-500 to-sky-500 px-6 text-white shadow-md")}
                            onClick={triggerSearch}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        ))}
                      </div>
                    ))}

                    {/* Desktop Navigation */}
                    {dyn.v1.addWrapDecoy("header-desktop-nav", (
                      <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
                        {dyn.v1.addWrapDecoy("header-wishlist-link", (
                          <SeedLink
                            href="/wishlist"
                            id={dyn.v3.getVariant("wishlist-button", ID_VARIANTS_MAP)}
                            className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "h-11 rounded-full border border-slate-200 px-4 inline-flex items-center text-xs font-semibold text-slate-600 hover:border-slate-400")}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            {dyn.v3.getVariant("wishlist", dynamicV3TextVariants, "Wishlist")}
                          </SeedLink>
                        ))}

                        {dyn.v1.addWrapDecoy("header-cart-link", (
                          <SeedLink
                            href="/cart"
                            id={dyn.v3.getVariant("cart-button", ID_VARIANTS_MAP)}
                            className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "relative inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-slate-700 shadow-sm")}
                            onClick={() => logEvent(EVENT_TYPES.VIEW_CART)}
                          >
                            <ShoppingCart className="h-5 w-5" />
                            <span className="ml-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-semibold text-white">
                              {cartItemCount}
                            </span>
                          </SeedLink>
                        ))}
                      </div>
                    ))}

                    {/* Mobile Actions */}
                    {dyn.v1.addWrapDecoy("header-mobile-actions", (
                      <div className="ml-auto flex items-center gap-2 md:hidden">
                        {dyn.v1.addWrapDecoy("header-mobile-cart-link", (
                          <SeedLink
                            href="/cart"
                            id={dyn.v3.getVariant("cart-button", ID_VARIANTS_MAP, "cart-mobile")}
                            className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "relative rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 shadow-sm")}
                            onClick={() => logEvent(EVENT_TYPES.VIEW_CART)}
                          >
                            <ShoppingCart className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                              {cartItemCount}
                            </span>
                          </SeedLink>
                        ))}
                        {dyn.v1.addWrapDecoy("header-mobile-menu-btn", (
                          <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            id={dyn.v3.getVariant("menu-button", ID_VARIANTS_MAP)}
                            className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 shadow-sm")}
                            aria-label={dyn.v3.getVariant("menu", dynamicV3TextVariants, "Open navigation")}
                          >
                            <Menu className="h-5 w-5" />
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          ))}
        </header>
      ))}

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            dyn.v1.addWrapDecoy("header-mobile-menu", (
              <div className="fixed inset-0 z-50 md:hidden">
                <div
                  className="absolute inset-0 bg-slate-950/50"
                  onClick={() => setMobileMenuOpen(false)}
                />
                {dyn.v1.addWrapDecoy("header-mobile-menu-content", (
                  <div className="absolute right-0 top-0 flex h-full w-4/5 max-w-sm flex-col bg-white p-6 shadow-2xl">
                    {dyn.v1.addWrapDecoy("header-mobile-menu-header", (
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                            {dyn.v3.getVariant("menu", dynamicV3TextVariants, "Menu")}
                          </p>
                          <p className="text-base font-semibold text-slate-900">
                            {dyn.v3.getVariant("navigate_autozone", dynamicV3TextVariants, "Navigate Autozone")}
                          </p>
                        </div>
                        {dyn.v1.addWrapDecoy("header-mobile-menu-close", (
                          <button
                            type="button"
                            onClick={() => setMobileMenuOpen(false)}
                            id={dyn.v3.getVariant("close-button", ID_VARIANTS_MAP)}
                            className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-full border border-slate-200 p-2 text-slate-600")}
                            aria-label="Close navigation"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        ))}
                      </div>
                    ))}

                    {/* Mobile Menu Links */}
                    {dyn.v1.addWrapDecoy("header-mobile-menu-nav", (
                      <nav className="flex flex-col gap-2">
                        {dyn.v1.addWrapDecoy("header-mobile-menu-home", (
                          <SeedLink
                            href="/"
                            id={dyn.v3.getVariant("nav-link", ID_VARIANTS_MAP, "nav-home")}
                            className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50")}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {dyn.v3.getVariant("home", dynamicV3TextVariants, "Home")}
                          </SeedLink>
                        ))}
                        {dyn.v1.addWrapDecoy("header-mobile-menu-search", (
                          <SeedLink
                            href="/search"
                            id={dyn.v3.getVariant("nav-link", ID_VARIANTS_MAP, "nav-search")}
                            className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50")}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {dyn.v3.getVariant("browse_products", dynamicV3TextVariants, "Browse Products")}
                          </SeedLink>
                        ))}
                        {dyn.v1.addWrapDecoy("header-mobile-menu-wishlist", (
                          <SeedLink
                            href="/wishlist"
                            id={dyn.v3.getVariant("nav-link", ID_VARIANTS_MAP, "nav-wishlist")}
                            className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50")}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {dyn.v3.getVariant("wishlist", dynamicV3TextVariants, "Wishlist")}
                          </SeedLink>
                        ))}
                        {dyn.v1.addWrapDecoy("header-mobile-menu-cart", (
                          <SeedLink
                            href="/cart"
                            id={dyn.v3.getVariant("nav-link", ID_VARIANTS_MAP, "nav-cart")}
                            className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50")}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {dyn.v3.getVariant("shopping_cart", dynamicV3TextVariants, "Shopping Cart")}
                          </SeedLink>
                        ))}
                      </nav>
                    ))}
                  </div>
                ))}
              </div>
            ))
          )}
        </>
      );
}
