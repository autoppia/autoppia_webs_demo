"use client";

import { Suspense } from "react";
import { DynamicStructureProvider } from "@/context/DynamicStructureContext";
import { ClientProvider } from "@/contexts/ClientContext";
import { MatterProvider } from "@/contexts/MatterContext";
import { FileProvider } from "@/contexts/FileContext";
import { LogProvider } from "@/contexts/LogContext";
import { EventProvider } from "@/contexts/EventContext";

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
  return (
    <ClientProvider>
      <MatterProvider>
        <FileProvider>
          <LogProvider>
            <EventProvider>
              <DynamicStructureWrapper>{children}</DynamicStructureWrapper>
            </EventProvider>
          </LogProvider>
        </FileProvider>
      </MatterProvider>
    </ClientProvider>
  );
}

