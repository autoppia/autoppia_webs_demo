"use client";

import { SeedLink } from "@/components/ui/SeedLink";
import { usePathname } from "next/navigation";
import { EVENT_TYPES, logEvent } from "@/library/events";

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home", event: EVENT_TYPES.HOME_NAVBAR },
    { href: "/jobs", label: "Jobs", event: EVENT_TYPES.JOBS_NAVBAR },
    { href: "/recommendations", label: "Recs", event: EVENT_TYPES.VIEW_ALL_RECOMMENDATIONS },
    { href: "/profile/alexsmith", label: "Profile", event: null },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-sm">
      <ul className="max-w-6xl mx-auto flex items-center justify-around py-2 px-4">
        {items.map((it) => (
          <li key={it.href}>
            <SeedLink
              href={it.href}
              onClick={() => {
                if (it.event) {
                  logEvent(it.event, { source: "bottom_nav", label: it.label });
                }
              }}
              className={`px-3 py-2 rounded text-sm font-medium ${
                pathname === it.href ? "text-blue-700 bg-blue-50" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {it.label}
            </SeedLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
