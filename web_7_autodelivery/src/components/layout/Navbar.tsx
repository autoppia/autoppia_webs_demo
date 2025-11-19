"use client";

import { SeedLink } from "@/components/ui/SeedLink";
import CartNavIcon from "@/components/cart/CartNavIcon";
import { Input } from "@/components/ui/input";
import { useSearchStore } from "@/store/search-store";
import { EVENT_TYPES, logEvent } from "@/components/library/events";
import { useSeedLayout } from "@/hooks/use-seed-layout";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

export default function Navbar() {
  const search = useSearchStore((s) => s.search);
  const setSearch = useSearchStore((s) => s.setSearch);
  const layout = useSeedLayout();
  const { getText, getId } = useV3Attributes();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    logEvent(EVENT_TYPES.SEARCH_RESTAURANT, { query: value });
  };

  // Dynamic positioning based on seed
  const getSearchBarPosition = () => {
    switch (layout.searchBar.position) {
      case 'left':
        return 'order-1';
      case 'center':
        return 'order-2 mx-auto';
      case 'right':
        return 'order-3 ml-auto';
      case 'top':
        return 'order-1 w-full mb-4';
      case 'bottom':
        return 'order-4 w-full mt-4';
      default:
        return 'order-3 ml-auto';
    }
  };

  const getLogoPosition = () => {
    switch (layout.navbar?.logoPosition) {
      case 'left':
        return 'order-1';
      case 'center':
        return 'order-2 mx-auto';
      case 'right':
        return 'order-3 ml-auto';
      default:
        return 'order-1';
    }
  };

  const getCartPosition = () => {
    switch (layout.navbar?.cartPosition) {
      case 'left':
        return 'order-1';
      case 'center':
        return 'order-2 mx-auto';
      case 'right':
        return 'order-3 ml-auto';
      default:
        return 'order-3 ml-auto';
    }
  };

  const getMenuPosition = () => {
    switch (layout.navbar?.menuPosition) {
      case 'left':
        return 'order-1';
      case 'center':
        return 'order-2 mx-auto';
      case 'right':
        return 'order-3 ml-auto';
      default:
        return 'order-2 mx-auto';
    }
  };

  return (
    <nav className={`sticky top-0 z-30 bg-white border-b border-zinc-200 shadow-sm h-20 flex items-center px-6 gap-8 ${layout.navbar?.containerClass || ''}`}>
      <SeedLink
        href="/"
        className={`font-extrabold text-xl text-zinc-800 tracking-tight ${getLogoPosition()}`}
      >
        {getText("brand_name", "Auto")}<span className="text-green-600">{getText("brand_suffix", "Delivery")}</span>
      </SeedLink>
      
      <h1
        className={`text-zinc-700 hover:text-green-600 font-medium px-3 py-1 ${getMenuPosition()}`}
        aria-label={getAria("nav_menu", "Main navigation")}
      >
        {getText("menu_restaurants", "Restaurants")}
      </h1>
      
      <div className={`hidden md:flex items-center ${getSearchBarPosition()} ${layout.searchBar.wrapperClass}`} role="search">
        <Input
          type="search"
          id={getId("search_box", "search-box")}
          aria-label={getAria("search_input", "Search restaurants input")}
          placeholder={getPlaceholder("search_input", "Search restaurants...")}
          value={search}
          onChange={handleSearchChange}
          className={`w-96 rounded-full text-sm ${layout.searchBar.inputClass}`}
          {...layout.getElementAttributes('SEARCH_DELIVERY_RESTAURANT', 0)}
        />
      </div>
      
      <div className={getCartPosition()}>
        <CartNavIcon />
      </div>
    </nav>
  );
}
