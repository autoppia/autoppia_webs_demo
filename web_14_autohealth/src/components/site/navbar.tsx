"use client";

import { Button } from "@/components/ui/button";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";
import { SeedLink } from "@/components/ui/SeedLink";
import { useMemo } from "react";

export default function Navbar() {
  const dyn = useDynamicSystem();
  const links = [
    { href: "/appointments", title: "Appointments" },
    { href: "/doctors", title: "Doctors" },
    { href: "/prescriptions", title: "Prescriptions" },
    { href: "/medical-records", title: "Medical Analysis" },
  ];
  const orderedLinks = useMemo(() => {
    const order = dyn.v1.changeOrderElements("navbar-links", links.length);
    return order.map((idx) => links[idx]);
  }, [dyn.seed, links]);

  const sectionKeys = ["logo", "nav", "cta"];
  const orderedSections = useMemo(() => {
    const order = dyn.v1.changeOrderElements("navbar-sections", sectionKeys.length);
    return order.map((idx) => sectionKeys[idx]);
  }, [dyn.seed]);

  const Logo = dyn.v1.addWrapDecoy("nav-logo", (
    <SeedLink 
      id={dyn.v3.getVariant("nav-logo", ID_VARIANTS_MAP, "nav-logo")}
      href="/" 
      className={cn("font-semibold text-emerald-700", dyn.v3.getVariant("nav-link", CLASS_VARIANTS_MAP, ""))}
    >
      AutoHealth
    </SeedLink>
  ));

  const Links = dyn.v1.addWrapDecoy("navbar-links-container", (
    <nav className="hidden gap-6 md:flex">
      {orderedLinks.map((n, i) => (
        dyn.v1.addWrapDecoy(`nav-link-${i}`, (
          <SeedLink
            key={n.href}
            id={dyn.v3.getVariant("nav-link", ID_VARIANTS_MAP, `nav-link-${i}`)}
            href={n.href}
            className={cn("text-sm text-muted-foreground hover:text-foreground", dyn.v3.getVariant("nav-link", CLASS_VARIANTS_MAP, ""))}
          >
            {dyn.v3.getVariant(`nav_${n.href.substring(1)}`, TEXT_VARIANTS_MAP, n.title)}
          </SeedLink>
        ), `nav-link-${i}`)
      ))}
    </nav>
  ));

  const Cta = dyn.v1.addWrapDecoy("nav-cta", (
    <SeedLink href="/appointments">
      <Button 
        id={dyn.v3.getVariant("nav-cta", ID_VARIANTS_MAP, "nav-cta")}
        className={cn(dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, ""))}
        size="sm"
      >
        {dyn.v3.getVariant("book_now", TEXT_VARIANTS_MAP, "Book now")}
      </Button>
    </SeedLink>
  ));

  const sectionMap: Record<string, React.ReactNode> = {
    logo: Logo,
    nav: Links,
    cta: Cta,
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur">
      {dyn.v1.addWrapDecoy("navbar-container", (
        <div className="container flex h-16 items-center justify-between">
          {orderedSections.map((k, i) => (
            dyn.v1.addWrapDecoy(`nav-section-${i}`, (
              <div key={k}>
                {sectionMap[k]}
              </div>
            ), `nav-section-${i}`)
          ))}
        </div>
      ))}
    </header>
  );
}
