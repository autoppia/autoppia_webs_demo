"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { SeedLink } from "@/components/ui/SeedLink";
import { Search, ChevronDown, ShoppingCart, Menu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { useSeed } from "@/context/SeedContext";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { getLayoutConfig } from "@/dynamic/v2-data";
import { getLayoutClasses } from "@/dynamic/v1-layouts";
export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
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
    { label: "Saved wishlist", href: "/#wishlist" },
    { label: "Account settings", href: "/search?q=account" },
  ];
  const secondaryLinks = [
    { label: "Rufus", href: "/search?q=rufus" },
    { label: "Today's deals", href: "/search?q=deals" },
    { label: "Buy again", href: "/search?q=buy%20again" },
    { label: "Customer service", href: "/search?q=customer%20service" },
    { label: "Registry", href: "/search?q=registry" },
    { label: "Gift cards", href: "/search?q=gift%20cards" },
    { label: "Sell", href: "/search?q=sell" },
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

  // Map layout config to component order
  const getComponentOrder = (config: any) => {
    const orderMap: { [key: string]: string[] } = {
      'logo': ['logo', 'search', 'nav'],
      'search': ['search', 'logo', 'nav'],
      'nav': ['nav', 'logo', 'search'],
    };
    
    // Use headerOrder from config, fallback to default
    return config.headerOrder || ['logo', 'search', 'nav'];
  };

  const order = getComponentOrder(layoutConfig);

  // Handle floating navbar style
  const headerClasses = layoutConfig.navbarStyle === 'floating' 
    ? "absolute top-4 right-4 bg-white shadow-xl rounded-lg p-2 border border-gray-200 z-50"
    : "fixed top-0 z-50 w-full";
  
  const navClasses = layoutConfig.navbarStyle === 'floating'
    ? "flex items-center gap-1 md:gap-2"
    : "bg-white border-b border-gray-200 px-2 py-2 flex items-center gap-2 md:gap-4";

  return (
    <header className={headerClasses}>
      {/* Main navigation bar */}
      <nav className={navClasses}>
        {/* Header content with dynamic layout */}
        <div className={`flex items-center ${layoutConfig.navbarStyle === 'floating' ? 'flex-wrap' : 'w-full'} ${layoutClasses.header}`}>
          {order.map((key: string) => {
            if (key === "logo") {
              return (
                <SeedLink key="logo" id={getId("logo_link")} href="/" className={`${layoutConfig.navbarStyle === 'floating' ? 'mr-1' : 'mr-2'} flex-shrink-0`}>
                  <div className={`bg-[#17A2B8] ${layoutConfig.navbarStyle === 'floating' ? 'px-2 py-1' : 'px-3 py-1'} rounded flex items-center ${layoutConfig.navbarStyle === 'floating' ? 'h-7' : 'h-9'}`}>
                    <span className={`font-bold text-white ${layoutConfig.navbarStyle === 'floating' ? 'text-sm' : 'text-lg'}`}>AUTOZONE</span>
                  </div>
                </SeedLink>
              );
            }

            if (key === "search") {
              if (layoutConfig.navbarStyle === 'floating') {
                // Compact search for floating navbar
                return (
                  <div key="search" className="flex items-center">
                    <Input
                      id={getId("search_input")}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          logEvent(EVENT_TYPES.SEARCH_PRODUCT, {
                            query: searchQuery,
                            category: selectedCategory.value,
                          });
                          router.push(
                            buildSearchUrl(searchQuery, selectedCategory.value)
                          );
                        }
                      }}
                      placeholder={getText("search_placeholder")}
                      className="w-32 h-7 text-xs rounded border bg-white shadow-inner focus:bg-white focus-visible:ring-1 focus-visible:ring-amazon-blue px-2 text-gray-800"
                    />
                    <Button
                      id={getId("search_button")}
                      aria-label={getText("search_button_aria")}
                      className="ml-1 h-7 w-7 p-0 bg-amazon-yellow hover:bg-amazon-darkYellow shadow"
                      onClick={() => {
                        logEvent(EVENT_TYPES.SEARCH_PRODUCT, {
                          query: searchQuery,
                          category: selectedCategory.value,
                        });
                        router.push(
                          buildSearchUrl(searchQuery, selectedCategory.value)
                        );
                      }}
                    >
                      <Search className="h-3 w-3 text-amazon-lightBlue" />
                    </Button>
                  </div>
                );
              }
              
              const searchClasses = layoutConfig.searchPosition === 'full-width' 
                ? 'flex-grow mx-1 md:mx-4' 
                : 'flex-grow flex mx-1 md:mx-4';
              
              return (
                <div key="search" className={searchClasses}>
                  <div className="w-full flex">
                    <div
                      id={getId("category_selector")}
                      ref={categoryRef}
                      className="relative flex items-center border-r border-gray-200"
                    >
                      <button
                        type="button"
                        onClick={() => setIsCategoryOpen((prev) => !prev)}
                        className="flex items-center gap-1 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700"
                      >
                        {selectedCategory.label}
                        <ChevronDown size={16} className="text-gray-500" />
                      </button>
                      {isCategoryOpen && (
                        <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-slate-200 bg-white shadow-lg">
                          {categories.map((category) => (
                            <button
                              key={category.value}
                              type="button"
                              onClick={() => handleCategorySelect(category)}
                              className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 ${
                                category.value === selectedCategory.value
                                  ? "font-semibold text-slate-900"
                                  : "text-slate-600"
                              }`}
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
                        if (e.key === "Enter") {
                          logEvent(EVENT_TYPES.SEARCH_PRODUCT, {
                            query: searchQuery,
                            category: selectedCategory.value,
                          });
                          router.push(
                            buildSearchUrl(searchQuery, selectedCategory.value)
                          );
                        }
                      }}
                      placeholder={getText("search_placeholder")}
                      className="flex-grow rounded-none border bg-white shadow-inner focus:bg-white focus-visible:ring-2 focus-visible:ring-amazon-blue px-3 text-gray-800"
                    />
                    <Button
                      id={getId("search_button")}
                      aria-label={getText("search_button_aria")}
                      className="rounded-l-none bg-amazon-yellow hover:bg-amazon-darkYellow shadow"
                      onClick={() => {
                        logEvent(EVENT_TYPES.SEARCH_PRODUCT, {
                          query: searchQuery,
                          category: selectedCategory.value,
                        });
                        router.push(
                          buildSearchUrl(searchQuery, selectedCategory.value)
                        );
                      }}
                    >
                      <Search className="h-5 w-5 text-amazon-lightBlue " />
                    </Button>
                  </div>
                </div>
              );
            }

            if (key === "nav") {
              if (layoutConfig.navbarStyle === 'floating') {
                // Compact nav for floating navbar
                return (
                  <div key="nav" className="flex items-center gap-1">
                    <SeedLink
                      id={getId("cart_link")}
                      href="/cart"
                      className="text-gray-700 flex items-center"
                      onClick={() => logEvent(EVENT_TYPES.VIEW_CART)}
                    >
                      <div className="relative">
                        <ShoppingCart size={20} />
                        <span id={getId("cart_count")} className="absolute -top-1 right-[6px] text-amazon-yellow font-bold text-xs">
                          {cartItemCount}
                        </span>
                      </div>
                    </SeedLink>
                  </div>
                );
              }
              
              return (
                <div
                  key="nav"
                  className="hidden md:flex items-center gap-3 md:gap-4"
                >
                  <div
                    id={getId("language_selector")}
                    ref={languageRef}
                    className="relative flex flex-col text-gray-700 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setLanguageMenuOpen((prev) => !prev)}
                      className="flex items-center gap-1 font-semibold"
                    >
                      <Globe size={16} />
                      <span>{selectedLanguage.label}</span>
                      <ChevronDown size={14} />
                    </button>
                    {languageMenuOpen && (
                      <div className="absolute left-0 top-full z-50 mt-2 w-40 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                        {languages.map((language) => (
                          <button
                            key={language.code}
                            type="button"
                            onClick={() => handleLanguageSelect(language)}
                            className={`block w-full rounded px-2 py-1 text-left text-sm hover:bg-slate-100 ${
                              language.code === selectedLanguage.code
                                ? "font-semibold text-slate-900"
                                : "text-slate-600"
                            }`}
                          >
                            {language.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div
                    id={getId("account_dropdown")}
                    ref={accountRef}
                    className="relative hidden text-gray-700 text-xs md:block"
                  >
                    <button
                      type="button"
                      onClick={() => setAccountMenuOpen((prev) => !prev)}
                      className="text-left"
                    >
                      <div>{getText("account_greeting")}</div>
                      <div className="font-bold flex items-center">
                        {getText("account_lists")}
                        <ChevronDown size={14} className="ml-1" />
                      </div>
                    </button>
                    {accountMenuOpen && (
                      <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                        {accountActions.map((action) => (
                          <button
                            key={action.label}
                            type="button"
                            onClick={() => handleAccountAction(action)}
                            className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-slate-100 text-slate-700"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="hidden text-gray-700 text-xs md:block">
                    <button
                      type="button"
                      onClick={() =>
                        handleHeaderNav(
                          "Returns",
                          "/search?q=returns",
                          EVENT_TYPES.HEADER_NAV_LINK
                        )
                      }
                      className="text-left hover:text-amazon-blue"
                    >
                      <div>{getText("returns")}</div>
                      <div className="font-bold">
                        {getText("orders")}
                      </div>
                    </button>
                  </div>
                  <SeedLink
                    id={getId("cart_link")}
                    href="/cart"
                    className="text-gray-700 flex items-end"
                    onClick={() => logEvent(EVENT_TYPES.VIEW_CART)}
                  >
                    <div className="relative">
                      <ShoppingCart size={32} />
                      <span id={getId("cart_count")} className="absolute -top-1 right-[10px] text-amazon-yellow font-bold">
                        {cartItemCount}
                      </span>
                    </div>
                    <span className="hidden md:inline-block font-bold mb-1">
                      {getText("cart")}
                    </span>
                  </SeedLink>
                  <button
                    type="button"
                    onClick={() =>
                      handleHeaderNav("Wishlist", "/#wishlist", EVENT_TYPES.HEADER_NAV_LINK)
                    }
                    className="text-xs font-bold text-gray-700 hover:text-amazon-blue"
                  >
                    {getText("wishlist_label", "Wishlist")}
                  </button>
                </div>
              );
            }

            return null;
          })}
        </div>
      </nav>
      {/* Secondary navigation - hidden for floating navbar */}
      {layoutConfig.navbarStyle !== 'floating' && (
        <div className="bg-amazon-lightBlue text-white px-2 py-1 flex items-center text-sm overflow-x-auto">
          <SeedLink href="/">
            <button
              id={getId("all_menu_button")}
              onClick={() =>
                logEvent(EVENT_TYPES.SECONDARY_NAV_LINK, {
                  label: "All menu",
                  destination: "/",
                })
              }
              className="flex items-center mr-3 p-1 hover:bg-gray-700 rounded"
            >
              <Menu size={18} className="mr-1" />
              <span className="font-bold">{getText("all_menu")}</span>
            </button>
          </SeedLink>
          <div className="flex gap-4 flex-grow overflow-x-auto no-scrollbar">
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
                className="text-gray-200 hover:text-white whitespace-nowrap text-sm"
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="ml-auto font-bold whitespace-nowrap">
            {getText("delivery_banner")}
          </div>
        </div>
      )}
    </header>
  );
}
