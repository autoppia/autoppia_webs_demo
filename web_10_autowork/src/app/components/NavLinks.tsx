"use client";

import { type ComponentType } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { Briefcase, Users, Sparkles, Heart, User, Clock3 } from "lucide-react";

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
  return (
    <>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <SeedLink
            key={link.label}
            href={link.href}
            className="flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 bg-transparent hover:bg-gradient-to-r hover:from-[#e6f9fb] hover:to-[#f0fdfa] text-base font-medium hover:text-[#08b4ce] hover:shadow-sm group"
            onClick={() =>
              logEvent(EVENT_TYPES.NAVBAR_CLICK, {
                label: link.label,
                href: link.href,
              })
            }
          >
            <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>{link.label}</span>
          </SeedLink>
        );
      })}
    </>
  );
}
