"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { NewEventModal } from "@/components/NewEventModal";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { DynamicButton } from "@/components/DynamicButton";
import { DynamicContainer, DynamicItem } from "@/components/DynamicContainer";
import { DynamicElement } from "@/components/DynamicElement";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useProjectData } from "@/shared/universal-loader";
import { useSeed } from "@/context/SeedContext";
import { initializeEvents } from "@/data/crm-enhanced";

type CalendarEvent = {
  id: number;
  date: string;
  label: string;
  time: string;
  color: keyof typeof COLORS;
};

const COLORS = {
  forest: "bg-accent-forest/20 text-accent-forest border-accent-forest/40",
  indigo: "bg-accent-indigo/20 text-accent-indigo border-accent-indigo/40",
  blue: "bg-blue-100 text-blue-700 border-blue-300",
  zinc: "bg-zinc-200 text-zinc-700 border-zinc-300",
};

const normalizeEvent = (ev: any, index: number): CalendarEvent => ({
  id: ev?.id ?? index + 1,
  date: ev?.date ?? new Date().toISOString().slice(0, 10),
  label: ev?.label ?? "Event",
  time: ev?.time ?? "2:00pm",
  color: (["forest", "indigo", "blue", "zinc"].includes(ev?.color) ? ev.color : "forest") as keyof typeof COLORS,
});

const LoadingNotice = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 text-sm text-zinc-500">
    <span className="h-2 w-2 rounded-full bg-accent-forest animate-ping" />
    <span>{message}</span>
  </div>
);

function getMonthMatrix(year: number, month: number) {
  const matrix = [];
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let d = 1 - firstDayOfWeek;
  for (let week = 0; week < 6; week++) {
    const row = [];
    for (let i = 0; i < 7; i++, d++) {
      const day = d > 0 && d <= daysInMonth ? d : null;
      row.push(day);
    }
    matrix.push(row);
  }
  return matrix;
}

function pad(num: number) {
  return num.toString().padStart(2, "0");
}

