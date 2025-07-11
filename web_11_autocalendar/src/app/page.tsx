"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_TYPES, logEvent } from "@/library/events";
import {
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isToday,
  isSameMonth,
  format,
  subMonths,
  addMonths,
  subYears,
  addYears,
  parseISO,
} from "date-fns";

const daysShort = ["S", "M", "T", "W", "T", "F", "S"];
const weekDaysFull = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const calendarColors = {
  Work: "#FB8C00",
  Family: "#E53935",
};
const INIT_COLORS = [
  "#1E88E5",
  "#43A047",
  "#FDD835",
  "#8E24AA",
  "#2196F3",
  "#00897B",
  "#00ACC1",
  "#F4511E",
];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 30];

interface Event {
  id: string;
  date: string;
  start: number;
  end: number;
  label: string;
  calendar: string;
  color: string;
  startTime: [number, number];
  endTime: [number, number];
}

interface EventModalState {
  open: boolean;
  editing: string | null;
  calendar: string;
  label: string;
  color: string;
  day: number | null;
  start: number | null;
  end: number | null;
  id: string | null;
  startTime: [number, number];
  endTime: [number, number];
  date: string | null;
}

interface RawEvent {
  id?: string;
  date?: string;
  start?: number;
  end?: number;
  label?: string;
  calendar?: string;
  color?: string;
  startTime?: [number, number];
  endTime?: [number, number];
}

interface Calendar {
  name: string;
  enabled: boolean;
  color: string;
}

function usePersistedEvents() {
  const [state, setState] = useState<Event[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem("gocal_events");
      if (!stored) return [];
      const evs = JSON.parse(stored) as RawEvent[];
      const validEvents = evs
        .map((ev) => {
          const start = ev.start ?? 9;
          const end = ev.end ?? 10;
          // Validate and convert startTime/endTime
          const startTime: [number, number] =
            Array.isArray(ev.startTime) && ev.startTime.length === 2
              ? [Math.floor(ev.startTime[0]), ev.startTime[1] === 30 ? 30 : 0]
              : [Math.floor(start), start % 1 === 0.5 ? 30 : 0];
          const endTime: [number, number] =
            Array.isArray(ev.endTime) && ev.endTime.length === 2
              ? [Math.floor(ev.endTime[0]), ev.endTime[1] === 30 ? 30 : 0]
              : [Math.floor(end), end % 1 === 0.5 ? 30 : 0];
          return {
            id: ev.id ?? Math.random().toString(36).slice(2),
            date: ev.date ?? new Date().toISOString().split("T")[0],
            start,
            end,
            label: ev.label ?? "",
            calendar: ev.calendar ?? "Work",
            color: ev.color ?? calendarColors.Work,
            startTime,
            endTime,
          };
        })
        .filter(
          (ev) =>
            Number.isInteger(ev.startTime[0]) && Number.isInteger(ev.endTime[0])
        );
      if (evs.length !== validEvents.length) {
        // Save cleaned events if some were invalid
        window.localStorage.setItem(
          "gocal_events",
          JSON.stringify(validEvents)
        );
      }
      return validEvents;
    } catch (error) {
      console.error("Error parsing localStorage events:", error);
      // Clear corrupted localStorage and return empty array
      window.localStorage.removeItem("gocal_events");
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("gocal_events", JSON.stringify(state));
    }
  }, [state]);

  return [state, setState] as const;
}

const weekDates = [15, 16, 17, 18, 19];
const getDayLabel = (dayIdx: number) =>
  `${weekDaysFull[dayIdx]}, July ${weekDates[dayIdx]}`;
const pad2 = (x: number) => (x < 10 ? `0${x}` : `${x}`);

