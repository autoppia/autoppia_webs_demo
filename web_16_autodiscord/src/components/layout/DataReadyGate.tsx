"use client";

import { dynamicDataProvider } from "@/dynamic/v2";
import { useSeed } from "@/context/SeedContext";
import { useEffect, useRef, useState } from "react";

const LOADING_UI = (
  <div className="min-h-screen bg-discord-darkest text-white flex items-center justify-center">
    <span className="text-white/80">Loading Discord…</span>
  </div>
);

export function DataReadyGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { seed } = useSeed();
  const prevSeedRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    dynamicDataProvider
      .whenReady()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((error) => {
        console.error("[autodiscord] Data load failed", error);
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted]);

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
        console.error("[autodiscord] Failed to reload data on seed change", error);
        setReady(true);
      }
    };

    reloadData();
  }, [seed, mounted]);

  if (typeof window === "undefined") {
    return LOADING_UI;
  }

  if (!ready) {
    return LOADING_UI;
  }

  return <>{children}</>;
}
