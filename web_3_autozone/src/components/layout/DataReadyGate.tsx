"use client";

import { useEffect, useState } from "react";
import { dynamicDataProvider } from "@/utils/dynamicDataProvider";
import { isDataGenerationEnabled } from "@/shared/data-generator";

export function DataReadyGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(dynamicDataProvider.isReady());
  const dataGen = isDataGenerationEnabled();

  useEffect(() => {
    if (ready) return;
    let mounted = true;
    dynamicDataProvider.whenReady().then(() => {
      if (!mounted) return;
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [ready]);

  if (dataGen && !ready) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-700">
        Generating data… please wait
      </div>
    );
  }

  return <>{children}</>;
}


