"use client";

import { useEffect } from "react";

// Provide a defensive noop for scripts that expect a global setter
if (typeof window !== "undefined" && !(window as any).setBaseWebRoot) {
  (window as any).setBaseWebRoot = () => {};
}

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";

    // Some embeds expect a global setter; provide a harmless noop to avoid runtime ReferenceError
    if (typeof window !== "undefined" && !(window as any).setBaseWebRoot) {
      (window as any).setBaseWebRoot = () => {};
    }
  }, []);

  return <div className="antialiased">{children}</div>;
}
