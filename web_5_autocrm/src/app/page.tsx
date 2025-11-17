"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SeedLink } from "@/components/ui/SeedLink";
import { Briefcase, Users, Calendar, FileText, Clock, Settings2 } from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import { useSeed } from "@/context/SeedContext";
import { getLayoutConfig } from "@/utils/dynamicDataProvider";
import { getLayoutClasses } from "@/utils/seedLayout";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { withSeed } from "@/utils/seedRouting";
import { useProjectData } from "@/shared/universal-loader";
// import { EVENT_TYPES, logEvent, EventType } from "@/library/events";

// interface EventData {
//   label: string;
//   href: string;
// }

function DashboardContent() {
  const { seed, v2Seed } = useSeed();
  const layoutConfig = getLayoutConfig(seed);
  const layoutClasses = getLayoutClasses(layoutConfig);
  const { getText, getId } = useDynamicStructure();
  const searchParams = useSearchParams();
  
  // Load dynamic counts for all entities
  const { data: clientsData } = useProjectData<any>({ projectKey: 'web_5_autocrm', entityType: 'clients', seedValue: v2Seed ?? undefined });
  const { data: mattersData } = useProjectData<any>({ projectKey: 'web_5_autocrm', entityType: 'matters', seedValue: v2Seed ?? undefined });
  const { data: eventsData } = useProjectData<any>({ projectKey: 'web_5_autocrm', entityType: 'events', seedValue: v2Seed ?? undefined });
  const { data: filesData } = useProjectData<any>({ projectKey: 'web_5_autocrm', entityType: 'files', seedValue: v2Seed ?? undefined });
  const { data: logsData } = useProjectData<any>({ projectKey: 'web_5_autocrm', entityType: 'logs', seedValue: v2Seed ?? undefined });
  
  const counters = {
    matters: mattersData?.length || 41,
    clients: clientsData?.length || 44,
    events: eventsData?.length || 6,
    files: filesData?.length || 50,
    logs: logsData?.length || 36,
  };
  
  // const handleClick = (eventType: EventType, data: EventData) => () => logEvent(eventType, { ...data });

  return (
    <section className={`${layoutClasses.spacing}`}>
      <h1 className="text-3xl md:text-[2.25rem] font-extrabold mb-10 tracking-tight">{getText("dashboard_title")}</h1>
      <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 ${layoutClasses.cards}`}>
        {/* Card 1: Matters */}
        <SeedLink
          href={withSeed("/matters", searchParams)}
          id={getId("matters_link")}
          // onClick={handleClick(EVENT_TYPES.MATTERS_SIDEBAR_CLICKED, { label: "Active Matters", href: "/matters" })}
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">{getText("matters_title")}</span>
            <Briefcase className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">{counters.matters}</span>
          <span className="text-sm text-zinc-400">{getText("total_matters")}</span>
        </SeedLink>

        {/* Card 2: Clients */}
        <SeedLink
          href={withSeed("/clients", searchParams)}
          id={getId("clients_link")}
          // onClick={handleClick(EVENT_TYPES.CLIENTS_SIDEBAR_CLICKED, { label: "Clients", href: "/clients" })}
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">{getText("clients_title")}</span>
            <Users className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">{counters.clients}</span>
          <span className="text-sm text-zinc-400">{getText("total_clients")}</span>
        </SeedLink>

        {/* Card 3: Calendar */}
        <SeedLink
          href={withSeed("/calendar", searchParams)}
          id={getId("calendar_link")}
          // onClick={handleClick(EVENT_TYPES.CALENDAR_SIDEBAR_CLICKED, { label: "Upcoming Events", href: "/calendar" })}
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">{getText("upcoming_events")}</span>
            <Calendar className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">{counters.events}</span>
          <span className="text-sm text-zinc-400">{getText("event_date")}</span>
        </SeedLink>

        {/* Card 4: Documents */}
        <SeedLink
          href={withSeed("/documents", searchParams)}
          id={getId("documents_link")}
          // onClick={handleClick(EVENT_TYPES.DOCUMENTS_SIDEBAR_CLICKED, { label: "Documents", href: "/documents" })}
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">{getText("documents_title")}</span>
            <FileText className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">{counters.files}</span>
          <span className="text-sm text-zinc-400">{getText("document_name")}</span>
        </SeedLink>

        {/* Card 5: Time Tracking */}
        <SeedLink
          href={withSeed("/billing", searchParams)}
          id={getId("billing_link")}
          // onClick={handleClick(EVENT_TYPES.TIME_AND_BILLING_SIDEBAR_CLICKED, { label: "Time & Billing", href: "/billing" })}
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">{getText("billing_title")}</span>
            <Clock className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">{counters.logs}</span>
          <span className="text-sm text-zinc-400">{getText("hours_logged")}</span>
        </SeedLink>

        {/* Card 6: Settings */}
        <SeedLink
          href={withSeed("/settings", searchParams)}
          id={getId("settings_link")}
          // onClick={handleClick(EVENT_TYPES.SETTINGS_SIDEBAR_CLICKED, { label: "Settings", href: "/settings" })}
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">{getText("settings_title")}</span>
            <Settings2 className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] select-none">--</span>
          <span className="text-sm text-zinc-400">{getText("notes")}</span>
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
