"use client";
import { EVENT_TYPES, logEvent } from "@/library/events";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { withSeed } from "@/utils/seedRouting";

const NAV_ITEMS = [
  {
    labelKey: "dashboard_title",
    idKey: "dashboard_link",
    href: "/",
    // event: EVENT_TYPES.DASHBOARD_SIDEBAR_CLICKED,
  },
  {
    labelKey: "matters_title",
    idKey: "matters_link",
    href: "/matters",
    // event: EVENT_TYPES.MATTERS_SIDEBAR_CLICKED,
  },
  {
    labelKey: "clients_title",
    idKey: "clients_link",
    href: "/clients",
    // event: EVENT_TYPES.CLIENTS_SIDEBAR_CLICKED,
  },
  {
    labelKey: "documents_title",
    idKey: "documents_link",
    href: "/documents",
    // event: EVENT_TYPES.DOCUMENTS_SIDEBAR_CLICKED,
  },
  {
    labelKey: "calendar_title",
    idKey: "calendar_link",
    href: "/calendar",
    // event: EVENT_TYPES.CALENDAR_SIDEBAR_CLICKED,
  },
  {
    labelKey: "billing_title",
    idKey: "billing_link",
    href: "/billing",
    // event: EVENT_TYPES.TIME_AND_BILLING_SIDEBAR_CLICKED,
  },
  {
    labelKey: "settings_title",
    idKey: "settings_link",
    href: "/settings",
    // event: EVENT_TYPES.SETTINGS_SIDEBAR_CLICKED,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getText, getId } = useDynamicStructure();
  return (
    <aside
      className="w-64 min-w-64 py-12 px-6 flex flex-col bg-neutral-bg-dark border-r border-zinc-200 shadow-sm"
      style={{ borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }}
    >
      <div className="mb-8 text-xl font-semibold text-zinc-700 tracking-tight">
        Menu
      </div>
      <nav className="flex flex-col gap-6 mt-2">
        {NAV_ITEMS.map(({ labelKey, idKey, href}) => {
          const isActive =
            href === "/"
              ? pathname === href
              : pathname === href || pathname.startsWith(href + "/");
          
          const label = getText(labelKey);
          const linkId = getId(idKey);

          return (
            <Link
              key={labelKey}
              id={linkId}
              href={withSeed(href, searchParams)}
              className={`text-base font-medium rounded-2xl px-4 py-2 transition-all ${
                isActive
                  ? "text-accent-forest bg-accent-forest/10 font-bold"
                  : "text-zinc-700 hover:bg-accent-forest/10"
              }`}
              // onClick={() => logEvent(event, { label, href })}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
