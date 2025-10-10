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
import { useDynamicStructure } from "@/context/DynamicStructureContext";

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
  const { getText, getId } = useDynamicStructure();
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
    <section className="p-6">
      <DynamicContainer className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{getText("matters_title")}</h1>
          <DynamicButton
            eventType="ADD_NEW_MATTER"
            onClick={() => setOpenNew(true)}
            className="bg-accent-forest text-white hover:bg-accent-forest/90"
            id={getId("add_matter_button")}
            aria-label={getText("add_new_matter")}
          >
            <Plus className="w-4 h-4 mr-2" /> {getText("add_new_matter")}
          </DynamicButton>
        </div>

        {/* Matter List */}
        <div className="grid gap-4">
          {matters.map((matter) => (
            <DynamicItem
              key={matter.id}
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
        </div>

        {/* Batch Actions */}
        {selected.length > 0 && (
          <div className="flex justify-end gap-2 mt-4">
            <DynamicButton
              eventType="ARCHIVE_MATTER"
              onClick={archiveSelected}
              variant="outline"
              id={getId("archive_button")}
              aria-label={getText("archive_selected")}
            >
              <Archive className="w-4 h-4 mr-2" /> {getText("archive_selected")}
            </DynamicButton>
            <DynamicButton
              eventType="DELETE_MATTER"
              onClick={deleteSelected}
              variant="outline"
              className="text-red-600 hover:bg-red-50"
              id={getId("delete_button")}
              aria-label={getText("delete_selected")}
            >
              <Trash2 className="w-4 h-4 mr-2" /> {getText("delete_selected")}
            </DynamicButton>
          </div>
        )}

        {/* New Matter Modal */}
        {openNew && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <DynamicContainer className="bg-white rounded-2xl p-8 max-w-md w-full">
              <form onSubmit={addMatter} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{getText("add_new_matter")}</h2>
                  <button
                    type="button"
                    onClick={() => setOpenNew(false)}
                    className="text-zinc-400 hover:text-zinc-600"
                    id={getId("close_modal_button")}
                    aria-label={getText("cancel_button")}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {getText("matter_name")}
                    </label>
                    <input
                      id={getId("matter_name_input")}
                      className="w-full rounded-lg border p-2"
                      value={newMatter.name}
                      onChange={(e) =>
                        setNewMatter((m) => ({ ...m, name: e.target.value }))
                      }
                      placeholder={getText("matter_name")}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {getText("client_name")}
                    </label>
                    <input
                      id={getId("client_name_input")}
                      className="w-full rounded-lg border p-2"
                      value={newMatter.client}
                      onChange={(e) =>
                        setNewMatter((m) => ({ ...m, client: e.target.value }))
                      }
                      placeholder={getText("client_name")}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {getText("matter_status")}
                    </label>
                    <select
                      id={getId("matter_status_select")}
                      className="w-full rounded-lg border p-2"
                      value={newMatter.status}
                      onChange={(e) =>
                        setNewMatter((m) => ({ ...m, status: e.target.value }))
                      }
                    >
                      <option value="Active">{getText("active_status")}</option>
                      <option value="On Hold">{getText("pending_status")}</option>
                      <option value="Archived">{getText("inactive_status")}</option>
                    </select>
                  </div>
                </div>

                <DynamicButton
                  eventType="ADD_NEW_MATTER"
                  type="submit"
                  className="w-full bg-accent-forest text-white hover:bg-accent-forest/90"
                  id={getId("submit_matter_button")}
                  aria-label={getText("add_new_matter")}
                >
                  {getText("add_new_matter")}
                </DynamicButton>
              </form>
            </DynamicContainer>
          </div>
        )}
      </DynamicContainer>
    </section>
  );
}
