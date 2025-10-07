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
import Cookies from "js-cookie";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { DEMO_MATTERS } from "@/library/dataset";
import { DynamicButton } from "@/components/DynamicButton";
import { DynamicContainer, DynamicItem } from "@/components/DynamicContainer";

const STORAGE_KEY = "matters";

type Matter = {
  id: string;
  name: string;
  client: string;
  status: string;
  updated: string;
};

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

export default function MattersListPage() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [openNew, setOpenNew] = useState(false);
  const [newMatter, setNewMatter] = useState({
    name: "",
    client: "",
    status: "Active",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMatters(JSON.parse(saved));
    } else {
      setMatters(DEMO_MATTERS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_MATTERS));
    }
  }, []);

  const updateMatters = (newList: Matter[]) => {
    setMatters(newList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    const custom = newList.filter(m => !DEMO_MATTERS.some(d => d.id === m.id));
    Cookies.set("custom_matters", JSON.stringify(custom), {
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
    const newItem = { id, ...newMatter, updated: "Now" } as Matter;
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

  return (
<<<<<<< HEAD
    <section className="p-6">
      <DynamicContainer className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Matters</h1>
          <DynamicButton
            eventType="ADD_NEW_MATTER"
            index={0}
=======
    <section id="matters-page">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 md:gap-0">
        <h1
          id="matters-title"
          className="text-3xl md:text-[2.25rem] font-extrabold tracking-tight"
        >
          Matters
        </h1>
        <div className="flex gap-2">
          <button
            id="new-matter-button"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent-forest text-white font-medium text-sm shadow-sm hover:bg-accent-forest/90 transition"
>>>>>>> main
            onClick={() => setOpenNew(true)}
            className="bg-accent-forest text-white hover:bg-accent-forest/90"
          >
            <Plus className="w-4 h-4 mr-2" /> New Matter
          </DynamicButton>
        </div>
<<<<<<< HEAD

        {/* Matter List */}
        <div className="grid gap-4">
          {matters.map((matter, index) => (
            <DynamicItem
              key={matter.id}
              index={index}
              className={`relative ${
                isSelected(matter.id) ? "ring-2 ring-accent-forest/30" : ""
              }`}
            >
              <div className="absolute top-4 left-4">
                <input
                  type="checkbox"
                  checked={isSelected(matter.id)}
                  onChange={() => toggleSelect(matter.id)}
                  className="accent-accent-forest w-5 h-5 rounded-xl border-zinc-200"
                />
              </div>

              <Link
                href={`/matters/${matter.id}`}
                onClick={() => logEvent(EVENT_TYPES.VIEW_MATTER_DETAILS, matter)}
                className="block p-6 pl-16"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <Briefcase className="w-6 h-6 text-zinc-400" />
                    <div>
                      <h3 className="font-semibold text-lg">{matter.name}</h3>
                      <p className="text-zinc-600 mt-1">{matter.client}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {statusPill(matter.status)}
                    <span className="text-sm text-zinc-500">{matter.updated}</span>
                  </div>
                </div>
              </Link>
            </DynamicItem>
          ))}
=======
      </div>
      {/* Table Head */}
      <div
        id="matters-table-header"
        className="hidden md:grid grid-cols-7 items-center px-6 text-sm text-zinc-500 uppercase tracking-wide mb-3 select-none"
        style={{ letterSpacing: "0.06em" }}
      >
        <span>
          <input
            id="select-all-checkbox"
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

      <div id="matters-list" className="flex flex-col gap-3">
        {matters.map((m) => (
          <div
            key={m.id}
            id={`matter-row-${m.id}`}
            data-testid={`matter-${m.id}`}
            className={`group bg-white rounded-2xl shadow-card border border-zinc-100 hover:border-accent-forest/40 hover:shadow-lg transition p-6 flex flex-col md:grid md:grid-cols-7 items-center gap-2 md:gap-0 no-underline ${
              isSelected(m.id) ? "ring-2 ring-accent-forest/30" : ""
            }`}
          >
            {/* Select checkbox */}
            <div onClick={(e) => e.stopPropagation()}>
              <input
                id={`checkbox-${m.id}`}
                data-testid={`checkbox-${m.id}`}
                type="checkbox"
                checked={isSelected(m.id)}
                onChange={() => toggleSelect(m.id)}
                aria-label={`Select matter ${m.name}`}
                className="accent-accent-forest w-5 h-5 rounded-xl border-zinc-200"
              />
            </div>
            <Link
              href={`/matters/${m.id}`}
              id={`matter-link-${m.id}`}
              data-testid={`matter-link-${m.id}`}
              onClick={() => logEvent(EVENT_TYPES.VIEW_MATTER_DETAILS, m)}
              className="col-span-6 grid grid-cols-6 w-full items-center"
            >
              <div className="col-span-2 flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-zinc-400" />
                <span
                  id={`matter-name-${m.id}`}
                  className="font-semibold text-md text-zinc-800"
                >
                  {m.name}
                </span>
              </div>
              <div
                id={`matter-client-${m.id}`}
                className="col-span-2 text-zinc-700"
              >
                {m.client}
              </div>
              <div
                id={`matter-status-${m.id}`}
                className="flex items-center"
              >
                {statusPill(m.status)}
              </div>
              <div
                id={`matter-updated-${m.id}`}
                className="text-zinc-500"
              >
                {m.updated}
              </div>
            </Link>
          </div>
        ))}
      </div>
      {/* Batch actions bar */}
      {selected.length > 0 && (
        <div
          id="batch-actions-bar"
          className="mt-12 flex gap-2 items-center text-sm text-zinc-500 justify-end animate-in fade-in"
        >
          <span>Batch actions:</span>
          <button
            id="archive-selected-button"
            data-testid="archive-selected-button"
            className="rounded-2xl px-4 py-2 bg-zinc-200 text-zinc-700 font-semibold hover:bg-zinc-300 inline-flex gap-2 items-center"
            onClick={archiveSelected}
          >
            <Archive className="w-4 h-4" /> Archive
          </button>
          <button
            id="delete-selected-button"
            data-testid="delete-selected-button"
            className="rounded-2xl px-4 py-2 bg-red-500 text-white font-semibold hover:bg-red-600 inline-flex gap-2 items-center"
            onClick={deleteSelected}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}

      {/* Modal for New Matter */}
      {openNew && (
        <div
          id="new-matter-modal-overlay"
          className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
        >
          <form
            id="new-matter-form"
            data-testid="new-matter-form"
            className="rounded-2xl bg-white w-full max-w-md p-8 shadow-2xl flex flex-col gap-6 border border-zinc-100 relative animate-in fade-in zoom-in-50"
            onSubmit={addMatter}
          >
            <button
              id="close-modal-button"
              type="button"
              onClick={closeModal}
              className="absolute right-3 top-3 text-zinc-400 rounded-full hover:bg-zinc-100 p-2"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 id="new-matter-modal-title" className="text-2xl font-bold mb-2">
              New Matter
            </h2>
            <div className="flex flex-col gap-2">
              <label
                className="font-medium text-zinc-700"
                htmlFor="matter-name-input"
              >
                Matter Name
              </label>
              <input
                id="matter-name-input"
                data-testid="matter-name-input"
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
                htmlFor="matter-client-input"
              >
                Client
              </label>
              <input
                id="matter-client-input"
                className="rounded-xl border border-zinc-200 px-4 py-3 text-md font-medium"
                required
                value={newMatter.client}
                onChange={(e) =>
                  setNewMatter((n) => ({ ...n, client: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="font-medium text-zinc-700"
                htmlFor="matter-status-select"
              >
                Status
              </label>
              <select
                id="matter-status-select"
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
              id="create-matter-submit-button"
              type="submit"
              className="rounded-2xl px-5 py-3 bg-accent-forest text-white font-semibold hover:bg-accent-forest/90 transition text-lg"
            >
              Create Matter
            </button>
          </form>
>>>>>>> main
        </div>

        {/* Batch Actions */}
        {selected.length > 0 && (
          <div className="flex justify-end gap-2 mt-4">
            <DynamicButton
              eventType="ARCHIVE_MATTER"
              index={0}
              onClick={archiveSelected}
              variant="outline"
            >
              <Archive className="w-4 h-4 mr-2" /> Archive Selected
            </DynamicButton>
            <DynamicButton
              eventType="DELETE_MATTER"
              index={1}
              onClick={deleteSelected}
              variant="outline"
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Selected
            </DynamicButton>
          </div>
        )}

        {/* New Matter Modal */}
        {openNew && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <DynamicContainer className="bg-white rounded-2xl p-8 max-w-md w-full">
              <form onSubmit={addMatter} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">New Matter</h2>
                  <button
                    type="button"
                    onClick={() => setOpenNew(false)}
                    className="text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Matter Name
                    </label>
                    <input
                      className="w-full rounded-lg border p-2"
                      value={newMatter.name}
                      onChange={(e) =>
                        setNewMatter((m) => ({ ...m, name: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Client
                    </label>
                    <input
                      className="w-full rounded-lg border p-2"
                      value={newMatter.client}
                      onChange={(e) =>
                        setNewMatter((m) => ({ ...m, client: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      className="w-full rounded-lg border p-2"
                      value={newMatter.status}
                      onChange={(e) =>
                        setNewMatter((m) => ({ ...m, status: e.target.value }))
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <DynamicButton
                  eventType="ADD_NEW_MATTER"
                  index={1}
                  type="submit"
                  className="w-full bg-accent-forest text-white hover:bg-accent-forest/90"
                >
                  Create Matter
                </DynamicButton>
              </form>
            </DynamicContainer>
          </div>
        )}
      </DynamicContainer>
    </section>
  );
}
