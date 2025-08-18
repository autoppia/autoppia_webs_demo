import { EVENT_TYPES, logEvent } from "@/library/events";
import { useState } from "react";
import { DynamicButton } from "@/components/DynamicButton";
import { DynamicContainer, DynamicItem } from "@/components/DynamicContainer";
import { DynamicElement } from "@/components/DynamicElement";

type EventColor = "forest" | "indigo" | "blue" | "zinc";

export type CalendarEvent = {
  id: number;
  date: string;
  label: string;
  time: string;
  color: EventColor;
};

const COLOR_MAP: Record<string, EventColor> = {
  "Matter/Event": "forest",
  "Internal": "indigo",
  "Filing": "blue",
  "Other": "zinc",
};

type NewEventModalProps = {
  date: string;
  onClose: () => void;
  onSave: (e: CalendarEvent) => void;
};

export function NewEventModal({ date, onClose, onSave }: NewEventModalProps) {
  const [label, setLabel] = useState("");
  const [time, setTime] = useState("09:00");
  const [color, setColor] = useState("Matter/Event");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const mappedColor = COLOR_MAP[color] || "forest";

    const newEvent: CalendarEvent = {
      id: Date.now(),
      date,
      label,
      time,
      color: mappedColor,
    };
    const eventToTrigger = {
      id: Date.now(),
      date,
      label,
      time,
      color,
    };
    logEvent(EVENT_TYPES.NEW_CALENDAR_EVENT_ADDED, eventToTrigger);
    onSave(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <DynamicContainer index={0} className="bg-white rounded-2xl p-6 shadow-xl border w-full max-w-sm flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DynamicElement elementType="header" index={0}>
            <h2 className="font-bold text-xl">New Event – {date}</h2>
          </DynamicElement>
          
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
            onChange={(e) => setColor(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="Matter/Event">Matter/Event</option>
            <option value="Internal">Internal</option>
            <option value="Filing">Filing</option>
            <option value="Other">Other</option>
          </select>
          
          <div className="flex justify-end gap-3">
            <DynamicButton
              eventType="NEW_CALENDAR_EVENT_ADDED"
              index={0}
              type="button"
              onClick={onClose}
              className="text-sm text-zinc-500"
            >
              Cancel
            </DynamicButton>
            <DynamicButton
              eventType="NEW_CALENDAR_EVENT_ADDED"
              index={1}
              type="submit"
              className="bg-accent-forest text-white px-4 py-2 rounded text-sm font-semibold"
            >
              Save
            </DynamicButton>
          </div>
        </form>
      </DynamicContainer>
    </div>
  );
}
