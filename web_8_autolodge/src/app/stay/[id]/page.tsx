"use client";
import { useParams, useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  addDays,
  format,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  setHours,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useRef } from "react";
import { FEATURED_HOTELS } from "@/library/dataset";

function toStartOfDay(date: Date) {
  if (!date) return date;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toUtcIsoWithTimezone(date: Date) {
  return date.toISOString().replace("Z", "+00:00");
}

export default function PropertyDetail() {
  const router = useRouter();
  const didTrack = useRef(false);
  const params = useParams<{ id: string }>();
  const { id } = params;
  const prop = FEATURED_HOTELS[Number(id)] ?? FEATURED_HOTELS[0];
  const stayFrom = new Date(prop.datesFrom);
  const stayTo = new Date(prop.datesTo);
  const availableDates = useMemo(
    () => eachDayOfInterval({ start: stayFrom, end: addDays(stayTo, -1) }),
    [stayFrom, stayTo]
  );
  // Booking calendar state
  const [selected, setSelected] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: stayFrom, to: stayTo });
  const [guests, setGuests] = useState(1);

  // Selection helpers
  const rangeIsExact =
    selected.from &&
    selected.to &&
    toStartOfDay(selected.from).getTime() ===
      toStartOfDay(stayFrom).getTime() &&
    toStartOfDay(selected.to).getTime() === toStartOfDay(stayTo).getTime();

  // Button states
  const nights =
    selected.from && selected.to
      ? (toStartOfDay(addDays(selected.to, -1)).getTime() -
          toStartOfDay(selected.from).getTime()) /
        (1000 * 60 * 60 * 24)
      : 0;

  const cleaningFee = 15;
  const priceSubtotal = prop.price * nights;
  const total = priceSubtotal + cleaningFee;

  function isWithinAvailable(date: Date) {
    return isWithinInterval(date, {
      start: stayFrom,
      end: addDays(stayTo, -1),
    });
  }
  // ✅ Trigger VIEW_HOTEL on mount
  useEffect(() => {
    if (!didTrack.current) {
      logEvent(EVENT_TYPES.VIEW_HOTEL, {
        id,
        title: prop.title,
        location: prop.location,
        rating: prop.rating,
        price: prop.price,
        dates: { from: prop.datesFrom, to: prop.datesTo },
        guests: prop.guests,
        host: prop.host,
        amenities: prop.amenities?.map((a) => a.title),
      });
      didTrack.current = true;
    }
  }, [id]);

  // For calendar: disable all outside available, highlight selection
  return (
    <div className="flex flex-row gap-10 w-full max-w-6xl mx-auto mt-7">
      <div className="flex-1 min-w-0 pr-6">
        <h1 className="text-2xl font-bold mb-2 leading-7">
          Entire Rental Unit in {prop.location}
        </h1>
        <div className="mb-3 text-neutral-700 text-[16px] flex gap-2 flex-wrap items-center">
          <span>{prop.guests} guests</span>
          <span>· {prop.bedrooms} bedroom</span>
          <span>· {prop.beds} bed</span>
          <span>· {prop.baths} bath</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-lg font-semibold flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#FF5A5F"
              width={18}
              height={18}
              viewBox="0 0 24 24"
              stroke="none"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>{" "}
            {prop.rating.toFixed(2)}
          </span>
          <span className="text-neutral-600">
            · {prop.reviews ?? 30} reviews
          </span>
        </div>
        <hr className="my-4" />
        <div className="mb-4 flex items-center gap-3">
          <Image
            src={prop.host.avatar}
            alt={prop.host.name}
            width={54}
            height={54}
            className="rounded-full border"
          />
          <div>
            <div className="font-medium text-neutral-800">
              Hosted by {prop.host.name}
            </div>
            <div className="text-neutral-500 text-sm">
              {prop.host.since} years hosting
            </div>
          </div>
        </div>
        <hr className="my-3" />
        <div className="flex flex-col gap-7 mt-4">
          {prop.amenities?.map((f, i) => (
            <div className="flex items-start gap-4" key={f.title}>
              <span className="text-2xl pt-1">{f.icon}</span>
              <div>
                <div className="font-semibold text-neutral-900 text-[17px]">
                  {f.title}
                </div>
                <div className="text-neutral-500 text-sm -mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Sidebar/summary */}
      <div className="w-[350px] min-w-[300px] bg-white shadow-md rounded-2xl border flex flex-col p-6 sticky top-8 h-fit">
        <div className="text-2xl font-bold mb-1">
          ${prop.price.toFixed(2)}{" "}
          <span className="text-base text-neutral-600 font-medium">
            USD <span className="font-normal">night</span>
          </span>
        </div>
        <div className="flex gap-3 mt-3 mb-4">
          <div className="flex-1 border rounded-md px-3 py-2">
            <div className="text-xs text-neutral-500 font-semibold">
              CHECK-IN
            </div>
            <div className="tracking-wide text-[15px]">
              {selected.from ? format(selected.from, "MM/dd/yyyy") : "–"}
            </div>
          </div>
          <div className="flex-1 border rounded-md px-3 py-2">
            <div className="text-xs text-neutral-500 font-semibold">
              CHECK-OUT
            </div>
            <div className="tracking-wide text-[15px]">
              {selected.to ? format(selected.to, "MM/dd/yyyy") : "–"}
            </div>
          </div>
        </div>
        <div className="border rounded-md px-3 py-2 mb-3">
          <div className="text-xs text-neutral-500 font-semibold">GUESTS</div>
          <input
            className="bg-transparent text-[15px] w-full p-0 border-none outline-none"
            value={guests}
            type="number"
            min={1}
            max={prop.guests}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value > guests) {
                logEvent(EVENT_TYPES.INCREASE_NUMBER_OF_GUESTS, {
                  from: guests,
                  to: value,
                  hotel: prop, // Pass the whole hotel object
                });
              } else if (value < guests) {
                logEvent(EVENT_TYPES.DECREASE_NUMBER_OF_GUESTS, {
                  from: guests,
                  to: value,
                  hotel: prop, // Pass the whole hotel object
                });
              }
              setGuests(value);
            }}
          />
        </div>
        {selected.from && selected.to && (
          <button
            className="rounded-lg w-full py-3 text-white font-semibold text-base bg-[#616882] hover:bg-[#8692bd] transition mb-3 shadow focus:outline-none"
            onClick={async () => {
              const checkinDate = selected.from!;
              const checkoutDate = selected.to!;

              console.log("🔔 Reserve clicked", {
                checkin: checkinDate,
                checkout: checkoutDate,
                guests,
              });

              try {
                await logEvent(EVENT_TYPES.RESERVE_HOTEL, {
                  id,
                  checkin: toUtcIsoWithTimezone(checkinDate),
                  checkout: toUtcIsoWithTimezone(checkoutDate),
                  guests,
                  hotel: prop,
                });
              } catch (err) {
                console.error("❌ logEvent failed", err);
              }

              router.push(
                `/stay/${params.id}/confirm?checkin=${checkinDate}&checkout=${checkoutDate}&guests=${guests}`
              );
            }}
          >
            Reserve
          </button>
        )}
        {(!selected.from || !selected.to) && (
          <button
            disabled
            className="rounded-lg w-full py-3 text-neutral-400 font-semibold text-base bg-neutral-100 mb-3 shadow cursor-not-allowed"
          >
            Check Availability
          </button>
        )}
        <div className="text-center text-neutral-400 text-sm mb-4">
          You won't be charged yet
        </div>
        <div className="flex flex-col gap-2 text-[15px]">
          <div className="flex items-center justify-between">
            <span className="underline">
              ${prop.price.toFixed(2)} USD x {nights} nights
            </span>
            <span>${priceSubtotal.toFixed(2)} USD</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="underline">Cleaning fee</span>{" "}
            <span>${cleaningFee} USD</span>
          </div>
          <hr />
          <div className="flex items-center justify-between font-bold text-neutral-900">
            <span>Total</span> <span>${total.toFixed(2)} USD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
