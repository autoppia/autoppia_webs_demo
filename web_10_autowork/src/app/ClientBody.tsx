"use client";

import { useEffect } from "react";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";

    // Ensure a default seed=1 in the URL (for consistent state) without reload
    try {
      const url = new URL(window.location.href);
      if (!url.searchParams.get("seed")) {
        url.searchParams.set("seed", "1");
        window.history.replaceState({}, "", url.toString());
      }
    } catch {
      // ignore URL errors
    }
  }, []);

  return <div className="antialiased">{children}</div>;
}
