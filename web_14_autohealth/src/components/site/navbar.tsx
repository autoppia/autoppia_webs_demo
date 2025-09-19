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
          onClick={() => logEvent(EVENT_TYPES.BROWSE_HOME_CLICKED, { source: "navbar_logo" })}
        >
          AutoHealth
        </Link>
        <nav className="hidden gap-6 md:flex">
          <Link
            href="/appointments"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => logEvent(EVENT_TYPES.BROWSE_APPOINTMENTS_CLICKED, { source: "navbar_link" })}
          >
            Appointments
          </Link>
          <Link
            href="/doctors"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => logEvent(EVENT_TYPES.BROWSE_DOCTORS_CLICKED, { source: "navbar_link" })}
          >
            Doctors
          </Link>
          <Link
            href="/prescriptions"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => logEvent(EVENT_TYPES.BROWSE_PRESCRIPTIONS_CLICKED, { source: "navbar_link" })}
          >
            Prescriptions
          </Link>
          <Link
            href="/medical-records"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => logEvent(EVENT_TYPES.BROWSE_MEDICAL_RECORDS_CLICKED, { source: "navbar_link" })}
          >
            Medical Records
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/appointments">
            <Button 
              size="sm"
              onClick={() => logEvent(EVENT_TYPES.BOOK_NOW_CLICKED, { source: "navbar_cta_button" })}
            >
              Book now
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
