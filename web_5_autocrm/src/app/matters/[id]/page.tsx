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
import { DEMO_MATTERS } from "@/library/dataset";
import { useSeed } from "@/context/SeedContext";
import { useProjectData } from "@/shared/universal-loader";
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
  const { resolvedSeeds } = useSeed();
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
  const storageKey = useMemo(
    () => `${STORAGE_KEY_PREFIX}_${v2Seed ?? "default"}`,
    [v2Seed]
  );
  const cookieKey = useMemo(
    () => `${CUSTOM_COOKIE_PREFIX}_${v2Seed ?? "default"}`,
    [v2Seed]
  );

  const { data } = useProjectData<any>({
    projectKey: "web_5_autocrm",
    entityType: "matters",
    seedValue: v2Seed ?? undefined,
  });

  const baseMatters = useMemo(() => {
    const normalizedDemo = DEMO_MATTERS.map((m, idx) => normalizeMatter(m, idx));
    const normalizedApi = (data || []).map((m: any, idx: number) =>
      normalizeMatter(m, idx)
    );
    return normalizedApi.length > 0 ? normalizedApi : normalizedDemo;
  }, [data]);

  useEffect(() => {
    if (!matterId) return;
    if (baseMatters.length === 0) return;

    setIsResolving(true);

    let resolvedList: Matter[] = baseMatters;

    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            resolvedList = parsed;
          }
        } catch (error) {
          console.warn("[MatterDetail] Failed to parse cached matters", error);
        }
      } else {
        window.localStorage.setItem(storageKey, JSON.stringify(baseMatters));
      }

      if (resolvedList === baseMatters) {
        const cookie = Cookies.get(cookieKey);
        if (cookie) {
          try {
            const parsed = JSON.parse(cookie);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const existingIds = new Set(resolvedList.map((m) => m.id));
              const merged = [...resolvedList];
              for (const entry of parsed) {
                if (!existingIds.has(entry.id)) {
                  merged.unshift(entry);
                }
              }
              resolvedList = merged;
            }
          } catch (error) {
            console.warn("[MatterDetail] Failed to parse custom matters cookie", error);
          }
        }
      }
    }

    const match =
      resolvedList.find((m) => m.id === matterId) ??
      baseMatters.find((m) => m.id === matterId) ??
      null;

    if (match) {
      setCurrentMatter(match);
      logEvent(EVENT_TYPES.VIEW_MATTER_DETAILS, match);
    } else {
      console.warn(`Matter with ID ${matterId} not found.`);
      setCurrentMatter(null);
    }
    setIsResolving(false);
  }, [matterId, baseMatters, storageKey, cookieKey]);

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

export default function MatterDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral flex items-center justify-center">Loading...</div>}>
      <MatterDetailPageContent />
    </Suspense>
  );
}
