"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  Archive,
  Trash2,
  X,
} from "lucide-react";
const STORAGE_KEY = "matters";
import Cookies from "js-cookie";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { DEMO_MATTERS } from "@/library/dataset";



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
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-2xl ${color}`}
    >
      {icon}
      {status}
    </span>
  );
}

export default function MattersListPage() {
  const [matters, setMatters] = useState<typeof DEMO_MATTERS>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [openNew, setOpenNew] = useState(false);
  const [newMatter, setNewMatter] = useState({
    name: "",
    client: "",
    status: "Active",
  });
  type Matter = {
    id: string;
    name: string;
    status: string;
    client: string;
    updated: string;
  };
  const updateMatters = (newMatters: Matter[]): void => {
    setMatters(newMatters);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMatters));

    const custom = newMatters.filter(
      (m) => !DEMO_MATTERS.some((d) => d.id === m.id)
    );

    Cookies.set("custom_matters", JSON.stringify(custom), {
      expires: 7, // days
      path: "/", // optional but recommended
    });
  };

  const allSelected = matters.length > 0 && selected.length === matters.length;
  const someSelected = selected.length > 0 && selected.length < matters.length;

  const toggleSelect = (id: string) => {
    setSelected((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    );
  };
  const isSelected = (id: string) => selected.includes(id);

  const toggleSelectAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(matters.map((m) => m.id));
  };

  const closeModal = () => {
    setOpenNew(false);
    setNewMatter({ name: "", client: "", status: "Active" });
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setMatters(JSON.parse(saved));
    else {
      setMatters(DEMO_MATTERS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_MATTERS));
    }
  }, []);

  const addMatter = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `MAT-${Math.floor(Math.random() * 9000 + 1000)}`;
    const newItem = { id, ...newMatter, updated: "Now" };
    const newList = [newItem, ...matters];
    updateMatters(newList);
    logEvent(EVENT_TYPES.ADD_NEW_MATTER, newItem);
    closeModal();
  };

  const deleteSelected = () => {
    const deleted = matters.filter((m) => selected.includes(m.id));
    updateMatters(matters.filter((m) => !selected.includes(m.id)));
    logEvent(EVENT_TYPES.DELETE_MATTER, {deleted});
    setSelected([]);
  };

  const archiveSelected = () => {
    const newList = matters.map((m) =>
      selected.includes(m.id) ? { ...m, status: "Archived" } : m
    );
    const archived = matters.filter((m) => selected.includes(m.id));
    updateMatters(newList);
    logEvent(EVENT_TYPES.ARCHIVE_MATTER, {archived});
    setSelected([]);
  };

  return (
    <section>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 md:gap-0">
        <h1 className="text-3xl md:text-[2.25rem] font-extrabold tracking-tight">
          Matters
        </h1>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent-forest text-white font-medium text-sm shadow-sm hover:bg-accent-forest/90 transition"
            onClick={() => setOpenNew(true)}
          >
            <Plus className="w-4 h-4" /> New Matter
          </button>
        </div>
      </div>
      {/* Table Head */}
      <div
        className="hidden md:grid grid-cols-7 items-center px-6 text-sm text-zinc-500 uppercase tracking-wide mb-3 select-none"
        style={{ letterSpacing: "0.06em" }}
      >
        <span>
          <input
            type="checkbox"
            className="accent-accent-forest w-5 h-5 rounded-xl border-zinc-200"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onChange={toggleSelectAll}
            aria-label="Select all matters"
          />
        </span>
        <span className="col-span-2">Matter</span>
        <span className="col-span-2">Client</span>
        <span>Status</span>
        <span>Updated</span>
        <span></span>
      </div>
      <div className="flex flex-col gap-3">
        {matters.map((m) => (
          <div
            key={m.id}
            className={`group bg-white rounded-2xl shadow-card border border-zinc-100 hover:border-accent-forest/40 hover:shadow-lg transition p-6 flex flex-col md:grid md:grid-cols-7 items-center gap-2 md:gap-0 no-underline ${
              isSelected(m.id) ? "ring-2 ring-accent-forest/30" : ""
            }`}
          >
            {/* Select checkbox */}
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected(m.id)}
                onChange={() => toggleSelect(m.id)}
                aria-label="Select matter"
                className="accent-accent-forest w-5 h-5 rounded-xl border-zinc-200"
              />
            </div>
            <Link
              href={`/matters/${m.id}`}
              onClick={() => logEvent(EVENT_TYPES.VIEW_MATTER_DETAILS, m)}
              className="col-span-6 grid grid-cols-6 w-full items-center"
            >
              <div className="col-span-2 flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-zinc-400" />
                <span className="font-semibold text-md text-zinc-800">
                  {m.name}
                </span>
              </div>
              <div className="col-span-2 text-zinc-700">{m.client}</div>
              <div className="flex items-center">{statusPill(m.status)}</div>
              <div className="text-zinc-500">{m.updated}</div>
            </Link>
          </div>
        ))}
      </div>
      {/* Batch actions bar */}
      {selected.length > 0 && (
        <div className="mt-12 flex gap-2 items-center text-sm text-zinc-500 justify-end animate-in fade-in">
          <span>Batch actions:</span>
          <button
            className="rounded-2xl px-4 py-2 bg-zinc-200 text-zinc-700 font-semibold hover:bg-zinc-300 inline-flex gap-2 items-center"
            onClick={archiveSelected}
          >
            <Archive className="w-4 h-4" /> Archive
          </button>
          <button
            className="rounded-2xl px-4 py-2 bg-red-500 text-white font-semibold hover:bg-red-600 inline-flex gap-2 items-center"
            onClick={deleteSelected}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}

      {/* Modal for New Matter */}
      {openNew && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <form
            className="rounded-2xl bg-white w-full max-w-md p-8 shadow-2xl flex flex-col gap-6 border border-zinc-100 relative animate-in fade-in zoom-in-50"
            onSubmit={addMatter}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-3 top-3 text-zinc-400 rounded-full hover:bg-zinc-100 p-2"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold mb-2">New Matter</h2>
            <div className="flex flex-col gap-2">
              <label
                className="font-medium text-zinc-700"
                htmlFor="matter-name"
              >
                Matter Name
              </label>
              <input
                id="matter-name"
                className="rounded-xl border border-zinc-200 px-4 py-3 text-md font-medium"
                required
                value={newMatter.name}
                onChange={(e) =>
                  setNewMatter((n) => ({ ...n, name: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="font-medium text-zinc-700"
                htmlFor="matter-client"
              >
                Client
              </label>
              <input
                id="matter-client"
                className="rounded-xl border border-zinc-200 px-4 py-3 text-md font-medium"
                required
                value={newMatter.client}
                onChange={(e) =>
                  setNewMatter((n) => ({ ...n, client: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-zinc-700">Status</label>
              <select
                className="rounded-xl border border-zinc-200 px-4 py-3 text-md font-medium"
                value={newMatter.status}
                onChange={(e) =>
                  setNewMatter((n) => ({ ...n, status: e.target.value }))
                }
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-2xl px-5 py-3 bg-accent-forest text-white font-semibold hover:bg-accent-forest/90 transition text-lg"
            >
              Create Matter
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
