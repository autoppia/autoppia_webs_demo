"use client";

import { useEffect, useRef, useState } from "react";
import { dynamicDataProvider } from "@/dynamic/v2";
import { useSeed } from "@/context/SeedContext";

const LOADING_UI = (
  <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
    <span className="text-white/80">Loading catalog…</span>
  </div>
);

export function DataReadyGate({ children }: { children: React.ReactNode }) {
  // Always wait for the dataset API to finish before showing content (we always call the endpoint).
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { seed } = useSeed();
  const prevSeedRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait for the full dataset response before showing content
  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    dynamicDataProvider
      .whenReady()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((error) => {
        console.error("[autobooks] Data load failed", error);
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  // Reload data only when seed changes (not on initial mount)
  useEffect(() => {
    if (!mounted) return;
    if (prevSeedRef.current === null) {
      prevSeedRef.current = seed;
      return;
    }
    if (prevSeedRef.current === seed) return;
    prevSeedRef.current = seed;

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

  // Server: render loading so client hydration matches (client starts with ready=false).
  if (typeof window === "undefined") {
    return LOADING_UI;
  }

  // Client: show loading until dataset is fully loaded
  if (!ready) {
    return LOADING_UI;
  }

  return <>{children}</>;
}
