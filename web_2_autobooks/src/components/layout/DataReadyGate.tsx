"use client";

import { useEffect, useState } from "react";
import { dynamicDataProvider } from "@/dynamic/v2";
import { useSeed } from "@/context/SeedContext";

export function DataReadyGate({ children }: { children: React.ReactNode }) {
  // Initialize as true on the server to avoid hydration mismatches
  // Then verify on the client if it is actually ready
  const [ready, setReady] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { seed } = useSeed();

  useEffect(() => {
    setMounted(true);
    // Check if it is actually ready after mounting
    if (!dynamicDataProvider.isReady()) {
      setReady(false);
      let isMounted = true;
      dynamicDataProvider
        .whenReady()
        .then(() => {
          if (!isMounted) return;
          setReady(true);
        })
        .catch((error) => {
          console.error("[autobooks] Data load failed", error);
          if (!isMounted) return;
          setReady(true);
        });
      return () => {
        isMounted = false;
      };
    }
  }, []);

  // Reload data when seed changes
  useEffect(() => {
    if (!mounted) return;

    const reloadData = async () => {
      setReady(false);
      try {
        await dynamicDataProvider.reload();
        setReady(true);
      } catch (error) {
        console.error("[autobooks] Failed to reload data on seed change", error);
        setReady(true);
      }
    };

    reloadData();
  }, [seed, mounted]);

  // During SSR and the first client render, show children
  // Only show loading if we are on the client and it truly is not ready
  if (mounted && !ready) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-700">
        Loading catalog…
      </div>
    );
  }

  return <>{children}</>;
}
