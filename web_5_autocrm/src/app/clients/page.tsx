"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Filter, ChevronRight, Search } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { clients } from "@/library/dataset";
import { DynamicButton } from "@/components/DynamicButton";
import { DynamicContainer, DynamicItem } from "@/components/DynamicContainer";
import { DynamicElement } from "@/components/DynamicElement";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { withSeed } from "@/utils/seedRouting";



function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function ClientsDirectoryContent() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getText, getId } = useDynamicStructure();

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
    router.push(withSeed(`/clients/${client.id}`, searchParams));
  };

  return (
    <DynamicContainer index={0}>
      <DynamicElement elementType="header" index={0}>
        <h1 className="text-3xl md:text-[2.25rem] font-extrabold mb-10 tracking-tight">
          {getText("clients_title")}
        </h1>
      </DynamicElement>
      
      <DynamicElement elementType="section" index={1} className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-0 mb-10">
        <div className="w-full md:w-96 relative">
          <span className="absolute left-4 top-3.5 text-zinc-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </span>
          <input
            id={getId("search_input")}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-neutral-bg-dark border border-zinc-200 text-md focus:outline-accent-forest focus:border-accent-forest placeholder-zinc-400 font-medium"
            placeholder={getText("search_placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search clients"
          />
        </div>
        <DynamicButton
          eventType="SEARCH_CLIENT"
          index={0}
          className="flex-shrink-0 flex items-center gap-2 px-5 h-12 ml-0 md:ml-4 font-medium rounded-2xl bg-white border border-zinc-200 text-zinc-700 shadow-sm hover:bg-zinc-50 transition"
          id={getId("filter_button")}
          aria-label={getText("filter_by")}
        >
          <Filter className="w-4 h-4" /> {getText("filter_by")}
        </DynamicButton>
      </DynamicElement>
      <DynamicElement elementType="section" index={2} className="rounded-2xl bg-white shadow-card border border-zinc-100">
        <div
          className="hidden md:grid grid-cols-7 px-10 pt-6 pb-2 text-zinc-500 text-xs uppercase tracking-wide select-none"
          style={{ letterSpacing: "0.08em" }}
        >
          <span className="col-span-3">{getText("client_name")}</span>
          <span className="">{getText("matters_title")}</span>
          <span className="">{getText("matter_status")}</span>
          <span className="">{getText("modified_date")}</span>
          <span className=""></span>
        </div>
        <div className="flex flex-col divide-y divide-zinc-100">
          {filtered.length === 0 && (
            <div className="py-12 px-6 text-zinc-400 text-base text-center">
              No clients found.
            </div>
          )}
          {filtered.map((c, index) => (
            <DynamicItem
              key={c.id}
              index={index}
              onClick={() => handleClientClick(c)}
              className="group flex flex-col md:grid md:grid-cols-7 items-center px-5 py-3 md:px-10 md:py-4 gap-3 md:gap-0 hover:bg-accent-forest/5 transition cursor-pointer"
            >
              <div className="col-span-3 flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-accent-forest/10 flex items-center justify-center rounded-full text-accent-forest font-bold text-xl">
                  <User className="w-5 h-5 md:hidden text-accent-forest" />
                  <span className="hidden md:block">{getInitials(c.name)}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    id={`client-name-${c.id}`}
                    className="font-semibold text-zinc-800 truncate leading-tight"
                  >
                    {c.name}
                  </span>
                  <span
                    id={`client-email-${c.id}`}
                    className="text-xs text-zinc-400 truncate"
                  >
                    {c.email}
                  </span>
                </div>
              </div>
              <div
                id={`client-matters-count-${c.id}`}
                className="text-zinc-700 font-medium"
              >
                {c.matters}
              </div>
              <div>
                <span
                  id={`client-status-${c.id}`}
                  className={`inline-flex px-3 py-1 rounded-2xl text-xs font-semibold ${
                    c.status === "Active"
                      ? "bg-accent-forest/10 text-accent-forest"
                      : "bg-zinc-200 text-zinc-500"
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <div
                id={`client-last-updated-${c.id}`}
                className="text-zinc-500"
              >
                {c.last}
              </div>
              <div className="ml-auto">
                <ChevronRight className="w-6 h-6 text-zinc-300 group-hover:text-accent-forest transition" />
              </div>
            </DynamicItem>
          ))}
        </div>
      </DynamicElement>
    </DynamicContainer>
  );
}

export default function ClientsDirectory() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral flex items-center justify-center">Loading...</div>}>
      <ClientsDirectoryContent />
    </Suspense>
  );
}
