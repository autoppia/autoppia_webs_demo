"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Timer, PlayCircle, PauseCircle, Plus, Trash2 } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { DEMO_LOGS } from "@/library/dataset";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useProjectData } from "@/shared/universal-loader";
import { useSeed } from "@/context/SeedContext";

const normalizeLog = (log: any, index: number) => ({
  id: log?.id ?? Date.now() + index,
  matter: log?.matter ?? "—",
  client: log?.client ?? "—",
  date: log?.date ?? new Date().toISOString().slice(0, 10),
  hours: typeof log?.hours === "number" ? log.hours : 1,
  description: log?.description ?? "—",
  status: log?.status ?? "Billable",
});

const LoadingNotice = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 text-sm text-zinc-500">
    <span className="h-2 w-2 rounded-full bg-accent-forest animate-ping" />
    <span>{message}</span>
  </div>
);

export default function BillingPage() {
  const { getText, getId } = useDynamicStructure();
  const { v2Seed } = useSeed();
  const { data, isLoading, error } = useProjectData<any>({
    projectKey: "web_5_autocrm",
    entityType: "logs",
    seedValue: v2Seed ?? undefined,
  });
  console.log("[BillingPage] API response", {
    seed: v2Seed ?? null,
    count: data?.length ?? 0,
    isLoading,
    error,
    sample: (data || []).slice(0, 3),
  });
  const normalizedDemo = useMemo(() => DEMO_LOGS.map((l, idx) => normalizeLog(l, idx)), []);
  const normalizedApi = useMemo(() => (data || []).map((l, idx) => normalizeLog(l, idx)), [data]);
  const resolvedLogs = normalizedApi.length > 0 ? normalizedApi : normalizedDemo;
  const [timerActive, setTimerActive] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [manual, setManual] = useState({
    matter: "",
    hours: 0.5,
    description: "",
  });
  const [logs, setLogs] = useState(resolvedLogs);
  useEffect(() => {
    if (isLoading) return;
    setLogs(resolvedLogs);
  }, [resolvedLogs, isLoading]);
  const apiError: string | null = error ?? null;
  const [tab, setTab] = useState("Logs");

  React.useEffect(() => {
    let id: ReturnType<typeof setInterval> | undefined;
    if (timerActive) {
      id = setInterval(() => setTimerSec((s) => s + 1), 1000);
    }
    return () => {
      if (id) clearInterval(id);
    };
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
      setLogs((prev) => [entry, ...prev]);
      logEvent(EVENT_TYPES.NEW_LOG_ADDED, entry);
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
    setLogs((prev) => [entry, ...prev]);
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
        {getText("billing_title")}
      </h1>
      {isLoading && (
        <LoadingNotice message={getText("loading_message") ?? "Loading logs..."} />
      )}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab("Logs")}
          className={`px-5 py-2 rounded-2xl font-semibold text-md ${
            tab === "Logs"
              ? "bg-accent-forest/10 text-accent-forest shadow"
              : "text-zinc-700 hover:bg-zinc-100"
          }`}
          id={getId("logs_tab_button")}
          aria-label={getText("time_entries")}
        >
          {getText("time_entries")}
        </button>
      </div>
      {tab === "Logs" && (
        <div className="flex flex-col md:flex-row gap-12 mb-8">
          <div className="bg-white rounded-2xl shadow-card p-7 flex flex-col gap-6 border border-zinc-100 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-2">
              <Timer className="w-7 h-7 text-accent-forest" />
              <span className="font-bold text-xl">{getText("timer")}</span>
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
                id={getId("timer_toggle_button")}
                className={`rounded-2xl px-5 py-3 font-bold text-lg shadow-sm flex items-center gap-2 transition ${
                  timerActive
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-accent-forest hover:bg-accent-forest/90 text-white"
                }`}
                onClick={timerActive ? stopTimer : startTimer}
                aria-label={timerActive ? getText("stop_timer") : getText("start_timer")}
              >
                {timerActive ? (
                  <>
                    <PauseCircle className="w-6 h-6" />
                    {getText("stop_timer")}
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-6 h-6" />
                    {getText("start_timer")}
                  </>
                )}
              </button>
            </div>
          </div>
            <form
              id={getId("add_log_form")}
              onSubmit={addManual}
              className="bg-white rounded-2xl shadow-card p-7 flex flex-col gap-5 border border-zinc-100 w-full max-w-xl"
            >
              <div className="flex items-center gap-3 mb-1">
                <Plus className="w-6 h-6 text-accent-forest" />
                <span className="font-bold text-lg">{getText("add_time_entry")}</span>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor={getId("manual_matter_input")} className="text-sm font-medium text-zinc-700">
                  {getText("matter_name")}
                </label>
                <input
                  id={getId("manual_matter_input")}
                  className="rounded-xl border border-zinc-200 px-4 py-3 text-md font-medium"
                  value={manual.matter}
                  onChange={(e) =>
                    setManual((m) => ({ ...m, matter: e.target.value }))
                  }
                  placeholder={getText("matter_name")}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor={getId("manual_description_input")} className="text-sm font-medium text-zinc-700">
                  {getText("task_description")}
                </label>
                <input
                  id={getId("manual_description_input")}
                  className="rounded-xl border border-zinc-200 px-4 py-3 text-md font-medium"
                  value={manual.description}
                  onChange={(e) =>
                    setManual((m) => ({ ...m, description: e.target.value }))
                  }
                  placeholder={getText("task_description")}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor={getId("manual_hours_input")} className="text-sm font-medium text-zinc-700">{getText("hours_logged")}</label>
                <input
                  id={getId("manual_hours_input")}
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
                id={getId("add_entry_button")}
                type="submit"
                className="rounded-2xl px-5 py-3 bg-accent-forest text-white font-semibold hover:bg-accent-forest/90 transition text-lg"
                aria-label={getText("add_time_entry")}
              >
                {getText("add_time_entry")}
              </button>
            </form>
        </div>
      )}
      {tab === "Logs" && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-5">{getText("recent_activity")}</h2>
          <div className="flex flex-col gap-4">
            {apiError && (
              <div className="text-red-600 px-4 py-2">Failed to load logs: {apiError}</div>
            )}
            {logs.length === 0 && (
              <div
                id={getId("no_logs_message")}
                data-testid="no-logs-message"
                className="text-zinc-400 px-4 py-8 text-center"
              >
                {getText("no_logs_yet")}
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
                  id={`${getId("delete_log_button")}-${l.id}`}
                  className="absolute right-3 top-3 text-zinc-300 hover:text-red-500 rounded-full"
                  title={getText("delete_button")}
                  onClick={() => deleteLog(l.id)}
                  aria-label={`${getText("delete_button")} ${l.matter}`}
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
