import { EVENT_TYPES, logEvent } from "@/library/events";
import { useState } from "react";

type EventColor = "forest" | "indigo" | "blue" | "zinc";

export type CalendarEvent = {
  id: number;
  date: string;
  label: string;
  time: string;
  color: EventColor;
};

type NewEventModalProps = {
  date: string;
  onClose: () => void;
  onSave: (e: CalendarEvent) => void;
};

export function NewEventModal({ date, onClose, onSave }: NewEventModalProps) {
  const [label, setLabel] = useState("");
  const [time, setTime] = useState("09:00");
  const [color, setColor] = useState<CalendarEvent["color"]>("forest");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEvent: CalendarEvent = {
      id: Date.now(),
      date,
      label,
      time,
      color,
    };
    logEvent(EVENT_TYPES.NEW_CALENDAR_EVENT_ADDED, newEvent); // ✅ Emit event
    onSave(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 shadow-xl border w-full max-w-sm flex flex-col gap-4"
      >
        <h2 className="font-bold text-xl">New Event – {date}</h2>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Event label"
          required
          className="border px-3 py-2 rounded"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <select
          value={color}
          onChange={(e) => setColor(e.target.value as CalendarEvent["color"])}
          className="border px-3 py-2 rounded"
        >
          <option value="forest">Matter/Event</option>
          <option value="indigo">Internal</option>
          <option value="blue">Filing</option>
          <option value="zinc">Other</option>
        </select>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-zinc-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-accent-forest text-white px-4 py-2 rounded text-sm font-semibold"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
