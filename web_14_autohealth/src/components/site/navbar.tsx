"use client";

import { Button } from "@/components/ui/button";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useSeedLayout } from "@/library/useSeedLayout";
import { DynamicElement } from "@/components/DynamicElement";
import { SeedLink } from "@/components/ui/SeedLink";

export default function Navbar() {
  const { reorderElements, layoutConfig } = useSeedLayout();
  const links = [
    { href: "/appointments", title: "Appointments", event: EVENT_TYPES.BROWSE_APPOINTMENTS_CLICKED },
    { href: "/doctors", title: "Doctors", event: EVENT_TYPES.BROWSE_DOCTORS_CLICKED },
    { href: "/prescriptions", title: "Prescriptions", event: EVENT_TYPES.BROWSE_PRESCRIPTIONS_CLICKED },
    { href: "/medical-records", title: "Medical Records", event: EVENT_TYPES.BROWSE_MEDICAL_RECORDS_CLICKED },
  ];
  const ordered = reorderElements(links);

  const sectionKeys = layoutConfig.headerOrder.map((key) => (key === "search" ? "cta" : key));

  const Logo = (
    <DynamicElement elementType="nav-logo" as="span" index={0}>
      <SeedLink 
        href="/" 
        className="font-semibold text-emerald-700"
        onClick={() => logEvent(EVENT_TYPES.BROWSE_HOME_CLICKED, { source: "navbar_logo" })}
      >
        AutoHealth
      </SeedLink>
    </DynamicElement>
  );

  const Links = (
    <nav className="hidden gap-6 md:flex">
      {ordered.map((n, i) => (
        <DynamicElement key={n.href} elementType="nav-link" as="span" index={i}>
          <SeedLink
            href={n.href}
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => logEvent(n.event, { source: "navbar_link" })}
          >
            {n.title}
          </SeedLink>
        </DynamicElement>
      ))}
    </nav>
  );

  const Cta = (
    <DynamicElement elementType="nav-cta" as="span" index={0}>
      <SeedLink href="/appointments">
        <Button 
          size="sm"
          onClick={() => logEvent(EVENT_TYPES.BOOK_NOW_CLICKED, { source: "navbar_cta_button" })}
        >
          Book now
        </Button>
      </SeedLink>
    </DynamicElement>
  );

  const sectionMap: Record<string, React.ReactNode> = {
    logo: Logo,
    nav: Links,
    cta: Cta,
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        {sectionKeys.map((k, i) => (
          <DynamicElement key={k} elementType="nav-section" as="div" index={i}>
            {sectionMap[k]}
          </DynamicElement>
        ))}
      </div>
    </header>
  );
}
