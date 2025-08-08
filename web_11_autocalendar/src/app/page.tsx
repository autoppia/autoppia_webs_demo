"use client";
import React from "react";
import Image from "next/image";
import { useState, useRef } from "react";
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
const HOURS = Array.from({ length: 17 }, (_, i) => i);

interface Event {
  id: string;
  date: string;
  start: number;
  end: number;
  label: string;
  calendar: string;
  color: string;
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
  date: string | null; // Added date property
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

function usePersistedEvents() {
  const [state, setState] = useState<Event[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem("gocal_events");
        if (!stored) return [];
        const evs = JSON.parse(stored);
        return evs.map((ev: RawEvent) => ({
          id: ev.id ?? Math.random().toString(36).slice(2),
          date: ev.date ?? new Date().toISOString().split("T")[0],
          start: ev.start ?? 9,
          end: ev.end ?? 10,
          label: ev.label ?? "",
          calendar: ev.calendar ?? "Work",
          color: ev.color ?? calendarColors.Work,
          startTime: Array.isArray(ev.startTime)
            ? ev.startTime
            : [ev.start || 9, 0],
          endTime: Array.isArray(ev.endTime) ? ev.endTime : [ev.end || 10, 0],
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  React.useEffect(() => {
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
function formatTime(hhmm: [number, number] | number) {
  const arr = Array.isArray(hhmm)
    ? hhmm
    : typeof hhmm === "number"
    ? [hhmm, 0]
    : [0, 0];
  const [h, m] = arr;
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
  else
    return `${MONTHS[start.getMonth()]} ${start.getDate()} – ${
      MONTHS[end.getMonth()]
    } ${end.getDate()}`;
}

export default function Home() {
  const [selectedDay, setSelectedDay] = useState(18);
  const [myCalExpanded, setMyCalExpanded] = useState(true);
  const [viewDropdown, setViewDropdown] = useState(false);
  const [events, setEvents] = usePersistedEvents();
  const [draftEv, setDraftEv] = useState(null);
  const dragAnchor = useRef(null);
  const todayCol = 3,
    nowHour = 11;
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const viewedWeek = getWeekDates(viewDate).slice(1, 6);
  const [miniCalMonth, setMiniCalMonth] = useState(() => viewDate.getMonth());
  const [miniCalYear, setMiniCalYear] = useState(() => viewDate.getFullYear());
  const miniCalMatrix = getMonthMatrix(miniCalYear, miniCalMonth);
  const [addCalOpen, setAddCalOpen] = useState(false);
  const [addCalName, setAddCalName] = useState("");
  const [addCalDesc, setAddCalDesc] = useState("");
  const [myCalendars, setMyCalendars] = useState([
    { name: "Work", enabled: true, color: "#2196F3" },
    { name: "Family", enabled: true, color: "#E53935" },
  ]);
  const [addCalColorIdx, setAddCalColorIdx] = useState(0);

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

  function openEventModal({
    day,
    start,
    end,
  }: {
    day: number | null;
    start: number | null;
    end: number | null;
  }) {
    const baseDay = day !== null ? viewedWeek[day] : viewDate;
    setEventModal({
      open: true,
      editing: null,
      calendar: "Work",
      label: "",
      color: "#2196F3",
      day,
      start,
      end,
      startTime: [start ?? 9, 0],
      endTime: [end ?? 10, 0],
      id: null,
      date: baseDay.toISOString().split("T")[0],
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
      startTime: [ev.start ?? 9, 0],
      endTime: [ev.end ?? 10, 0],
      id: ev.id,
      date: ev.date,
    });
  }
  function handleModalField<K extends keyof EventModalState>(
    field: K,
    val: EventModalState[K]
  ) {
    if (field === "calendar") {
      const calendarValue = val as string; // Type assertion: val is string when field is 'calendar'
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

  function handleModalSave(e: React.FormEvent) {
    e.preventDefault();
    const dstr = eventModal.date ?? viewDate.toISOString().split("T")[0];
    const newEv: Event = {
      id: eventModal.editing ?? Math.random().toString(36).slice(2),
      date: dstr,
      start: eventModal.startTime[0],
      end: eventModal.endTime[0],
      label: eventModal.label,
      calendar: eventModal.calendar,
      color: eventModal.color,
    };
    setEvents((evts) => {
      if (eventModal.editing)
        return evts.map((ev) => (ev.id === eventModal.editing ? newEv : ev));
      else return [...evts, newEv];
    });
    setEventModal((e) => ({ ...e, open: false }));
  }

  function handleEventDelete() {
    setEvents((evts) => evts.filter((ev) => ev.id !== eventModal.id));
    setEventModal((e) => ({ ...e, open: false }));
  }

  function onGridMouseDown(e: React.MouseEvent, dayIdx: number, hrIdx: number) {
    openEventModal({ day: dayIdx, start: hrIdx, end: hrIdx + 1 });
  }

  function onGridMouseEnter(
    e: React.MouseEvent,
    dayIdx: number,
    hrIdx: number
  ) {}

  function onGridMouseUp(e: React.MouseEvent) {
    dragAnchor.current = null;
  }

  const VIEW_OPTIONS = ["Day", "5 days", "Week", "Month"];
  const [currentView, setCurrentView] = useState("5 days");

  function getMainGridDates(view: string) {
    if (view === "Day") {
      return [viewDate];
    }
    if (view === "5 days") {
      return getWeekDates(viewDate).slice(1, 6);
    }
    if (view === "Week") {
      return getWeekDates(viewDate);
    }
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const matrix = getMonthMatrix(viewDate.getFullYear(), viewDate.getMonth());
    return matrix.flat();
  }

  const mainGridDates = getMainGridDates(currentView);

  let topLabel = "";
  if (currentView === "Day")
    topLabel = `${DAYS[viewDate.getDay()]}, ${
      MONTHS[viewDate.getMonth()]
    } ${viewDate.getDate()}`;
  else if (currentView === "5 days" || currentView === "Week")
    topLabel = weekRangeLabel(getMainGridDates(currentView));
  else if (currentView === "Month")
    topLabel = `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

  function onMonthCellClick(date: Date) {
    setEventModal({
      open: true,
      editing: null,
      calendar: "Work",
      label: "",
      color: "#2196F3",
      day: null,
      start: 9,
      end: 10,
      startTime: [9, 0],
      endTime: [10, 0],
      id: null,
      date: date.toISOString().split("T")[0],
    });
  }

  function onWeekHourCellClick(date: Date, hour: number) {
    setEventModal({
      open: true,
      editing: null,
      calendar: "Work",
      label: "",
      color: "#2196F3",
      day: null,
      start: hour,
      end: hour + 1,
      startTime: [hour, 0],
      endTime: [hour + 1, 0],
      id: null,
      date: date.toISOString().split("T")[0],
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

  const filteredEvents = events.filter((ev) =>
    myCalendars.find((c) => c.name === ev.calendar && c.enabled)
  );

  function handleSetToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setViewDate(today);
    setMiniCalMonth(today.getMonth());
    setMiniCalYear(today.getFullYear());
  }

  function handleWeekNav(dir: "prev" | "next") {
    const next = addDays(viewDate, dir === "next" ? 7 : -7);
    setViewDate(next);
    setMiniCalMonth(next.getMonth());
    setMiniCalYear(next.getFullYear());
  }

  return (
    <main className="flex min-h-screen w-full bg-[#fbfafa] text-[#382f3f]">
      <aside className="w-[260px] bg-white border-r border-[#e5e5e5] flex flex-col pt-0 pb-2 px-0 shadow z-10 min-h-screen select-none relative">
        <div className="flex items-center justify-center gap-1 h-[64px] pt-0">
          <div className="bg-[#6573af] px-5 py-5 rounded flex items-center h-9">
            <span className="font-bold text-white text-lg">AutoCalendar</span>
          </div>
        </div>
        <div className="flex flex-row items-center px-4 mt-2 mb-4">
          <button className="bg-white shadow-md rounded-2xl h-[44px] w-full flex items-center px-4 font-semibold text-[#383e4d] text-base gap-3 border border-[#ececec] hover:shadow-lg transition">
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
            >
              «
            </button>
            <button
              onClick={() => handleMiniCalNav("prev")}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
            >
              ‹
            </button>
            <span className="mx-2">
              {MONTHS[miniCalMonth]} {miniCalYear}
            </span>
            <button
              onClick={() => handleMiniCalNav("next")}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
            >
              ›
            </button>
            <button
              onClick={() => setMiniCalYear((y) => y + 1)}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
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
          >
            <span>My calendars</span>
            <svg
              className={`transition ml-1 ${
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
                  <span
                    className="w-4 h-4 rounded-sm border-2 flex items-center justify-center mr-1 transition-colors"
                    style={{
                      borderColor: cal.color,
                      background: cal.enabled ? cal.color : "#fff",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={cal.enabled}
                      onChange={() =>
                        setMyCalendars((cals) =>
                          cals.map((c, i) =>
                            i === idx ? { ...c, enabled: !c.enabled } : c
                          )
                        )
                      }
                      className="appearance-none w-3 h-3 rounded-sm cursor-pointer"
                      style={{
                        background: cal.enabled ? cal.color : "#fff",
                        border: "none",
                      }}
                    />
                  </span>
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
              onClick={() => setAddCalOpen(true)}
              type="button"
              tabIndex={0}
              aria-label="Add calendar"
              className="flex items-center justify-center p-0 w-6 h-6 rounded-full  border-[#222] text-[#222] hover:bg-gray-100 transition mr-2"
            >
              <svg
                width="30"
                height="30"
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
            >
              Today
            </button>
            <button
              className="rounded-full hover:bg-gray-100 p-4 text-3xl ml-2 text-black"
              onClick={() => handleWeekNav("prev")}
            >
              ‹
            </button>
            <button
              className="rounded-full hover:bg-gray-100 p-4 text-3xl text-black"
              onClick={() => handleWeekNav("next")}
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
                      onClick={() => {
                        setCurrentView(opt);
                        setViewDropdown(false);
                      }}
                      key={opt}
                      className={`w-full text-left px-4 py-2 hover:bg-[#f3f7fa] text-[15px] z-50 ${
                        opt === currentView ? "font-semibold bg-[#f3f7fa]" : ""
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="rounded-full hover:ring-2 hover:ring-blue-200 ml-1">
              <img
                src="https://ui-avatars.com/api/?name=John+Doe&background=random&size=128"
                alt="profile"
                className="w-9 h-9 rounded-full object-cover border border-[#dedede]"
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
                        >
                          <div
                            className={`absolute left-1.5 top-1 text-center ${
                              isTod
                                ? "text-white bg-[#1976d2] rounded-full w-6 h-6 flex items-center justify-center font-bold"
                                : ""
                            }`}
                            style={{
                              fontSize: "1rem",
                              padding: isTod ? "0" : "",
                              background: isTod ? "#1976d2" : "none",
                            }}
                          >
                            {d.getDate() < 10 ? `0${d.getDate()}` : d.getDate()}
                          </div>
                          <div className="mt-7 flex flex-col gap-0.5">
                            {evs.slice(0, 3).map((ev) => (
                              <span
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
                              >
                                {ev.label}
                              </span>
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
          {currentView === "Week" && (
            <>
              <div
                className="flex w-full bg-white border-b border-[#e5e5e5] sticky top-0"
                style={{ minWidth: 720 }}
              >
                <div className="w-14 flex-shrink-0" />
                {mainGridDates.map((d, i) => (
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
              <div className="flex w-full" style={{ minWidth: 720 }}>
                <div className="w-14 flex flex-col items-end pt-2 flex-shrink-0 select-none">
                  {[...Array(24)].map((_, hr) => (
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
                    className="flex-1 flex flex-col border-r border-[#e5e5e5] last:border-none"
                  >
                    {[...Array(24)].map((_, hrIdx) => (
                      <div
                        key={"cell" + dayIdx + "-" + hrIdx}
                        className="h-14 border-b border-[#ededed] bg-white cursor-pointer"
                        onClick={() => onWeekHourCellClick(d, hrIdx)}
                      />
                    ))}
                    {filteredEvents
                      .filter((ev) => ev.date === d.toISOString().split("T")[0])
                      .map((ev) => (
                        <div
                          key={ev.id}
                          className="absolute left-0 right-0 ml-2 mr-2 rounded px-1 py-0.5 text-xs text-white font-medium shadow"
                          style={{
                            top: `${ev.start * 56 + 38}px`,
                            height: `${(ev.end - ev.start) * 56 - 6}px`,

                            background: ev.color,
                            zIndex: 2,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditEventModal(ev);
                          }}
                        >
                          {ev.label}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </>
          )}
          {currentView === "5 days" && (
            <>
              <div
                className="flex w-full bg-white border-b border-[#e5e5e5] sticky top-0"
                style={{ minWidth: 550 }}
              >
                <div className="w-14 flex-shrink-0" />
                {mainGridDates.map((d, i) => (
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
              <div className="flex w-full" style={{ minWidth: 550 }}>
                <div className="w-14 flex flex-col items-end pt-2 flex-shrink-0 select-none">
                  {[...Array(24)].map((_, hr) => (
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
                    className="flex-1 flex flex-col border-r border-[#e5e5e5] last:border-none"
                  >
                    {[...Array(24)].map((_, hrIdx) => (
                      <div
                        key={"cell" + dayIdx + "-" + hrIdx}
                        className="h-14 border-b border-[#ededed] bg-white cursor-pointer"
                        onClick={() => onWeekHourCellClick(d, hrIdx)}
                      />
                    ))}
                    {filteredEvents
                      .filter((ev) => ev.date === d.toISOString().split("T")[0])
                      .map((ev) => (
                        <div
                          key={ev.id}
                          className="absolute left-0 right-0 ml-2 mr-2 rounded px-1 py-0.5 text-xs text-white font-medium shadow"
                          style={{
                            top: `${ev.start * 56 + 78}px`,
                            height: `${(ev.end - ev.start) * 56 - 6}px`,
                            background: ev.color,
                            zIndex: 2,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditEventModal(ev);
                          }}
                        >
                          {ev.label}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </>
          )}
          {currentView === "Day" && (
            <>
              <div className="flex w-full bg-white border-b border-[#e5e5e5] sticky top-0">
                <div className="w-14 flex-shrink-0" />
                <div className="flex-1 px-2 text-center pt-3 pb-2">
                  <div className="text-xs text-gray-500 mb-1">
                    {DAYS[viewDate.getDay()]}
                  </div>
                  <div className="text-[22px] font-normal">
                    {viewDate.getDate()}
                  </div>
                </div>
              </div>
              <div className="flex w-full">
                <div className="w-14 flex flex-col items-end pt-2 flex-shrink-0 select-none">
                  {[...Array(24)].map((_, hr) => (
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
                <div className="flex-1 flex flex-col">
                  {[...Array(24)].map((_, hrIdx) => (
                    <div
                      key={"cell-day-" + hrIdx}
                      className="h-14 border-b border-[#ededed] bg-white cursor-pointer"
                      onClick={() => onWeekHourCellClick(viewDate, hrIdx)}
                    />
                  ))}
                  {filteredEvents
                    .filter(
                      (ev) => ev.date === viewDate.toISOString().split("T")[0]
                    )
                    .map((ev) => (
                      <div
                        key={ev.id}
                        className="absolute left-0 right-0 ml-2 mr-2 rounded px-1 py-0.5 text-xs text-white font-medium shadow"
                        style={{
                          top: `${ev.start * 56 + 34}px`,
                          height: `30px`,
                          background: ev.color,
                          zIndex: 2,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditEventModal(ev);
                        }}
                      >
                        {ev.label}
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      <Dialog
        open={eventModal.open}
        onOpenChange={(v) => (v ? null : onModalClose())}
      >
        <DialogContent className="max-w-xl">
          <form onSubmit={handleModalSave} className="space-y-5">
            <div className="flex flex-col mb-2">
              <Label>Calendar</Label>
              <select
                className="px-3 py-2 border rounded w-full mt-1"
                value={eventModal.calendar || "Work"}
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
            <DialogHeader>
              <DialogTitle>
                {eventModal.editing ? "Edit event" : "Add event"}
              </DialogTitle>
            </DialogHeader>
            <div>
              <Label>Title</Label>
              <Input
                value={eventModal.label}
                onChange={(e) => handleModalField("label", e.target.value)}
                required
                autoFocus
                maxLength={80}
              />
            </div>
            <div>
              <div className="mb-1 font-medium text-sm">
                {eventModal.day !== null
                  ? getDayLabel(+eventModal.day)
                  : format(
                      parseISO(
                        eventModal.date || viewDate.toISOString().split("T")[0]
                      ),
                      "EEE, MMMM d"
                    )}
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
                <Button variant="outline" type="button">
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
