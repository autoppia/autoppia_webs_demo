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
import { useSeed } from "@/context/SeedContext";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { getLayoutConfig } from "@/utils/dynamicDataProvider";
import { getLayoutClasses } from "@/utils/seedLayout";
export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useSeedRouter();
  const { state } = useCart();
  const cartItemCount = isMounted ? state.totalItems : 0;

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
                <SeedLink key="logo" href="/" className={`${layoutConfig.navbarStyle === 'floating' ? 'mr-1' : 'mr-2'} flex-shrink-0`}>
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
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          logEvent(EVENT_TYPES.SEARCH_PRODUCT, {
                            query: searchQuery,
                          });
                          router.push(
                            `/search?q=${encodeURIComponent(searchQuery)}`
                          );
                        }
                      }}
                      placeholder="Search"
                      className="w-32 h-7 text-xs rounded border bg-white shadow-inner focus:bg-white focus-visible:ring-1 focus-visible:ring-amazon-blue px-2 text-gray-800"
                    />
                    <Button
                      id="search-btn"
                      className="ml-1 h-7 w-7 p-0 bg-amazon-yellow hover:bg-amazon-darkYellow shadow"
                      onClick={() => {
                        logEvent(EVENT_TYPES.SEARCH_PRODUCT, {
                          query: searchQuery,
                        });
                        router.push(
                          `/search?q=${encodeURIComponent(searchQuery)}`
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
                    <div className="flex items-center bg-gray-100 border-r border-gray-200 px-2 rounded-l-md">
                      <span className="text-xs font-medium text-gray-700">
                        All
                      </span>
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                    <Input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          logEvent(EVENT_TYPES.SEARCH_PRODUCT, {
                            query: searchQuery,
                          });
                          router.push(
                            `/search?q=${encodeURIComponent(searchQuery)}`
                          );
                        }
                      }}
                      placeholder="Search Autozon"
                      className="flex-grow rounded-none border bg-white shadow-inner focus:bg-white focus-visible:ring-2 focus-visible:ring-amazon-blue px-3 text-gray-800"
                    />
                    <Button
                      id="search-btn"
                      className="rounded-l-none bg-amazon-yellow hover:bg-amazon-darkYellow shadow"
                      onClick={() => {
                        logEvent(EVENT_TYPES.SEARCH_PRODUCT, {
                          query: searchQuery,
                        });
                        router.push(
                          `/search?q=${encodeURIComponent(searchQuery)}`
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
                      href="/cart"
                      className="text-gray-700 flex items-center"
                      onClick={() => logEvent(EVENT_TYPES.VIEW_CART)}
                    >
                      <div className="relative">
                        <ShoppingCart size={20} />
                        <span className="absolute -top-1 right-[6px] text-amazon-yellow font-bold text-xs">
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
                  <div className="text-gray-700 flex items-center text-xs gap-1">
                    <Globe size={16} />
                    <span className="font-bold">EN</span>
                    <ChevronDown size={14} />
                  </div>
                  <div className="text-gray-700 text-xs hidden md:block">
                    <div>Hello, user</div>
                    <div className="font-bold flex items-center">
                      Account & Lists
                      <ChevronDown size={14} className="ml-1" />
                    </div>
                  </div>
                  <div className="text-gray-700 text-xs hidden md:block">
                    <div>Returns</div>
                    <div className="font-bold">& Orders</div>
                  </div>
                  <SeedLink
                    href="/cart"
                    className="text-gray-700 flex items-end"
                    onClick={() => logEvent(EVENT_TYPES.VIEW_CART)}
                  >
                    <div className="relative">
                      <ShoppingCart size={32} />
                      <span className="absolute -top-1 right-[10px] text-amazon-yellow font-bold">
                        {cartItemCount}
                      </span>
                    </div>
                    <span className="hidden md:inline-block font-bold mb-1">
                      Cart
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
            <button className="flex items-center mr-3 p-1 hover:bg-gray-700 rounded">
              <Menu size={18} className="mr-1" />
              <span className="font-bold">All</span>
            </button>
          </SeedLink>
          <div className="flex gap-4 flex-grow overflow-x-auto no-scrollbar">
            <span className="cursor-default text-gray-300">Rufus</span>
            <span className="cursor-default text-gray-300">
              Today&apos;s Deals
            </span>
            <span className="cursor-default text-gray-300">Buy Again</span>
            <span className="cursor-default text-gray-300">Customer Service</span>
            <span className="cursor-default text-gray-300">Registry</span>
            <span className="cursor-default text-gray-300">Gift Cards</span>
            <span className="cursor-default text-gray-300">Sell</span>
          </div>
          <div className="ml-auto font-bold whitespace-nowrap">
            $5 flat delivery fee
          </div>
        </div>
      )}
    </header>
  );
}
