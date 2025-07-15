import { User, Mail, CheckCircle, FileText, Briefcase, Calendar, ChevronRight } from 'lucide-react';

export default function ClientProfilePage() {
  // Demo data
  const client = {
    name: 'Jessica Brown',
    email: 'jbrown@samplemail.com',
    status: 'Active',
    id: 'CL-098',
    joined: 'Jan 2023',
    phone: "555-555-2187"
  };
  const matters = [
    { id: 'MAT-113', name: 'Estate Plan Review', status: 'Active' },
    { id: 'MAT-099', name: 'Business Agreement', status: 'Closed' },
  ];
  const activity = [
    { label: 'Matter updated', date: 'Today, 10:12am', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Emailed document', date: 'Yesterday', icon: <Mail className="w-4 h-4" /> },
    { label: 'Signed contract', date: 'Last week', icon: <CheckCircle className="w-4 h-4 text-accent-forest" /> },
  ];

  return (
    <section className="max-w-4xl mx-auto flex flex-col gap-10">
      {/* Profile Card */}
      <div className="rounded-2xl bg-white shadow-card p-8 flex flex-col md:flex-row items-center md:items-start gap-7 border border-zinc-100">
        <div className="w-20 h-20 rounded-full bg-accent-forest/10 flex items-center justify-center text-accent-forest text-4xl font-bold">
          <User className="w-9 h-9 md:hidden" />
          <span className="hidden md:block">JB</span>
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <span className="font-bold text-xl text-[#1A1A1A] truncate">{client.name}</span>
          <span className="text-zinc-500 flex items-center gap-2 text-sm"><Mail className="w-4 h-4" />{client.email}</span>
          <div className="flex gap-3 mt-2 items-center">
            <span className="px-3 py-1 rounded-2xl text-xs font-semibold bg-accent-forest/10 text-accent-forest">{client.status}</span>
            <span className="text-xs text-zinc-400 font-mono">{client.id}</span>
            <span className="text-xs text-zinc-400">Joined {client.joined}</span>
          </div>
        </div>
      </div>
      {/* Timeline + Related matters row (mobile: stacks) */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Timeline */}
        <section className="flex-1 min-w-0">
          <h2 className="font-semibold text-lg mb-5">Activity Timeline</h2>
          <ul className="flex flex-col gap-6">
            {activity.map((item, i) => (
              <li key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 text-accent-forest text-lg">
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-zinc-700">{item.label}</span>
                  <span className="text-xs text-zinc-400">{item.date}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
        {/* Related matters */}
        <section className="w-full lg:w-80 flex-shrink-0">
          <h2 className="font-semibold text-lg mb-5">Related Matters</h2>
          <div className="flex flex-col gap-4">
            {matters.map(m => (
              <div key={m.id} className="rounded-2xl bg-white border border-zinc-100 shadow p-4 flex items-center gap-4 hover:shadow-lg transition">
                <FileText className="w-7 h-7 text-accent-forest/60"/>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-zinc-800 truncate">{m.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex px-3 py-0.5 rounded-2xl text-xs font-semibold ${m.status==='Active'?'bg-accent-forest/10 text-accent-forest':'bg-zinc-200 text-zinc-500'}`}>{m.status}</span>
                    <span className="text-xs text-zinc-400 font-mono">{m.id}</span>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-zinc-300"/>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
