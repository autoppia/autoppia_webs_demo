"use client";

import React, { Suspense, useEffect } from "react";
import { MailLayout, useDynamicSystem } from "@/dynamic";
import { useSeed } from "@/context/SeedContext";
import { DataReadyGate } from "@/components/DataReadyGate";

function GmailContent() {
  const dyn = useDynamicSystem();
  const { seed } = useSeed();

  // Log V2 status for debugging
  useEffect(() => {
    console.log("[automail] V2 Status:", {
      seed,
      v2Enabled: dyn.v2.isEnabled(),
    });
  }, [seed, dyn]);

  return <MailLayout key="layout" />;
}

export default function GmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <DataReadyGate>
        <GmailContent />
      </DataReadyGate>
    </Suspense>
  );
}
