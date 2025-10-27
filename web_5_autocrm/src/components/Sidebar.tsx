"use client";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { SeedLink } from "@/components/ui/SeedLink";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/",
    // event: EVENT_TYPES.DASHBOARD_SIDEBAR_CLICKED,
  },
  {
    label: "Matters",
    href: "/matters",
    // event: EVENT_TYPES.MATTERS_SIDEBAR_CLICKED,
  },
  {
    label: "Clients",
    href: "/clients",
    // event: EVENT_TYPES.CLIENTS_SIDEBAR_CLICKED,
  },
  {
    label: "Documents",
    href: "/documents",
    // event: EVENT_TYPES.DOCUMENTS_SIDEBAR_CLICKED,
  },
  {
    label: "Calendar",
    href: "/calendar",
    // event: EVENT_TYPES.CALENDAR_SIDEBAR_CLICKED,
  },
  {
    label: "Time & Billing",
    href: "/billing",
    // event: EVENT_TYPES.TIME_AND_BILLING_SIDEBAR_CLICKED,
  },
  {
    label: "Settings",
    href: "/settings",
    // event: EVENT_TYPES.SETTINGS_SIDEBAR_CLICKED,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="w-64 min-w-64 py-12 px-6 flex flex-col bg-neutral-bg-dark border-r border-zinc-200 shadow-sm"
      style={{ borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }}
    >
      <div className="mb-8 text-xl font-semibold text-zinc-700 tracking-tight">
        Menu
      </div>
      <nav className="flex flex-col gap-6 mt-2">
        {NAV_ITEMS.map(({ label, href}) => {
          const isActive =
            href === "/"
              ? pathname === href
              : pathname === href || pathname.startsWith(href + "/");

          return (
            <SeedLink
              key={label}
              href={href}
              className={`text-base font-medium rounded-2xl px-4 py-2 transition-all ${
                isActive
                  ? "text-accent-forest bg-accent-forest/10 font-bold"
                  : "text-zinc-700 hover:bg-accent-forest/10"
              }`}
              // onClick={() => logEvent(event, { label, href })}
            >
              {label}
            </SeedLink>
          );
        })}
      </nav>
    </aside>
  );
}
