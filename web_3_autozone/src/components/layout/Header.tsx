"use client";

import { useEffect, useRef, useState } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import {
  Search,
  ChevronDown,
  ShoppingCart,
  Menu,
  Globe,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { useSeed } from "@/context/SeedContext";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { getLayoutConfig } from "@/dynamic/v2-data";
import { getLayoutClasses } from "@/dynamic/v1-layouts";
import { cn } from "@/library/utils";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
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

  const languages = [
    { code: "en-US", label: "English (EN)", short: "EN" },
    { code: "es-ES", label: "Español (ES)", short: "ES" },
    { code: "fr-FR", label: "Français (FR)", short: "FR" },
  ];
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  const accountActions = [
    { label: "View orders", href: "/checkout" },
    { label: "Saved wishlist", href: "/wishlist" },
    { label: "Account settings", href: "/search?q=account" },
  ];

  const secondaryLinks = [
    { label: "Operations", href: "/#operations" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Search", href: "/search" },
    { label: "Cart", href: "/cart" },
    { label: "Checkout", href: "/checkout" },
    { label: "Support", href: "/search?q=customer%20service" },
  ];

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
  const { getText, getId } = useV3Attributes();
  const { seed } = useSeed();
  const layoutConfig = getLayoutConfig(seed);
  const layoutClasses = getLayoutClasses(layoutConfig);
  const liveRoutes = 18 + (seed % 7);
  const liveCrews = 52 + (seed % 11);

  const languageRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setLanguageMenuOpen(false);
      }
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
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

  useEffect(() => {
    if (mobileMenuOpen) {
      setLanguageMenuOpen(false);
      setAccountMenuOpen(false);
      setIsCategoryOpen(false);
    }
  }, [mobileMenuOpen]);

  const handleLanguageSelect = (language: (typeof languages)[number]) => {
    setSelectedLanguage(language);
    setLanguageMenuOpen(false);
    logEvent(EVENT_TYPES.LANGUAGE_CHANGE, {
      language: language.code,
    });
  };

  const handleAccountAction = (action: { label: string; href: string }) => {
    setAccountMenuOpen(false);
    logEvent(EVENT_TYPES.ACCOUNT_MENU_ACTION, {
      action: action.label,
      destination: action.href,
    });
    router.push(action.href);
  };

  const handleHeaderNav = (
    label: string,
    href: string,
    eventType: (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES] = EVENT_TYPES.HEADER_NAV_LINK
  ) => {
    logEvent(eventType, { label, destination: href });
    router.push(href);
  };

  const handleCategorySelect = (category: (typeof categories)[number]) => {
    setSelectedCategory(category);
    setIsCategoryOpen(false);
    logEvent(EVENT_TYPES.CATEGORY_FILTER, {
      category: category.value,
    });
  };

  const triggerSearch = () => {
    logEvent(EVENT_TYPES.SEARCH_PRODUCT, {
      query: searchQuery,
      category: selectedCategory.value,
    });
    router.push(buildSearchUrl(searchQuery, selectedCategory.value));
  };

  const getComponentOrder = (config: any) => {
    const orderMap: Record<string, string[]> = {
      logo: ["logo", "search", "nav"],
      search: ["search", "logo", "nav"],
      nav: ["nav", "logo", "search"],
    };
    if (!config.headerOrder) return orderMap.logo;
    if (Array.isArray(config.headerOrder)) return config.headerOrder;
    if (orderMap[config.headerOrder]) {
      return orderMap[config.headerOrder];
    }
    return orderMap.logo;
  };

  const order = getComponentOrder(layoutConfig);
  const isFloating = layoutConfig.navbarStyle === "floating";

  const headerClasses = cn(
    "z-50 transition-all duration-300",
    isFloating
      ? "pointer-events-none fixed left-4 right-4 top-4 sm:left-auto sm:right-6"
      : "sticky top-0 w-full backdrop-blur-xl"
  );

  const navClasses = cn(
    "w-full",
    isFloating
      ? "pointer-events-none ml-auto max-w-[420px]"
      : "mx-auto max-w-[1360px] px-4 pb-4 pt-4 sm:px-6 md:px-8"
  );

  return (
    <>
      <header className={headerClasses}>
        <nav className={navClasses}>
          <div
            className={cn(
              "glass-panel w-full rounded-[28px] border-white/60 bg-white/85 shadow-lg",
              isFloating
                ? "pointer-events-auto px-4 py-3"
                : "px-4 py-3 shadow-elevated md:px-6 md:py-4"
            )}
          >
            <div
              className={cn(
                "flex w-full flex-wrap items-center gap-4 md:flex-nowrap md:gap-6",
                layoutClasses.header,
                !isFloating && "justify-between"
              )}
            >
              {order.map((key: string) => {
                if (key === "logo") {
                  return (
                    <SeedLink
                      key="logo"
                      id={getId("logo_link")}
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
                  );
                }

                if (key === "search") {
                  if (isFloating) {
                    return (
                      <div
                        key="search"
                        className="flex w-full items-center gap-2 pt-2 sm:w-auto sm:flex-1"
                      >
                        <Input
                          id={getId("search_input")}
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") triggerSearch();
                          }}
                      placeholder={getText(
                        "search_placeholder",
                        "Search deployments, kits, crews"
                      )}
                          className="h-9 flex-1 rounded-full border border-slate-200 bg-white/90 px-3 text-sm shadow-inner focus-visible:ring-2 focus-visible:ring-slate-400"
                        />
                        <Button
                          id={getId("search_button")}
                          aria-label={getText("search_button_aria")}
                          className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 p-0 text-white shadow-md"
                          onClick={triggerSearch}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key="search"
                      className={cn(
                        "flex min-w-[320px] flex-1 items-stretch gap-0 rounded-full border border-slate-200 bg-white shadow-inner md:min-w-[420px]",
                        layoutConfig.searchPosition === "full-width"
                          ? "mx-1 md:mx-4"
                          : "mx-1 flex md:mx-4"
                      )}
                    >
                      <div
                        id={getId("category_selector")}
                        ref={categoryRef}
                        className="relative flex items-center"
                      >
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
                        id={getId("search_input")}
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") triggerSearch();
                        }}
                      placeholder={getText(
                        "search_placeholder",
                        "Search deployments, kits, crews"
                      )}
                        className="h-full min-h-[48px] flex-1 border-none bg-transparent px-4 text-sm focus-visible:ring-0"
                      />
                      <Button
                        id={getId("search_button")}
                        aria-label={getText("search_button_aria")}
                        className="h-full min-h-[48px] rounded-l-none rounded-r-full bg-gradient-to-r from-indigo-500 to-sky-500 px-6 text-white shadow-md"
                        onClick={triggerSearch}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                }

                if (key === "nav") {
                  if (isFloating) {
                    return (
                      <div key="nav" className="flex items-center gap-2">
                        <SeedLink
                          id={getId("cart_link")}
                          href="/cart"
                          className="text-slate-700"
                          onClick={() => logEvent(EVENT_TYPES.VIEW_CART)}
                        >
                          <div className="relative rounded-full bg-white/70 p-2 shadow-inner">
                            <ShoppingCart className="h-5 w-5" />
                            <span
                              id={getId("cart_count")}
                              className="absolute -top-1 -right-1 inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white"
                            >
                              {cartItemCount}
                            </span>
                          </div>
                        </SeedLink>
                        <button
                          type="button"
                          onClick={() => setMobileMenuOpen(true)}
                          className="rounded-full border border-slate-200 bg-white/70 p-2 text-slate-700 shadow-sm md:hidden"
                          aria-label="Open navigation"
                        >
                          <Menu className="h-5 w-5" />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key="nav"
                      className="hidden flex-1 items-center justify-end gap-3 md:flex"
                    >

                      <div
                        id={getId("account_dropdown")}
                        ref={accountRef}
                        className="relative hidden text-xs text-slate-600 lg:block"
                      >
                        <button
                          type="button"
                          onClick={() => setAccountMenuOpen((prev) => !prev)}
                          className="text-left"
                        >
                          <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                            {getText("account_greeting")}
                          </span>
                          <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                            {getText("account_lists")}
                            <ChevronDown size={12} />
                          </div>
                        </button>
                        {accountMenuOpen && (
                          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-3 shadow-2xl">
                            {accountActions.map((action) => (
                              <button
                                key={action.label}
                                type="button"
                                onClick={() => handleAccountAction(action)}
                                className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleHeaderNav(
                            "Returns",
                            "/search?q=returns",
                            EVENT_TYPES.HEADER_NAV_LINK
                          )
                        }
                        className="hidden text-left text-xs font-semibold text-slate-600 hover:text-slate-900 md:block"
                      >
                        <span className="block text-[11px] uppercase tracking-[0.35em] text-slate-400">
                          {getText("returns")}
                        </span>
                        <span className="text-sm">{getText("orders")}</span>
                      </button>

                      <SeedLink
                        id={getId("cart_link")}
                        href="/cart"
                        className="relative inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-slate-700 shadow-sm"
                        onClick={() => logEvent(EVENT_TYPES.VIEW_CART)}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        <span
                          id={getId("cart_count")}
                          className="ml-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-semibold text-white"
                        >
                          {cartItemCount}
                        </span>
                      </SeedLink>

                      <button
                        type="button"
                        onClick={() =>
                          handleHeaderNav(
                            "Wishlist",
                            "/wishlist",
                            EVENT_TYPES.HEADER_NAV_LINK
                          )
                        }
                        className="h-11 rounded-full border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:border-slate-400"
                      >
                        {getText("wishlist_label", "Wishlist")}
                      </button>
                    </div>
                  );
                }

                return null;
              })}

              {/* Mobile quick actions */}
              {!isFloating && (
                <div className="ml-auto flex items-center gap-2 md:hidden">
                  <SeedLink
                    id={`${getId("cart_link")}-mobile`}
                    href="/cart"
                    className="relative rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 shadow-sm"
                    onClick={() => logEvent(EVENT_TYPES.VIEW_CART)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span
                      className="absolute -top-1 -right-1 inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white"
                    >
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
              )}
            </div>
          </div>
        </nav>

        {layoutConfig.navbarStyle !== "floating" && (
          <div className="border-t border-white/20 bg-slate-900 text-white">
            <div className="omnizon-container flex items-center gap-5 overflow-x-auto py-3 text-sm md:gap-6">
              <SeedLink href="/">
                <button
                  id={getId("all_menu_button")}
                  onClick={() =>
                    logEvent(EVENT_TYPES.SECONDARY_NAV_LINK, {
                      label: "All menu",
                      destination: "/",
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.3em]"
                >
                  <Menu size={16} />
                  {getText("all_menu")}
                </button>
              </SeedLink>

              <div className="flex flex-1 gap-3 md:gap-4">
                {secondaryLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() =>
                      handleHeaderNav(
                        link.label,
                        link.href,
                        EVENT_TYPES.SECONDARY_NAV_LINK
                      )
                    }
                    className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="hidden items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/70 md:flex">
                <Globe className="h-4 w-4" />
                {liveRoutes} routes · {liveCrews} crews
              </div>
            </div>
          </div>
        )}
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-4/5 max-w-sm flex-col bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                  Menu
                </p>
                <p className="text-base font-semibold text-slate-900">
                  Navigate Autozon
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
            <div className="mt-6 flex-1 overflow-y-auto space-y-6">
              <div>
                <p className="section-eyebrow text-[10px] text-slate-400">
                  Quick actions
                </p>
                <div className="mt-3 grid gap-3">
                  {accountActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => {
                        handleAccountAction(action);
                        setMobileMenuOpen(false);
                      }}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-slate-400"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="subtle-divider" />

              <div>
                <p className="section-eyebrow text-[10px] text-slate-400">
                  Browse
                </p>
                <div className="mt-3 grid gap-2">
                  {secondaryLinks.map((link) => (
                    <button
                      key={link.label}
                      type="button"
                      className="rounded-xl px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                      onClick={() => {
                        handleHeaderNav(
                          link.label,
                          link.href,
                          EVENT_TYPES.SECONDARY_NAV_LINK
                        );
                        setMobileMenuOpen(false);
                      }}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="subtle-divider" />

            </div>
          </div>
        </div>
      )}
    </>
  );
}
