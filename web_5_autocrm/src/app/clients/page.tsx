"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { User, Filter, ChevronRight, Search } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { initializeClients } from "@/data/crm-enhanced";
import { useProjectData } from "@/shared/universal-loader";
import { dynamicDataProvider, getClients } from "@/dynamic/v2";
import { DynamicButton } from "@/components/DynamicButton";
import { DynamicContainer, DynamicItem } from "@/components/DynamicContainer";
import { DynamicElement } from "@/components/DynamicElement";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP } from "@/dynamic/v3";
import { useSeed } from "@/context/SeedContext";



function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

const LoadingNotice = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 text-sm text-zinc-500">
    <span className="h-2 w-2 rounded-full bg-accent-forest animate-ping" />
    <span>{message}</span>
  </div>
);

const STORAGE_KEY_PREFIX = "clients";

function ClientsDirectoryContent() {
  const [query, setQuery] = useState("");
  const dyn = useDynamicSystem();
  const { seed } = useSeed();
  const v2Seed = seed;
  const searchInputBase =
    "w-full h-12 pl-12 pr-4 rounded-2xl bg-neutral-bg-dark border border-zinc-200 text-md focus:outline-accent-forest focus:border-accent-forest placeholder-zinc-400 font-medium";
  const filterSelectBase =
    "h-12 rounded-2xl border border-zinc-200 px-3 text-sm font-medium text-zinc-700 bg-white";
  // console.log("[ClientsPage] current v2Seed", v2Seed);

  // Use dynamicDataProvider to get clients - same source as detail page
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      setIsLoading(true);
      try {
        // Wait for data to be ready
        await dynamicDataProvider.whenReady();

        // Reload with current seed to ensure we have the right data
        await dynamicDataProvider.reload(seed ?? undefined);

        // Wait again to ensure reload is complete
        await dynamicDataProvider.whenReady();

        // Get clients from provider
        const clientsData = getClients();

        // Normalize clients for display
        const normalized = clientsData.map((c: any, i: number) => ({
          id: c.id ?? `CL-${1000 + i}`,
          name: c.name ?? c.title ?? `Client ${i + 1}`,
          email: c.email ?? `client${i + 1}@example.com`,
          matters:
            typeof c.matters === "number"
              ? c.matters
              : Math.floor(Math.random() * 5) + 1,
          avatar: c.avatar ?? "",
          status: c.status ?? "Active",
          last: c.last ?? "Today",
        }));

        setClients(normalized);
      } catch (error) {
        console.error("[ClientsPage] Failed to load clients", error);
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, [seed, v2Seed]);
  const [clientList, setClientList] = useState(clients);

  useEffect(() => {
    setClientList(clients);
  }, [clients]);

  const seedRouter = useSeedRouter();
  const { getText, getId } = useDynamicStructure();
  const storageKey = useMemo(
    () => `${STORAGE_KEY_PREFIX}_${v2Seed ?? "default"}`,
    [v2Seed]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (clientList.length === 0) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(clientList));
    } catch (error) {
      console.warn("[ClientsPage] Failed to cache clients", error);
    }
  }, [clientList, storageKey]);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [matterFilter, setMatterFilter] = useState<string>("all");

  const statusOptions = useMemo(() => {
    const set = new Set(clientList.map((c) => c.status || "Active"));
    return Array.from(set);
  }, [clientList]);

  const filtered = clientList.filter((c) => {
    const matchesQuery =
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesMatters =
      matterFilter === "all"
        ? true
        : matterFilter === "1-2"
          ? c.matters <= 2
          : matterFilter === "3-4"
            ? c.matters >= 3 && c.matters <= 4
            : c.matters >= 5;

    return matchesQuery && matchesStatus && matchesMatters;
  });

  useEffect(() => {
    if (query.trim()) {
      logEvent(EVENT_TYPES.SEARCH_CLIENT, { query });
    }
  }, [query]);

  useEffect(() => {
    logEvent(EVENT_TYPES.FILTER_CLIENTS, {
      status: statusFilter,
      matters: matterFilter,
      results: filtered.length,
    });
  }, [statusFilter, matterFilter, filtered.length]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    status: "Active",
    matters: 1,
  });

  const handleAddClient = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newClient.name.trim() || !newClient.email.trim()) return;
    const clientRecord = {
      id: `CL-${Math.floor(Math.random() * 9000) + 1000}`,
      name: newClient.name.trim(),
      email: newClient.email.trim(),
      matters: Number(newClient.matters) || 1,
      avatar: "",
      status: newClient.status,
      last: "Today",
    };
    setClientList((prev) => [clientRecord, ...prev]);
    logEvent(EVENT_TYPES.ADD_CLIENT, clientRecord);
    setShowAddModal(false);
    setNewClient({ name: "", email: "", status: "Active", matters: 1 });
  };

  const handleClientClick = (client: (typeof clients)[number]) => {
    logEvent(EVENT_TYPES.VIEW_CLIENT_DETAILS, client);
    seedRouter.push(`/clients/${client.id}`);
  };

  return (
    <DynamicContainer index={0}>
      <DynamicElement elementType="header" index={0}>
        <h1 className="text-3xl md:text-[2.25rem] font-extrabold mb-10 tracking-tight">
          {getText("clients_title", "Clients")}
        </h1>
        <div className="flex justify-end">
          <button
            id={getId("add_client_button")}
            className={dyn.v3.getVariant("add_client_button_class", undefined, "px-4 py-2 rounded-2xl bg-accent-forest text-white font-semibold shadow-sm")}
            onClick={() => setShowAddModal(true)}
          >
            {dyn.v3.getVariant("add_client_button", undefined, "Add client")}
          </button>
        </div>
      </DynamicElement>

      <DynamicElement elementType="section" index={1} className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-0 mb-10">
        <div className="w-full md:w-96 relative">
          <span className="absolute left-4 top-3.5 text-zinc-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </span>
          <input
            id={getId("search_input")}
            className={dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, searchInputBase)}
            placeholder={getText("search_placeholder", "Search Placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search clients"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 ml-0 md:ml-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <label className="text-sm text-zinc-600">Status</label>
            <select
              id={getId("status_filter")}
              className={dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, filterSelectBase)}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-600">Matters</label>
            <select
              id={getId("matters_filter")}
              className={dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, filterSelectBase)}
              value={matterFilter}
              onChange={(e) => setMatterFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="1-2">1-2</option>
              <option value="3-4">3-4</option>
              <option value="5plus">5+</option>
            </select>
          </div>
        </div>
      </DynamicElement>
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Add client</h2>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form className="flex flex-col gap-3" onSubmit={handleAddClient}>
              <label className="text-sm text-zinc-600">
                Name
                <input
                  className="mt-1 w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm"
                  value={newClient.name}
                  onChange={(e) => setNewClient((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </label>
              <label className="text-sm text-zinc-600">
                Email
                <input
                  className="mt-1 w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </label>
              <div className="flex gap-3">
                <label className="text-sm text-zinc-600 flex-1">
                  Matters
                  <input
                    className="mt-1 w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm"
                    type="number"
                    min={1}
                    value={newClient.matters}
                    onChange={(e) => setNewClient((prev) => ({ ...prev, matters: Number(e.target.value) }))}
                  />
                </label>
                <label className="text-sm text-zinc-600 flex-1">
                  Status
                  <select
                    className="mt-1 w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm"
                    value={newClient.status}
                    onChange={(e) => setNewClient((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Closed">Closed</option>
                  </select>
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-forest text-white text-sm font-semibold"
                >
                  Add client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isLoading && (
        <LoadingNotice message={getText("loading_message", "Loading...") ?? "Loading clients..."} />
      )}
      <DynamicElement elementType="section" index={2} className="rounded-2xl bg-white shadow-card border border-zinc-100">
        <div
          className="hidden md:grid grid-cols-7 px-10 pt-6 pb-2 text-zinc-500 text-xs uppercase tracking-wide select-none"
          style={{ letterSpacing: "0.08em" }}
        >
          <span className="col-span-3">{getText("client_name", "Client Name")}</span>
          <span className="">{getText("matters_title", "Matters")}</span>
          <span className="">{getText("matter_status", "Matter Status")}</span>
          <span className="">{getText("modified_date", "Modified Date")}</span>
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
                {c.avatar ? (
                  <img
                    src={c.avatar}
                    alt={`${c.name} avatar`}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-200"
                  />
                ) : (
                  <div className="w-12 h-12 bg-accent-forest/10 flex items-center justify-center rounded-full text-accent-forest font-bold text-xl">
                    <User className="w-5 h-5 md:hidden text-accent-forest" />
                    <span className="hidden md:block">{getInitials(c.name)}</span>
                  </div>
                )}
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
