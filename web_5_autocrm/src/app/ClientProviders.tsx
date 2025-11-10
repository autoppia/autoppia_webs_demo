"use client";

import { Suspense } from "react";
import { DynamicStructureProvider } from "@/context/DynamicStructureContext";

// Suspense wrapper for the provider that uses useSearchParams
function DynamicStructureWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>{children}</div>}>
      <DynamicStructureProvider>{children}</DynamicStructureProvider>
    </Suspense>
  );
}

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DynamicStructureWrapper>{children}</DynamicStructureWrapper>;
}

