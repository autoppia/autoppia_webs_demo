"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SeedLink } from "@/components/ui/SeedLink";
import { Briefcase, Users, Calendar, FileText, Clock, Settings2 } from "lucide-react";
import { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { useSeed } from "@/context/SeedContext";
// LAYOUT FIJO - Sin variaciones V1
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useProjectData } from "@/shared/universal-loader";
// import { EVENT_TYPES, logEvent, EventType } from "@/library/events";

// interface EventData {
//   label: string;
//   href: string;
// }

function DashboardContent() {
  const { seed, resolvedSeeds } = useSeed();
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
  
  // LAYOUT FIJO - Sin variaciones, siempre como seed 1
  
  // Log v2 info when it changes (only once per unique v2 seed)
  const lastV2SeedRef = useRef<number | null>(null);
  useEffect(() => {
    const currentV2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
    // Only log if v2 seed actually changed
    if (lastV2SeedRef.current !== currentV2Seed) {
      console.log(`[autocrm] V2 Data - Seed: ${currentV2Seed} (from base seed: ${seed})`);
      lastV2SeedRef.current = currentV2Seed;
    }
  }, [resolvedSeeds.v2, resolvedSeeds.base, seed]);
  
  // LAYOUT FIJO - Sin variaciones, siempre como seed 1
  const { getText, getId } = useDynamicStructure();
  const searchParams = useSearchParams();
  
  // Load dynamic counts for all entities (with cleanup to avoid duplicate loads)
  const lastV2SeedForDataRef = useRef<number | null>(null);
  const [dataSeed, setDataSeed] = useState<number | undefined>(v2Seed);
  
  useEffect(() => {
    const currentV2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
    if (lastV2SeedForDataRef.current !== currentV2Seed) {
      lastV2SeedForDataRef.current = currentV2Seed;
      setDataSeed(currentV2Seed);
    }
  }, [resolvedSeeds.v2, resolvedSeeds.base]);
  
  const { data: clientsData } = useProjectData<any>({ projectKey: 'web_5_autocrm', entityType: 'clients', seedValue: dataSeed });
  const { data: mattersData } = useProjectData<any>({ projectKey: 'web_5_autocrm', entityType: 'matters', seedValue: dataSeed });
  const { data: eventsData } = useProjectData<any>({ projectKey: 'web_5_autocrm', entityType: 'events', seedValue: dataSeed });
  const { data: filesData } = useProjectData<any>({ projectKey: 'web_5_autocrm', entityType: 'files', seedValue: dataSeed });
  const { data: logsData } = useProjectData<any>({ projectKey: 'web_5_autocrm', entityType: 'logs', seedValue: dataSeed });
  
  const counters = {
    matters: mattersData?.length || 41,
    clients: clientsData?.length || 44,
    events: eventsData?.length || 6,
    files: filesData?.length || 50,
    logs: logsData?.length || 36,
  };
  
  // const handleClick = (eventType: EventType, data: EventData) => () => logEvent(eventType, { ...data });

  return (
    <section>
      <h1 className="text-3xl md:text-[2.25rem] font-extrabold mb-10 tracking-tight">{getText("dashboard_title", "Dashboard")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Card 1: Matters */}
        <SeedLink
          href="/matters"
          id={getId("matters_link")}
          // onClick={handleClick(EVENT_TYPES.MATTERS_SIDEBAR_CLICKED, { label: "Active Matters", href: "/matters" })}
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">{getText("matters_title", "Matters")}</span>
            <Briefcase className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">{counters.matters}</span>
          <span className="text-sm text-zinc-400">{getText("total_matters", "Total Matters")}</span>
        </SeedLink>

        {/* Card 2: Clients */}
        <SeedLink
          href="/clients"
          id={getId("clients_link")}
          // onClick={handleClick(EVENT_TYPES.CLIENTS_SIDEBAR_CLICKED, { label: "Clients", href: "/clients" })}
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">{getText("clients_title", "Clients")}</span>
            <Users className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">{counters.clients}</span>
          <span className="text-sm text-zinc-400">{getText("total_clients", "Total Clients")}</span>
        </SeedLink>

        {/* Card 3: Calendar */}
        <SeedLink
          href="/calendar"
          id={getId("calendar_link")}
          // onClick={handleClick(EVENT_TYPES.CALENDAR_SIDEBAR_CLICKED, { label: "Upcoming Events", href: "/calendar" })}
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">{getText("upcoming_events", "Upcoming Events")}</span>
            <Calendar className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">{counters.events}</span>
          <span className="text-sm text-zinc-400">{getText("event_date", "Event Date")}</span>
        </SeedLink>

        {/* Card 4: Documents */}
        <SeedLink
          href="/documents"
          id={getId("documents_link")}
          // onClick={handleClick(EVENT_TYPES.DOCUMENTS_SIDEBAR_CLICKED, { label: "Documents", href: "/documents" })}
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">{getText("documents_title", "Documents")}</span>
            <FileText className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">{counters.files}</span>
          <span className="text-sm text-zinc-400">{getText("document_name", "Document Name")}</span>
        </SeedLink>

        {/* Card 5: Time Tracking */}
        <SeedLink
          href="/billing"
          id={getId("billing_link")}
          // onClick={handleClick(EVENT_TYPES.TIME_AND_BILLING_SIDEBAR_CLICKED, { label: "Time & Billing", href: "/billing" })}
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">{getText("billing_title", "Billing Title")}</span>
            <Clock className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">{counters.logs}</span>
          <span className="text-sm text-zinc-400">{getText("hours_logged", "Hours Logged")}</span>
        </SeedLink>

        {/* Card 6: Settings */}
        <SeedLink
          href="/settings"
          id={getId("settings_link")}
          // onClick={handleClick(EVENT_TYPES.SETTINGS_SIDEBAR_CLICKED, { label: "Settings", href: "/settings" })}
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">{getText("settings_title", "Settings")}</span>
            <Settings2 className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] select-none">--</span>
          <span className="text-sm text-zinc-400">{getText("notes", "Notes")}</span>
        </SeedLink>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
