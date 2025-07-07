"use client";
import React, { useState } from "react";
import { Timer, PlayCircle, PauseCircle, Plus, Trash2 } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";

const DEMO_LOGS = [
  { id: 1, matter: "Estate Planning", client: "Smith & Co.", date: "2025-05-19", hours: 2, description: "Consultation", status: "Billable" },
  { id: 2, matter: "IP Filing", client: "Acme Biotech", date: "2025-05-18", hours: 1.5, description: "Draft application", status: "Billed" },
  { id: 3, matter: "M&A Advice", client: "Peak Ventures", date: "2025-05-16", hours: 3, description: "Negotiation call", status: "Billable" },
  { id: 4, matter: "Trademark Filing", client: "OmniCorp", date: "2025-05-15", hours: 2.5, description: "Prepare documents", status: "Billed" },
  { id: 5, matter: "NDA Review", client: "FutureTech", date: "2025-05-14", hours: 1.2, description: "Review clauses", status: "Billable" },
  { id: 6, matter: "Shareholder Dispute", client: "Union Legal", date: "2025-05-13", hours: 4, description: "Strategy meeting", status: "Billable" },
  { id: 7, matter: "Franchise Agreement", client: "TasteBuds Inc.", date: "2025-05-12", hours: 2.75, description: "Legal drafting", status: "Billed" },
  { id: 8, matter: "Employment Contract", client: "NextGen Solutions", date: "2025-05-11", hours: 1, description: "HR consultation", status: "Billable" },
  { id: 9, matter: "Investor Due Diligence", client: "CapitalCore", date: "2025-05-10", hours: 3.3, description: "Risk assessment", status: "Billed" },
  { id: 10, matter: "Corporate Compliance", client: "SecureCom", date: "2025-05-09", hours: 2.1, description: "Documentation check", status: "Billable" },
  { id: 11, matter: "Patent Filing", client: "Innovatek", date: "2025-05-08", hours: 2, description: "Patent search", status: "Billed" },
  { id: 12, matter: "Business Sale", client: "QuickMart", date: "2025-05-07", hours: 5, description: "Contract review", status: "Billable" },
  { id: 13, matter: "Internal Audit", client: "GreenFields", date: "2025-05-06", hours: 3.5, description: "Financial review", status: "Billed" },
  { id: 14, matter: "Trademark Renewal", client: "LabelLine", date: "2025-05-05", hours: 0.8, description: "Online filing", status: "Billable" },
  { id: 15, matter: "Merger Strategy", client: "AlphaGroup", date: "2025-05-04", hours: 4.2, description: "Planning call", status: "Billable" },
  { id: 16, matter: "Copyright Dispute", client: "PixelPlay", date: "2025-05-03", hours: 2.9, description: "Case analysis", status: "Billed" },
  { id: 17, matter: "IP Agreement", client: "MindShift", date: "2025-05-02", hours: 1.1, description: "Client call", status: "Billable" },
  { id: 18, matter: "SaaS Contract", client: "CloudNest", date: "2025-05-01", hours: 2.6, description: "Contract draft", status: "Billable" },
  { id: 19, matter: "Annual Return Filing", client: "NovaLabs", date: "2025-04-30", hours: 3.4, description: "Compliance filing", status: "Billed" },
  { id: 20, matter: "Legal Memo", client: "Visionary Ltd.", date: "2025-04-29", hours: 1.8, description: "Drafting memo", status: "Billable" },
  { id: 21, matter: "Founder Agreement", client: "CoreConnect", date: "2025-04-28", hours: 2.7, description: "Review terms", status: "Billable" },
  { id: 22, matter: "Funding Round", client: "BuildRight", date: "2025-04-27", hours: 4.6, description: "Legal prep", status: "Billed" },
  { id: 23, matter: "Property Lease", client: "UrbanSpace", date: "2025-04-26", hours: 2.9, description: "Lease review", status: "Billable" },
  { id: 24, matter: "Board Meeting", client: "SteelRock", date: "2025-04-25", hours: 1.3, description: "Meeting notes", status: "Billed" },
  { id: 25, matter: "Tax Advisory", client: "EcoFinance", date: "2025-04-24", hours: 2.5, description: "Tax analysis", status: "Billable" },
  { id: 26, matter: "Startup Incorporation", client: "BrightStart", date: "2025-04-23", hours: 3.7, description: "Setup docs", status: "Billable" },
  { id: 27, matter: "Product Licensing", client: "SoftBridge", date: "2025-04-22", hours: 2.2, description: "Review contract", status: "Billed" },
  { id: 28, matter: "Compliance Review", client: "MetaSolutions", date: "2025-04-21", hours: 1.9, description: "Checklist audit", status: "Billable" },
  { id: 29, matter: "Trademark Filing", client: "GlobalReach", date: "2025-04-20", hours: 0.9, description: "Filing form", status: "Billable" },
  { id: 30, matter: "Business Valuation", client: "TrueNorth", date: "2025-04-19", hours: 4.5, description: "Valuation call", status: "Billed" },
  { id: 31, matter: "Policy Drafting", client: "SafeHaven", date: "2025-04-18", hours: 3.2, description: "Drafting policy", status: "Billable" },
  { id: 32, matter: "Court Filing", client: "Delta Law", date: "2025-04-17", hours: 2.8, description: "File case", status: "Billed" },
  { id: 33, matter: "Contract Dispute", client: "ZenithCorp", date: "2025-04-16", hours: 1.4, description: "Client discussion", status: "Billable" },
  { id: 34, matter: "Risk Assessment", client: "ArmorX", date: "2025-04-15", hours: 3, description: "Review & report", status: "Billable" },
  { id: 35, matter: "Startup Pitch Deck", client: "LaunchLeap", date: "2025-04-14", hours: 2.3, description: "Legal feedback", status: "Billed" },
  { id: 36, matter: "Non-Compete Review", client: "RevoTech", date: "2025-04-13", hours: 1.7, description: "Review & advise", status: "Billable" },
];

