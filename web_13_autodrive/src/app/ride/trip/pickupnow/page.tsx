"use client";
import { useState, useRef, useEffect } from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { format } from "date-fns";
import RideNavbar from "../../../../components/RideNavbar";
import { EVENT_TYPES, logEvent } from "@/library/event";
import { DatePickerInput } from "../../../../components/DatePicker";

function getTimeSlotsForDate(dateStr: string) {
  const results = [];
  let base = new Date();
  if (dateStr) {
    const [yyyy, mm, dd] = dateStr.split("-");
    base = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  let startHour = 0,
    startMin = 0;
  const todayStr = format(new Date(), "yyyy-MM-dd");
  if (dateStr === todayStr) {
    // If today, start at now rounded up to next slot
    const now = new Date();
    base.setHours(now.getHours(), now.getMinutes(), 0, 0);
    let min = now.getMinutes();
    min = min % 10 === 0 ? min : min + (10 - (min % 10));
    if (min === 60) {
      base.setHours(now.getHours() + 1, 0, 0, 0);
      min = 0;
    } else {
      base.setMinutes(min);
    }
    startHour = base.getHours();
    startMin = base.getMinutes();
  }
  for (let h = startHour; h < 24; h++) {
    for (let m = h === startHour ? startMin : 0; m < 60; m += 10) {
      const d = new Date(base.getTime());
      d.setHours(h, m, 0, 0);
      const label = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const value = d.toTimeString().slice(0, 5);
      results.push({ label, value });
    }
  }
  return results;
}

export default function PickupNowPage() {
  const router = useSeedRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  const [showSlotPanel, setShowSlotPanel] = useState(false);
  const slotPanelRef = useRef<HTMLDivElement>(null);
  
  // Convert Date to string format for compatibility
  const date = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
  
  // Only calculate slots and set initial time on client
  const slots = isMounted ? getTimeSlotsForDate(date) : [];
  useEffect(() => {
    setIsMounted(true);
  }, []);
  // On mount (client only), check sessionStorage for pickup date/time
  useEffect(() => {
    if (!isMounted) return;
    if (typeof window !== "undefined") {
      const sd = sessionStorage.getItem("ud_pickupdate");
      const st = sessionStorage.getItem("ud_pickuptime");
      if (sd && st) {
        setSelectedDate(new Date(sd));
        setTime(st);
      }
    }
  }, [isMounted]);
  // Set first available time slot if needed
  useEffect(() => {
    if (isMounted && slots.length && !time) {
      setTime(slots[0]?.value || "");
    }
  }, [isMounted, slots, time]);
  useEffect(() => {
    if (!showSlotPanel) return;
    function handle(e: MouseEvent) {
      if (
        slotPanelRef.current &&
        !slotPanelRef.current.contains(e.target as Node)
      )
        setShowSlotPanel(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showSlotPanel]);
  // Handler for Next button
  const handleNext = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("ud_pickupdate", date);
      sessionStorage.setItem("ud_pickuptime", time);
    }
    router.push("/ride/trip");
    console.log("Logging NEXT_PICKUP", { date, time });
    logEvent(EVENT_TYPES.NEXT_PICKUP, { 
      date, 
      time,
      timestamp: new Date().toISOString(),
      scheduledDateTime: `${date}T${time}`,
      isFutureDate: new Date(`${date}T${time}`) > new Date()
    });
  };
  const handleRemove = () => {
    setSelectedDate(new Date());
    if (isMounted && slots.length) setTime(slots[0]?.value || "");
    setShowSlotPanel(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("ud_pickupdate");
      sessionStorage.removeItem("ud_pickuptime");
    }
  };
  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <RideNavbar activeTab="ride" />
      <div className="flex gap-8 mt-8 px-8 pb-10 max-lg:flex-col max-lg:px-2 max-lg:gap-4">
        <section className="w-[400px] bg-white rounded-2xl shadow-xl p-8 flex flex-col max-lg:w-full mx-auto mt-2 relative border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              aria-label="Back"
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
                <path
                  d="M13 16l-5-5 5-5"
                  stroke="#111"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              onClick={handleRemove}
              className="text-[15px] text-gray-900 font-semibold"
            >
              Remove
            </button>
          </div>
          <div className="font-bold text-xl mb-8 leading-tight">
            When do you want to be picked up?
          </div>
          {/* Date picker row */}
          <div className="mb-4">
            <DatePickerInput
              date={selectedDate}
              onDateChange={(newDate) => {
                setSelectedDate(newDate);
                setTime("");
                if (newDate) {
                  const dateString = format(newDate, "yyyy-MM-dd");
                  console.log("Logging SELECT_DATE", { date: dateString });
                  logEvent(EVENT_TYPES.SELECT_DATE, { 
                    date: dateString,
                    timestamp: new Date().toISOString(),
                    isToday: dateString === format(new Date(), "yyyy-MM-dd"),
                    isFutureDate: dateString > format(new Date(), "yyyy-MM-dd")
                  });
                }
              }}
              placeholder="Select date"
              disabled={!isMounted}
              minDate={new Date()}
              maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
            />
          </div>
          {/* Time picker row */}
          <div className="mb-7 relative">
            <div
              className="bg-gray-100 rounded-lg flex items-center px-4 py-3 cursor-pointer border border-gray-200 text-base group" id="time-picker"
              onClick={() => isMounted && setShowSlotPanel(!showSlotPanel)}
              tabIndex={0}
            >
              <svg
                width="22"
                height="22"
                fill="none"
                className="mr-3"
                viewBox="0 0 20 20"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="#fff"
                  stroke="#2095d2"
                  strokeWidth="1.5"
                />
                <path
                  d="M10 6v4l2.5 2"
                  stroke="#2095d2"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="flex-1 text-base text-left font-medium text-gray-900">
                {isMounted
                  ? slots.find((s) => s.value === time)?.label ||
                    slots[0]?.label ||
                    "Select time"
                  : "--"}
              </span>
              <svg
                width="20"
                height="20"
                fill="none"
                className="ml-2"
                viewBox="0 0 20 20"
              >
                <path d="M16 7l-6 6-6-6" stroke="#2095d2" strokeWidth="1.5" />
              </svg>
            </div>
            {/* Time slot list dropdown */}
            {isMounted && showSlotPanel && (
              <div
                ref={slotPanelRef}
                className="absolute left-0 top-14 w-full max-h-64 overflow-y-auto bg-white border border-[#2095d2] rounded-lg shadow-xl z-40"
                style={{ boxShadow: "0 4px 32px 0 rgba(0,0,0,0.18)" }}
              >
                {slots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => {
                      setTime(slot.value);
                      setShowSlotPanel(false);
                      console.log("Logging SELECT_TIME", { time: slot.value });
                      logEvent(EVENT_TYPES.SELECT_TIME, { 
                        time: slot.value,
                        timestamp: new Date().toISOString(),
                        timeSlot: slot.label,
                        isAvailable: true
                      });
                    }}
                    className={`block w-full text-left px-6 py-3 text-base font-medium hover:bg-[#e6f6fc] ${
                      time === slot.value
                        ? "bg-[#f5fbfc] font-bold text-[#2095d2]"
                        : ""
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Info and Next (unchanged) */}
          <ul className="mb-4 text-[15px] text-gray-800 divide-y divide-gray-200 bg-white rounded-lg">
            <li className="flex items-start py-3 px-0 gap-3">
              <span className="mt-0.5">
                <svg width="19" height="19" fill="none" viewBox="0 0 24 24">
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="4"
                    fill="#2095d2"
                  />
                  <text
                    x="12"
                    y="16"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#fff"
                  >
                    30
                  </text>
                </svg>
              </span>
              Schedule your pick-up up to 30 days in advance.
            </li>
            <li className="flex items-start py-3 px-0 gap-3">
              <span className="mt-0.5">
                <svg width="18" height="18" fill="none" viewBox="0 0 22 22">
                  <path
                    d="M11 3a8 8 0 1 1 0 16a8 8 0 0 1 0-16zm0 0v6l4 2"
                    stroke="#2095d2"
                    strokeWidth="1.2"
                    fill="none"
                  />
                </svg>
              </span>
              Additional waiting time included to start your trip.
            </li>
            <li className="flex items-start py-3 px-0 gap-3">
              <span className="mt-0.5">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <rect
                    x="4"
                    y="8"
                    width="16"
                    height="2"
                    rx="1"
                    fill="#2095d2"
                  />
                  <rect
                    x="4"
                    y="14"
                    width="16"
                    height="2"
                    rx="1"
                    fill="#2095d2"
                  />
                </svg>
              </span>
              Cancel at no cost up to 60 minutes before.
            </li>
          </ul>
          <a className="text-xs underline text-[#222] mb-5" href="#">
            View terms and conditions
          </a>
          <button
            onClick={handleNext}
            className="block w-full rounded-md text-white bg-[#2095d2] hover:bg-[#1273a0] py-3 text-lg font-bold mt-2 transition"
          >
            Next
          </button>
        </section>
        <section className="flex-1 min-w-0">
          <div className="w-full h-full min-h-[640px] flex items-center justify-center rounded-2xl border border-gray-100 overflow-hidden bg-gray-100">
            <img
              src="https://ext.same-assets.com/407674263/1830126968.svg"
              alt="Map"
              className="object-cover w-full h-full"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
