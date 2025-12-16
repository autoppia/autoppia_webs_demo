"use client";

import { useEffect } from "react";

export function BodyWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Remove any existing navbar classes
    document.body.classList.remove('navbar-side', 'navbar-hidden-top', 'navbar-floating', 'navbar-top');
    
    // Default navbar style
    document.body.classList.add('navbar-top');
  }, []);

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
