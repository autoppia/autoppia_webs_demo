"use client";
import React, { useState } from "react";
import { Timer, PlayCircle, PauseCircle, Plus, Trash2 } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { DEMO_LOGS } from "@/library/dataset";
import { useProjectData } from "@/shared/universal-loader";


export default function BillingPage() {
  const { data, isLoading, error } = useProjectData<any>({
    projectKey: 'web_5_autocrm:logs',
    entityType: 'logs',
    generateCount: 40,
    version: 'v1',
    fallback: () => DEMO_LOGS,
  });
  const [timerActive, setTimerActive] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [manual, setManual] = useState({
    matter: "",
    hours: 0.5,
    description: "",
  });
  const [logs, setLogs] = useState(
    (data && data.length ? data : DEMO_LOGS).map((l: any, i: number) => ({
      id: l.id ?? Date.now() + i,
      matter: l.matter ?? '—',
      client: l.client ?? '—',
      date: l.date ?? new Date().toISOString().slice(0,10),
      hours: typeof l.hours === 'number' ? l.hours : 1,
      description: l.description ?? '—',
      status: l.status ?? 'Billable',
    }))
  );
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
                id="timer-toggle-button"
                className={`rounded-2xl px-5 py-3 font-bold text-lg shadow-sm flex items-center gap-2 transition ${
                  timerActive
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-accent-forest hover:bg-accent-forest/90 text-white"
                }`}
                onClick={timerActive ? stopTimer : startTimer}
                aria-label={timerActive ? "Stop Timer" : "Start Timer"}
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
              id="add-log-form"
              onSubmit={addManual}
              className="bg-white rounded-2xl shadow-card p-7 flex flex-col gap-5 border border-zinc-100 w-full max-w-xl"
            >
              <div className="flex items-center gap-3 mb-1">
                <Plus className="w-6 h-6 text-accent-forest" />
                <span className="font-bold text-lg">Add Log Entry</span>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="manual-matter" className="text-sm font-medium text-zinc-700">
                  Matter
                </label>
                <input
                  id="manual-matter"
                  className="rounded-xl border border-zinc-200 px-4 py-3 text-md font-medium"
                  value={manual.matter}
                  onChange={(e) =>
                    setManual((m) => ({ ...m, matter: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="manual-description" className="text-sm font-medium text-zinc-700">
                  Description
                </label>
                <input
                  id="manual-description"
                  className="rounded-xl border border-zinc-200 px-4 py-3 text-md font-medium"
                  value={manual.description}
                  onChange={(e) =>
                    setManual((m) => ({ ...m, description: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="manual-hours" className="text-sm font-medium text-zinc-700">Hours</label>
                <input
                  id="manual-hours"
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
                id="add-entry-button"
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
            {error && (
              <div className="text-red-600 px-4 py-2">Failed to load logs: {error}</div>
            )}
            {logs.length === 0 && (
              <div
                id="no-logs-message"
                data-testid="no-logs-message"
                className="text-zinc-400 px-4 py-8 text-center"
              >
                No logs yet.
              </div>
            )}
            {logs.map((l) => (
              <div
                key={l.id}
                id={`log-entry-${l.id}`}
                data-testid={`log-entry-${l.id}`}
                className="bg-white rounded-2xl shadow p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 border border-zinc-100 hover:shadow-lg transition group relative"
              >
                <div className="flex-1 flex flex-col sm:flex-row gap-1 sm:gap-6 items-start sm:items-center">
                  <span
                    id={`log-hours-${l.id}`}
                    className="text-xl font-bold text-accent-forest min-w-[38px] text-left"
                  >
                    {l.hours}h
                  </span>
                  <span
                    id={`log-matter-${l.id}`}
                    className="text-zinc-700 font-semibold"
                  >
                    {l.matter}
                  </span>
                  <span
                    id={`log-client-${l.id}`}
                    className="text-xs text-zinc-400 whitespace-nowrap"
                  >
                    {l.client}
                  </span>
                  <span
                    id={`log-date-${l.id}`}
                    className="text-xs text-zinc-400"
                  >
                    {l.date}
                  </span>
                  <span
                    id={`log-status-${l.id}`}
                    className={`inline-flex px-3 py-1 ml-3 rounded-2xl text-xs font-semibold ${
                      l.status === "Billable"
                        ? "bg-accent-forest/10 text-accent-forest"
                        : "bg-zinc-200 text-zinc-500"
                    }`}
                  >
                    {l.status}
                  </span>
                  <span
                    id={`log-description-${l.id}`}
                    className="text-zinc-500 ml-2"
                  >
                    {l.description}
                  </span>
                </div>
                <button
                  id={`delete-log-${l.id}`}
                  className="absolute right-3 top-3 text-zinc-300 hover:text-red-500 rounded-full"
                  title="Delete"
                  onClick={() => deleteLog(l.id)}
                  aria-label={`Delete log entry for ${l.matter}`}
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
