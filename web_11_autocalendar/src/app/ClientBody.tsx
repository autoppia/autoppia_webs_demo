"use client";

import { useEffect } from "react";
import { useSeed } from "@/context/SeedContext";
import { dynamicDataProvider } from "@/dynamic/v2";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const { seed } = useSeed();

  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  // Keep V2 data in sync with the URL seed.
  useEffect(() => {
    dynamicDataProvider.reloadIfSeedChanged(seed);
  }, [seed]);

  return <div className="antialiased">{children}</div>;
}
