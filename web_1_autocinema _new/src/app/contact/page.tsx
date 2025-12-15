"use client";

import { Suspense } from "react";
import { ContactSection } from "@/components/contact/ContactSection";

function ContactContent() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <main className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <ContactSection />
      </main>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
      <ContactContent />
    </Suspense>
  );
}
