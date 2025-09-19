"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logEvent, EVENT_TYPES } from "@/library/events";

export default function Navbar() {
  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link 
          href="/" 
          className="font-semibold text-emerald-700"
          onClick={() => logEvent(EVENT_TYPES.NAVIGATE_TO_HOME, { source: "navbar_logo" })}
        >
          AutoHealth
        </Link>
        <nav className="hidden gap-6 md:flex">
          <Link
            href="/appointments"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => logEvent(EVENT_TYPES.NAVIGATE_TO_APPOINTMENTS, { source: "navbar_link" })}
          >
            Appointments
          </Link>
          <Link
            href="/doctors"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => logEvent(EVENT_TYPES.NAVIGATE_TO_DOCTORS, { source: "navbar_link" })}
          >
            Doctors
          </Link>
          <Link
            href="/prescriptions"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => logEvent(EVENT_TYPES.NAVIGATE_TO_PRESCRIPTIONS, { source: "navbar_link" })}
          >
            Prescriptions
          </Link>
          <Link
            href="/medical-records"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => logEvent(EVENT_TYPES.VIEW_HEALTH_METRICS, { source: "navbar_link", action: "navigate_to_medical_records" })}
          >
            Medical Records
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/appointments">
            <Button 
              size="sm"
              onClick={() => logEvent(EVENT_TYPES.NAVIGATE_TO_APPOINTMENTS, { source: "navbar_cta_button" })}
            >
              Book now
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
