"use client";

import type { ComponentType } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { Briefcase, Users, Sparkles, Heart, User, Clock3 } from "lucide-react";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

type NavLink = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const links: NavLink[] = [
  {
    label: "Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    label: "Hires",
    href: "/hires",
    icon: Users,
  },
  {
    label: "Experts",
    href: "/experts",
    icon: Sparkles,
  },
  {
    label: "Favorites",
    href: "/favorites",
    icon: Heart,
  },
  {
    label: "Hire later",
    href: "/hire-later",
    icon: Clock3,
  },
  {
    label: "Profile",
    href: "/profile/alexsmith",
    icon: User,
  },
];

export default function NavLinks() {
  const dyn = useDynamicSystem();
  
  const getNavLinkKey = (href: string) => {
    if (href === "/jobs") return "nav-jobs-link";
    if (href === "/hires") return "nav-hires-link";
    if (href === "/experts") return "nav-experts-link";
    if (href === "/favorites") return "nav-favorites-link";
    if (href === "/hire-later") return "nav-hire-later-link";
    if (href === "/profile/alexsmith") return "nav-profile-link";
    return "nav-link";
  };

  return (
    <>
      {links.map((link) => {
        const Icon = link.icon;
        const navKey = getNavLinkKey(link.href);
        const specificEvent =
          {
            "/jobs": EVENT_TYPES.NAVBAR_JOBS_CLICK,
            "/hires": EVENT_TYPES.NAVBAR_HIRES_CLICK,
            "/experts": EVENT_TYPES.NAVBAR_EXPERTS_CLICK,
            "/favorites": EVENT_TYPES.NAVBAR_FAVORITES_CLICK,
            "/hire-later": EVENT_TYPES.NAVBAR_HIRE_LATER_CLICK,
            "/profile/alexsmith": EVENT_TYPES.NAVBAR_PROFILE_CLICK,
          }[link.href] || EVENT_TYPES.NAVBAR_CLICK;
        return (
          <SeedLink
            key={link.label}
            href={link.href}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 bg-transparent hover:bg-gradient-to-r hover:from-[#e6f9fb] hover:to-[#f0fdfa] text-base font-medium hover:text-[#08b4ce] hover:shadow-sm group ${dyn.v3.getVariant(`${navKey}-class`, CLASS_VARIANTS_MAP, "")}`}
            onClick={() =>
              logEvent(specificEvent, {
                label: link.label,
                href: link.href,
              })
            }
          >
            <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>{dyn.v3.getVariant(`${navKey}-text`, TEXT_VARIANTS_MAP, link.label)}</span>
          </SeedLink>
        );
      })}
    </>
  );
}
