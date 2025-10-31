"use client";

import { SeedLink } from "@/components/ui/SeedLink";
import Image from "next/image";
import { usePathname } from "next/navigation";
import UserSearchBar from "./UserSearchBar";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useSeed } from "@/library/useSeed";
import { getLayoutClasses, getShuffledItems } from "@/library/layouts";

export default function HeaderNav() {
  const pathname = usePathname();
  const { layout } = useSeed();

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
      href: "/profile/alexsmith",
      label: "Profile",
      eventType: EVENT_TYPES.PROFILE_NAVBAR,
      eventData: { label: "Profile", username: "alexsmith" }
    },
    {
      href: "/demo",
      label: "Demo",
      eventType: EVENT_TYPES.HOME_NAVBAR,
      eventData: { label: "Demo" }
    }
  ];

  const shuffledNavItems = getShuffledItems(navItems, layout.navOrder);

  const searchClasses = getLayoutClasses(layout, 'searchPosition');

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
