"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { dynamicDataProvider } from "@/dynamic/v2";
import { useSeed } from "@/context/SeedContext";

const LOADING_UI = (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <span className="text-muted-foreground">Loading emails…</span>
  </div>
);

function ErrorRetryUI({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-muted-foreground text-center max-w-md">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

/**
 * Waits for the email data to be ready before showing the mail layout.
 * On seed change, waits for reload to finish so the email list is visible and populated.
 * Shows an error state with retry when initial load fails repeatedly.
 */
export function DataReadyGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        if (!cancelled) {
          setError(null);
          setReady(true);
        }
      })
      .catch((err) => {
        console.error("[automail] Data load failed", err);
        if (!cancelled) {
          setError(
            "Could not load emails. Check your connection and try again."
          );
          setReady(true);
        }
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
      setError(null);
      try {
        await dynamicDataProvider.reload(seed);
        setReady(true);
      } catch (err) {
        console.error("[automail] Failed to reload data on seed change", err);
        setError("Failed to load data for this view. You can try again.");
        setReady(true);
      }
    };

    reloadData();
  }, [seed, mounted, isSeedReady]);

  const handleRetry = useCallback(() => {
    setError(null);
    setReady(false);
    dynamicDataProvider.refreshEmailsForSeed(seed).then(() => {
      setReady(true);
    }).catch((err) => {
      console.error("[automail] Retry failed", err);
      setError("Could not load emails. Check your connection and try again.");
      setReady(true);
    });
  }, [seed]);

  if (typeof window === "undefined") {
    return LOADING_UI;
  }

  if (!ready) {
    return LOADING_UI;
  }

  if (error) {
    return <ErrorRetryUI message={error} onRetry={handleRetry} />;
  }

  return <>{children}</>;
}
