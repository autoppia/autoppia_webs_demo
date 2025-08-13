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
  // New fields
  description?: string;
  location?: string;
  allDay?: boolean;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
  recurrenceEndDate?: string | null; // ISO date string
  attendees?: string[];
  reminders?: number[]; // minutes before
  busy?: boolean;
  visibility?: "default" | "private" | "public";
  meetingLink?: string;
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
  // New fields for modal
  description: string;
  location: string;
  allDay: boolean;
  recurrence: "none" | "daily" | "weekly" | "monthly";
  recurrenceEndDate: string | null;
  attendees: string[];
  attendeesInput: string;
  reminders: number[];
  reminderToAdd: number; // minutes
  busy: boolean;
  visibility: "default" | "private" | "public";
  meetingLink: string;
  step: number; // 0: Details, 1: People, 2: Options
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
  // New persisted optional fields
  description?: string;
  location?: string;
  allDay?: boolean;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
  recurrenceEndDate?: string | null;
  attendees?: string[];
  reminders?: number[];
  busy?: boolean;
  visibility?: "default" | "private" | "public";
  meetingLink?: string;
}

interface Calendar {
  name: string;
  enabled: boolean;
  color: string;
}

function usePersistedEvents() {
  const [state, setState] = useState<Event[]>(() => {
    // Add more default events for search demo
    const defaultEvents: Event[] = [
      {
        id: "1",
        date: "2025-08-15",
        start: 9,
        end: 10,
        label: "Team Meeting",
        calendar: "Work",
        color: "#2196F3",
        startTime: [9, 0],
        endTime: [10, 0],
        description: "Weekly sync with team.",
        location: "Zoom",
        allDay: false,
        recurrence: "weekly",
        recurrenceEndDate: "2025-12-31",
        attendees: ["alice@example.com", "bob@example.com"],
        reminders: [30],
        busy: true,
        visibility: "default",
        meetingLink: "https://zoom.us/j/123456789",
      },
      {
        id: "2",
        date: "2025-08-16",
        start: 14,
        end: 15,
        label: "Doctor Appointment",
        calendar: "Personal",
        color: "#E53935",
        startTime: [14, 0],
        endTime: [15, 0],
        description: "Annual checkup.",
        location: "Clinic",
        allDay: false,
        recurrence: "none",
        recurrenceEndDate: "2025-08-16",
        attendees: [],
        reminders: [60],
        busy: false,
        visibility: "private",
        meetingLink: "",
      },
      {
        id: "3",
        date: "2025-08-17",
        start: 11,
        end: 12,
        label: "Project Demo",
        calendar: "Work",
        color: "#2196F3",
        startTime: [11, 0],
        endTime: [12, 0],
        description: "Demo for client.",
        location: "Office",
        allDay: false,
        recurrence: "none",
        recurrenceEndDate: "2025-08-17",
        attendees: ["client@example.com"],
        reminders: [15],
        busy: true,
        visibility: "public",
        meetingLink: "https://meet.google.com/abc-defg-hij",
      },
    ];
    if (typeof window === "undefined") return defaultEvents;
    try {
      const stored = window.localStorage.getItem("gocal_events");
      if (!stored) return defaultEvents;
      const evs = JSON.parse(stored) as RawEvent[];
      const validEvents = evs
        .map((ev) => {
          const start = ev.start ?? 9;
          const end = ev.end ?? 10;
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
            description: ev.description ?? "",
            location: ev.location ?? "",
            allDay: ev.allDay ?? false,
            recurrence: ev.recurrence ?? "none",
            recurrenceEndDate: ev.recurrenceEndDate ?? null,
            attendees: Array.isArray(ev.attendees) ? ev.attendees : [],
            reminders: Array.isArray(ev.reminders) ? ev.reminders : [],
            busy: ev.busy ?? true,
            visibility: ev.visibility ?? "default",
            meetingLink: ev.meetingLink ?? "",
          } as Event;
        })
        .filter(
          (ev) =>
            Number.isInteger(ev.startTime[0]) && Number.isInteger(ev.endTime[0])
        );
      if (evs.length !== validEvents.length) {
        window.localStorage.setItem(
          "gocal_events",
          JSON.stringify(validEvents)
        );
      }
      return validEvents.length > 0 ? validEvents : defaultEvents;
    } catch (error) {
      console.error("Error parsing localStorage events:", error);
      window.localStorage.removeItem("gocal_events");
      return defaultEvents;
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

// Expand recurring events into individual occurrences within a given range
function expandRecurringEvents(
  baseEvents: Event[],
  rangeStart: Date,
  rangeEnd: Date
): Event[] {
  const results: Event[] = [];
  const clampToDate = (d: Date) => {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c;
  };

  const start = clampToDate(rangeStart);
  const end = clampToDate(rangeEnd);

  for (const ev of baseEvents) {
    const evDate = clampToDate(new Date(ev.date));
    const recEnd = ev.recurrenceEndDate
      ? clampToDate(new Date(ev.recurrenceEndDate))
      : evDate;
    const last = recEnd < end ? recEnd : end;

    const pushOccurrence = (d: Date) => {
      const iso = d.toISOString().split("T")[0];
      results.push({ ...ev, date: iso });
    };

    if (!ev.recurrence || ev.recurrence === "none") {
      if (evDate >= start && evDate <= end) pushOccurrence(evDate);
      continue;
    }

    if (ev.recurrence === "daily") {
      const cur = new Date(evDate);
      while (cur <= last) {
        if (cur >= start) pushOccurrence(cur);
        cur.setDate(cur.getDate() + 1);
      }
      continue;
    }

    if (ev.recurrence === "weekly") {
      const cur = new Date(evDate);
      while (cur <= last) {
        if (cur >= start) pushOccurrence(cur);
        cur.setDate(cur.getDate() + 7);
      }
      continue;
    }

    if (ev.recurrence === "monthly") {
      let cur = new Date(evDate);
      const origDay = evDate.getDate();
      while (cur <= last) {
        if (cur >= start) pushOccurrence(cur);
        const nextMonth = new Date(cur);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        // Clamp day to valid range of the next month
        const lastDayNextMonth = new Date(
          nextMonth.getFullYear(),
          nextMonth.getMonth() + 1,
          0
        ).getDate();
        nextMonth.setDate(Math.min(origDay, lastDayNextMonth));
        cur = nextMonth;
      }
      continue;
    }
  }

  return results;
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
    description: "",
    location: "",
    allDay: false,
    recurrence: "none",
    recurrenceEndDate: null,
    attendees: [],
    attendeesInput: "",
    reminders: [],
    reminderToAdd: 30,
    busy: true,
    visibility: "default",
    meetingLink: "",
    step: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [hasOpenedSearch, setHasOpenedSearch] = useState(false);
  const [submittedSearch, setSubmittedSearch] = useState("");

  useEffect(() => {
    if (!hasOpenedSearch && searchQuery === "") return;
      if (!hasOpenedSearch) {
    setHasOpenedSearch(true);
  }
}, [searchQuery, hasOpenedSearch]);

  // Debounce search query change logging
  useEffect(() => {
    if (!hasOpenedSearch) return;
      const handle = setTimeout(() => {
    // intentionally no per-keystroke logging
  }, 400);
    return () => clearTimeout(handle);
  }, [searchQuery, hasOpenedSearch]);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      logEvent(EVENT_TYPES.SEARCH_SUBMIT, { query: searchQuery });
      setSubmittedSearch(searchQuery);
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setSearchQuery(q);
      if (q === "") {
    // clear event removed
  }
  }

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

  const VIEW_OPTIONS = ["Day", "5 days", "Week", "Month"];
  const [currentView, setCurrentView] = useState("5 days");

  // Determine the visible date range
  const [rangeStart, rangeEnd] = useMemo(() => {
    const dates = (() => {
      const view = currentView;
      if (view === "Day") return [new Date(viewDate)];
      if (view === "5 days") return getWeekDates(viewDate).slice(1, 6);
      if (view === "Week") return getWeekDates(viewDate);
      return getMonthMatrix(viewDate.getFullYear(), viewDate.getMonth()).flat();
    })();
    const start = new Date(dates[0]);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dates[dates.length - 1]);
    end.setHours(23, 59, 59, 999);
    return [start, end] as const;
  }, [viewDate, currentView]);

  const expandedEvents = useMemo(() => {
    const base = filteredEvents;
    const expanded = expandRecurringEvents(base, rangeStart, rangeEnd);
    if (!submittedSearch.trim()) return expanded;
    const q = submittedSearch.toLowerCase();
    return expanded.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        (e.location ?? "").toLowerCase().includes(q)
    );
  }, [filteredEvents, rangeStart, rangeEnd, submittedSearch]);



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
    const isoDate = date.toISOString().split("T")[0];
    setEventModal({
      open: true,
      editing: null,
      calendar: "Work",
      label: "",
      color: myCalendars.find((cal) => cal.name === "Work")?.color ?? "#2196F3",
      day: null,
      start: startHour + startMins / 60,
      end: endHour + endMins / 60,
      startTime: [startHour, startMins],
      endTime: [endHour, endMins],
      id: null,
      date: isoDate,
      description: "",
      location: "",
      allDay: false,
      recurrence: "none",
      recurrenceEndDate: isoDate,
      attendees: [],
      attendeesInput: "",
      reminders: [],
      reminderToAdd: 30,
      busy: true,
      visibility: "default",
      meetingLink: "",
      step: 0,
    });
    logEvent(EVENT_TYPES.EVENT_WIZARD_OPEN, { step: 0, source: "event-modal" });
  }

  function openEditEventModal(ev: Event) {
    const base = events.find((e) => e.id === ev.id) ?? ev;
    const idx = viewedWeek.findIndex(
      (day) => day.toISOString().split("T")[0] === base.date
    );
    setEventModal({
      open: true,
      editing: base.id,
      calendar: base.calendar,
      label: base.label,
      color: base.color,
      day: idx >= 0 ? idx : null,
      start: base.start,
      end: base.end,
      startTime: base.startTime,
      endTime: base.endTime,
      id: base.id,
      date: base.date,
      description: base.description ?? "",
      location: base.location ?? "",
      allDay: base.allDay ?? false,
      recurrence: base.recurrence ?? "none",
      recurrenceEndDate: base.recurrenceEndDate ?? base.date,
      attendees: Array.isArray(base.attendees) ? base.attendees : [],
      attendeesInput: "",
      reminders: Array.isArray(base.reminders) ? base.reminders : [],
      reminderToAdd: 30,
      busy: base.busy ?? true,
      visibility: base.visibility ?? "default",
      meetingLink: base.meetingLink ?? "",
      step: 0,
    });
    logEvent(EVENT_TYPES.EVENT_WIZARD_OPEN, { step: 0, source: "event-modal" });
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
    } else if (field === "allDay") {
      const isAllDay = Boolean(val);
      setEventModal((e) => ({
        ...e,
        allDay: isAllDay,
      }));
    } else {
      setEventModal((e) => ({ ...e, [field]: val }));
    }
  }

  function addAttendee() {
    const email = eventModal.attendeesInput.trim();
    if (!email) return;
    // Simple email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    logEvent(EVENT_TYPES.EVENT_ADD_ATTENDEE, { email });
    setEventModal((e) => ({
      ...e,
      attendees: [...e.attendees, email],
      attendeesInput: "",
    }));
  }

  function removeAttendee(email: string) {
    logEvent(EVENT_TYPES.EVENT_REMOVE_ATTENDEE, { email });
    setEventModal((e) => ({
      ...e,
      attendees: e.attendees.filter((a) => a !== email),
    }));
  }

  const REMINDER_OPTIONS = [5, 10, 15, 30, 60, 120, 1440];

  function addReminder() {
    const minutes = eventModal.reminderToAdd;
    logEvent(EVENT_TYPES.EVENT_ADD_REMINDER, { minutes });
    setEventModal((e) => ({ ...e, reminders: [...e.reminders, minutes] }));
  }

  function removeReminder(idx: number) {
    const minutes = eventModal.reminders[idx];
    logEvent(EVENT_TYPES.EVENT_REMOVE_REMINDER, { minutes, idx });
    setEventModal((e) => ({
      ...e,
      reminders: e.reminders.filter((_, i) => i !== idx),
    }));
  }

  function goNextStep() {
    setEventModal((e) => {
      const next = Math.min(e.step + 1, 2);
      // No event logging for next step
      return { ...e, step: next };
    });
  }

  function goPrevStep() {
    setEventModal((e) => {
      const prev = Math.max(e.step - 1, 0);
      // No event logging for prev step
      return { ...e, step: prev };
    });
  }

  function onModalClose() {
    setEventModal((e) => ({ ...e, open: false }));
  }

  function handleModalSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // --- Full Form Validation ---
    // Required fields
    if (!eventModal.label || eventModal.label.trim() === "") {
      alert("Event title is required.");
      return;
    }
    if (!eventModal.calendar || eventModal.calendar.trim() === "") {
      alert("Calendar is required.");
      return;
    }
    if (!eventModal.date || eventModal.date.trim() === "") {
      alert("Date is required.");
      return;
    }
    // Validate date
    if (isNaN(Date.parse(eventModal.date))) {
      alert("Please enter a valid date.");
      return;
    }
    // Validate time (if not all day)
    if (!eventModal.allDay) {
      const [sh, sm] = eventModal.startTime;
      const [eh, em] = eventModal.endTime;
      if (
        sh < 0 || sh > 23 || sm < 0 || sm > 59 ||
        eh < 0 || eh > 23 || em < 0 || em > 59
      ) {
        alert("Please enter a valid start and end time.");
        return;
      }
      if (sh > eh || (sh === eh && sm >= em)) {
        alert("End time must be after start time.");
        return;
      }
    }
    // Validate attendees (if any)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of eventModal.attendees) {
      if (!emailPattern.test(email)) {
        alert(`Invalid attendee email: ${email}`);
        return;
      }
    }
    // Validate meeting link if present
    if (eventModal.meetingLink && eventModal.meetingLink.trim() !== "") {
      const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/i;
      if (!urlPattern.test(eventModal.meetingLink.trim())) {
        alert("Please enter a valid meeting URL (starting with http(s)://)");
        return;
      }
    }
    const eventData = {
      source: "event-modal",
      title: eventModal.label,
      calendar: eventModal.calendar,
      date: eventModal.date,
      startTime: eventModal.startTime,
      endTime: eventModal.endTime,
      color: eventModal.color,
      isEditing: !!eventModal.editing,
      allDay: eventModal.allDay,
      recurrence: eventModal.recurrence,
      attendees: eventModal.attendees,
      reminders: eventModal.reminders,
      busy: eventModal.busy,
      visibility: eventModal.visibility,
      location: eventModal.location,
      description: eventModal.description,
      meetingLink: eventModal.meetingLink,
    };
    logEvent(EVENT_TYPES.ADD_EVENT, eventData);
    const dstr = eventModal.date ?? viewDate.toISOString().split("T")[0];

    const isAllDay = eventModal.allDay;
    const startNum = isAllDay
      ? 0
      : eventModal.startTime[0] + eventModal.startTime[1] / 60;
    const endNum = isAllDay
      ? 24
      : eventModal.endTime[0] + eventModal.endTime[1] / 60;

    const newEv: Event = {
      id: eventModal.editing ?? Math.random().toString(36).slice(2),
      date: dstr,
      start: startNum,
      end: endNum,
      label: eventModal.label,
      calendar: eventModal.calendar,
      color: eventModal.color,
      startTime: isAllDay ? [0, 0] : eventModal.startTime,
      endTime: isAllDay ? [23, 30] : eventModal.endTime,
      description: eventModal.description,
      location: eventModal.location,
      allDay: isAllDay,
      recurrence: eventModal.recurrence,
      recurrenceEndDate: eventModal.recurrenceEndDate,
      attendees: eventModal.attendees,
      reminders: eventModal.reminders,
      busy: eventModal.busy,
      visibility: eventModal.visibility,
      meetingLink: eventModal.meetingLink,
    };
    setEvents((evts) => {
      if (eventModal.editing)
        return evts.map((ev) => (ev.id === eventModal.editing ? newEv : ev));
      return [...evts, newEv];
    });
    onModalClose();
  }

  function handleEventDelete() {
    const eventData = {
      source: "event-modal",
      eventId: eventModal.id,
      title: eventModal.label,
      calendar: eventModal.calendar,
      date: eventModal.date,
      startTime: eventModal.startTime,
      endTime: eventModal.endTime,
      color: eventModal.color,
      isEditing: !!eventModal.editing,
      allDay: eventModal.allDay,
      recurrence: eventModal.recurrence,
      attendees: eventModal.attendees,
      reminders: eventModal.reminders,
      busy: eventModal.busy,
      visibility: eventModal.visibility,
      location: eventModal.location,
      description: eventModal.description,
      meetingLink: eventModal.meetingLink,
    };
    logEvent(EVENT_TYPES.DELETE_EVENT, eventData);
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

  // Derived lists
  const allDayEvents = useMemo(
    () => expandedEvents.filter((ev) => ev.allDay),
    [expandedEvents]
  );
  const timedEvents = useMemo(
    () => expandedEvents.filter((ev) => !ev.allDay),
    [expandedEvents]
  );

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
                      {d.getDate() < 10 ? `0${d.getDate()}` : d.getDate()}
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
            <div className="hidden md:block">
              <Input
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search events"
                className="w-[240px]"
                aria-label="Search events"
                onFocus={() => {
      if (!hasOpenedSearch) {
        setHasOpenedSearch(true);
      }
    }}
              />
            </div>
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
                      const evs = expandedEvents.filter(
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
                                key={ev.id + ev.date}
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
              {/* All-day row */}
              <div className="flex w-full min-w-[550px] border-b border-[#e5e5e5] bg-[#fafafa]">
                <div className="w-14 flex items-center justify-end pr-2 text-xs text-gray-500 flex-shrink-0">
                  All-day
                </div>
                {mainGridDates.map((d) => {
                  const iso = d.toISOString().split("T")[0];
                  const dayEvents = allDayEvents.filter((ev) => ev.date === iso);
                  return (
                    <div
                      key={`allday-${iso}`}
                      className="flex-1 min-h-[44px] border-r border-[#e5e5e5] p-1 flex flex-wrap gap-1 items-start"
                    >
                      {dayEvents.map((ev) => (
                        <button
                          key={ev.id + ev.date}
                          className="px-2 py-0.5 rounded text-white text-xs font-medium"
                          style={{ background: ev.color }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditEventModal(ev);
                          }}
                        >
                          {ev.label}
                        </button>
                      ))}
                    </div>
                  );
                })}
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
                    {timedEvents
                      .filter((ev) => ev.date === d.toISOString().split("T")[0])
                      .map((ev) => {
                        return (
                          <button
                            key={ev.id + ev.date}
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
                            {ev.label} ({formatTime(ev.startTime)} - {formatTime(
                              ev.endTime
                            )})
                          </button>
                        );
                      })}
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

            {/* Stepper */}
            <div className="flex items-center gap-2 text-sm">
              {[
                { label: "Details", idx: 0 },
                { label: "People", idx: 1 },
                { label: "Options", idx: 2 },
              ].map((s) => (
                <button
                  type="button"
                  key={s.idx}
                  onClick={() => setEventModal((e) => ({ ...e, step: s.idx }))}
                  className={`px-3 py-1 rounded border ${
                    eventModal.step === s.idx
                      ? "bg-[#1976d2] text-white border-[#1976d2]"
                      : "bg-white text-[#383e4d] border-[#e5e5e5]"
                  }`}
                  aria-label={`Go to ${s.label} step`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Step 0: Details */}
            {eventModal.step === 0 && (
              <div className="space-y-5">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-date">Date</Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={eventModal.date ?? viewDate.toISOString().split("T")[0]}
                      onChange={(e) => handleModalField("date", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-location">Location</Label>
                    <Input
                      id="event-location"
                      value={eventModal.location}
                      onChange={(e) => handleModalField("location", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="allday"
                    type="checkbox"
                    checked={eventModal.allDay}
                    onChange={(e) => handleModalField("allDay", e.target.checked)}
                  />
                  <Label htmlFor="allday">All day</Label>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 opacity-100">
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
                        disabled={eventModal.allDay}
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
                        disabled={eventModal.allDay}
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
                        disabled={eventModal.allDay}
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
                        disabled={eventModal.allDay}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recurrence">Repeat</Label>
                    <select
                      id="recurrence"
                      className="px-3 py-2 border rounded w-full mt-1"
                      value={eventModal.recurrence}
                      onChange={(e) =>
                        handleModalField(
                          "recurrence",
                          e.target.value as EventModalState["recurrence"]
                        )
                      }
                    >
                      <option value="none">Does not repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="recurrence-end">Repeat until</Label>
                    <Input
                      id="recurrence-end"
                      type="date"
                      value={
                        eventModal.recurrenceEndDate ??
                        eventModal.date ??
                        viewDate.toISOString().split("T")[0]
                      }
                      onChange={(e) =>
                        handleModalField("recurrenceEndDate", e.target.value)
                      }
                      disabled={eventModal.recurrence === "none"}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: People */}
            {eventModal.step === 1 && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="attendee">Add attendee (email)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="attendee"
                      value={eventModal.attendeesInput}
                      onChange={(e) => handleModalField("attendeesInput", e.target.value)}
                      placeholder="name@example.com"
                    />
                    <Button type="button" onClick={addAttendee}>
                      Add
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {eventModal.attendees.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-2 px-2 py-1 rounded bg-[#f3f7fa] border border-[#e5e5e5] text-sm"
                      >
                        {email}
                        <button
                          type="button"
                          className="text-red-600"
                          onClick={() => removeAttendee(email)}
                          aria-label={`Remove ${email}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Options */}
            {eventModal.step === 2 && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="meeting-link">Meeting link</Label>
                  <Input
                    id="meeting-link"
                    value={eventModal.meetingLink}
                    onChange={(e) => handleModalField("meetingLink", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={eventModal.description}
                    onChange={(e) => handleModalField("description", e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="busy"
                    type="checkbox"
                    checked={eventModal.busy}
                    onChange={(e) => handleModalField("busy", e.target.checked)}
                  />
                  <Label htmlFor="busy">Mark as busy</Label>
                </div>
                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <select
                    id="visibility"
                    className="px-3 py-2 border rounded w-full mt-1"
                    value={eventModal.visibility}
                    onChange={(e) =>
                      handleModalField(
                        "visibility",
                        e.target.value as EventModalState["visibility"]
                      )
                    }
                  >
                    <option value="default">Default</option>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <div>
                  <Label>Reminders</Label>
                  <div className="flex gap-2 mt-1">
                    <select
                      className="px-3 py-2 border rounded"
                      value={eventModal.reminderToAdd}
                      onChange={(e) =>
                        handleModalField("reminderToAdd", parseInt(e.target.value))
                      }
                    >
                      {REMINDER_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m >= 60
                            ? `${Math.round(m / 60)}h before`
                            : `${m}m before`}
                        </option>
                      ))}
                    </select>
                    <Button type="button" onClick={addReminder}>
                      Add reminder
                    </Button>
                  </div>
                  <ul className="mt-2 space-y-2">
                    {eventModal.reminders.map((m, i) => (
                      <li key={`${m}-${i}`} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {m >= 60 ? `${Math.round(m / 60)}h` : `${m}m`} before
                        </span>
                        <button
                          type="button"
                          className="text-red-600"
                          onClick={() => removeReminder(i)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <DialogFooter>
              <div className="flex-1" />
              {eventModal.step > 0 && (
                <Button type="button" variant="outline" onClick={goPrevStep}>
                  Back
                </Button>
              )}
              {eventModal.step < 2 && (
                <Button type="button" onClick={goNextStep}>
                  Next
                </Button>
              )}
              {eventModal.step === 2 && (
                <Button variant="default" type="submit">
                  Save
                </Button>
              )}
              {eventModal.editing && eventModal.step === 2 && (
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
                    const eventData = {
                      source: "event-modal",
                      reason: "User clicked cancel button",
                      eventId: eventModal.id,
                      title: eventModal.label,
                      calendar: eventModal.calendar,
                      date: eventModal.date,
                      startTime: eventModal.startTime,
                      endTime: eventModal.endTime,
                      color: eventModal.color,
                      isEditing: !!eventModal.editing,
                      allDay: eventModal.allDay,
                      recurrence: eventModal.recurrence,
                      attendees: eventModal.attendees,
                      reminders: eventModal.reminders,
                      busy: eventModal.busy,
                      visibility: eventModal.visibility,
                      location: eventModal.location,
                      description: eventModal.description,
                      meetingLink: eventModal.meetingLink,
                    };
                    logEvent(EVENT_TYPES.CANCEL_ADD_EVENT, eventData);
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
