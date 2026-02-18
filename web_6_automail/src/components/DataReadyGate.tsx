"use client";

import { useEffect, useRef, useState } from "react";
import { dynamicDataProvider } from "@/dynamic/v2";
import { useSeed } from "@/context/SeedContext";

const LOADING_UI = (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <span className="text-muted-foreground">Loading emails…</span>
  </div>
);

/**
 * Waits for the email data to be ready before showing the mail layout.
 * On seed change, waits for reload to finish so the email list is visible and populated.
 */
export function DataReadyGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { seed, isSeedReady } = useSeed();
  const prevSeedRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait for initial data (or cached data) before showing content
  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    dynamicDataProvider
      .whenReady()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((error) => {
        console.error("[automail] Data load failed", error);
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  // On seed change: wait for reload so the email list appears with the right data. Only when URL seed is ready to avoid reload(1).
  useEffect(() => {
    if (!mounted || !isSeedReady) return;
    if (prevSeedRef.current === null) {
      prevSeedRef.current = seed;
      return;
    }
    if (prevSeedRef.current === seed) return;
    prevSeedRef.current = seed;

    const reloadData = async () => {
      setReady(false);
      try {
        await dynamicDataProvider.reload(seed);
        setReady(true);
      } catch (error) {
        console.error("[automail] Failed to reload data on seed change", error);
        setReady(true);
      }
    };

    reloadData();
  }, [seed, mounted, isSeedReady]);

  if (typeof window === "undefined") {
    return LOADING_UI;
  }

  if (!ready) {
    return LOADING_UI;
  }

  return <>{children}</>;
}
