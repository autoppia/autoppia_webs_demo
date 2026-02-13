"use client";

import { useEffect, useState } from "react";
import { dynamicDataProvider } from "@/dynamic/v2";
import { useSeed } from "@/context/SeedContext";

export function DataReadyGate({ children }: { children: React.ReactNode }) {
  // Start false so server and initial client render show the same fallback,
  // then flip to ready after mount/data load to avoid hydration mismatches.
  const [ready, setReady] = useState(false);
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
          console.error("[autocinema] Data load failed", error);
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
        console.error("[autocinema] Failed to reload data on seed change", error);
        setReady(true);
      }
    };
    
    reloadData();
  }, [seed, mounted]);

  // During SSR and first client render, show a stable fallback to avoid HTML/React mismatches
  if (!mounted || !ready) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-700">
        Loading film library…
      </div>
    );
  }

  return <>{children}</>;
}
