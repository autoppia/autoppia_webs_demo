"use client";

import { useEffect, useState } from "react";
import { dynamicDataProvider } from "@/dynamic/v2-data";

export function DataReadyGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    dynamicDataProvider
      .whenReady()
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch((error) => {
        console.warn("[autocinema] Data load failed, continuing with fallback:", error);
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-neutral-950" />;
  }

  return <>{children}</>;
}
