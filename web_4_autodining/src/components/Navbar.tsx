"use client";

import { useSeed } from "@/context/SeedContext";
import { SeedLink } from "@/components/ui/SeedLink";
import { useSeedVariation } from "@/dynamic/v1-layouts";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { useMemo } from "react";

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
  const { seed, resolvedSeeds } = useSeed();
  const { getText, getId } = useV3Attributes();
  const layoutSeed = resolvedSeeds.v1 ?? seed;

  // Use seed-based navigation variation
  const navVariation = useSeedVariation("navigation", undefined, layoutSeed);

  // Check if it's seed 6 for special spacing
  const isSeed6 = layoutSeed === 6;

  return (
    <nav className="w-full border-b bg-white sticky top-0 z-10">
      <div className={`${isSeed6 ? 'w-full' : 'max-w-6xl mx-auto'} flex items-center h-20 ${isSeed6 ? 'px-2 pl-2 pr-8' : 'px-4'} gap-6 ${navVariation.className || ""}`}
           data-testid={navVariation.dataTestId}>
        {/* Logo section - always on left */}
        <div className={`flex items-center gap-3 ${isSeed6 ? 'ml-0' : ''}`}>
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
        <div className={`flex items-center gap-6 ${isSeed6 ? 'mr-0' : ''}`}>
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
