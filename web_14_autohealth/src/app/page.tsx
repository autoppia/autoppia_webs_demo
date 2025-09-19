"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logEvent, EVENT_TYPES } from "@/library/events";

export default function Home() {
  const nav = [
    { href: "/appointments", title: "Appointments", desc: "Find a slot and book online", event: EVENT_TYPES.BROWSE_APPOINTMENTS_CLICKED },
    { href: "/doctors", title: "Doctors", desc: "Browse specialists and ratings", event: EVENT_TYPES.BROWSE_DOCTORS_CLICKED },
    { href: "/prescriptions", title: "Prescriptions", desc: "View your medications", event: EVENT_TYPES.BROWSE_PRESCRIPTIONS_CLICKED },
    { href: "/medical-records", title: "Medical Records", desc: "Upload and review files", event: EVENT_TYPES.BROWSE_MEDICAL_RECORDS_CLICKED },
  ];

  return (
    <div className="container py-10">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Book your doctor online
        </h1>
        <p className="mt-3 text-muted-foreground">
          Simple, fast, and secure. Demo only — no sign-in, no backend.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/appointments">
            <Button 
              size="lg"
              onClick={() => logEvent(EVENT_TYPES.BROWSE_APPOINTMENTS_CLICKED, { source: "homepage_cta_button" })}
            >
              Browse Appointments
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {nav.map((n) => (
          <Link key={n.href} href={n.href}>
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
        ))}
      </section>
    </div>
  );
}
