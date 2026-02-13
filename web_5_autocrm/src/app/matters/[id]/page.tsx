"use client";
import { useParams, useSearchParams } from "next/navigation";
import {
  Briefcase,
  FileText,
  DollarSign,
  Clock,
  ChevronDown,
} from "lucide-react";
import React, { useState, useMemo, useEffect, Suspense } from "react";
import Cookies from "js-cookie";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useSeed } from "@/context/SeedContext";
import { initializeMatters } from "@/data/crm-enhanced";
import { getMatterById, dynamicDataProvider } from "@/dynamic/v2";
import { useDynamicSystem } from "@/dynamic/shared";
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
};

const STORAGE_KEY_PREFIX = "matters";
const CUSTOM_COOKIE_PREFIX = "custom_matters";

const normalizeMatter = (matter: any, index: number): Matter => ({
  id: matter?.id ?? matter?.matterId ?? `MAT-${1000 + index}`,
  name: matter?.name ?? matter?.title ?? matter?.matter ?? `Matter ${index + 1}`,
  client: matter?.client ?? matter?.clientName ?? "—",
  status: matter?.status ?? "Active",
  updated: matter?.updated ?? matter?.updated_at ?? matter?.lastUpdated ?? "Today",
});

function useDetailLayoutVariant() {
  // Get the seed value from URL, default to 1 if not present
  const searchParams = useSearchParams();
  const seedParam = searchParams?.get('seed');
  const seed = useMemo(() => {
    return seedParam ? parseInt(seedParam) : 1;
  }, [seedParam]);

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

function MatterDetailPageContent() {
  const [tab, setTab] = useState("Overview");
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [currentMatter, setCurrentMatter] = useState<Matter | null>(null);
  const [isResolving, setIsResolving] = useState(true);

  const layout = useDetailLayoutVariant();
  const params = useParams();
  const matterId = params?.id as string;
  const { seed } = useSeed();
  const v2Seed = seed;
  const dyn = useDynamicSystem();

  // Debug: Verify V2 status
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[matters/[id]/page] V2 status:", {
        v2Enabled: dyn.v2.isEnabled(),
      });
    }
  }, [dyn.v2]);
  const storageKey = useMemo(
    () => `${STORAGE_KEY_PREFIX}_${v2Seed ?? "default"}`,
    [v2Seed]
  );
  const cookieKey = useMemo(
    () => `${CUSTOM_COOKIE_PREFIX}_${v2Seed ?? "default"}`,
    [v2Seed]
  );

  // Load matter data using V2 system
  useEffect(() => {
    if (!matterId) return;

    let mounted = true;
    const run = async () => {
      setIsResolving(true);
      try {
        console.log(`[matters/[id]/page] Loading matter ${matterId} with seed=${seed}, v2Seed=${v2Seed}`);

        // Wait for data to be ready
        await dynamicDataProvider.whenReady();

        // Reload if seed changed
        await dynamicDataProvider.reload(seed ?? undefined);

        // Wait again to ensure reload is complete
        await dynamicDataProvider.whenReady();

        if (!mounted) return;

        // Get matter directly using getMatterById
        const allMatters = dynamicDataProvider.getMatters();
        console.log(`[matters/[id]/page] Searching for matter ${matterId} in ${allMatters.length} matters`);

        const found = getMatterById(matterId);
        console.log(`[matters/[id]/page] Matter ${matterId} found:`, found ? found.name : "NOT FOUND");

        if (found) {
          const normalized = normalizeMatter(found, 0);
          setCurrentMatter(normalized);
          logEvent(EVENT_TYPES.VIEW_MATTER_DETAILS, normalized);
        } else {
          // Log available matters for debugging
          console.warn(`[matters/[id]/page] Matter ${matterId} not found. Available matters (${allMatters.length}):`,
            allMatters.slice(0, 5).map(m => ({ id: m.id, name: m.name }))
          );
          setCurrentMatter(null);
        }
      } catch (error) {
        console.error("[matters/[id]/page] Failed to load matter", error);
        if (!mounted) return;
        setCurrentMatter(null);
      } finally {
        if (!mounted) return;
        setIsResolving(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [matterId, seed, v2Seed]);

  // If the matter is not found, show error
  if (isResolving) {
    return (
      <section className="flex justify-center items-center h-screen">
        <p className="text-zinc-500">Loading matter details...</p>
      </section>
    );
  }

  if (!currentMatter) {
    return (
      <section className="flex justify-center items-center h-screen">
        <p className="text-zinc-500">
          Matter {matterId ? `(${matterId}) ` : ""}not found
        </p>
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
              <div className="space-y-4 text-zinc-600">
                <div>
                  <p className="mb-2">
                    <strong className="text-zinc-800">Case Type:</strong> {currentMatter.name}
                  </p>
                  <p className="mb-2">
                    <strong className="text-zinc-800">Client:</strong> {currentMatter.client}
                  </p>
                  <p className="mb-2">
                    <strong className="text-zinc-800">Status:</strong> {currentMatter.status}
                  </p>
                </div>
                <div className="border-t border-zinc-200 pt-4">
                  <p className="mb-2">
                    <strong className="text-zinc-800">Billable time:</strong>{" "}
                    <span className="font-bold text-zinc-800">
                      {Math.floor(Math.random() * 40 + 10)} hours
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-zinc-800">Last updated:</strong> {currentMatter.updated}
                  </p>
                  <p>
                    <strong className="text-zinc-800">Most recent activity:</strong> Matter reviewed and documentation updated.
                  </p>
                </div>
              </div>
            </div>
          )}
          {tab === "Documents" && (
            <div>
              <h2 className="font-bold text-lg mb-4">Matter Documents</h2>
              <ul className="space-y-2 ml-3 text-zinc-600">
                <li>• Retainer Agreement.pdf - Signed</li>
                <li>• {currentMatter.name.replace(/[^a-zA-Z0-9]/g, '-')}-Agreement.docx - Draft</li>
                <li>• Client Communication Log.pdf - Updated</li>
                <li>• Case Notes.docx - Active</li>
              </ul>
            </div>
          )}
          {tab === "Billing" && (
            <div>
              <h2 className="font-bold text-lg mb-4">Billing Summary</h2>
              <ul className="space-y-2 ml-3 text-zinc-600">
                <li>
                  <strong className="text-zinc-800">Last invoice:</strong> ${Math.floor(Math.random() * 5000 + 1000).toLocaleString()}
                </li>
                <li>
                  <strong className="text-zinc-800">Total billed:</strong> ${Math.floor(Math.random() * 20000 + 5000).toLocaleString()}
                </li>
                <li>
                  <strong className="text-zinc-800">Payments received:</strong> ${Math.floor(Math.random() * 15000 + 3000).toLocaleString()}
                </li>
                <li>
                  <strong className="text-zinc-800">Outstanding balance:</strong> ${Math.floor(Math.random() * 5000 + 500).toLocaleString()}
                </li>
              </ul>
            </div>
          )}
          {tab === "Activity" && (
            <div>
              <h2 className="font-bold text-lg mb-4">Recent Activity</h2>
              <ul className="space-y-2 ml-3 text-zinc-600">
                <li>• [{currentMatter.updated}] Matter {currentMatter.status === "Active" ? "updated" : currentMatter.status === "Archived" ? "archived" : "put on hold"}</li>
                <li>• [Yesterday] Document review completed</li>
                <li>• [2 days ago] Client meeting scheduled</li>
                <li>• [Last week] Initial consultation completed</li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </section>
  );
}

export default function MatterDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral flex items-center justify-center">Loading...</div>}>
      <MatterDetailPageContent />
    </Suspense>
  );
}
