import { EVENT_TYPES, logEvent } from "@/library/events";
import { useState } from "react";
import { DynamicButton } from "@/components/DynamicButton";
import { DynamicContainer, DynamicItem } from "@/components/DynamicContainer";
import { DynamicElement } from "@/components/DynamicElement";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP } from "@/dynamic/v3";

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
  idPrefix?: string;
};

export function NewEventModal({
  date,
  onClose,
  onSave,
  idPrefix = "new-event",
}: NewEventModalProps) {
  const dyn = useDynamicSystem();
  const rootId = `${idPrefix}-modal`;
  const titleId = `${idPrefix}-title`;
  const labelInputId = dyn.v3.getVariant("event_label_input", ID_VARIANTS_MAP, `${idPrefix}-label`);
  const timeInputId = dyn.v3.getVariant("event_time_input", ID_VARIANTS_MAP, `${idPrefix}-time`);
  const colorSelectId = dyn.v3.getVariant("event_color_select", ID_VARIANTS_MAP, `${idPrefix}-color`);

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
      id: newEvent.id,
      date,
      label,
      time,
      color: mappedColor,
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
            <h2 className="font-bold text-xl">{dyn.v3.getVariant("new_event_title", undefined, "New Event")} – {date}</h2>
          </DynamicElement>

          <div className="flex flex-col gap-2">
            <label htmlFor={labelInputId} className="text-sm font-medium text-zinc-700">
              {dyn.v3.getVariant("event_label_label", undefined, "Event label")}
            </label>
            <input 
              id={labelInputId}
              value={label} 
              onChange={(e) => setLabel(e.target.value)} 
              placeholder={dyn.v3.getVariant("event_label_placeholder", undefined, "Event label")} 
              required 
              className="border px-3 py-2 rounded" 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={timeInputId} className="text-sm font-medium text-zinc-700">
              {dyn.v3.getVariant("event_time_label", undefined, "Time")}
            </label>
            <input 
              id={timeInputId}
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              className="border px-3 py-2 rounded" 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={colorSelectId} className="text-sm font-medium text-zinc-700">
              {dyn.v3.getVariant("event_color_label", undefined, "Category")}
            </label>
            <select 
              id={colorSelectId}
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
              className="border px-3 py-2 rounded"
            >
            <option value="Matter/Event">Matter/Event</option>
            <option value="Internal">Internal</option>
            <option value="Filing">Filing</option>
            <option value="Other">Other</option>
          </select>
          </div>

          <div className="flex justify-end gap-3">
            <DynamicButton
              eventType="NEW_CALENDAR_EVENT_ADDED"
              index={0}
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-sm text-zinc-700 border-zinc-200 bg-white hover:bg-neutral-bg-dark"
            >
              {dyn.v3.getVariant("cancel_button", undefined, "Cancel")}
            </DynamicButton>
            <DynamicButton eventType="NEW_CALENDAR_EVENT_ADDED" index={1} type="submit" className="bg-accent-forest text-white px-4 py-2 rounded text-sm font-semibold">
              {dyn.v3.getVariant("save_button", undefined, "Save")}
            </DynamicButton>
          </div>
        </form>
      </DynamicContainer>
    </div>
  );
}
