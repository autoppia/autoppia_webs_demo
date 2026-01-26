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
          console.error("[autohealth] Data load failed", error);
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
        console.error("[autohealth] Failed to reload data on seed change", error);
        setReady(true);
      }
    };

    reloadData();
  }, [seed, mounted]);

  // Show children immediately on server, or when ready on client
  if (!mounted || ready) {
    return <>{children}</>;
  }

  // Show loading state while data is loading
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading data...</p>
      </div>
    </div>
  );
}
