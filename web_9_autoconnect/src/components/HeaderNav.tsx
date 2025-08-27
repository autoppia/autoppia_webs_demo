"use client";

import Link from "next/link";
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
        return `${baseClasses} fixed left-0 top-0 h-full w-16 z-30 flex-col`;
      case 'right':
        return `${baseClasses} fixed right-0 top-0 h-full w-16 z-30 flex-col`;
      case 'hidden':
        return 'hidden';
      default:
        return `${baseClasses} sticky top-0 z-30 h-16 w-full`;
    }
  };

  const getHeaderContentClasses = () => {
    switch (layout.headerPosition) {
      case 'left':
      case 'right':
        return "flex flex-col items-center gap-4 h-full py-4";
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
          <Link href="/" className="flex items-center gap-2">
            <span className={`font-bold text-xl tracking-tight text-white ${layout.headerPosition === 'left' || layout.headerPosition === 'right' ? 'hidden' : 'hidden sm:block'}`}>
              AutoConnect
            </span>
          </Link>
        </div>
        {layout.searchPosition === 'header' && layout.headerPosition !== 'left' && layout.headerPosition !== 'right' && (
          <div className={searchClasses}>
            <UserSearchBar />
          </div>
        )}
        <nav className={getNavClasses()}>
          {shuffledNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={linkClass(item.href)}
              onClick={() => logEvent(item.eventType, item.eventData)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
