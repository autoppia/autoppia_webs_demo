"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useSeedLayout } from "@/library/useSeedLayout";
import { DynamicElement } from "@/components/DynamicElement";
import { getEffectiveSeed, getLayoutConfig } from "@/utils/dynamicDataProvider";
import { withSeed } from "@/utils/seedRouting";

export default function Navbar() {
  const { reorderElements, getText, getElementAttributes } = useSeedLayout();
  const links = [
    { href: "/appointments", title: "Appointments", event: EVENT_TYPES.BROWSE_APPOINTMENTS_CLICKED },
    { href: "/doctors", title: "Doctors", event: EVENT_TYPES.BROWSE_DOCTORS_CLICKED },
    { href: "/prescriptions", title: "Prescriptions", event: EVENT_TYPES.BROWSE_PRESCRIPTIONS_CLICKED },
    { href: "/medical-records", title: "Medical Records", event: EVENT_TYPES.BROWSE_MEDICAL_RECORDS_CLICKED },
  ];
  const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
  const hasSeed = !!sp?.get('seed');
  const ordered = hasSeed ? reorderElements(links) : links;

  // Seed-driven navbar section ordering (logo, links, cta)
  const rawSeed = sp ? parseInt(sp.get('seed') || '1') : 1;
  const seed = getEffectiveSeed(rawSeed);
  const layout = getLayoutConfig(seed);
  const headerOrder = layout.headerOrder; // e.g., ['logo','nav','search']
  const sectionKeys = hasSeed
    ? headerOrder.map((k: string) => (k === 'search' ? 'cta' : k))
    : ['logo', 'nav', 'cta'];

  const Logo = (
    <DynamicElement elementType="nav-logo" as="span" index={0}>
      <Link 
        href={withSeed("/")} 
        className="font-semibold text-emerald-700"
        onClick={() => logEvent(EVENT_TYPES.BROWSE_HOME_CLICKED, { source: "navbar_logo" })}
      >
        AutoHealth
      </Link>
    </DynamicElement>
  );

  const Links = (
    <nav className="hidden gap-6 md:flex">
      {ordered.map((n, i) => (
        <DynamicElement key={n.href} elementType="nav-link" as="span" index={i}>
          <Link
            href={withSeed(n.href)}
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => logEvent(n.event, { source: "navbar_link" })}
          >
            {n.title}
          </Link>
        </DynamicElement>
      ))}
    </nav>
  );

  const Cta = (
    <DynamicElement elementType="nav-cta" as="span" index={0}>
      <Link href={withSeed("/appointments")}>
        <Button 
          size="sm"
          onClick={() => logEvent(EVENT_TYPES.BOOK_NOW_CLICKED, { source: "navbar_cta_button" })}
          {...getElementAttributes('nav-book-now-button', 0)}
        >
          {getText('nav-book-now-button', 'Book now')}
        </Button>
      </Link>
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
