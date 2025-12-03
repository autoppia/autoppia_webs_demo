"use client";

import { useState, useEffect } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import { usePathname } from "next/navigation";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useSeed } from "@/context/SeedContext";
import {
  getEffectiveLayoutConfig,
  getLayoutClasses,
} from "@/dynamic/v1-layouts";
import { dynamicDataProvider } from "@/dynamic/v2-data";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

export default function HeaderNav() {
  const pathname = usePathname();
  const { seed, resolvedSeeds } = useSeed();
  const layoutSeed = resolvedSeeds.v1 ?? resolvedSeeds.base ?? seed;
  const layout = getEffectiveLayoutConfig(layoutSeed);
  const { getId, getClass } = useV3Attributes();
  
  // Fix hydration error: use state to get user only on client side
  const [profileUsername, setProfileUsername] = useState<string>("alexsmith");
  
  useEffect(() => {
    // Only get user on client side to avoid hydration mismatch
    const users = dynamicDataProvider.getUsers();
    const username = users[2]?.username || users[0]?.username || "alexsmith";
    setProfileUsername(username);
  }, []);

  const applyVariant = (type: string, base: string) => {
    const variant = getClass(type, "");
    return variant ? `${variant} ${base}` : base;
  };

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
      eventData: { label: "Home" },
      idKey: "nav_home_link",
    },
    {
      href: "/jobs",
      label: "Jobs", 
      eventType: EVENT_TYPES.JOBS_NAVBAR,
      eventData: { label: "Jobs" },
      idKey: "nav_jobs_link",
    },
    {
      href: "/recommendations",
      label: "Recommendations",
      eventType: EVENT_TYPES.VIEW_ALL_RECOMMENDATIONS,
      eventData: { label: "Recommendations", source: "navbar" },
      idKey: "nav_recommendations_link",
    },
    {
      href: `/profile/${profileUsername}`,
      label: "Profile",
      eventType: EVENT_TYPES.PROFILE_NAVBAR,
      eventData: { label: "Profile", username: profileUsername },
      idKey: "nav_profile_link",
    }
  ];

  const getHeaderClasses = () => {
    const baseClasses = "flex items-center border-b bg-white shadow-sm";
    
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
        return "flex items-center w-full max-w-[1570px] mx-auto px-6 gap-2";
    }
  };

  const getNavClasses = () => {
    switch (layout.headerPosition) {
      case 'left':
      case 'right':
        return "flex flex-col gap-2";
      default:
        return "flex gap-2";
    }
  };

  return (
    <header className={getHeaderClasses()}>
      <div className={getHeaderContentClasses()}>
        <div className="flex items-center w-[300px]">
          <div className="text-white bg-blue-600 px-4 py-2 rounded">
            <SeedLink
              href="/"
              id={getId("logo_link")}
              className={applyVariant("nav-link", "flex items-center gap-2")}
            >
              <span className="font-bold text-xl tracking-tight text-white">
                AutoConnect
              </span>
            </SeedLink>
          </div>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center justify-end w-[300px]">
          <nav className={getNavClasses()}>
            {navItems.map((item) => (
              <SeedLink
                key={item.href}
                href={item.href}
                id={getId(item.idKey)}
                className={applyVariant("nav-link", linkClass(item.href))}
                onClick={() => logEvent(item.eventType, item.eventData)}
              >
                {item.label}
              </SeedLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
