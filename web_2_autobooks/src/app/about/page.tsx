"use client";

import { Suspense } from "react";
import { AboutSection } from "@/components/about/AboutSection";

function AboutContent() {
  return (
    <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      {/* Background gradient overlays */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
      
      <main className="relative mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <AboutSection />
      </main>
    </div>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
      <AboutContent />
    </Suspense>
  );
}
