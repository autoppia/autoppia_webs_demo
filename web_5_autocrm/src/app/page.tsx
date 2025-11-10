"use client";
import { SeedLink } from "@/components/ui/SeedLink";
import { Briefcase, Users, Calendar, FileText, Clock, Settings2 } from "lucide-react";
import { Suspense } from "react";
import { useSeed } from "@/context/SeedContext";
import { getLayoutConfig } from "@/utils/dynamicDataProvider";
import { getLayoutClasses } from "@/utils/seedLayout";

function DashboardContent() {
  const { seed } = useSeed();
  const layoutConfig = getLayoutConfig(seed);
  const layoutClasses = getLayoutClasses(layoutConfig);

  return (
    <section className={`${layoutClasses.spacing}`}>
      <h1 className="text-3xl md:text-[2.25rem] font-extrabold mb-10 tracking-tight">
        Dashboard Overview
      </h1>
      <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 ${layoutClasses.cards}`}>
        {/* Card 1: Matters */}
        <SeedLink
          href="/matters"
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">
              Active Matters
            </span>
            <Briefcase className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">41</span>
          <span className="text-sm text-zinc-400">
            Matters currently open
          </span>
        </SeedLink>

        {/* Card 2: Clients */}
        <SeedLink
          href="/clients"
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">
              Clients
            </span>
            <Users className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">44</span>
          <span className="text-sm text-zinc-400">
            Total clients
          </span>
        </SeedLink>

        {/* Card 3: Calendar */}
        <SeedLink
          href="/calendar"
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">
              Upcoming Events
            </span>
            <Calendar className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">6</span>
          <span className="text-sm text-zinc-400">
            Events this week
          </span>
        </SeedLink>

        {/* Card 4: Documents */}
        <SeedLink
          href="/documents"
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">
              Documents
            </span>
            <FileText className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">50</span>
          <span className="text-sm text-zinc-400">
            Files managed
          </span>
        </SeedLink>

        {/* Card 5: Time Tracking */}
        <SeedLink
          href="/billing"
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">
              Time Tracked
            </span>
            <Clock className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] select-none">36</span>
          <span className="text-sm text-zinc-400">
            Billable hours
          </span>
        </SeedLink>

        {/* Card 6: Settings */}
        <SeedLink
          href="/settings"
          className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">
              Settings
            </span>
            <Settings2 className="w-7 h-7 text-accent-forest group-hover:scale-110 transition" />
          </div>
          <span className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] select-none">--</span>
          <span className="text-sm text-zinc-400">
            Customize CRM
          </span>
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
