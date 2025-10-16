"use client";
import { useParams } from "next/navigation";
import {
  Briefcase,
  FileText,
  DollarSign,
  Clock,
  ChevronDown,
} from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import Cookies from "js-cookie";
import {EVENT_TYPES, logEvent} from "@/library/events";
import { DEMO_MATTERS } from "@/library/dataset";
const TABS = [
  { name: "Overview", icon: <Briefcase className="w-5 h-5 mr-1" /> },
  { name: "Documents", icon: <FileText className="w-5 h-5 mr-1" /> },
  { name: "Billing", icon: <DollarSign className="w-5 h-5 mr-1" /> },
  { name: "Activity", icon: <Clock className="w-5 h-5 mr-1" /> },
];

type Matter = {
  id: string;
  name: string;
  status: string;
  client: string;
  updated: string;
  // opened: string;
  // description: string;
};

function useDetailLayoutVariant() {
  // Get the seed value from URL, default to 1 if not present
  const [seed, setSeed] = useState(1);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const seedParam = searchParams.get('seed');
    setSeed(seedParam ? parseInt(seedParam) : 1);
  }, []);

  // Define different layout variants for detail page
  const variants = {
    standard: {
      containerClasses: "flex flex-col lg:flex-row gap-10",
      sidebarClasses: "flex-shrink-0 min-w-80 lg:max-w-xs w-full lg:sticky lg:top-32",
      mainContentClasses: "flex-1 min-w-0",
      cardClasses: "bg-white rounded-2xl shadow-card p-8 border border-zinc-100",
      tabClasses: "flex gap-4 mb-10 border-b border-zinc-100 pb-2.5",
      activeTabClasses: "bg-accent-forest/10 text-accent-forest shadow",
      inactiveTabClasses: "text-zinc-700 hover:bg-zinc-100"
    },
    modern: {
      containerClasses: "grid lg:grid-cols-[300px,1fr] gap-8",
      sidebarClasses: "lg:sticky lg:top-32 h-fit",
      mainContentClasses: "min-w-0",
      cardClasses: "bg-white rounded-3xl shadow-lg border-2 border-zinc-100 p-10",
      tabClasses: "flex flex-wrap gap-2 mb-8",
      activeTabClasses: "bg-accent-forest text-white",
      inactiveTabClasses: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
    },
    compact: {
      containerClasses: "flex flex-col gap-6",
      sidebarClasses: "w-full",
      mainContentClasses: "w-full",
      cardClasses: "bg-white rounded-lg shadow-sm border border-zinc-100 p-6",
      tabClasses: "flex overflow-x-auto gap-1 mb-6 pb-px",
      activeTabClasses: "bg-accent-forest/10 text-accent-forest font-bold",
      inactiveTabClasses: "text-zinc-500 hover:text-zinc-700"
    },
    split: {
      containerClasses: "grid lg:grid-cols-2 gap-8",
      sidebarClasses: "lg:sticky lg:top-32 h-fit",
      mainContentClasses: "min-w-0",
      cardClasses: "bg-white rounded-2xl shadow-xl border-0 p-8",
      tabClasses: "inline-flex bg-zinc-100 rounded-xl p-1 mb-8",
      activeTabClasses: "bg-white shadow text-accent-forest",
      inactiveTabClasses: "text-zinc-600 hover:text-zinc-800"
    }
  };

  // Choose variant based on seed
  const getVariant = (seed: number) => {
    if (seed <= 3) return variants.standard;
    if (seed <= 5) return variants.modern;
    if (seed <= 7) return variants.compact;
    return variants.split;
  };

  return getVariant(seed);
}