function formatTime(hhmm: [number, number]) {
  const [h, m] = hhmm;
  const ap = h < 12 ? "am" : "pm";
  const disp = h === 0 ? 12 : h <= 12 ? h : h - 12;
  return `${disp}:${pad2(m)} ${ap}`;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getStartOfWeek(d: Date, startDay = 1) {
  const dt = new Date(d);
  const wd = dt.getDay();
  const diff = (wd - startDay + 7) % 7;
  dt.setDate(dt.getDate() - diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function getWeekDates(d: Date) {
  const s = getStartOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => addDays(s, i));
}

function getMonthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = getStartOfWeek(first, 0);
  const arr: Date[][] = [];
  for (let row = 0; row < 6; ++row) {
    const week: Date[] = [];
    for (let col = 0; col < 7; ++col) {
      week.push(addDays(start, row * 7 + col));
    }
    arr.push(week);
  }
  return arr;
}

function weekRangeLabel(week: Date[]) {
  const start = week[0],
    end = week[week.length - 1];
  if (start.getMonth() === end.getMonth())
    return `${MONTHS[start.getMonth()]} ${start.getDate()} – ${end.getDate()}`;
  return `${MONTHS[start.getMonth()]} ${start.getDate()} – ${
    MONTHS[end.getMonth()]
  } ${end.getDate()}`;
}

export default function Home() {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    const nowInPKT = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Karachi" })
    );
    nowInPKT.setHours(0, 0, 0, 0);
    return nowInPKT;
  });
  const [myCalExpanded, setMyCalExpanded] = useState(true);
  const [viewDropdown, setViewDropdown] = useState(false);
  const [events, setEvents] = usePersistedEvents();
  const [miniCalMonth, setMiniCalMonth] = useState(viewDate.getMonth());
  const [miniCalYear, setMiniCalYear] = useState(viewDate.getFullYear());
  const [addCalOpen, setAddCalOpen] = useState(false);
  const [addCalName, setAddCalName] = useState("");
  const [addCalDesc, setAddCalDesc] = useState("");
  const [addCalColorIdx, setAddCalColorIdx] = useState(0);
  const [myCalendars, setMyCalendars] = useState<Calendar[]>([
    { name: "Work", enabled: true, color: "#2196F3" },
    { name: "Family", enabled: true, color: "#E53935" },
  ]);
  const [eventModal, setEventModal] = useState<EventModalState>({
    open: false,
    editing: null,
    calendar: "Work",
    label: "",
    color: "#2196F3",
    day: null,
    start: null,
    end: null,
    id: null,
    startTime: [9, 0],
    endTime: [10, 0],
    date: null,
  });

  const viewedWeek = useMemo(
    () => getWeekDates(viewDate).slice(1, 6),
    [viewDate]
  );
  const miniCalMatrix = useMemo(
    () => getMonthMatrix(miniCalYear, miniCalMonth),
    [miniCalYear, miniCalMonth]
  );
  const filteredEvents = useMemo(
    () =>
      events.filter((ev) =>
        myCalendars.find((c) => c.name === ev.calendar && c.enabled)
      ),
    [events, myCalendars]
  );

  function usePersistedEvents() {
    const [state, setState] = useState<Event[]>(() => {
      if (typeof window === "undefined") return [];
      try {
        const stored = window.localStorage.getItem("gocal_events");
        if (!stored) return [];
        const evs = JSON.parse(stored) as RawEvent[];
        const validEvents = evs
          .map((ev) => {
            const start = ev.start ?? 9;
            const end = ev.end ?? 10;
            // Validate and convert startTime/endTime
            const startTime: [number, number] =
              Array.isArray(ev.startTime) && ev.startTime.length === 2
                ? [Math.floor(ev.startTime[0]), ev.startTime[1] === 30 ? 30 : 0]
                : [Math.floor(start), start % 1 === 0.5 ? 30 : 0];
            const endTime: [number, number] =
              Array.isArray(ev.endTime) && ev.endTime.length === 2
                ? [Math.floor(ev.endTime[0]), ev.endTime[1] === 30 ? 30 : 0]
                : [Math.floor(end), end % 1 === 0.5 ? 30 : 0];
            return {
              id: ev.id ?? Math.random().toString(36).slice(2),
              date: ev.date ?? new Date().toISOString().split("T")[0],
              start,
              end,
              label: ev.label ?? "",
              calendar: ev.calendar ?? "Work",
              color: ev.color ?? calendarColors.Work,
              startTime,
              endTime,
            };
          })
          .filter(
            (ev) =>
              Number.isInteger(ev.startTime[0]) &&
              Number.isInteger(ev.endTime[0])
          );
        if (evs.length !== validEvents.length) {
          // Save cleaned events if some were invalid
          window.localStorage.setItem(
            "gocal_events",
            JSON.stringify(validEvents)
          );
        }
        return validEvents;
      } catch (error) {
        console.error("Error parsing localStorage events:", error);
        // Clear corrupted localStorage and return empty array
        window.localStorage.removeItem("gocal_events");
        return [];
      }
    });

    useEffect(() => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("gocal_events", JSON.stringify(state));
      }
    }, [state]);

    return [state, setState] as const;
  }

  function openEventModal({
    date,
    start,
    end,
    startMinutes = 0,
    endMinutes = 0,
  }: {
    date: Date; // Explicitly pass the date
    start: number | null;
    end: number | null;
    startMinutes?: number;
    endMinutes?: number;
  }) {
    const startHour = start !== null ? Math.floor(start) : 9;
    const startMins = start !== null && start % 1 === 0.5 ? 30 : startMinutes;
    const endHour = end !== null ? Math.floor(end) : startHour + 1;
    const endMins = end !== null && end % 1 === 0.5 ? 30 : endMinutes;
    setEventModal({
      open: true,
      editing: null,
      calendar: "Work",
      label: "",
      color: myCalendars.find((cal) => cal.name === "Work")?.color ?? "#2196F3",
      day: null, // No longer needed
      start: startHour + startMins / 60,
      end: endHour + endMins / 60,
      startTime: [startHour, startMins],
      endTime: [endHour, endMins],
      id: null,
      date: date.toISOString().split("T")[0], // Use the provided date
    });
  }

  function openEditEventModal(ev: Event) {
    const idx = viewedWeek.findIndex(
      (day) => day.toISOString().split("T")[0] === ev.date
    );
    setEventModal({
      open: true,
      editing: ev.id,
      calendar: ev.calendar,
      label: ev.label,
      color: ev.color,
      day: idx >= 0 ? idx : null,
      start: ev.start,
      end: ev.end,
      startTime: ev.startTime,
      endTime: ev.endTime,
      id: ev.id,
      date: ev.date,
    });
  }

  function handleModalField<K extends keyof EventModalState>(
    field: K,
    val: EventModalState[K]
  ) {
    if (field === "calendar") {
      const calendarValue = val as string;
      const color =
        myCalendars.find((cal) => cal.name === calendarValue)?.color ??
        calendarColors.Work;
      setEventModal((e) => ({ ...e, calendar: calendarValue, color }));
    } else {
      setEventModal((e) => ({ ...e, [field]: val }));
    }
  }

  function onModalClose() {
    setEventModal((e) => ({ ...e, open: false }));
  }

  function handleModalSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    logEvent(EVENT_TYPES.ADD_EVENT, {
      source: "event-modal",
      title: eventModal.label,
      calendar: eventModal.calendar,
      date: eventModal.date,
      startTime: eventModal.startTime,
      endTime: eventModal.endTime,
      color: eventModal.color,
      isEditing: !!eventModal.editing,
    });
    const dstr = eventModal.date ?? viewDate.toISOString().split("T")[0];
    const newEv: Event = {
      id: eventModal.editing ?? Math.random().toString(36).slice(2),
      date: dstr,
      start: eventModal.startTime[0] + eventModal.startTime[1] / 60,
      end: eventModal.endTime[0] + eventModal.endTime[1] / 60,
      label: eventModal.label,
      calendar: eventModal.calendar,
      color: eventModal.color,
      startTime: eventModal.startTime,
      endTime: eventModal.endTime,
    };
    setEvents((evts) => {
      if (eventModal.editing)
        return evts.map((ev) => (ev.id === eventModal.editing ? newEv : ev));
      return [...evts, newEv];
    });
    onModalClose();
  }

  function handleEventDelete() {
    setEvents((evts) => evts.filter((ev) => ev.id !== eventModal.id));
    onModalClose();
  }

  function onWeekHourCellClick(date: Date, hour: number) {
    logEvent(EVENT_TYPES.CELL_CLCIKED, {
      source: `${currentView.toLowerCase()}-view`,
      date: date.toISOString(),
      hour,
      view: currentView,
    });
    openEventModal({
      date,
      start: hour,
      end: hour + 0.5,
      startMinutes: 0,
      endMinutes: 30,
    });
  }

  function onMonthCellClick(date: Date) {
    logEvent(EVENT_TYPES.CELL_CLCIKED, {
      source: "month-view",
      date: date.toISOString(),
      view: "Month",
    });
    openEventModal({
      date,
      start: 9,
      end: 9.5,
      startMinutes: 0,
      endMinutes: 30,
    });
  }

  function handleMiniCalDayClick(d: Date) {
    setViewDate(d);
    setMiniCalMonth(d.getMonth());
    setMiniCalYear(d.getFullYear());
  }

  function handleMiniCalNav(dir: "prev" | "next") {
    const next =
      dir === "next"
        ? addMonths(new Date(miniCalYear, miniCalMonth, 1), 1)
        : subMonths(new Date(miniCalYear, miniCalMonth, 1), 1);
    setMiniCalMonth(next.getMonth());
    setMiniCalYear(next.getFullYear());
  }

  function handleSetToday() {
    const today = new Date();
    const todayInPKT = new Date(
      today.toLocaleString("en-US", { timeZone: "Asia/Karachi" })
    );
    todayInPKT.setHours(0, 0, 0, 0);
    setViewDate(todayInPKT);
    setMiniCalMonth(todayInPKT.getMonth());
    setMiniCalYear(todayInPKT.getFullYear());
    logEvent(EVENT_TYPES.SELECT_TODAY, {
      source: "mini-calendar",
      selectedDate: todayInPKT.toISOString(),
    });
  }

  function handleWeekNav(dir: "prev" | "next") {
    const next = addDays(viewDate, dir === "next" ? 7 : -7);
    setViewDate(next);
    setMiniCalMonth(next.getMonth());
    setMiniCalYear(next.getFullYear());
  }

  const VIEW_OPTIONS = ["Day", "5 days", "Week", "Month"];
  const [currentView, setCurrentView] = useState("5 days");

  const mainGridDates = useMemo(() => {
    if (currentView === "Day") return [viewDate];
    if (currentView === "5 days") return getWeekDates(viewDate).slice(1, 6);
    if (currentView === "Week") return getWeekDates(viewDate);
    return getMonthMatrix(viewDate.getFullYear(), viewDate.getMonth()).flat();
  }, [currentView, viewDate]);

  const topLabel = useMemo(() => {
    if (currentView === "Day")
      return `${DAYS[viewDate.getDay()]}, ${
        MONTHS[viewDate.getMonth()]
      } ${viewDate.getDate()}`;
    if (currentView === "5 days" || currentView === "Week")
      return weekRangeLabel(mainGridDates);
    return `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
  }, [currentView, viewDate, mainGridDates]);

  return (
    <main className="flex min-h-screen w-full bg-[#fbfafa] text-[#382f3f]">
      <aside className="w-[260px] bg-white border-r border-[#e5e5e5] flex flex-col pt-0 pb-2 px-0 shadow z-10 min-h-screen select-none">
        <div className="flex items-center justify-center gap-1 h-[64px]">
          <div className="bg-[#1976d2] px-14 py-6 rounded flex items-center h-9">
            <span className="font-bold text-white text-lg">AutoCalendar</span>
          </div>
        </div>
        <div className="flex flex-row items-center px-4 mt-2 mb-4">
          <button
            className="bg-white shadow-md rounded-2xl h-[44px] w-full flex items-center px-4 font-semibold text-[#383e4d] text-base gap-3 border border-[#ececec] hover:shadow-lg transition"
            onClick={() =>
              openEventModal({
                date: viewDate,
                start: 9,
                end: 9.5,
                startMinutes: 0,
                endMinutes: 30,
              })
            }
            aria-label="Create new event"
          >
            <span className="text-[#1976d2] flex items-center">
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="#1976d2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            <span className="ml-0.5">Create</span>
            <svg
              className="ml-auto"
              width="20"
              height="20"
              fill="none"
              stroke="#222"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-0 mb-0 mt-10">
          <div className="flex w-full justify-between text-[14px] items-center mb-1 mt-1 font-medium">
            <button
              onClick={() => setMiniCalYear((y) => y - 1)}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
              aria-label="Previous year"
            >
              «
            </button>
            <button
              onClick={() => handleMiniCalNav("prev")}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="mx-2">
              {MONTHS[miniCalMonth]} {miniCalYear}
            </span>
            <button
              onClick={() => handleMiniCalNav("next")}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
              aria-label="Next month"
            >
              ›
            </button>
            <button
              onClick={() => setMiniCalYear((y) => y + 1)}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
              aria-label="Next year"
            >
              »
            </button>
          </div>
          <div className="grid grid-cols-7 text-xs text-center text-gray-400 mb-1">
            {DAYS.map((d) => (
              <span key={d} className="py-[2px]">
                {d.slice(0, 1)}
              </span>
            ))}
          </div>
          <div>
            {miniCalMatrix.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 mb-0.5">
                {week.map((d, di) => {
                  const isSel = isSameDay(d, viewDate);
                  const isTod = isToday(d);
                  const inMonth = d.getMonth() === miniCalMonth;
                  return (
                    <button
                      key={di}
                      onClick={() => handleMiniCalDayClick(d)}
                      className={`h-7 w-7 mx-auto flex items-center justify-center rounded-full text-base select-none border-none
                        ${
                          isSel
                            ? "bg-[#1976d2] text-white"
                            : isTod
                            ? "bg-blue-200 text-blue-900 font-bold"
                            : inMonth
                            ? "text-[#383e4d] hover:bg-gray-100"
                            : "text-gray-300"
                        }`}
                      aria-label={`Select ${format(d, "MMMM d, yyyy")}`}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col px-4 mt-10">
          <button
            onClick={() => setMyCalExpanded((v) => !v)}
            className="flex items-center text-[15px] font-bold text-[#383e4d] mb-1 gap-1 group"
            aria-expanded={myCalExpanded}
            aria-label="Toggle my calendars"
          >
            <span>My calendars</span>
            <svg
              className={`transition ${
                myCalExpanded ? "rotate-0" : "-rotate-90"
              }`}
              width="18"
              height="18"
              fill="none"
              stroke="#383e4d"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {myCalExpanded && (
            <div className="flex flex-col gap-2 pl-1 mt-2">
              {myCalendars.map((cal, idx) => (
                <label
                  key={cal.name}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={cal.enabled}
                    onChange={() => {
                      logEvent(EVENT_TYPES.CHOOSE_CALENDAR, {
                        calendarName: cal.name,
                        selected: !cal.enabled,
                        color: cal.color,
                      });
                      setMyCalendars((cals) =>
                        cals.map((c, i) =>
                          i === idx ? { ...c, enabled: !c.enabled } : c
                        )
                      );
                    }}
                    className="appearance-none w-4 h-4 rounded-sm cursor-pointer border-2"
                    style={{
                      borderColor: cal.color,
                      background: cal.enabled ? cal.color : "#fff",
                    }}
                    aria-label={`Toggle ${cal.name} calendar`}
                  />
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ background: cal.color }}
                  />
                  {cal.name}
                </label>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 mt-4 mb-1">
            <span className="text-[15px] text-[#2d2d36] font-medium select-none">
              Add new calendar
            </span>
            <button
              onClick={() => {
                logEvent(EVENT_TYPES.ADD_NEW_CALENDAR, {
                  source: "calendar-sidebar",
                  action: "open_add_calendar_modal",
                });
                setAddCalOpen(true);
              }}
              type="button"
              aria-label="Add new calendar"
              className="flex items-center justify-center p-0 w-6 h-6 rounded-full border-[#222] text-[#222] hover:bg-gray-100 transition"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="#222"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
          </div>

          <Dialog open={addCalOpen} onOpenChange={setAddCalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-[#1b1a1a] font-normal text-xl mb-2">
                  Create new calendar
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (addCalName.trim()) {
                    const color =
                      INIT_COLORS[
                        (myCalendars.length + addCalColorIdx) %
                          INIT_COLORS.length
                      ];
                    logEvent(EVENT_TYPES.CREATE_CALENDAR, {
                      name: addCalName,
                      description: addCalDesc,
                      color,
                    });
                    setMyCalendars((cals) => [
                      ...cals,
                      { name: addCalName, enabled: true, color },
                    ]);
                    setAddCalColorIdx((idx) => idx + 1);
                    setAddCalName("");
                    setAddCalDesc("");
                    setAddCalOpen(false);
                  }
                }}
                className="flex flex-col gap-4"
              >
                <Input
                  placeholder="Name"
                  required
                  value={addCalName}
                  onChange={(e) => setAddCalName(e.target.value)}
                  className="bg-[#eee] border-none text-base py-2"
                />
                <Textarea
                  placeholder="Description"
                  value={addCalDesc}
                  onChange={(e) => setAddCalDesc(e.target.value)}
                  className="bg-[#eee] border-none min-h-[90px] text-base py-2"
                />
                <div>
                  <span className="text-xs text-gray-400">Owner</span>
                  <br />
                  <span className="text-sm mt-0.5 font-medium">
                    Tomas Abraham
                  </span>
                </div>
                <Button
                  className="mt-1 bg-[#1976d2] hover:bg-[#1660b2] px-6 py-2"
                  type="submit"
                >
                  Create calendar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </aside>
      <section className="flex-1 flex flex-col h-screen overflow-hidden">
        <nav className="w-full flex items-center justify-between h-[64px] px-6 border-b border-[#e5e5e5] bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2 min-w-[340px]">
            <button
              className="border border-[#e5e5e5] bg-white rounded px-3 h-9 text-[15px] font-medium shadow-sm hover:bg-[#f5f5f5]"
              onClick={handleSetToday}
              aria-label="Go to today"
            >
              Today
            </button>
            <button
              className="rounded-full hover:bg-gray-100 p-4 text-3xl text-black"
              onClick={() => handleWeekNav("prev")}
              aria-label="Previous week"
            >
              ‹
            </button>
            <button
              className="rounded-full hover:bg-gray-100 p-4 text-3xl text-black"
              onClick={() => handleWeekNav("next")}
              aria-label="Next week"
            >
              ›
            </button>
            <span className="text-[22px] font-normal ml-3">{topLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setViewDropdown((v) => !v)}
                className="border border-[#e5e5e5] bg-white rounded px-3 h-9 text-[15px] min-w-[68px] font-normal text-[#383e4d] shadow-sm hover:bg-[#f5f5f5] flex items-center gap-1"
                aria-expanded={viewDropdown}
                aria-label="Select calendar view"
              >
                {currentView}
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="#444"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {viewDropdown && (
                <div className="absolute mt-1 right-0 z-50 bg-white shadow-lg border border-[#e5e5e5] rounded min-w-[130px]">
                  {VIEW_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        logEvent(
                          {
                            Day: EVENT_TYPES.SELECT_DAY,
                            "5 days": EVENT_TYPES.SELECT_FIVE_DAYS,
                            Week: EVENT_TYPES.SELECT_WEEK,
                            Month: EVENT_TYPES.SELECT_MONTH,
                          }[opt],
                          {
                            source: "calendar-view-dropdown",
                            selectedView: opt,
                          }
                        );
                        setCurrentView(opt);
                        setViewDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-[#f3f7fa] text-[15px] ${
                        opt === currentView ? "font-semibold bg-[#f3f7fa]" : ""
                      }`}
                      aria-label={`Select ${opt} view`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="rounded-full hover:ring-2 hover:ring-blue-200 ml-1"
              aria-label="User profile"
            >
              <Image
                src="https://ui-avatars.com/api/?name=John+Doe&background=random&size=128"
                alt="Profile picture"
                width={36}
                height={36}
                className="rounded-full object-cover border border-[#dedede]"
              />
            </button>
          </div>
        </nav>
        <div
          className="flex-1 w-full overflow-auto relative bg-white select-none"
          style={{ minHeight: "500px" }}
        >
          {currentView === "Month" && (
            <div className="w-full">
              <div className="grid grid-cols-7 border-b border-[#e5e5e5] bg-white sticky top-0">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className="py-2 px-1 text-center text-xs font-semibold text-gray-500"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div>
                {[...Array(6)].map((_, rowIdx) => (
                  <div
                    key={rowIdx}
                    className="grid grid-cols-7 h-[90px] border-b border-[#e5e5e5]"
                  >
                    {[...Array(7)].map((_, colIdx) => {
                      const idx = rowIdx * 7 + colIdx;
                      const d = mainGridDates[idx];
                      const isOut = d.getMonth() !== viewDate.getMonth();
                      const isTod = isToday(d);
                      const evs = filteredEvents.filter(
                        (ev) => ev.date === d.toISOString().split("T")[0]
                      );
                      return (
                        <div
                          key={colIdx}
                          onClick={() => onMonthCellClick(d)}
                          className={`border-r border-[#e5e5e5] relative px-1 pt-1 h-full align-top cursor-pointer ${
                            isOut ? "bg-[#ededed]" : ""
                          }`}
                          style={{
                            color: isOut ? "#bdbdbd" : "#222",
                            fontSize: "17px",
                          }}
                          role="button"
                          aria-label={`Select ${format(d, "MMMM d, yyyy")}`}
                        >
                          <div
                            className={`absolute left-1.5 top-1 text-center ${
                              isTod
                                ? "text-white bg-[#1976d2] rounded-full w-6 h-6 flex items-center justify-center font-bold"
                                : ""
                            }`}
                            style={{
                              fontSize: "1rem",
                              background: isTod ? "#1976d2" : "none",
                            }}
                          >
                            {d.getDate() < 10 ? `0${d.getDate()}` : d.getDate()}
                          </div>
                          <div className="mt-7 flex flex-col gap-0.5">
                            {evs.slice(0, 3).map((ev) => (
                              <button
                                key={ev.id}
                                style={{
                                  background: ev.color,
                                  color: "#fff",
                                  fontSize: "11px",
                                }}
                                className="rounded px-2 py-0.5 text-xs block cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditEventModal(ev);
                                }}
                                aria-label={`Edit event: ${ev.label}`}
                              >
                                {ev.label}
                              </button>
                            ))}
                            {evs.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{evs.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
          {(currentView === "Week" ||
            currentView === "5 days" ||
            currentView === "Day") && (
            <>
              <div className="flex w-full bg-white border-b border-[#e5e5e5] sticky top-0 min-w-[550px]">
                <div className="w-14 flex-shrink-0" />
                {mainGridDates.map((d) => (
                  <div
                    key={d.toISOString()}
                    className="flex-1 px-2 text-center border-r border-[#e5e5e5] pt-3 pb-2"
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {DAYS[d.getDay()]}
                    </div>
                    <div className="text-[22px] font-normal">{d.getDate()}</div>
                  </div>
                ))}
              </div>
              <div className="flex w-full min-w-[550px]">
                <div className="w-14 flex flex-col items-end pt-2 flex-shrink-0 select-none">
                  {HOURS.map((hr) => (
                    <div
                      key={hr}
                      className="h-14 text-xs text-gray-400 w-12 pr-1"
                    >
                      {hr === 0
                        ? "12 AM"
                        : hr < 12
                        ? `${hr} AM`
                        : hr === 12
                        ? "12 PM"
                        : `${hr - 12} PM`}
                    </div>
                  ))}
                </div>
                {mainGridDates.map((d, dayIdx) => (
                  <div
                    key={d.toISOString()}
                    className="flex-1 flex flex-col border-r border-[#e5e5e5] last:border-none relative"
                  >
                    {HOURS.map((hrIdx) => (
                      <div
                        key={`cell-${dayIdx}-${hrIdx}`}
                        className="h-14 border-b border-[#ededed] bg-white cursor-pointer"
                        onClick={() => onWeekHourCellClick(d, hrIdx)}
                        role="button"
                        aria-label={`Add event on ${format(
                          d,
                          "MMMM d, yyyy"
                        )} at ${hrIdx}:00`}
                      />
                    ))}
                    {filteredEvents
                      .filter((ev) => ev.date === d.toISOString().split("T")[0])
                      .map((ev) => {
                        // Debugging log to verify endTime values
                        console.log(
                          `Event ${ev.label}: startTime=${ev.startTime}, endTime=${ev.endTime}`
                        );
                        return (
                          <button
                            key={ev.id}
                            className="absolute left-0 right-0 ml-2 mr-2 rounded px-1 py-0.5 text-xs text-white font-medium shadow"
                            style={{
                              top: `${ev.start * 56 + 24}px`,
                              height: `${(ev.end - ev.start) * 56 - 4}px`,
                              background: ev.color,
                              zIndex: 2,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditEventModal(ev);
                            }}
                            aria-label={`Edit event: ${
                              ev.label
                            } from ${formatTime(ev.startTime)} to ${formatTime(
                              ev.endTime
                            )}`}
                          >
                            {ev.label} ({formatTime(ev.startTime)} -{" "}
                            {formatTime(ev.endTime)})
                          </button>
                        );
                      })}
                  </div>
                ))}
              </div>
              <div className="flex w-full min-w-[550px]">
                <div className="w-14 flex flex-col items-end pt-2 flex-shrink-0 select-none">
                  {HOURS.map((hr) => (
                    <div
                      key={hr}
                      className="h-14 text-xs text-gray-400 w-12 pr-1"
                    >
                      {hr === 0
                        ? "12 AM"
                        : hr < 12
                        ? `${hr} AM`
                        : hr === 12
                        ? "12 PM"
                        : `${hr - 12} PM`}
                    </div>
                  ))}
                </div>
                {mainGridDates.map((d, dayIdx) => (
                  <div
                    key={d.toISOString()}
                    className="flex-1 flex flex-col border-r border-[#e5e5e5] last:border-none relative"
                  >
                    {HOURS.map((hrIdx) => (
                      <div
                        key={`cell-${dayIdx}-${hrIdx}`}
                        className="h-14 border-b border-[#ededed] bg-white cursor-pointer"
                        onClick={() => onWeekHourCellClick(d, hrIdx)}
                        role="button"
                        aria-label={`Add event on ${format(
                          d,
                          "MMMM d, yyyy"
                        )} at ${hrIdx}:00`}
                      />
                    ))}
                    {filteredEvents
                      .filter((ev) => ev.date === d.toISOString().split("T")[0])
                      .map((ev) => (
                        <button
                          key={ev.id}
                          className="absolute left-0 right-0 ml-2 mr-2 rounded px-1 py-0.5 text-xs text-white font-medium shadow"
                          style={{
                            top: `${ev.start * 56 + 24}px`,
                            height: `${(ev.end - ev.start) * 56 - 4}px`,
                            background: ev.color,
                            zIndex: 2,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditEventModal(ev);
                          }}
                          aria-label={`Edit event: ${
                            ev.label
                          } from ${formatTime(ev.startTime)} to ${formatTime(
                            ev.endTime
                          )}`}
                        >
                          {ev.label} ({formatTime(ev.startTime)} -{" "}
                          {formatTime(ev.endTime)})
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      <Dialog open={eventModal.open} onOpenChange={onModalClose}>
        <DialogContent className="max-w-xl">
          <form onSubmit={handleModalSave} className="space-y-5">
            <DialogHeader>
              <DialogTitle>
                {eventModal.editing ? "Edit event" : "Add event"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col mb-2">
              <Label htmlFor="calendar-select">Calendar</Label>
              <select
                id="calendar-select"
                className="px-3 py-2 border rounded w-full mt-1"
                value={eventModal.calendar}
                onChange={(e) => handleModalField("calendar", e.target.value)}
                required
              >
                {myCalendars.map((cal) => (
                  <option key={cal.name} value={cal.name}>
                    {cal.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={eventModal.label}
                onChange={(e) => handleModalField("label", e.target.value)}
                required
                autoFocus
                maxLength={80}
                aria-required="true"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="start-time-hour">Start Time</Label>
                <div className="flex gap-2 mt-1">
                  <select
                    id="start-time-hour"
                    className="px-3 py-2 border rounded w-full"
                    value={eventModal.startTime[0]}
                    onChange={(e) =>
                      handleModalField("startTime", [
                        parseInt(e.target.value),
                        eventModal.startTime[1],
                      ])
                    }
                    aria-label="Start time hour"
                  >
                    {HOURS.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour === 0
                          ? "12 AM"
                          : hour < 12
                          ? `${hour} AM`
                          : hour === 12
                          ? "12 PM"
                          : `${hour - 12} PM`}
                      </option>
                    ))}
                  </select>
                  <select
                    className="px-3 py-2 border rounded w-20"
                    value={eventModal.startTime[1]}
                    onChange={(e) =>
                      handleModalField("startTime", [
                        eventModal.startTime[0],
                        parseInt(e.target.value),
                      ])
                    }
                    aria-label="Start time minute"
                  >
                    {MINUTES.map((minute) => (
                      <option key={minute} value={minute}>
                        {pad2(minute)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="end-time-hour">End Time</Label>
                <div className="flex gap-2 mt-1">
                  <select
                    id="end-time-hour"
                    className="px-3 py-2 border rounded w-full"
                    value={eventModal.endTime[0]}
                    onChange={(e) =>
                      handleModalField("endTime", [
                        parseInt(e.target.value),
                        eventModal.endTime[1],
                      ])
                    }
                    aria-label="End time hour"
                  >
                    {HOURS.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour === 0
                          ? "12 AM"
                          : hour < 12
                          ? `${hour} AM`
                          : hour === 12
                          ? "12 PM"
                          : `${hour - 12} PM`}
                      </option>
                    ))}
                  </select>
                  <select
                    className="px-3 py-2 border rounded w-20"
                    value={eventModal.endTime[1]}
                    onChange={(e) =>
                      handleModalField("endTime", [
                        eventModal.endTime[0],
                        parseInt(e.target.value),
                      ])
                    }
                    aria-label="End time minute"
                  >
                    {MINUTES.map((minute) => (
                      <option key={minute} value={minute}>
                        {pad2(minute)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-1 font-medium text-sm">
                {eventModal.date
                  ? format(parseISO(eventModal.date), "EEE, MMMM d")
                  : format(viewDate, "EEE, MMMM d")}
                , {formatTime(eventModal.startTime)} –{" "}
                {formatTime(eventModal.endTime)}
              </div>
            </div>
            <DialogFooter>
              <Button variant="default" type="submit">
                Save
              </Button>
              {eventModal.editing && (
                <Button
                  variant="destructive"
                  type="button"
                  onClick={handleEventDelete}
                >
                  Delete
                </Button>
              )}
              <DialogClose asChild>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    logEvent(EVENT_TYPES.CANCEL_ADD_EVENT, {
                      source: "event-modal",
                      date: eventModal.date,
                      reason: "User clicked cancel button",
                      title: eventModal.label,
                    });
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
