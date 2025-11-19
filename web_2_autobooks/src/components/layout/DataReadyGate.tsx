"use client";

import { useEffect, useState } from "react";
import { dynamicDataProvider } from "@/dynamic/v2-data";

export function DataReadyGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(dynamicDataProvider.isReady());

  useEffect(() => {
    if (ready) return;
    let mounted = true;
    dynamicDataProvider
      .whenReady()
      .then(() => {
        if (!mounted) return;
        setReady(true);
      })
      .catch((error) => {
        console.error("[autobooks] Data load failed", error);
        if (!mounted) return;
        setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, [ready]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-700">
        Loading catalog…
      </div>
    );
  }

  return <>{children}</>;
}
