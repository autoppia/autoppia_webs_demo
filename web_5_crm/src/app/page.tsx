import { Briefcase, Users, Calendar, FileText, Clock, Settings2 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <section>
      <h1 className="text-3xl md:text-[2.25rem] font-extrabold mb-10 tracking-tight">Dashboard Overview</h1>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
      >
        {/* Card 1: Matters */}
        <div className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">Active Matters</span>
            <Briefcase className="w-7 h-7 text-accent-forest group-hover:scale-110 transition"/>
          </div>
          <span className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] select-none">--</span>
          <span className="text-sm text-zinc-400">Matters currently open</span>
        </div>
        {/* Card 2: Clients */}
        <div className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">Clients</span>
            <Users className="w-7 h-7 text-accent-forest group-hover:scale-110 transition"/>
          </div>
          <span className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] select-none">--</span>
          <span className="text-sm text-zinc-400">Total clients</span>
        </div>
        {/* Card 3: Calendar */}
        <div className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">Upcoming Events</span>
            <Calendar className="w-7 h-7 text-accent-forest group-hover:scale-110 transition"/>
          </div>
          <span className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] select-none">--</span>
          <span className="text-sm text-zinc-400">Events this week</span>
        </div>
        {/* Card 4: Documents */}
        <div className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">Documents</span>
            <FileText className="w-7 h-7 text-accent-forest group-hover:scale-110 transition"/>
          </div>
          <span className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] select-none">--</span>
          <span className="text-sm text-zinc-400">Files managed</span>
        </div>
        {/* Card 5: Time Tracking */}
        <div className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">Time Tracked</span>
            <Clock className="w-7 h-7 text-accent-forest group-hover:scale-110 transition"/>
          </div>
          <span className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] select-none">--</span>
          <span className="text-sm text-zinc-400">Billable hours</span>
        </div>
        {/* Card 6: Settings/Config - could be used for notifications etc. */}
        <div className="rounded-2xl bg-white shadow-card p-8 flex flex-col gap-4 min-h-[180px] group transition shadow-md hover:shadow-lg border border-zinc-100 hover:border-zinc-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-600 text-lg">Settings</span>
            <Settings2 className="w-7 h-7 text-accent-forest group-hover:scale-110 transition"/>
          </div>
          <span className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] select-none">--</span>
          <span className="text-sm text-zinc-400">Customize CRM</span>
        </div>
      </div>
    </section>
  );
}
