"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { SeedLink } from "@/components/ui/SeedLink";
import { cn } from "@/library/utils";

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
  {
    labelKey: "help_title",
    idKey: "help_link",
    href: "/help",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getText, getId } = useDynamicStructure();
  const dyn = useDynamicSystem();
  
  // V1: Order navigation items dynamically
  const navOrder = dyn.v1.changeOrderElements("sidebar-nav", NAV_ITEMS.length);
  const orderedNavItems = navOrder.map((idx) => NAV_ITEMS[idx]);
  
  return (
    dyn.v1.addWrapDecoy("sidebar", (
      <aside
        className="w-64 min-w-64 py-12 px-6 flex flex-col bg-neutral-bg-dark border-r border-zinc-200 shadow-sm"
        style={{ borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }}
      >
        <div className="mb-8 text-xl font-semibold text-zinc-700 tracking-tight">
          Menu
        </div>
        <nav className="flex flex-col gap-6 mt-2">
          {orderedNavItems.map(({ labelKey, idKey, href}) => {
            const isActive =
              href === "/"
                ? pathname === href
                : pathname === href || pathname.startsWith(href + "/");
            
            // For help_title, use V3 for text, ID, and class
            const isHelpLink = labelKey === "help_title";
            const label = isHelpLink 
              ? dyn.v3.getVariant("help_title", TEXT_VARIANTS_MAP, "Help")
              : getText(labelKey, labelKey.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()));
            const linkId = isHelpLink
              ? dyn.v3.getVariant("help_link", ID_VARIANTS_MAP, "help_link")
              : getId(idKey);

            return (
              dyn.v1.addWrapDecoy(`sidebar-link-${labelKey}`, (
                <SeedLink
                  key={labelKey}
                  id={linkId}
                  href={href}
                  className={cn(
                    dyn.v3.getVariant("nav-link", CLASS_VARIANTS_MAP, "nav-link"),
                    "text-base font-medium rounded-2xl px-4 py-2 transition-all",
                    isActive
                      ? "text-accent-forest bg-accent-forest/10 font-bold"
                      : "text-zinc-700 hover:bg-accent-forest/10"
                  )}
                >
                  {label}
                </SeedLink>
              ), `sidebar-link-wrap-${labelKey}`)
            );
          })}
        </nav>
      </aside>
    ), "sidebar-wrap")
  );
}
