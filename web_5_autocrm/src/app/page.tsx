"use client";
import { SeedLink } from "@/components/ui/SeedLink";
import { Briefcase, Users, Calendar, FileText, Clock, Settings2 } from "lucide-react";
import { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { useSeed } from "@/context/SeedContext";
import { useDynamicSystem } from "@/dynamic";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";
import { useProjectData } from "@/shared/universal-loader";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { initializeClients, initializeEvents, initializeFiles, initializeLogs, initializeMatters } from "@/data/crm-enhanced";

function DashboardContent() {
  const { seed, isSeedReady } = useSeed();
  const v2Seed = seed;

  // Log v2 info when it changes (only once per unique v2 seed)
  const lastV2SeedRef = useRef<number | null>(null);
  useEffect(() => {
    const currentV2Seed = seed;
    // Only log if v2 seed actually changed
    if (lastV2SeedRef.current !== currentV2Seed) {
      console.log(`[autocrm] V2 Data - Seed: ${currentV2Seed} (from base seed: ${seed})`);
      lastV2SeedRef.current = currentV2Seed;
    }
  }, [seed]);

  const dyn = useDynamicSystem();

  // Debug: Verify V2 status
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[page] V2 status:", {
        v2Enabled: dyn.v2.isEnabled(),
      });
    }
  }, [dyn.v2]);

  // Only pass seed to API when URL seed is ready to avoid request with seed=1.
  const dataSeed = isSeedReady ? v2Seed : undefined;

  const { data: clientsData } = useProjectData<any>({ projectKey: 'web_5_autocrm', entityType: 'clients', seedValue: dataSeed });
  const { data: mattersData } = useProjectData<any>({ projectKey: 'web_5_autocrm', entityType: 'matters', seedValue: dataSeed });
  const { data: eventsData } = useProjectData<any>({ projectKey: 'web_5_autocrm', entityType: 'events', seedValue: dataSeed });
  const { data: filesData } = useProjectData<any>({ projectKey: 'web_5_autocrm', entityType: 'files', seedValue: dataSeed });
  const { data: logsData } = useProjectData<any>({ projectKey: 'web_5_autocrm', entityType: 'logs', seedValue: dataSeed });

  const [dataCounts, setDataCounts] = useState({
    matters: 0,
    clients: 0,
    events: 0,
    files: 0,
    logs: 0,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [clients, matters, events, files, logs] = await Promise.all([
          initializeClients(),
          initializeMatters(),
          initializeEvents(),
          initializeFiles(),
          initializeLogs(),
        ]);
        if (!alive) return;
        setDataCounts({
          matters: matters.length,
          clients: clients.length,
          events: events.length,
          files: files.length,
          logs: logs.length,
        });
      } catch (err) {
        console.warn("[Dashboard] Failed to load data counts", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const counters = {
    matters: (mattersData && mattersData.length > 0 ? mattersData.length : dataCounts.matters),
    clients: (clientsData && clientsData.length > 0 ? clientsData.length : dataCounts.clients),
    events: (eventsData && eventsData.length > 0 ? eventsData.length : dataCounts.events),
    files: (filesData && filesData.length > 0 ? filesData.length : dataCounts.files),
    logs: (logsData && logsData.length > 0 ? logsData.length : dataCounts.logs),
  };

  // const handleClick = (eventType: EventType, data: EventData) => () => logEvent(eventType, { ...data });

  return (
    <section>
      <h1 className="text-3xl md:text-[2.25rem] font-extrabold mb-10 tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {(() => {
          const dashboardCards = [
            dyn.v1.addWrapDecoy("matters-card", (
              <SeedLink
                key="matters"
                href="/matters"
                id={dyn.v3.getVariant("matters_link", ID_VARIANTS_MAP, "matters_link")}
                className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200")}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-600 text-lg">{dyn.v3.getVariant("matters_title", undefined, "Matters")}</span>
                  <Briefcase className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
                </div>
                <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">{counters.matters}</span>
                <span className="text-sm text-zinc-400">{dyn.v3.getVariant("total_matters", undefined, "Total Matters")}</span>
              </SeedLink>
            ), "matters-card-wrap"),
            dyn.v1.addWrapDecoy("clients-card", (
              <SeedLink
                key="clients"
                href="/clients"
                id={dyn.v3.getVariant("clients_link", ID_VARIANTS_MAP, "clients_link")}
                className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200")}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-600 text-lg">{dyn.v3.getVariant("clients_title", undefined, "Clients")}</span>
                  <Users className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
                </div>
                <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">{counters.clients}</span>
                <span className="text-sm text-zinc-400">{dyn.v3.getVariant("total_clients", undefined, "Total Clients")}</span>
              </SeedLink>
            ), "clients-card-wrap"),
            dyn.v1.addWrapDecoy("calendar-card", (
              <SeedLink
                key="calendar"
                href="/calendar"
                id={dyn.v3.getVariant("calendar_link", ID_VARIANTS_MAP, "calendar_link")}
                className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200")}
                onClick={() => {
                  logEvent(EVENT_TYPES.VIEW_PENDING_EVENTS, {});
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-600 text-lg">{dyn.v3.getVariant("upcoming_events", undefined, "Upcoming Events")}</span>
                  <Calendar className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
                </div>
                <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">{counters.events}</span>
                <span className="text-sm text-zinc-400">{dyn.v3.getVariant("event_date", undefined, "Event Date")}</span>
              </SeedLink>
            ), "calendar-card-wrap"),
            dyn.v1.addWrapDecoy("documents-card", (
              <SeedLink
                key="documents"
                href="/documents"
                id={dyn.v3.getVariant("documents_link", ID_VARIANTS_MAP, "documents_link")}
                className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200")}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-600 text-lg">{dyn.v3.getVariant("documents_title", undefined, "Documents")}</span>
                  <FileText className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
                </div>
                <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">{counters.files}</span>
                <span className="text-sm text-zinc-400">{dyn.v3.getVariant("document_name", undefined, "Document Name")}</span>
              </SeedLink>
            ), "documents-card-wrap"),
            dyn.v1.addWrapDecoy("billing-card", (
              <SeedLink
                key="billing"
                href="/billing"
                id={dyn.v3.getVariant("billing_link", ID_VARIANTS_MAP, "billing_link")}
                className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200")}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-600 text-lg">{dyn.v3.getVariant("billing_title", undefined, "Billing")}</span>
                  <Clock className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
                </div>
                <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">{counters.logs}</span>
                <span className="text-sm text-zinc-400">{dyn.v3.getVariant("hours_logged", undefined, "Hours Logged")}</span>
              </SeedLink>
            ), "billing-card-wrap"),
            dyn.v1.addWrapDecoy("settings-card", (
              <SeedLink
                key="settings"
                href="/settings"
                id={dyn.v3.getVariant("settings_link", ID_VARIANTS_MAP, "settings_link")}
                className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200")}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-600 text-lg">{dyn.v3.getVariant("settings_title", undefined, "Settings")}</span>
                  <Settings2 className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
                </div>
                <span className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] select-none">--</span>
                <span className="text-sm text-zinc-400">{dyn.v3.getVariant("notes", undefined, "Notes")}</span>
              </SeedLink>
            ), "settings-card-wrap")
          ];
          const order = dyn.v1.changeOrderElements("dashboard-cards", dashboardCards.length);
          return order.map((idx) => dashboardCards[idx]);
        })()}
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
