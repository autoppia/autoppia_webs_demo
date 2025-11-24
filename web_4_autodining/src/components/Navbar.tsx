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

  // Determine logo position based on seed
  // For default seed (8) - logo in center always
  // For other seeds, position can vary based on navigation layout
  const logoPosition = useMemo(() => {
    // Default seed (8) always has logo in center
    if (layoutSeed === 8) {
      return "center";
    }
    
    const variationIndex = ((layoutSeed % 30) + 1) % 10 || 10;
    // Seeds 1, 4, 7, 10 (variation 1, 4, 7, 10) have logo on left
    if (variationIndex === 1 || variationIndex === 4 || variationIndex === 7 || variationIndex === 10) {
      return "left";
    }
    // Seeds 2, 5, 8 have logo in center
    if (variationIndex === 2 || variationIndex === 5 || variationIndex === 8) {
      return "center";
    }
    // Seeds 3, 6, 9 have logo on right
    return "right";
  }, [layoutSeed]);

  // Get navigation items class based on variation
  const navItemsClass = useMemo(() => {
    const variationIndex = ((layoutSeed % 30) + 1) % 10 || 10;
    if (variationIndex === 2 || variationIndex === 5 || variationIndex === 8) {
      return "flex items-center gap-3";
    }
    if (variationIndex === 3 || variationIndex === 6 || variationIndex === 9) {
      return "flex flex-col items-end gap-2";
    }
    return "flex items-center gap-4";
  }, [layoutSeed]);

  return (
    <nav className="w-full border-b bg-white sticky top-0 z-10">
      <div className={`max-w-6xl mx-auto flex items-center ${showSearch ? 'justify-between' : 'justify-between'} h-20 px-4 gap-2 ${navVariation.className || ""}`}
           data-testid={navVariation.dataTestId}>
        {/* Logo section - position varies by seed */}
        {logoPosition === "left" && (
          <div className="flex items-center gap-3">
            <SeedLink href="/">
              <div className="bg-[#46a758] px-3 py-1 rounded flex items-center h-9">
                <span className="font-bold text-white text-lg">
                  {getText("app_title") || "AutoDining"}
                </span>
              </div>
            </SeedLink>
          </div>
        )}

        {/* Search section - middle */}
        {showSearch && (
          <div className="flex-1 flex items-center justify-center">
            <input
              id={searchInputId || getId("search_input")}
              type="text"
              placeholder={getText("search_placeholder") || "Search restaurants..."}
              className="rounded p-2 min-w-[250px] border border-gray-300"
              disabled
            />
            <button 
              id={searchButtonId || getId("search_button")} 
              className="ml-2 px-4 py-2 rounded bg-[#46a758] text-white"
              onClick={onSearchClick}
            >
              {getText("search_button") || "Search"}
            </button>
          </div>
        )}

        {/* Center logo - for grid layouts */}
        {logoPosition === "center" && !showSearch && (
          <div className="flex items-center justify-center gap-3 flex-1">
            <SeedLink href="/">
              <div className="bg-[#46a758] px-3 py-1 rounded flex items-center h-9">
                <span className="font-bold text-white text-lg">
                  {getText("app_title") || "AutoDining"}
                </span>
              </div>
            </SeedLink>
          </div>
        )}

        {/* Navigation links */}
        <div className={navItemsClass}>
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

        {/* Right logo - for block layouts */}
        {logoPosition === "right" && (
          <div className="flex items-center gap-3">
            <SeedLink href="/">
              <div className="bg-[#46a758] px-3 py-1 rounded flex items-center h-9">
                <span className="font-bold text-white text-lg">
                  {getText("app_title") || "AutoDining"}
                </span>
              </div>
            </SeedLink>
          </div>
        )}
      </div>
    </nav>
  );
}
