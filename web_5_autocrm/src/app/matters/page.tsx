"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import {
  FileText,
  Plus,
  CheckCircle,
  XCircle,
  Archive,
  Trash2,
  X,
  Search,
  Filter,
  ArrowUpDown,
  Pencil,
  User,
} from "lucide-react";
import Cookies from "js-cookie";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { initializeMatters, initializeClients } from "@/data/crm-enhanced";
import { DynamicButton } from "@/components/DynamicButton";
import { DynamicContainer, DynamicItem } from "@/components/DynamicContainer";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useProjectData } from "@/shared/universal-loader";
import { useSeed } from "@/context/SeedContext";

const STORAGE_KEY = "matters";

type Matter = {
  id: string;
  name: string;
  client: string;
  status: string;
  updated: string;
  createdAt: number;
};

const normalizeMatter = (matter: any, index: number): Matter => {
  const rawCreated = matter?.createdAt ?? matter?.created_at;
  const createdAt =
    typeof rawCreated === "number"
      ? rawCreated
      : rawCreated
        ? Date.parse(String(rawCreated)) || Date.now() - index * 1000
        : Date.now() - index * 1000;

  return {
    id: matter?.id ?? matter?.matterId ?? `MAT-${1000 + index}`,
    name: matter?.name ?? matter?.title ?? matter?.matter ?? `Matter ${index + 1}`,
    client: matter?.client ?? matter?.clientName ?? "—",
    status: matter?.status ?? "Active",
    updated: matter?.updated ?? matter?.updated_at ?? matter?.lastUpdated ?? "Today",
    createdAt,
  };
};

const LoadingNotice = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 text-sm text-zinc-500">
    <span className="h-2 w-2 rounded-full bg-accent-forest animate-ping" />
    <span>{message}</span>
  </div>
);

