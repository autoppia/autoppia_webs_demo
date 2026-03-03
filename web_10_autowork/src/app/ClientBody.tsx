"use client";

import { useEffect } from "react";
import { useSeed } from "@/context/SeedContext";
import { dynamicDataProvider } from "@/dynamic/v2";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const { seed, isSeedReady } = useSeed();

  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";

    // Ensure a default seed=1 in the URL (for consistent state) without reload
    try {
      const url = new URL(window.location.href);
      if (!url.searchParams.get("seed")) {
        url.searchParams.set("seed", "1");
        window.history.replaceState({}, "", url.toString());
      }
    } catch {
      // ignore URL errors
    }
  }, []);

  // Keep V2 data in sync with the URL seed. Only run when URL seed is ready to avoid duplicate call with seed=1.
  useEffect(() => {
    if (!isSeedReady) return;
    dynamicDataProvider.reloadIfSeedChanged(seed);
  }, [seed, isSeedReady]);

  return <div className="antialiased">{children}</div>;
}