export default function CalendarPage() {
  const { getText, getId } = useDynamicStructure();
  const { resolvedSeeds } = useSeed();
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
  const { data, isLoading, error } = useProjectData<any>({
    projectKey: "web_5_autocrm",
    entityType: "events",
    seedValue: v2Seed ?? undefined,
  });
  console.log("[CalendarPage] API response", {
    seed: v2Seed ?? null,
    count: data?.length ?? 0,
    isLoading,
    error,
    sample: (data || []).slice(0, 3),
  });
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().slice(0, 10), [today]);
  const todayTimestamp = useMemo(() => Date.parse(todayStr), [todayStr]);
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [curYear, setCurYear] = useState(today.getFullYear());
  const [openEventDate, setOpenEventDate] = useState<string | null>(null);
  const [showPending, setShowPending] = useState(false);
  const [fallbackEvents, setFallbackEvents] = useState<CalendarEvent[]>([]);
  useEffect(() => {
    initializeEvents().then((rows) =>
      setFallbackEvents(rows.map((ev, idx) => normalizeEvent(ev, idx)))
    );
  }, []);

  const normalizedApi = useMemo(() => (data || []).map((ev, idx) => normalizeEvent(ev, idx)), [data]);
  const resolvedEvents = normalizedApi.length > 0 ? normalizedApi : fallbackEvents;
  const [events, setEvents] = useState<CalendarEvent[]>(resolvedEvents);
  useEffect(() => {
    if (isLoading) return;
    setEvents(resolvedEvents);
  }, [resolvedEvents, isLoading]);
  const apiError: string | null = error ?? null;

  const monthLabel = new Date(curYear, curMonth).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const weeks = useMemo(() => getMonthMatrix(curYear, curMonth), [curYear, curMonth]);
  const getDateStr = (d: number) => `${curYear}-${pad(curMonth + 1)}-${pad(d)}`;
  const pendingEvents = useMemo(
    () =>
      events
        .filter((ev) => Date.parse(ev.date) >= todayTimestamp)
        .sort((a, b) => Date.parse(a.date) - Date.parse(b.date)),
    [events, todayTimestamp]
  );

  const togglePending = () => {
    const next = !showPending;
    setShowPending(next);
    if (next) {
      logEvent(EVENT_TYPES.VIEW_PENDING_EVENTS, {
        total: pendingEvents.length,
        earliest: pendingEvents[0]?.date,
      });
    }
  };

  return (
    <DynamicContainer index={0}>
      <DynamicElement elementType="header" index={0}>
        <h1 className="text-3xl font-extrabold mb-10 tracking-tight">{getText("calendar_title", "Calendar")}</h1>
      </DynamicElement>

      {isLoading && (
        <LoadingNotice message={getText("loading_message", "Loading...") ?? "Loading calendar..."} />
      )}

      <DynamicElement elementType="section" index={1} className="flex items-center gap-2 mb-6">
        <DynamicButton
          eventType="NEW_CALENDAR_EVENT_ADDED"
          index={0}
          className="p-2 rounded-full hover:bg-accent-forest/20"
          id={getId("previous_month_button")}
          aria-label={getText("previous_month", "Previous Month")}
          onClick={() =>
            setCurMonth((m: number) =>
              m === 0 ? (setCurYear((y: number) => y - 1), 11) : m - 1
            )
          }
        >
          <ChevronLeft className="w-5 h-5" />
        </DynamicButton>
        <span className="font-bold text-lg px-4" aria-live="polite">
          {monthLabel}
        </span>
        <DynamicButton
          eventType="NEW_CALENDAR_EVENT_ADDED"
          index={1}
          className="p-2 rounded-full hover:bg-accent-forest/20"
          id={getId("next_month_button")}
          aria-label={getText("next_month", "Next Month")}
          onClick={() =>
            setCurMonth((m) =>
              m === 11 ? (setCurYear((y) => y + 1), 0) : m + 1
            )
          }
        >
          <ChevronRight className="w-5 h-5" />
        </DynamicButton>
      </DynamicElement>

      <DynamicElement elementType="section" index={2} className="w-full mx-auto rounded-2xl overflow-hidden border border-zinc-100 bg-white shadow-card">
        {apiError && (
          <div className="px-6 py-3 text-red-600">Failed to load calendar: {apiError}</div>
        )}
        <div className="grid grid-cols-7 bg-neutral-bg-dark text-zinc-500 text-xs font-semibold uppercase tracking-wider">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              id={`day-header-${d.toLowerCase()}`}
              className="py-3 px-1 text-center whitespace-nowrap"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-zinc-100 bg-white">
          {weeks.flatMap((week, wi) =>
            week.map((d, di) => {
              const dateStr = d ? getDateStr(d) : "";
              const isToday =
                d &&
                curYear === today.getFullYear() &&
                curMonth === today.getMonth() &&
                d === today.getDate();
              const dayEvents = d
                ? events.filter((e: CalendarEvent) => e.date === dateStr)
                : [];
              return (
                <DynamicItem
                  key={wi + "-" + di}
                  index={wi * 7 + di}
                  onClick={() => d && setOpenEventDate(dateStr)}
                  className={`relative border-b border-zinc-100 min-h-[86px] px-2 md:px-3 pt-2 group flex flex-col items-start ${
                    d ? "bg-white" : "bg-neutral-bg-dark"
                  }${isToday ? " ring-2 ring-accent-forest/70 z-10" : ""}`}
                >
                  <div
                    id={d ? `day-number-${dateStr}` : undefined}
                    className={`font-semibold text-zinc-400 text-xs ${
                      isToday && "text-accent-forest"
                    }`}
                  >
                    {d || ""}
                  </div>
                  <div
                    id={d ? `events-container-${dateStr}` : undefined}
                    className="flex flex-col gap-1.5 mt-0.5 w-full"
                  >
                    {dayEvents.map((ev: CalendarEvent) => (
                      <div
                        key={ev.id}
                        className={`border rounded-xl px-2 py-1 w-full text-xs font-medium truncate shadow-sm cursor-pointer ${
                          COLORS[ev.color as keyof typeof COLORS]
                        }`}
                        title={ev.label}
                      >
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" /> {ev.label}
                        </span>
                        <span className="ml-1.5 text-xs text-zinc-400">
                          <Clock className="w-3 h-3 inline" /> {ev.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </DynamicItem>
              );
            })
          )}
        </div>
        {openEventDate && (
          <NewEventModal
            date={openEventDate}
            onClose={() => setOpenEventDate(null)}
            onSave={(newEvent: CalendarEvent) => setEvents((prev) => [...prev, newEvent])}
          />
        )}

        {/* Legend */}
        <div className="bg-neutral-bg-dark border-t border-zinc-100 px-6 py-3 flex flex-wrap items-center gap-4">
          <span className="text-xs font-bold text-zinc-500 mr-3">Legend:</span>
          <span className="inline-flex items-center gap-1 text-xs">
            <span className="w-4 h-4 rounded-xl bg-accent-forest/70 inline-block"></span>{" "}
            Matter/Event
          </span>
          <span className="inline-flex items-center gap-1 text-xs">
            <span className="w-4 h-4 rounded-xl bg-accent-indigo/70 inline-block"></span>{" "}
            Internal
          </span>
          <span className="inline-flex items-center gap-1 text-xs">
            <span className="w-4 h-4 rounded-xl bg-blue-100 inline-block border border-blue-300"></span>{" "}
            Filing
          </span>
          <span className="inline-flex items-center gap-1 text-xs">
            <span className="w-4 h-4 rounded-xl bg-zinc-200 inline-block border border-zinc-300"></span>{" "}
            Other
          </span>
        </div>
      </DynamicElement>

      {pendingEvents.length > 0 && (
        <div className="mt-6 bg-white border border-zinc-100 rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-accent-forest" />
              <h2 className="font-semibold text-lg">{getText("pending_events", "Pending Events")}</h2>
            </div>
            <DynamicButton
              eventType="VIEW_PENDING_EVENTS"
              className="text-sm px-3 py-2 rounded-xl border border-zinc-200 hover:bg-neutral-bg-dark"
              onClick={togglePending}
              id={getId("toggle_pending_events")}
              aria-expanded={showPending}
            >
              {showPending ? getText("hide", "Hide") : getText("view_pending", "View pending")}
            </DynamicButton>
          </div>
          {showPending && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {pendingEvents.map((ev) => (
                <div key={ev.id} className="border border-zinc-100 rounded-xl p-4 flex items-center justify-between bg-neutral-bg-dark">
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-800">{ev.label}</span>
                    <span className="text-xs text-zinc-500">
                      {ev.date} · {ev.time}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${COLORS[ev.color]}`}>
                    {ev.color}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DynamicContainer>
  );
}
