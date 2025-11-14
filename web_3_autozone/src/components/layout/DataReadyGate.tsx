"use client";

import { useProducts } from "@/context/ProductsContext";
import { isDataGenerationEnabled } from "@/shared/data-generator";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";

export function DataReadyGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useProducts();
  const dataGen = isDataGenerationEnabled();
  const dbMode = isDbLoadModeEnabled();

  if ((dbMode || dataGen) && isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-gray-700 space-y-2 px-4 text-center">
        <p>{dbMode ? "Loading seeded dataset…" : "Generating data… please wait"}</p>
        {dbMode && (
          <p className="text-sm text-gray-500">
            Using seed values from the URL (1-300) for deterministic results.
          </p>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

