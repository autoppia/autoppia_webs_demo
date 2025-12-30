"use client";

import { useState, useEffect } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import { usePathname } from "next/navigation";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useSeed } from "@/context/SeedContext";
import { dynamicDataProvider } from "@/dynamic/v2-data";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

export default function HeaderNav() {
  const pathname = usePathname();
  const dyn = useDynamicSystem();
  
  // Fix hydration error: use state to get user only on client side
  const [profileUsername, setProfileUsername] = useState<string>("alexsmith");
  const navTextVariants: Record<string, string[]> = {
    nav_home: ["Home", "Feed", "Dashboard"],
    nav_jobs: ["Jobs", "Careers", "Openings"],
    nav_recommendations: ["Recommendations", "For you", "Suggestions"],
    nav_profile: ["Profile", "Me", "My profile"],
  };
  const navIdVariants: Record<string, string[]> = {
    nav_home_link: ["nav_home_link", "nav_home", "nav-feed"],
    nav_jobs_link: ["nav_jobs_link", "nav_jobs", "nav-careers"],
    nav_recommendations_link: ["nav_recs_link", "nav_recommendations", "nav-suggestions"],
    nav_profile_link: ["nav_profile_link", "nav_profile", "nav-me"],
  };
  
  useEffect(() => {
    // Only get user on client side to avoid hydration mismatch
    const users = dynamicDataProvider.getUsers();
    const username = users[2]?.username || users[0]?.username || "alexsmith";
    setProfileUsername(username);
  }, []);

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
      eventData: { label: "Home" },
      idKey: "nav_home_link",
    },
    {
      href: "/jobs",
      label: "Jobs", 
      eventType: EVENT_TYPES.JOBS_NAVBAR,
      eventData: { label: "Jobs" },
      idKey: "nav_jobs_link",
    },
    {
      href: "/recommendations",
      label: "Recommendations",
      eventType: EVENT_TYPES.VIEW_ALL_RECOMMENDATIONS,
      eventData: { label: "Recommendations", source: "navbar" },
      idKey: "nav_recommendations_link",
    },
    {
      href: `/profile/${profileUsername}`,
      label: "Profile",
      eventType: null,
      eventData: null,
      idKey: "nav_profile_link",
    }
  ];
  const orderedNavItems = navItems;

  return (
    <header
      className={dyn.v3.getVariant(
        "header_classes",
        CLASS_VARIANTS_MAP,
        "flex items-center border-b bg-white shadow-sm sticky top-0 z-30 h-16 w-full"
      )}
      id={dyn.v3.getVariant("header_nav_id", ID_VARIANTS_MAP, "header-nav")}
    >
      <div className="flex items-center w-full max-w-[1200px] mx-auto px-4 gap-4">
        <div className="flex items-center">
          <SeedLink
            href="/"
            id={dyn.v3.getVariant("logo_link", ID_VARIANTS_MAP, "logo_link")}
            className={dyn.v3.getVariant(
              "nav-link",
              CLASS_VARIANTS_MAP,
              "flex items-center gap-2"
            )}
          >
            <span className="font-bold text-xl tracking-tight text-white bg-blue-600 px-3 py-1.5 rounded">AutoConnect</span>
          </SeedLink>
        </div>

        <div className="flex-1 flex justify-center">
          <nav className="flex items-center gap-3">
            {orderedNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href === "/" && pathname === "/");
              return (
                <SeedLink
                  key={item.href}
                  href={item.href}
                  id={dyn.v3.getVariant(item.idKey, navIdVariants, item.idKey)}
                  className={dyn.v3.getVariant(
                    "nav-link",
                    CLASS_VARIANTS_MAP,
                    linkClass(item.href)
                  )}
                  onClick={() => {
                    if (item.eventType) {
                      logEvent(item.eventType, item.eventData || {});
                    }
                  }}
                  style={
                    isActive
                      ? { fontWeight: 700 }
                      : { fontWeight: 500 }
                  }
                >
                  {dyn.v3.getVariant(item.idKey.replace("_link", ""), navTextVariants, item.label)}
                </SeedLink>
              );
            })}
          </nav>
        </div>

        <div className="min-w-[140px] flex justify-end" />
      </div>
    </header>
  );
}