function statusPill(status: string) {
  let color = "bg-accent-forest/10 text-accent-forest";
  let icon = <CheckCircle className="w-4 h-4 mr-1" />;
  if (status === "On Hold") {
    color = "bg-indigo-100 text-accent-indigo";
    icon = <FileText className="w-4 h-4 mr-1" />;
  }
  if (status === "Archived") {
    color = "bg-zinc-200 text-zinc-500";
    icon = <XCircle className="w-4 h-4 mr-1" />;
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-2xl ${color}`}>
      {icon}
      {status}
    </span>
  );
}

function MattersListPageContent() {
  const { getText, getId } = useDynamicStructure();
  const { resolvedSeeds } = useSeed();
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { data, isLoading, error } = useProjectData<any>({
    projectKey: "web_5_autocrm",
    entityType: "matters",
    seedValue: v2Seed,
  });
  
  // Load clients to get avatars
  const { data: clientsData } = useProjectData<any>({
    projectKey: "web_5_autocrm",
    entityType: "clients",
    seedValue: v2Seed,
  });
  const [fallbackClients, setFallbackClients] = useState<any[]>([]);
  useEffect(() => {
    initializeClients().then((rows) => {
      setFallbackClients(rows);
    });
  }, []);
  
  const clients = useMemo(() => {
    const base = clientsData && clientsData.length > 0 ? clientsData : fallbackClients;
    return base.map((c: any) => ({
      id: c.id,
      name: c.name ?? c.title ?? "",
      avatar: c.avatar ?? "",
    }));
  }, [clientsData, fallbackClients]);
  
  const getClientAvatar = (clientName: string): string => {
    const client = clients.find((c) => c.name === clientName);
    return client?.avatar || "";
  };
  
  console.log("[MattersPage] API response", {
    seed: v2Seed,
    count: data?.length ?? 0,
    isLoading,
    error,
    sample: (data || []).slice(0, 3),
  });
  const [fallbackMatters, setFallbackMatters] = useState<Matter[]>([]);
  useEffect(() => {
    initializeMatters().then((rows) => {
      setFallbackMatters(rows.map((m: any, idx: number) => normalizeMatter(m, idx)));
    });
  }, []);

  const normalizedApi = useMemo(() => (data || []).map((m, idx) => normalizeMatter(m, idx)), [data]);
  const resolvedMatters = normalizedApi.length > 0 ? normalizedApi : fallbackMatters;
  const storageKey = useMemo(
    () => `${STORAGE_KEY}_${v2Seed ?? "default"}`,
    [v2Seed]
  );
  const [matters, setMatters] = useState<Matter[]>(resolvedMatters);
  const [seedSnapshot, setSeedSnapshot] = useState<number | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [openNew, setOpenNew] = useState(false);
  const [editingMatter, setEditingMatter] = useState<Matter | null>(null);
  const [editDraft, setEditDraft] = useState({
    name: "",
    client: "",
    status: "Active",
  });
  const [newMatter, setNewMatter] = useState({
    name: "",
    client: "",
    status: "Active",
  });

  useEffect(() => {
    if (isLoading) return;
    const currentSeed = v2Seed;
    if (seedSnapshot === currentSeed) return;
    let next = resolvedMatters;
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          next = JSON.parse(saved);
        } catch (err) {
          console.warn("[MattersPage] Unable to parse cached matters", err);
        }
      } else {
        window.localStorage.setItem(storageKey, JSON.stringify(resolvedMatters));
      }
    }
    const nextWithTimestamps = next.map((m: any, idx: number) => ({
      ...m,
      createdAt:
        typeof m.createdAt === "number"
          ? m.createdAt
          : Date.now() - idx * 1000,
    }));
    setMatters(nextWithTimestamps);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(nextWithTimestamps));
    }
    setSeedSnapshot(currentSeed);
  }, [resolvedMatters, storageKey, v2Seed, isLoading, seedSnapshot]);

  const updateMatters = (newList: Matter[]) => {
    const withTimestamps = newList.map((m, idx) => ({
      ...m,
      createdAt:
        typeof m.createdAt === "number"
          ? m.createdAt
          : Date.now() - idx * 1000,
    }));
    setMatters(withTimestamps);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(withTimestamps));
    }
    const baseIds = new Set(resolvedMatters.map((m) => m.id));
    const custom = withTimestamps.filter((m) => !baseIds.has(m.id));
    Cookies.set(`custom_matters_${v2Seed ?? "default"}`, JSON.stringify(custom), {
      expires: 7,
      path: "/",
    });
  };

  const toggleSelect = (id: string) => {
    setSelected(sel =>
      sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]
    );
  };

  const isSelected = (id: string) => selected.includes(id);

  const addMatter = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `MAT-${Math.floor(Math.random() * 9000 + 1000)}`;
    const newItem = {
      id,
      ...newMatter,
      updated: "Now",
      createdAt: Date.now(),
    } as Matter;
    const newList = [newItem, ...matters];
    updateMatters(newList);
    logEvent(EVENT_TYPES.ADD_NEW_MATTER, newItem);
    setOpenNew(false);
    setNewMatter({ name: "", client: "", status: "Active" });
  };

  const deleteSelected = () => {
    const deleted = matters.filter(m => selected.includes(m.id));
    updateMatters(matters.filter(m => !selected.includes(m.id)));
    logEvent(EVENT_TYPES.DELETE_MATTER, { deleted });
    setSelected([]);
  };

  const archiveSelected = () => {
    const newList = matters.map(m =>
      selected.includes(m.id) ? { ...m, status: "Archived" } : m
    );
    const archived = matters.filter(m => selected.includes(m.id));
    updateMatters(newList);
    logEvent(EVENT_TYPES.ARCHIVE_MATTER, { archived });
    setSelected([]);
  };

  const filteredMatters = useMemo(() => {
    let list = [...matters];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.client.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") {
      list = list.filter((m) => m.status === statusFilter);
    }
    list.sort((a, b) =>
      sortDirection === "desc"
        ? b.createdAt - a.createdAt
        : a.createdAt - b.createdAt
    );
    return list;
  }, [matters, searchQuery, statusFilter, sortDirection]);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    logEvent(EVENT_TYPES.SEARCH_MATTER, {
      query: searchQuery.trim(),
      results: filteredMatters.length,
    });
  }, [searchQuery, filteredMatters.length]);

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    logEvent(EVENT_TYPES.FILTER_MATTER_STATUS, {
      status: value,
    });
  };

  const handleSortChange = (value: "asc" | "desc") => {
    setSortDirection(value);
    logEvent(EVENT_TYPES.SORT_MATTER_BY_CREATED_AT, {
      direction: value,
    });
  };

  const startEditMatter = (matter: Matter) => {
    setEditingMatter(matter);
    setEditDraft({
      name: matter.name,
      client: matter.client,
      status: matter.status,
    });
  };

  const saveMatterUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatter) return;
    const updatedMatter: Matter = {
      ...editingMatter,
      name: editDraft.name,
      client: editDraft.client,
      status: editDraft.status,
      updated: "Updated just now",
    };
    const newList = matters.map((m) =>
      m.id === editingMatter.id ? updatedMatter : m
    );
    updateMatters(newList);
    logEvent(EVENT_TYPES.UPDATE_MATTER, {
      before: editingMatter,
      after: updatedMatter,
    });
    setEditingMatter(null);
  };

  return (
    <section className="p-6">
      <DynamicContainer className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{getText("matters_title", "Matters")}</h1>
          <DynamicButton
            eventType="ADD_NEW_MATTER"
            onClick={() => setOpenNew(true)}
            className="bg-accent-forest text-white hover:bg-accent-forest/90"
            id={getId("add_matter_button")}
            aria-label={getText("add_new_matter", "Add New Matter")}
          >
            <Plus className="w-4 h-4 mr-2" /> {getText("add_new_matter", "Add New Matter")}
          </DynamicButton>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between shadow-sm">
          <div className="flex flex-1 items-center gap-2">
            <Search className="w-4 h-4 text-zinc-400" />
            <input
              id={getId("matter_search_input")}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getText("search_matters", "Search matters...")}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              id={getId("matter_status_filter")}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="All">{getText("all_status", "All")}</option>
              <option value="Active">{getText("active_status", "Active")}</option>
              <option value="On Hold">{getText("pending_status", "On Hold")}</option>
              <option value="Archived">{getText("inactive_status", "Archived")}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-zinc-400" />
            <select
              id={getId("matter_sort_select")}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              value={sortDirection}
              onChange={(e) =>
                handleSortChange(e.target.value === "asc" ? "asc" : "desc")
              }
            >
              <option value="desc">{getText("latest_first", "Latest first")}</option>
              <option value="asc">{getText("oldest_first", "Oldest first")}</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <LoadingNotice message={getText("loading_message", "Loading...") ?? "Loading matters..."} />
        )}

        {/* Matter List */}
        <div className="grid gap-4">
          {error && (
            <div className="text-red-600">Failed to load matters: {error}</div>
          )}
          {isLoading && matters.length === 0 && (
            <div className="text-zinc-500">
              {getText("loading_message", "Loading...") ?? "Loading matters..."}
            </div>
          )}
          {filteredMatters.length === 0 && !isLoading && (
            <div className="text-zinc-500">{getText("no_matters_found", "No matters found for the current filters.")}</div>
          )}
          {filteredMatters.map((matter) => (
            <DynamicItem
              key={matter.id}
              className={`relative ${
                isSelected(matter.id) ? "ring-2 ring-accent-forest/30" : ""
              }`}
            >
              <div className="absolute top-1/2 left-4 -translate-y-1/2">
                <input
                  type="checkbox"
                  checked={isSelected(matter.id)}
                  onChange={() => toggleSelect(matter.id)}
                  className="accent-accent-forest w-5 h-5 rounded-xl border-zinc-200"
                />
              </div>

              <SeedLink
                href={`/matters/${matter.id}`}
                onClick={() => logEvent(EVENT_TYPES.VIEW_MATTER_DETAILS, matter)}
                className="block p-6 pl-16"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    {getClientAvatar(matter.client) ? (
                      <img
                        src={getClientAvatar(matter.client)}
                        alt={`${matter.client} avatar`}
                        className="w-12 h-12 rounded-full object-cover border border-zinc-200 flex-shrink-0"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 rounded-full bg-accent-forest/10 flex items-center justify-center flex-shrink-0 ${getClientAvatar(matter.client) ? 'hidden' : ''}`}>
                      <User className="w-6 h-6 text-accent-forest" />
                    </div>
                    <FileText className="w-6 h-6 text-zinc-400 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">{matter.name}</h3>
                      <p className="text-zinc-600 mt-1">{matter.client}</p>
                    </div>
                  </div>
                    <div className="flex items-center gap-4">
                      {statusPill(matter.status)}
                      <span className="text-sm text-zinc-500">{matter.updated}</span>
                      <button
                        className="text-zinc-400 hover:text-accent-forest text-sm flex items-center gap-1"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startEditMatter(matter);
                        }}
                        aria-label={getText("edit_matter", "Edit matter")}
                      >
                        <Pencil className="w-4 h-4" />
                        {getText("edit", "Edit")}
                      </button>
                    </div>
                  </div>
                </SeedLink>
              </DynamicItem>
            ))}
        </div>

        {/* Batch Actions */}
        {selected.length > 0 && (
          <div className="flex flex-wrap justify-end gap-3 mt-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <DynamicButton
              eventType="ARCHIVE_MATTER"
              onClick={archiveSelected}
              variant="outline"
              id={getId("archive_button")}
              aria-label={getText("archive_selected", "Archive Selected")}
            >
              <Archive className="w-4 h-4 mr-2" /> {getText("archive_selected", "Archive Selected")}
            </DynamicButton>
            <DynamicButton
              eventType="DELETE_MATTER"
              onClick={deleteSelected}
              variant="outline"
              className="text-red-600 hover:bg-red-50"
              id={getId("delete_button")}
              aria-label={getText("delete_selected", "Delete Selected")}
            >
              <Trash2 className="w-4 h-4 mr-2" /> {getText("delete_selected", "Delete Selected")}
            </DynamicButton>
          </div>
        )}

        {/* New Matter Modal */}
        {openNew && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <DynamicContainer className="bg-white rounded-2xl p-8 max-w-md w-full">
              <form onSubmit={addMatter} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{getText("add_new_matter", "Add New Matter")}</h2>
                  <button
                    type="button"
                    onClick={() => setOpenNew(false)}
                    className="text-zinc-400 hover:text-zinc-600"
                    id={getId("close_modal_button")}
                    aria-label={getText("cancel_button", "Cancel")}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {getText("matter_name", "Matter Name")}
                    </label>
                    <input
                      id={getId("matter_name_input")}
                      className="w-full rounded-lg border p-2"
                      value={newMatter.name}
                      onChange={(e) =>
                        setNewMatter((m) => ({ ...m, name: e.target.value }))
                      }
                      placeholder={getText("matter_name", "Matter Name")}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {getText("client_name", "Client Name")}
                    </label>
                    <input
                      id={getId("client_name_input")}
                      className="w-full rounded-lg border p-2"
                      value={newMatter.client}
                      onChange={(e) =>
                        setNewMatter((m) => ({ ...m, client: e.target.value }))
                      }
                      placeholder={getText("client_name", "Client Name")}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {getText("matter_status", "Matter Status")}
                    </label>
                    <select
                      id={getId("matter_status_select")}
                      className="w-full rounded-lg border p-2"
                      value={newMatter.status}
                      onChange={(e) =>
                        setNewMatter((m) => ({ ...m, status: e.target.value }))
                      }
                    >
                      <option value="Active">{getText("active_status", "Active")}</option>
                      <option value="On Hold">{getText("pending_status", "Pending")}</option>
                      <option value="Archived">{getText("inactive_status", "Inactive")}</option>
                    </select>
                  </div>
                </div>

                <DynamicButton
                  eventType="ADD_NEW_MATTER"
                  type="submit"
                  className="w-full bg-accent-forest text-white hover:bg-accent-forest/90"
                  id={getId("submit_matter_button")}
                  aria-label={getText("add_new_matter", "Add New Matter")}
                >
                  {getText("add_new_matter", "Add New Matter")}
                </DynamicButton>
              </form>
            </DynamicContainer>
          </div>
        )}

        {/* Edit Matter Modal */}
        {editingMatter && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <DynamicContainer className="bg-white rounded-2xl p-8 max-w-md w-full">
              <form onSubmit={saveMatterUpdate} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{getText("edit_matter", "Edit Matter")}</h2>
                  <button
                    type="button"
                    onClick={() => setEditingMatter(null)}
                    className="text-zinc-400 hover:text-zinc-600"
                    id={getId("close_edit_modal_button")}
                    aria-label={getText("cancel_button", "Cancel")}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {getText("matter_name", "Matter Name")}
                    </label>
                    <input
                      id={getId("edit_matter_name_input")}
                      className="w-full rounded-lg border p-2"
                      value={editDraft.name}
                      onChange={(e) =>
                        setEditDraft((m) => ({ ...m, name: e.target.value }))
                      }
                      placeholder={getText("matter_name", "Matter Name")}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {getText("client_name", "Client Name")}
                    </label>
                    <input
                      id={getId("edit_client_name_input")}
                      className="w-full rounded-lg border p-2"
                      value={editDraft.client}
                      onChange={(e) =>
                        setEditDraft((m) => ({ ...m, client: e.target.value }))
                      }
                      placeholder={getText("client_name", "Client Name")}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {getText("matter_status", "Matter Status")}
                    </label>
                    <select
                      id={getId("edit_matter_status_select")}
                      className="w-full rounded-lg border p-2"
                      value={editDraft.status}
                      onChange={(e) =>
                        setEditDraft((m) => ({ ...m, status: e.target.value }))
                      }
                    >
                      <option value="Active">{getText("active_status", "Active")}</option>
                      <option value="On Hold">{getText("pending_status", "On Hold")}</option>
                      <option value="Archived">{getText("inactive_status", "Archived")}</option>
                    </select>
                  </div>
                </div>

                <DynamicButton
                  eventType="UPDATE_MATTER"
                  type="submit"
                  className="w-full bg-accent-forest text-white hover:bg-accent-forest/90"
                  id={getId("save_matter_button")}
                  aria-label={getText("save_changes", "Save changes")}
                >
                  {getText("save_changes", "Save changes")}
                </DynamicButton>
              </form>
            </DynamicContainer>
          </div>
        )}
      </DynamicContainer>
    </section>
  );
}

export default function MattersListPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral flex items-center justify-center">Loading...</div>}>
      <MattersListPageContent />
    </Suspense>
  );
}
