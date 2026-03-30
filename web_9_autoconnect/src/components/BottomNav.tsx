"use client";

import { SeedLink } from "@/components/ui/SeedLink";
import { usePathname } from "next/navigation";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";
import NotificationBadge from "@/components/NotificationBadge";

export default function BottomNav() {
  const pathname = usePathname();
  const unreadNotifications = useUnreadNotificationsCount();

  const items = [
    { href: "/", label: "Home", event: EVENT_TYPES.HOME_NAVBAR },
    { href: "/jobs", label: "Jobs", event: EVENT_TYPES.JOBS_NAVBAR },
    {
      href: "/notifications",
      label: "Alerts",
      event: EVENT_TYPES.NOTIFICATIONS_NAVBAR,
    },
    { href: "/recommendations", label: "Recs", event: EVENT_TYPES.VIEW_ALL_RECOMMENDATIONS },
    { href: "/profile/me", label: "Profile", event: null },
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
                  logEvent(it.event, {
                    source: "bottom_nav",
                    label: it.label,
                    unreadCount:
                      it.href === "/notifications" ? unreadNotifications : undefined,
                  });
                }
              }}
              className={`px-3 py-2 rounded text-sm font-medium ${
                (it.href.startsWith("/profile/") ? pathname.startsWith("/profile/") : pathname === it.href)
                  ? "text-blue-700 bg-blue-50"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {it.href === "/notifications" ? (
                <span className="relative inline-flex items-center pr-2">
                  <span>{it.label}</span>
                  <NotificationBadge
                    count={unreadNotifications}
                    className="absolute -right-2 -top-1.5 h-4 min-w-4 border-white bg-red-500 px-1 text-[9px] text-white shadow-sm"
                  />
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <span>{it.label}</span>
                </span>
              )}
            </SeedLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
