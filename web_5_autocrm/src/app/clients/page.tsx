"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Filter, ChevronRight, Search } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { clients } from "@/library/dataset";



function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function ClientsDirectory() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (query.trim()) {
      logEvent(EVENT_TYPES.SEARCH_CLIENT, { query });
    }
  }, [query]);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
  );

  const handleClientClick = (client: (typeof clients)[number]) => {
    logEvent(EVENT_TYPES.VIEW_CLIENT_DETAILS, client);
    router.push(`/clients/${client.id}`);
  };

  return (
    <section>
      <h1 className="text-3xl md:text-[2.25rem] font-extrabold mb-10 tracking-tight">
        Clients Directory
      </h1>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-0 mb-10">
        <div className="w-full md:w-96 relative">
          <span className="absolute left-4 top-3.5 text-zinc-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </span>
          <input
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-neutral-bg-dark border border-zinc-200 text-md focus:outline-accent-forest focus:border-accent-forest placeholder-zinc-400 font-medium"
            placeholder="Search clients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search clients"
          />
        </div>
        <button className="flex-shrink-0 flex items-center gap-2 px-5 h-12 ml-0 md:ml-4 font-medium rounded-2xl bg-white border border-zinc-200 text-zinc-700 shadow-sm hover:bg-zinc-50 transition">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>
      <div className="rounded-2xl bg-white shadow-card border border-zinc-100">
        <div
          className="hidden md:grid grid-cols-7 px-10 pt-6 pb-2 text-zinc-500 text-xs uppercase tracking-wide select-none"
          style={{ letterSpacing: "0.08em" }}
        >
          <span className="col-span-3">Client</span>
          <span className="">Matters</span>
          <span className="">Status</span>
          <span className="">Last Updated</span>
          <span className=""></span>
        </div>
        <div className="flex flex-col divide-y divide-zinc-100">
          {filtered.length === 0 && (
            <div className="py-12 px-6 text-zinc-400 text-base text-center">
              No clients found.
            </div>
          )}
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => handleClientClick(c)}
              className="group flex flex-col md:grid md:grid-cols-7 items-center px-5 py-3 md:px-10 md:py-4 gap-3 md:gap-0 hover:bg-accent-forest/5 transition cursor-pointer"
            >
              <div className="col-span-3 flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-accent-forest/10 flex items-center justify-center rounded-full text-accent-forest font-bold text-xl">
                  <User className="w-5 h-5 md:hidden text-accent-forest" />
                  <span className="hidden md:block">{getInitials(c.name)}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-zinc-800 truncate leading-tight">
                    {c.name}
                  </span>
                  <span className="text-xs text-zinc-400 truncate">
                    {c.email}
                  </span>
                </div>
              </div>
              <div className="text-zinc-700 font-medium">{c.matters}</div>
              <div>
                <span
                  className={`inline-flex px-3 py-1 rounded-2xl text-xs font-semibold ${
                    c.status === "Active"
                      ? "bg-accent-forest/10 text-accent-forest"
                      : "bg-zinc-200 text-zinc-500"
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <div className="text-zinc-500">{c.last}</div>
              <div className="ml-auto">
                <ChevronRight className="w-6 h-6 text-zinc-300 group-hover:text-accent-forest transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
