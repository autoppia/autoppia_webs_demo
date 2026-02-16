// src/library/dataset.ts
// This file exports the CalendarEvent interface for type definitions.

export interface CalendarEvent {
  id: string;
  date: string;
  start: number;
  end: number;
  label: string;
  calendar: string;
  color: string;
  startTime: [number, number];
  endTime: [number, number];
  description: string;
  location: string;
  allDay: boolean;
  recurrence: "none" | "daily" | "weekly" | "monthly";
  recurrenceEndDate: string | null;
  attendees: string[];
  reminders: number[];
  busy: boolean;
  visibility: "default" | "private" | "public";
  meetingLink: string;
}
