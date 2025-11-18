"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { SeedLink } from "@/components/ui/SeedLink";

const NAV_ITEMS = [
  {
    labelKey: "dashboard_title",
    idKey: "dashboard_link",
    href: "/",
  },
  {
    labelKey: "matters_title",
    idKey: "matters_link",
    href: "/matters",
  },
  {
    labelKey: "clients_title",
    idKey: "clients_link",
    href: "/clients",
  },
  {
    labelKey: "documents_title",
    idKey: "documents_link",
    href: "/documents",
  },
  {
    labelKey: "calendar_title",
    idKey: "calendar_link",
    href: "/calendar",
  },
  {
    labelKey: "billing_title",
    idKey: "billing_link",
    href: "/billing",
  },
  {
    labelKey: "settings_title",
    idKey: "settings_link",
    href: "/settings",
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
            <SeedLink
              key={labelKey}
              id={linkId}
              href={href}
              className={`text-base font-medium rounded-2xl px-4 py-2 transition-all ${
                isActive
                  ? "text-accent-forest bg-accent-forest/10 font-bold"
                  : "text-zinc-700 hover:bg-accent-forest/10"
              }`}
            >
              {label}
            </SeedLink>
          );
        })}
      </nav>
    </aside>
  );
}
