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
import {DASHBOARD_HOTELS} from "@/library/dataset";

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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [receiverEmail, setReceiverEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const router = useRouter();
  const didTrack = useRef(false);
  const params = useParams<{ id: string }>();
  const { id } = params;
  const prop = useMemo(() => {
    const numId = Number(id);
    const hotel = DASHBOARD_HOTELS.find(hotel => hotel.id === numId);
    return hotel ?? DASHBOARD_HOTELS[0];
  }, [id]);
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
        reviews: prop.reviews,
        price: prop.price,
        dates: { from: prop.datesFrom, to: prop.datesTo },
        guests: prop.guests,
        host: prop.host,
        amenities: prop.amenities?.map((a) => a.title),
      });
      didTrack.current = true;
    }
  }, [id]);

  useEffect(() => {
    if (toastMessage) {
      const timeout = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [toastMessage]);

  // For calendar: disable all outside available, highlight selection
  return (
    <div className="relative flex flex-row gap-10 w-full max-w-6xl mx-auto mt-7">
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded text-sm shadow-lg z-50">
          {toastMessage}
        </div>
      )}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md animate-fade-in">
            <h2 className="text-xl font-semibold mb-3 text-neutral-800">
              📤 Share this property
            </h2>

            <input
              type="email"
              placeholder="Receiver's email"
              value={receiverEmail}
              onChange={(e) => {
                const value = e.target.value;
                setReceiverEmail(value);

                const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                setEmailError(
                  isValidEmail || value === "" ? "" : "Invalid email address"
                );
              }}
              className="w-full border px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300"
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setReceiverEmail("");
                  setEmailError("");
                }}
                className="px-4 py-1.5 rounded-full text-sm bg-neutral-200 hover:bg-neutral-300"
              >
                Cancel
              </button>
              <button
                disabled={!!emailError || !receiverEmail}
                onClick={() => {
                  setShowShareModal(false);
                  setToastMessage(`Link sent to ${receiverEmail}`);
                  logEvent("SHARE_HOTEL", {
                    title: prop.title,
                    location: prop.location,
                    rating: prop.rating,
                    reviews: prop.reviews,
                    price: prop.price,
                    dates: { from: prop.datesFrom, to: prop.datesTo },
                    guests: prop.guests,
                    host: prop.host,
                    amenities: prop.amenities?.map((a) => a.title),
                    email: receiverEmail,
                  });
                  setReceiverEmail("");
                  setEmailError("");
                  setTimeout(() => setToastMessage(""), 3000);
                }}
                className="px-4 py-1.5 rounded-full text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

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
          <button
            onClick={() => {
              const newState = !isWishlisted;
              setIsWishlisted(newState);

              if(newState) {

              logEvent(
                  EVENT_TYPES.ADD_TO_WISHLIST,
                {
                  title: prop.title,
                  location: prop.location,
                  rating: prop.rating,
                  reviews: prop.reviews,
                  price: prop.price,
                  dates: { from: prop.datesFrom, to: prop.datesTo },
                  guests: prop.guests,
                  host: prop.host,
                  amenities: prop.amenities?.map((a) => a.title),
                }
              );
               }

              setToastMessage(
                newState ? "Added to wishlist ❤️" : "Removed from wishlist 💔"
              );
            }}
            className="p-2 bg-white border border-neutral-200 rounded-full hover:shadow transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={isWishlisted ? "red" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              width={24}
              height={24}
              className={isWishlisted ? "text-red-500" : "text-neutral-600"}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3
         c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3
         C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Share
          </button>
        </div>
        <hr className="my-4" />
        <div className="mb-4 flex items-center gap-3">
          <Image
            id="hostAvatar"
            src={prop.host.avatar}
            alt={prop.host.name}
            width={54}
            height={54}
            className="rounded-full border"
          />
          <div>
            <div id="hostName" className="font-medium text-neutral-800">
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
            <div
              className="flex items-start gap-4"
              key={f.title}
              id={`amenity-${i}`}
            >
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
        <div id="pricePerNight" className="text-2xl font-bold mb-1">
          ${prop.price.toFixed(2)}{" "}
          <span className="text-base text-neutral-600 font-medium">
            USD <span className="font-normal">night</span>
          </span>
        </div>
        <div className="flex gap-3 mt-3 mb-4">
          <div id="checkIn" className="flex-1 border rounded-md px-3 py-2">
            <div className="text-xs text-neutral-500 font-semibold">
              CHECK-IN
            </div>
            <div className="tracking-wide text-[15px]">
              {selected.from ? format(selected.from, "MM/dd/yyyy") : "–"}
            </div>
          </div>
          <div id="checkOut" className="flex-1 border rounded-md px-3 py-2">
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
            id="guestsCount"
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
                // logEvent(EVENT_TYPES.DECREASE_NUMBER_OF_GUESTS, {
                //   from: guests,
                //   to: value,
                //   hotel: prop, // Pass the whole hotel object
                // });
              }
              setGuests(value);
            }}
          />
        </div>
        {selected.from && selected.to && (
          <button
            id="reserveButton"
            className="rounded-lg w-full py-3 text-white font-semibold text-base bg-[#616882] hover:bg-[#8692bd] transition mb-3 shadow focus:outline-none"
            onClick={async () => {
              const checkinDate = selected.from!;
              const checkoutDate = selected.to!;


              try {
                await logEvent(EVENT_TYPES.RESERVE_HOTEL, {
                  id: prop.id,
                  guests_set: guests,
                  hotel: prop,
                  // Include actual selected dates in local timezone (not UTC)
                  selected_checkin: checkinDate.toLocaleDateString('en-CA'), // YYYY-MM-DD format
                  selected_checkout: checkoutDate.toLocaleDateString('en-CA'), // YYYY-MM-DD format
                  selected_dates_from: checkinDate.toLocaleDateString('en-CA'),
                  selected_dates_to: checkoutDate.toLocaleDateString('en-CA'),
                });
                
                // Set flag to prevent duplicate logging on confirm page
                sessionStorage.setItem('reserveEventLogged', 'true');
              } catch (err) {
                console.error("❌ logEvent failed", err);
              }

              router.push(
                `/stay/${params.id}/confirm?checkin=${encodeURIComponent(
                  toUtcIsoWithTimezone(checkinDate)
                )}&checkout=${encodeURIComponent(
                  toUtcIsoWithTimezone(checkoutDate)
                )}&guests=${guests}`
              );
            }}
          >
            Reserve
          </button>
        )}
        {(!selected.from || !selected.to) && (
          <button
            id="checkAvailabilityButton"
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
