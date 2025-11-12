"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { SeedLink } from "@/components/ui/SeedLink";
import {
  Search,
  MapPin,
  ChevronDown,
  ShoppingCart,
  Menu,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useSeed } from "@/context/SeedContext";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { getLayoutConfig } from "@/utils/dynamicDataProvider";
import { getLayoutClasses } from "@/utils/seedLayout";
import { withSeed, withSeedAndParams } from "@/utils/seedRouting";
import { useSearchParams } from "next/navigation";
export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useSeedRouter();
  const searchParams = useSearchParams();
  const { state } = useCart();
  const cartItemCount = isMounted ? state.totalItems : 0;
  const { getText, getId } = useDynamicStructure();
  const { seed } = useSeed();
  const layoutConfig = getLayoutConfig(seed);
  const layoutClasses = getLayoutClasses(layoutConfig);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
                          });
                          router.push(
                            withSeedAndParams("/search", { q: searchQuery }, searchParams)
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
                        });
                        router.push(
                          withSeedAndParams("/search", { q: searchQuery }, searchParams)
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
                    <div id={getId("category_selector")} className="flex items-center bg-gray-100 border-r border-gray-200 px-2 rounded-l-md">
                      <span className="text-xs font-medium text-gray-700">
                        {getText("all_categories")}
                      </span>
                      <ChevronDown size={16} className="text-gray-500" />
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
                          });
                          router.push(
                            withSeedAndParams("/search", { q: searchQuery }, searchParams)
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
                        });
                        router.push(
                          withSeedAndParams("/search", { q: searchQuery }, searchParams)
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
                  <div id={getId("language_selector")} className="text-gray-700 flex items-center text-xs gap-1">
                    <Globe size={16} />
                    <span className="font-bold">{getText("language")}</span>
                    <ChevronDown size={14} />
                  </div>
                  <div id={getId("account_dropdown")} className="text-gray-700 text-xs hidden md:block">
                    <div>{getText("account_greeting")}</div>
                    <div className="font-bold flex items-center">
                      {getText("account_lists")}
                      <ChevronDown size={14} className="ml-1" />
                    </div>
                  </div>
                  <div className="text-gray-700 text-xs hidden md:block">
                    <div>{getText("returns")}</div>
                    <div className="font-bold">{getText("orders")}</div>
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
            <button id={getId("all_menu_button")} className="flex items-center mr-3 p-1 hover:bg-gray-700 rounded">
              <Menu size={18} className="mr-1" />
              <span className="font-bold">{getText("all_menu")}</span>
            </button>
          </SeedLink>
          <div className="flex gap-4 flex-grow overflow-x-auto no-scrollbar">
            <span className="cursor-default text-gray-300">Rufus</span>
            <span className="cursor-default text-gray-300">
              {getText("todays_deals")}
            </span>
            <span className="cursor-default text-gray-300">{getText("buy_again")}</span>
            <span className="cursor-default text-gray-300">{getText("customer_service")}</span>
            <span className="cursor-default text-gray-300">{getText("registry")}</span>
            <span className="cursor-default text-gray-300">{getText("gift_cards")}</span>
            <span className="cursor-default text-gray-300">{getText("sell")}</span>
          </div>
          <div className="ml-auto font-bold whitespace-nowrap">
            {getText("delivery_banner")}
          </div>
        </div>
      )}
    </header>
  );
}
