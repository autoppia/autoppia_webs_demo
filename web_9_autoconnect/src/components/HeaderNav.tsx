"use client";

import { SeedLink } from "@/components/ui/SeedLink";
import { usePathname } from "next/navigation";
import UserSearchBar from "./UserSearchBar";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useSeed } from "@/context/SeedContext";
import {
  getEffectiveLayoutConfig,
  getLayoutClasses,
  getShuffledItems,
} from "@/dynamic/v1-layouts";
import { dynamicDataProvider } from "@/dynamic/v2-data";

export default function HeaderNav() {
  const pathname = usePathname();
  const { seed, resolvedSeeds } = useSeed();
  const layoutSeed = resolvedSeeds.v1 ?? resolvedSeeds.base ?? seed;
  const layout = getEffectiveLayoutConfig(layoutSeed);

  const linkClass = (href: string) =>
    `px-3 py-2 text-sm font-medium rounded ${
      pathname === href
        ? "bg-blue-100 text-blue-700 font-semibold"
        : "hover:bg-blue-50"
    }`;

  const navItems = [
    {
      href: "/",
      label: "Home",
      eventType: EVENT_TYPES.HOME_NAVBAR,
      eventData: { label: "Home" }
    },
    {
      href: "/jobs",
      label: "Jobs", 
      eventType: EVENT_TYPES.JOBS_NAVBAR,
      eventData: { label: "Jobs" }
    },
    {
      href: "/recommendations",
      label: "Recommendations",
      eventType: EVENT_TYPES.VIEW_ALL_RECOMMENDATIONS,
      eventData: { label: "Recommendations", source: "navbar" }
    },
    {
      href: `/profile/${(dynamicDataProvider.getUsers()[0]?.username) || "alexsmith"}`,
      label: "Profile",
      eventType: EVENT_TYPES.PROFILE_NAVBAR,
      eventData: { label: "Profile", username: dynamicDataProvider.getUsers()[0]?.username || "alexsmith" }
    }
  ];

  const shuffledNavItems = getShuffledItems(navItems, layoutSeed);

  const searchClasses = getLayoutClasses(layout, "searchPosition");

  const getHeaderClasses = () => {
    const baseClasses = "flex items-center border-b bg-white px-4 shadow-sm";
    
    switch (layout.headerPosition) {
      case 'top':
        return `${baseClasses} sticky top-0 z-30 h-16 w-full`;
      case 'bottom':
        return `${baseClasses} sticky bottom-0 z-30 h-16 w-full`;
      case 'left':
        return `fixed left-0 top-0 h-full w-56 z-30 flex flex-col border-r bg-white shadow-sm`;
      case 'right':
        return `fixed right-0 top-0 h-full w-56 z-30 flex flex-col border-l bg-white shadow-sm`;
      default:
        return `${baseClasses} sticky top-0 z-30 h-16 w-full`;
    }
  };

  const getHeaderContentClasses = () => {
    switch (layout.headerPosition) {
      case 'left':
      case 'right':
        return "flex flex-col items-start gap-4 h-full py-4 px-3";
      default:
        return "flex items-center gap-4 w-full max-w-6xl mx-auto";
    }
  };

  const getNavClasses = () => {
    switch (layout.headerPosition) {
      case 'left':
      case 'right':
        return "flex flex-col gap-2";
      default:
        return "flex gap-2 ml-4";
    }
  };

  return (
    <header className={getHeaderClasses()}>
      <div className={getHeaderContentClasses()}>
        <div className="text-white bg-blue-600 px-2 py-2">
          <SeedLink href="/" className="flex items-center gap-2">
            <span className={`font-bold text-xl tracking-tight text-white`}>
              AutoConnect
            </span>
          </SeedLink>
        </div>
        {/* Always show UserSearchBar in header for all layouts */}
        <div className={searchClasses}>
          <UserSearchBar />
        </div>
        <nav className={getNavClasses()}>
          {shuffledNavItems.map((item) => (
            <SeedLink
              key={item.href}
              href={item.href}
              className={linkClass(item.href)}
              onClick={() => logEvent(item.eventType, item.eventData)}
            >
              {item.label}
            </SeedLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
