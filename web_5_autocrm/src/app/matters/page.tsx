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
const DEMO_MATTERS = [
  { id: "MAT-0012", name: "Estate Planning", status: "Active", client: "Smith & Co.", updated: "Today" },
  { id: "MAT-0011", name: "Contract Review", status: "Archived", client: "Jones Legal", updated: "2 days ago" },
  { id: "MAT-0009", name: "IP Filing", status: "Active", client: "Acme Biotech", updated: "Last week" },
  { id: "MAT-0005", name: "M&A Advice", status: "On Hold", client: "Peak Ventures", updated: "Yesterday" },
  { id: "MAT-0020", name: "Trademark Registration", status: "Active", client: "Olivia Martinez", updated: "1d ago" },
  { id: "MAT-0021", name: "Patent Analysis", status: "On Hold", client: "TechNova Inc.", updated: "3d ago" },
  { id: "MAT-0022", name: "Corporate Formation", status: "Active", client: "Chen Legal Group", updated: "Today" },
  { id: "MAT-0023", name: "Partnership Agreement", status: "Archived", client: "BrightMind Ltd.", updated: "2w ago" },
  { id: "MAT-0024", name: "IP Litigation", status: "Active", client: "Zara Sheikh", updated: "Yesterday" },
  { id: "MAT-0025", name: "Shareholder Dispute", status: "Active", client: "Al-Madina Textiles", updated: "3d ago" },
  { id: "MAT-0026", name: "License Drafting", status: "On Hold", client: "Nova Enterprises", updated: "5d ago" },
  { id: "MAT-0027", name: "Employee Contracts", status: "Archived", client: "Grace Consulting", updated: "1w ago" },
  { id: "MAT-0028", name: "Real Estate Purchase", status: "Active", client: "Mohammed Anwar", updated: "Yesterday" },
  { id: "MAT-0029", name: "Data Protection Audit", status: "Active", client: "Sunrise Partners", updated: "2d ago" },
  { id: "MAT-0030", name: "Debt Collection", status: "Archived", client: "GreenLeaf Holdings", updated: "3d ago" },
  { id: "MAT-0031", name: "Technology Transfer", status: "On Hold", client: "David Thompson", updated: "2w ago" },
  { id: "MAT-0032", name: "Joint Venture Setup", status: "Active", client: "Yuki Tanaka", updated: "Today" },
  { id: "MAT-0033", name: "Compliance Review", status: "Active", client: "Skyline Architects", updated: "Yesterday" },
  { id: "MAT-0034", name: "Business Incorporation", status: "On Hold", client: "Fatima Noor", updated: "3w ago" },
  { id: "MAT-0035", name: "Franchise Agreement", status: "Archived", client: "Visionary Lab", updated: "1d ago" },
  { id: "MAT-0036", name: "Land Acquisition", status: "Active", client: "Eleanor White", updated: "2d ago" },
  { id: "MAT-0037", name: "Vendor Contract", status: "Active", client: "EcoBuild Solutions", updated: "Last week" },
  { id: "MAT-0038", name: "Copyright Filing", status: "On Hold", client: "Carlos Rivera", updated: "5d ago" },
  { id: "MAT-0039", name: "Startup Advisory", status: "Active", client: "Global Reach Inc.", updated: "Yesterday" },
  { id: "MAT-0040", name: "Internal Investigation", status: "Archived", client: "Jin Park", updated: "2w ago" },
  { id: "MAT-0041", name: "Financial Compliance", status: "Active", client: "Aurora Media", updated: "Today" },
  { id: "MAT-0042", name: "Supplier Dispute", status: "On Hold", client: "Trinity Pharma", updated: "4d ago" },
  { id: "MAT-0043", name: "Regulatory Approval", status: "Archived", client: "George Maxwell", updated: "1w ago" },
  { id: "MAT-0044", name: "Government Tender", status: "Active", client: "NextGen Realty", updated: "3d ago" },
  { id: "MAT-0045", name: "Joint Ownership Case", status: "On Hold", client: "Rebecca Clark", updated: "5d ago" },
  { id: "MAT-0046", name: "Investment Deal Review", status: "Active", client: "Gulf Horizons", updated: "Yesterday" },
  { id: "MAT-0047", name: "Business Dissolution", status: "Archived", client: "Starlight Finance", updated: "1w ago" },
  { id: "MAT-0048", name: "Legal Risk Audit", status: "Active", client: "Anastasia Romanov", updated: "3d ago" },
  { id: "MAT-0049", name: "Engineering IP Audit", status: "On Hold", client: "Quantum Engineering", updated: "Today" },
  { id: "MAT-0050", name: "Tax Compliance", status: "Active", client: "Nina Patel", updated: "2d ago" },
  { id: "MAT-0051", name: "Security Policy Review", status: "Archived", client: "Bravo Security", updated: "Last week" },
  { id: "MAT-0052", name: "HR Law Training", status: "Active", client: "Jade Harper", updated: "Yesterday" },
  { id: "MAT-0053", name: "IT Contract Negotiation", status: "On Hold", client: "Arctic Tech", updated: "4d ago" },
  { id: "MAT-0054", name: "Asset Sale", status: "Active", client: "Theodore Lee", updated: "Today" },
  { id: "MAT-0055", name: "Outsourcing Agreement", status: "Archived", client: "Ravi Gupta", updated: "2d ago" },
  { id: "MAT-0056", name: "Joint Patent Filing", status: "Active", client: "Meera Shah", updated: "3w ago" },
];

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
