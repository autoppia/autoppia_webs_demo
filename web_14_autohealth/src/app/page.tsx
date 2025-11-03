"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useSeedLayout } from "@/library/useSeedLayout";
import { DynamicElement } from "@/components/DynamicElement";
import { withSeed } from "@/utils/seedRouting";

export default function Home() {
  const { reorderElements } = useSeedLayout();
  const nav = [
    { href: "/appointments", title: "Appointments", desc: "Find a slot and book online", event: EVENT_TYPES.BROWSE_APPOINTMENTS_CLICKED },
    { href: "/doctors", title: "Doctors", desc: "Browse specialists and ratings", event: EVENT_TYPES.BROWSE_DOCTORS_CLICKED },
    { href: "/prescriptions", title: "Prescriptions", desc: "View your medications", event: EVENT_TYPES.BROWSE_PRESCRIPTIONS_CLICKED },
    { href: "/medical-records", title: "Medical Records", desc: "Upload and review files", event: EVENT_TYPES.BROWSE_MEDICAL_RECORDS_CLICKED },
  ];
  const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
  const hasSeed = !!sp?.get('seed');
  const reorderedNav = hasSeed ? reorderElements(nav) : nav;

  const heroParts = [
    { key: 'title' },
    { key: 'desc' },
    { key: 'cta' },
  ];
  const orderedHero = hasSeed ? reorderElements(heroParts) : heroParts;

  return (
    <div className="container py-10">
      <section className="mx-auto max-w-3xl text-center">
        {orderedHero.map((part, i) => (
          <DynamicElement key={part.key} elementType={`hero-${part.key}`} as="div" index={i}>
            {part.key === 'title' && (
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Book your doctor online
              </h1>
            )}
            {part.key === 'desc' && (
              <p className="mt-3 text-muted-foreground">
                Simple, fast, and secure. Demo only — no sign-in, no backend.
              </p>
            )}
            {part.key === 'cta' && (
              <div className="mt-6 flex justify-center">
                <Link href={withSeed("/appointments")}>
                  <Button 
                    size="lg"
                    onClick={() => logEvent(EVENT_TYPES.BROWSE_APPOINTMENTS_CLICKED, { source: "homepage_cta_button" })}
                  >
                    Browse Appointments
                  </Button>
                </Link>
              </div>
            )}
          </DynamicElement>
        ))}
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reorderedNav.map((n, i) => (
          <DynamicElement key={n.href} elementType="nav-card" as="section" index={i}>
            <Link href={withSeed(n.href)}>
              <Card 
                className="h-full transition hover:shadow-md"
                onClick={() => logEvent(n.event, { 
                  source: "homepage_card", 
                  destination: n.href,
                  title: n.title 
                })}
              >
                <CardHeader>
                  <CardTitle>{n.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{n.desc}</p>
                </CardContent>
              </Card>
            </Link>
          </DynamicElement>
        ))}
      </section>
    </div>
  );
}
