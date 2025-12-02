"use client";

import { useSeed } from "@/context/SeedContext";
import { SeedLink } from "@/components/ui/SeedLink";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

interface NavbarProps {
  showSearch?: boolean;
  searchInputId?: string;
  searchButtonId?: string;
  onSearchClick?: () => void;
}

export default function Navbar({ 
  showSearch = false,
  searchInputId,
  searchButtonId,
  onSearchClick 
}: NavbarProps) {
  const { getText, getId } = useV3Attributes();

  return (
    <nav className="w-full border-b bg-white sticky top-0 z-10">
      <div className="w-full flex items-center h-20 px-6 gap-6">
        {/* Logo section - always on left */}
        <div className="flex items-center gap-3 ml-0">
          <SeedLink href="/">
            <div className="bg-[#46a758] px-3 py-1 rounded flex items-center h-9">
              <span className="font-bold text-white text-lg">
                {getText("app_title") || "AutoDining"}
              </span>
            </div>
          </SeedLink>
        </div>

        <div className="flex-1" />

        {/* Navigation links - right */}
        <div className="flex items-center gap-6 mr-0">
          <SeedLink
            className="text-sm text-gray-600 hover:text-[#46a758] transition-colors"
            href="/help"
          >
            Help
          </SeedLink>
          <SeedLink
            className="text-sm text-gray-600 hover:text-[#46a758] transition-colors"
            href="/about"
          >
            About
          </SeedLink>
          <SeedLink
            className="text-sm text-gray-600 hover:text-[#46a758] transition-colors"
            href="/contact"
          >
            Contact
          </SeedLink>
          {showSearch && (
            <SeedLink
              className="text-sm text-gray-600 hover:text-[#46a758] transition-colors"
              href="/faqs"
            >
              FAQs
            </SeedLink>
          )}
        </div>
      </div>
    </nav>
  );
}
