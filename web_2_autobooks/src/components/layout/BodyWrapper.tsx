"use client";

import { useEffect } from "react";
import { useSeed } from "@/context/SeedContext";
import { getLayoutConfig } from "@/dynamic/v2-data";
import { applyLayoutOverrides } from "@/dynamic/v1-layouts";

export function BodyWrapper({ children }: { children: React.ReactNode }) {
  const { seed, resolvedSeeds } = useSeed();
  const layoutSeed = resolvedSeeds.v1 ?? seed;
  const baseSeed = resolvedSeeds.base ?? seed;
  const layoutConfig = applyLayoutOverrides(getLayoutConfig(layoutSeed), baseSeed);

  useEffect(() => {
    // Remove any existing navbar classes
    document.body.classList.remove('navbar-side', 'navbar-hidden-top', 'navbar-floating', 'navbar-top');
    
    // Add the appropriate navbar class based on layout config
    switch (layoutConfig.navbarStyle) {
      case 'side':
        document.body.classList.add('navbar-side');
        break;
      case 'hidden-top':
        document.body.classList.add('navbar-hidden-top');
        break;
      case 'floating':
        document.body.classList.add('navbar-floating');
        break;
      default:
        document.body.classList.add('navbar-top');
    }
  }, [layoutConfig.navbarStyle]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const assignParam = (storageKey: string, keys: string[], fallback: string) => {
      for (const key of keys) {
        const value = params.get(key);
        if (value !== null) {
          localStorage.setItem(storageKey, value || fallback);
          return;
        }
      }
    };
    assignParam("web_agent_id", ["X-WebAgent-Id", "web_agent_id"], "null");
    assignParam("validator_id", ["X-Validator-Id", "validator_id"], "1");
    assignParam("user", ["user"], "null");
  }, []);

  return <>{children}</>;
}
