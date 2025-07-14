"use client";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { NewEventModal } from "@/components/NewEventModal";
import { CalendarEvent, COLORS, EVENTS } from "@/library/dataset";


function getMonthMatrix(year: number, month: number) {
  // returns [[date, ...], ...weeks] covering 6 weeks
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
  const today = new Date();
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [curYear, setCurYear] = useState(today.getFullYear());
  const [openEventDate, setOpenEventDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(EVENTS);

  const monthLabel = new Date(curYear, curMonth).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const weeks = getMonthMatrix(curYear, curMonth);
  const getDateStr = (d: number) => `${curYear}-${pad(curMonth + 1)}-${pad(d)}`;
  return (
    <section>
      <h1 className="text-3xl font-extrabold mb-10 tracking-tight">Calendar</h1>
      <div className="flex items-center gap-2 mb-6">
        <button
          className="p-2 rounded-full hover:bg-accent-forest/20"
          aria-label="Previous Month"
          onClick={() =>
            setCurMonth((m) =>
              m === 0 ? (setCurYear((y) => y - 1), 11) : m - 1
            )
          }
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-lg px-4" aria-live="polite">
          {monthLabel}
        </span>
        <button
          className="p-2 rounded-full hover:bg-accent-forest/20"
          aria-label="Next Month"
          onClick={() =>
            setCurMonth((m) =>
              m === 11 ? (setCurYear((y) => y + 1), 0) : m + 1
            )
          }
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="w-full mx-auto rounded-2xl overflow-hidden border border-zinc-100 bg-white shadow-card">
        <div className="grid grid-cols-7 bg-neutral-bg-dark text-zinc-500 text-xs font-semibold uppercase tracking-wider">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-3 px-1 text-center whitespace-nowrap">
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
                ? events.filter((e) => e.date === dateStr)
                : [];
              return (
                <div
                  key={wi + "-" + di}
                  onClick={() => d && setOpenEventDate(dateStr)}
                  className={`relative border-b border-zinc-100 min-h-[86px] px-2 md:px-3 pt-2 group flex flex-col items-start ${
                    d ? "bg-white" : "bg-neutral-bg-dark"
                  }${isToday ? " ring-2 ring-accent-forest/70 z-10" : ""}`}
                >
                  <div
                    className={`font-semibold text-zinc-400 text-xs ${
                      isToday && "text-accent-forest"
                    }`}
                  >
                    {d || ""}
                  </div>
                  <div className="flex flex-col gap-1.5 mt-0.5 w-full">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className={`border rounded-xl px-2 py-1 w-full text-xs font-medium truncate shadow-sm cursor-pointer ${
                          COLORS[ev.color]
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
                </div>
              );
            })
          )}
        </div>
        {openEventDate && (
          <NewEventModal
            date={openEventDate}
            onClose={() => setOpenEventDate(null)}
            onSave={(newEvent) => setEvents((prev) => [...prev, newEvent])}
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
      </div>
    </section>
  );
}
