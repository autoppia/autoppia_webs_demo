"use client";

import { Suspense } from "react";
import { HomeContent } from "@/components/pages/HomeContent";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
      <HomeContent />
    </Suspense>
  );
}

