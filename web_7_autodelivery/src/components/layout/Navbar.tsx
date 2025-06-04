"use client";

import Link from "next/link";
import CartNavIcon from "@/components/cart/CartNavIcon";
import { Input } from "@/components/ui/input";
import { useSearchStore } from "@/store/search-store";
import { EVENT_TYPES, logEvent } from "@/components/library/events";

export default function Navbar() {
  const search = useSearchStore((s) => s.search);
  const setSearch = useSearchStore((s) => s.setSearch);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    logEvent(EVENT_TYPES.SEARCH_RESTAURANT, { query: value });
  };

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-zinc-200 shadow-sm h-20 flex items-center px-6 gap-8">
      <Link
        href="/"
        className="font-extrabold text-xl text-zinc-800 tracking-tight"
      >
        Auto<span className="text-green-600">Delivery</span>
      </Link>
      <div className="flex-1" />
      <h1 className="text-zinc-700 hover:text-green-600 font-medium px-3 py-1">
        Restaurants
      </h1>
      <div className="hidden md:flex items-center ml-auto" role="search">
        <Input
          type="search"
          placeholder="Search restaurants..."
          value={search}
          onChange={handleSearchChange}
          className="w-96 rounded-full text-sm"
        />
      </div>
      <CartNavIcon />
    </nav>
  );
}