export default function MatterDetailPage() {
  const [tab, setTab] = useState("Overview");
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [customMatters, setCustomMatters] = useState<Matter[]>([]);
  const [currentMatter, setCurrentMatter] = useState<Matter | null>(null);
  
  const layout = useDetailLayoutVariant();
  const params = useParams();
  const matterId = params?.id as string;

  useEffect(() => {
    const cookie = Cookies.get("custom_matters");
    if (cookie) setCustomMatters(JSON.parse(cookie));
  }, []);

  useEffect(() => {
    if (!matterId) return;

    const allMatters = [...customMatters, ...DEMO_MATTERS];
    const matter = allMatters.find((m) => m.id === matterId);
    if (matter) {
      setCurrentMatter(matter);
      logEvent(EVENT_TYPES.VIEW_MATTER_DETAILS, matter);
    } else {
      console.warn(`Matter with ID ${matterId} not found.`);
      setCurrentMatter(null);
    }
  }, [matterId, customMatters]);

  // If the matter is not found or still loading, you might want to show a loading state or an error
  if (!currentMatter) {
    return (
      <section className="flex justify-center items-center h-screen">
        <p className="text-zinc-500">Loading matter details or matter not found...</p>
      </section>
    );
  }

  return (
    <section className={layout.containerClasses}>
      {/* Left Summary Pane */}
      <aside className={layout.sidebarClasses}>
        <div className={`${layout.cardClasses} flex flex-col gap-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xl text-[#1A1A1A]">
              {currentMatter.name}
            </span>
            <button
              aria-label="collapse"
              onClick={() => setSummaryOpen((o) => !o)}
              className="rounded-2xl p-2 hover:bg-zinc-100"
            >
              <ChevronDown
                className={`w-6 h-6 transition-transform ${
                  summaryOpen ? "" : "-rotate-90"
                }`}
              />
            </button>
          </div>
          {summaryOpen && (
            <>
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-block px-3 py-1 bg-accent-forest/10 text-accent-forest rounded-2xl text-xs font-medium">
                  {currentMatter.status}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {currentMatter.id}
                </span>
              </div>
              <dl className="text-sm text-zinc-500 font-medium space-y-1">
                <div>
                  <dt className="inline">Client: </dt>
                  <dd className="inline text-zinc-700 font-semibold ml-1">
                    {currentMatter.client}
                  </dd>
                </div>
                <div>
                  <dt className="inline">Last updated: </dt>
                  <dd className="inline ml-1">{currentMatter.updated}</dd>
                </div>
              </dl>
              {/*<p className="text-zinc-600 mt-3 font-normal text-sm leading-relaxed">*/}
              {/*  {currentMatter.description}*/}
              {/*</p>*/}
            </>
          )}
        </div>
      </aside>
      {/* Right: Tabbed Content */}
      <main className={layout.mainContentClasses}>
        <nav className={layout.tabClasses}>
          {TABS.map(({ name, icon }) => (
            <button
              key={name}
              id={`tab-${name.toLowerCase()}`}
              className={`flex items-center px-5 py-2 rounded-2xl font-semibold text-md transition-colors ${
                name === tab
                  ? layout.activeTabClasses
                  : layout.inactiveTabClasses
              }`}
              onClick={() => setTab(name)}
            >
              {icon}
              {name}
            </button>
          ))}
        </nav>
        <div className={layout.cardClasses}>
          {tab === "Overview" && (
            <div>
              <h2 className="font-bold text-lg mb-4">Matter Overview</h2>
              <ul className="list-disc ml-6 text-zinc-600">
                <li>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </li>
                <li>
                  Billable time:{" "}
                  <span className="font-bold text-zinc-800">-- h</span>
                </li>
                <li>Most recent activity, e.g. document signed.</li>
              </ul>
            </div>
          )}
          {tab === "Documents" && (
            <div>
              <h2 className="font-bold text-lg mb-4">Matter Documents</h2>
              <ul className="ml-3 text-zinc-600">
                <li>[Doc1.pdf] Signed | see Files tab</li>
                <li>[Agreement.docx] Draft | see Files tab</li>
              </ul>
            </div>
          )}
          {tab === "Billing" && (
            <div>
              <h2 className="font-bold text-lg mb-4">Billing Summary</h2>
              <ul className="ml-3 text-zinc-600">
                <li>
                  Last invoice:{" "}
                  <span className="font-bold text-zinc-800">--</span>
                </li>
                <li>Payments: --</li>
              </ul>
            </div>
          )}
          {tab === "Activity" && (
            <div>
              <h2 className="font-bold text-lg mb-4">Recent Activity</h2>
              <ul className="ml-3 text-zinc-600">
                <li>[Today] Matter opened</li>
                <li>[Yesterday] Note added</li>
              </ul>
            </div>
          )}
          {tab === "Overview" && (
            <div>
              <h2 className="font-bold text-lg mb-4">Matter Overview</h2>
              <ul className="list-disc ml-6 text-zinc-600">
                <li>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </li>
                <li>
                  Billable time:{" "}
                  <span className="font-bold text-zinc-800">-- h</span>
                </li>
                <li>Most recent activity, e.g. document signed.</li>
              </ul>
            </div>
          )}
          {tab === "Documents" && (
            <div>
              <h2 className="font-bold text-lg mb-4">Matter Documents</h2>
              <ul className="ml-3 text-zinc-600">
                <li>[Doc1.pdf] Signed | see Files tab</li>
                <li>[Agreement.docx] Draft | see Files tab</li>
              </ul>
            </div>
          )}
          {tab === "Billing" && (
            <div>
              <h2 className="font-bold text-lg mb-4">Billing Summary</h2>
              <ul className="ml-3 text-zinc-600">
                <li>
                  Last invoice:{" "}
                  <span className="font-bold text-zinc-800">--</span>
                </li>
                <li>Payments: --</li>
              </ul>
            </div>
          )}
          {tab === "Activity" && (
            <div>
              <h2 className="font-bold text-lg mb-4">Recent Activity</h2>
              <ul className="ml-3 text-zinc-600">
                <li>[Today] Matter opened</li>
                <li>[Yesterday] Note added</li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </section>
  );
}
