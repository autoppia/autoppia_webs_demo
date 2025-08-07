"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useRouter } from "next/navigation";
export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const { state } = useCart();
  const cartItemCount = state.totalItems;
  return (
    <header className="fixed top-0 z-50 w-full">
      {/* Main navigation bar */}
      <nav className="bg-white border-b border-gray-200 px-2 py-2 flex items-center gap-2 md:gap-4">
        {/* Logo */}
        <Link href="/" className="mr-2 flex-shrink-0">
          <div className="bg-[#17A2B8] px-3 py-1 rounded flex items-center h-9">
            <span className="font-bold text-white text-lg">AUTOZONE</span>
          </div>
        </Link>
        {/* Deliver to */}
        <div className="text-gray-700 hidden md:flex items-start gap-1 flex-shrink-0">
          <MapPin size={18} className="mt-1 text-gray-400" />
          <div className="text-xs leading-tight">
            <span className="text-gray-400">Deliver to user</span>
            <p className="font-bold">San Francisco</p>
          </div>
        </div>
        {/* Search */}
        <div className="flex-grow flex mx-1 md:mx-4">
          <div className="w-full flex">
            <div className="flex items-center bg-gray-100 border-r border-gray-200 px-2 rounded-l-md">
              <span className="text-xs font-medium text-gray-700">All</span>
              <ChevronDown size={16} className="text-gray-500" />
            </div>
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  logEvent(EVENT_TYPES.SEARCH_PRODUCT, { query: searchQuery });
                  router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
              placeholder="Search Autozon"
              className="flex-grow rounded-none border bg-white shadow-inner focus:bg-white focus-visible:ring-2 focus-visible:ring-amazon-blue px-3 text-gray-800"
            />
            <Button
              className="rounded-l-none bg-amazon-yellow hover:bg-amazon-darkYellow shadow"
              onClick={() => {
                logEvent(EVENT_TYPES.SEARCH_PRODUCT, { query: searchQuery });
                router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
              }}
            >
              <Search className="h-5 w-5 text-amazon-lightBlue " />
            </Button>
          </div>
        </div>
        {/* Nav links */}
        <div className="hidden md:flex items-center gap-3 md:gap-4">
          {/* Language */}
          <div className="text-gray-700 flex items-center text-xs gap-1">
            <Globe size={16} />
            <span className="font-bold">EN</span>
            <ChevronDown size={14} />
          </div>
          {/* Account */}
          <div className="text-gray-700 text-xs hidden md:block">
            <div>Hello, user</div>
            <div className="font-bold flex items-center">
              Account & Lists
              <ChevronDown size={14} className="ml-1" />
            </div>
          </div>
          {/* Returns & Orders */}
          <div className="text-gray-700 text-xs hidden md:block">
            <div>Returns</div>
            <div className="font-bold">& Orders</div>
          </div>
          {/* Cart */}
          <Link
            href="/cart"
            className="text-gray-700 flex items-end"
          >
            <div className="relative">
              <ShoppingCart size={32} />
              <span className="absolute -top-1 right-[10px] text-amazon-yellow font-bold">
                {cartItemCount}
              </span>
            </div>
            <span className="hidden md:inline-block font-bold mb-1">Cart</span>
          </Link>
        </div>
      </nav>
      {/* Secondary navigation */}
      <div className="bg-amazon-lightBlue text-white px-2 py-1 flex items-center text-sm overflow-x-auto">
        <Link href="/">
          <button className="flex items-center mr-3 p-1 hover:bg-gray-700 rounded">
            <Menu size={18} className="mr-1" />
            <span className="font-bold">All</span>
          </button>
        </Link>
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
    </header>
  );
}