export default function BillingPage() {
  const [timerActive, setTimerActive] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [manual, setManual] = useState({
    matter: "",
    hours: 0.5,
    description: "",
  });
  const [logs, setLogs] = useState(DEMO_LOGS);
  const [tab, setTab] = useState("Logs");

  React.useEffect(() => {
    let id: NodeJS.Timeout;
    if (timerActive) {
      id = setInterval(() => setTimerSec((s) => s + 1), 1000);
    }
    return () => id && clearInterval(id);
  }, [timerActive]);

  function startTimer() {
    setTimerActive(true);
    setTimerSec(0);
    setTab("Logs");
    // logEvent(EVENT_TYPES.TIMER_STARTED, {
    //   startedAt: new Date().toISOString(),
    // });
  }

  function stopTimer() {
    setTimerActive(false);
    if (timerSec > 0) {
      const entry = {
        id: Date.now(),
        matter: "—",
        client: "—",
        date: new Date().toISOString().slice(0, 10),
        hours: +(timerSec / 3600).toFixed(2),
        description: "Timed entry",
        status: "Billable",
      };
      setLogs([entry, ...logs]);
      // logEvent(EVENT_TYPES.TIMER_STOPPED, { duration: timerSec, ...entry });
    }
  }

  function addManual(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const entry = {
      id: Date.now(),
      matter: manual.matter,
      client: "—",
      date: new Date().toISOString().slice(0, 10),
      hours: manual.hours,
      description: manual.description,
      status: "Billable",
    };
    setLogs([entry, ...logs]);
    setManual({ matter: "", hours: 0.5, description: "" });
    logEvent(EVENT_TYPES.NEW_LOG_ADDED, entry);
  }

  function deleteLog(id: number) {
    const log = logs.find((l) => l.id === id);
    if (log) logEvent(EVENT_TYPES.LOG_DELETE, log);
    setLogs((logs) => logs.filter((l) => l.id !== id));
  }

  return (
    <section>
      <h1 className="text-3xl font-extrabold mb-10 tracking-tight">
        Time Tracking / Billing
      </h1>
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab("Logs")}
          className={`px-5 py-2 rounded-2xl font-semibold text-md ${
            tab === "Logs"
              ? "bg-accent-forest/10 text-accent-forest shadow"
              : "text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          Logs
        </button>
      </div>
      {tab === "Logs" && (
        <div className="flex flex-col md:flex-row gap-12 mb-8">
          <div className="bg-white rounded-2xl shadow-card p-7 flex flex-col gap-6 border border-zinc-100 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-2">
              <Timer className="w-7 h-7 text-accent-forest" />
              <span className="font-bold text-xl">Timer</span>
            </div>
            <div className="text-5xl font-bold tracking-tight text-[#1A1A1A] mb-2 select-none">
              {`${Math.floor(timerSec / 3600)
                .toString()
                .padStart(2, "0")}:${Math.floor((timerSec % 3600) / 60)
                .toString()
                .padStart(2, "0")}:${(timerSec % 60)
                .toString()
                .padStart(2, "0")}`}
            </div>
            <div className="flex gap-3">
              <button
                className={`rounded-2xl px-5 py-3 font-bold text-lg shadow-sm flex items-center gap-2 transition ${
                  timerActive
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-accent-forest hover:bg-accent-forest/90 text-white"
                }`}
                onClick={timerActive ? stopTimer : startTimer}
              >
                {timerActive ? (
                  <>
                    <PauseCircle className="w-6 h-6" />
                    Stop
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-6 h-6" />
                    Start
                  </>
                )}
              </button>
            </div>
          </div>
          <form
            onSubmit={addManual}
            className="bg-white rounded-2xl shadow-card p-7 flex flex-col gap-5 border border-zinc-100 w-full max-w-xl"
          >
            <div className="flex items-center gap-3 mb-1">
              <Plus className="w-6 h-6 text-accent-forest" />
              <span className="font-bold text-lg">Add Log Entry</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">
                Matter
              </label>
              <input
                className="rounded-xl border border-zinc-200 px-4 py-3 text-md font-medium"
                value={manual.matter}
                onChange={(e) =>
                  setManual((m) => ({ ...m, matter: e.target.value }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">
                Description
              </label>
              <input
                className="rounded-xl border border-zinc-200 px-4 py-3 text-md font-medium"
                value={manual.description}
                onChange={(e) =>
                  setManual((m) => ({ ...m, description: e.target.value }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">Hours</label>
              <input
                type="number"
                step=".1"
                min="0.1"
                max="24"
                className="rounded-xl border border-zinc-200 px-4 py-3 text-md font-medium w-32"
                value={manual.hours}
                onChange={(e) =>
                  setManual((m) => ({ ...m, hours: +e.target.value }))
                }
                required
              />
            </div>
            <button
              type="submit"
              className="rounded-2xl px-5 py-3 bg-accent-forest text-white font-semibold hover:bg-accent-forest/90 transition text-lg"
            >
              Add Entry
            </button>
          </form>
        </div>
      )}
      {tab === "Logs" && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-5">Recent Logs</h2>
          <div className="flex flex-col gap-4">
            {logs.length === 0 && (
              <div className="text-zinc-400 px-4 py-8 text-center">
                No logs yet.
              </div>
            )}
            {logs.map((l) => (
              <div
                key={l.id}
                className="bg-white rounded-2xl shadow p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 border border-zinc-100 hover:shadow-lg transition group relative"
              >
                <div className="flex-1 flex flex-col sm:flex-row gap-1 sm:gap-6 items-start sm:items-center">
                  <span className="text-xl font-bold text-accent-forest min-w-[38px] text-left">
                    {l.hours}h
                  </span>
                  <span className="text-zinc-700 font-semibold">
                    {l.matter}
                  </span>
                  <span className="text-xs text-zinc-400 whitespace-nowrap">
                    {l.client}
                  </span>
                  <span className="text-xs text-zinc-400">{l.date}</span>
                  <span
                    className={`inline-flex px-3 py-1 ml-3 rounded-2xl text-xs font-semibold ${
                      l.status === "Billable"
                        ? "bg-accent-forest/10 text-accent-forest"
                        : "bg-zinc-200 text-zinc-500"
                    }`}
                  >
                    {l.status}
                  </span>
                  <span className="text-zinc-500 ml-2">{l.description}</span>
                </div>
                <button
                  className="absolute right-3 top-3 text-zinc-300 hover:text-red-500 rounded-full"
                  title="Delete"
                  onClick={() => deleteLog(l.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
