"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isWithinInterval,
} from "date-fns";
import Image from "next/image";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { dynamicDataProvider } from "@/utils/dynamicDataProvider";
import type { Hotel } from "@/types/hotel";
import { useSeedLayout } from "@/library/utils";
import { getSeedLayout as getLayoutVariantConfig } from "@/library/layoutVariants";

function parseLocalDate(dateString: string | undefined) {
  if (!dateString) {
    return null;
  }

  const [year, month, day] = dateString.split("-").map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function toStartOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function toUtcIsoWithTimezone(date: Date) {
  const utc = new Date(date.getTime());
  return utc.toISOString().replace("Z", "+00:00");
}

function getFallbackHotel(): Hotel {
  const [firstDynamic] = dynamicDataProvider.getHotels();
  if (firstDynamic) {
    return firstDynamic;
  }
  // If no AI-generated hotels available, throw error rather than using dataset
  throw new Error("No AI-generated hotels available. Please ensure data generation is enabled.");
}

function PropertyDetailContent() {
  const { getText, getId } = useDynamicStructure();
  const { seed } = useSeedLayout();
  const layoutVariant = useMemo(
    () => getLayoutVariantConfig(seed ?? 1),
    [seed],
  );
  const { propertyDetail, buttons, forms } = layoutVariant;
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [prop, setProp] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load hotel data - always use AI-generated data, never dataset
  useEffect(() => {
    async function loadHotel() {
      setIsLoading(true);
      const numId = Number(params.id);
      
      if (Number.isFinite(numId)) {
        // First try to get from provider
        let hotel = dynamicDataProvider.getHotelById(numId);
        
        // If not found, try to generate on-demand
        if (!hotel) {
          hotel = await dynamicDataProvider.getHotelByIdOrGenerate(numId);
        }
        
        // If still not found, use first available AI-generated hotel
        if (!hotel) {
          const allDynamicHotels = dynamicDataProvider.getHotels();
          if (allDynamicHotels.length > 0) {
            hotel = allDynamicHotels[0];
          }
        }
        
        if (hotel) {
          setProp(hotel);
          setIsLoading(false);
          return;
        }
      }
      
      // Final fallback - but this should never use dataset
      try {
        const fallback = getFallbackHotel();
        setProp(fallback);
      } catch (error) {
        console.error("Failed to load hotel:", error);
        // Use first available AI-generated hotel as last resort
        const allDynamicHotels = dynamicDataProvider.getHotels();
        if (allDynamicHotels.length > 0) {
          setProp(allDynamicHotels[0]);
        }
      }
      setIsLoading(false);
    }
    
    loadHotel();
  }, [params.id]);

  // All hooks must be called before any conditional returns
  const stayFrom = useMemo(() => {
    if (!prop) return toStartOfDay(new Date());
    const parsed = parseLocalDate(prop.datesFrom);
    return parsed ? toStartOfDay(parsed) : toStartOfDay(new Date());
  }, [prop?.datesFrom]);

  const stayTo = useMemo(() => {
    if (!prop) return addDays(toStartOfDay(new Date()), 1);
    const parsed = parseLocalDate(prop.datesTo);
    if (parsed) {
      return toStartOfDay(parsed);
    }
    return addDays(stayFrom, 1);
  }, [prop?.datesTo, stayFrom]);

  const initialRange = useMemo<DateRange | undefined>(
    () => ({
      from: stayFrom,
      to: stayTo,
    }),
    [stayFrom, stayTo]
  );

  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    initialRange
  );
  useEffect(() => {
    setSelectedRange(initialRange);
  }, [initialRange]);

  const [guests, setGuests] = useState(() => {
    if (!prop) return 1;
    const maxGuests = prop.maxGuests ?? prop.guests ?? 1;
    return Math.min(Math.max(1, prop.guests ?? 1), maxGuests);
  });

  useEffect(() => {
    if (!prop) return;
    const maxGuests = prop.maxGuests ?? prop.guests ?? 1;
    setGuests(Math.min(Math.max(1, prop.guests ?? 1), maxGuests));
  }, [prop?.guests, prop?.maxGuests]);

  // All remaining hooks must be called before conditional return
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [receiverEmail, setReceiverEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const didTrack = useRef(false);
  useEffect(() => {
    if (!prop || didTrack.current) {
      return;
    }

    logEvent(EVENT_TYPES.VIEW_HOTEL, {
      id: prop.id,
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
  }, [
    prop?.amenities,
    prop?.datesFrom,
    prop?.datesTo,
    prop?.guests,
    prop?.host,
    prop?.id,
    prop?.location,
    prop?.price,
    prop?.rating,
    prop?.reviews,
    prop?.title,
  ]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Show loading state - must be after all hooks
  if (isLoading || !prop) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading hotel details...</div>
      </div>
    );
  }

  // These calculations can happen after the early return check since they're not hooks
  const nights =
    selectedRange?.from && selectedRange?.to
      ? Math.max(
          0,
          differenceInCalendarDays(
            selectedRange.to,
            selectedRange.from
          )
        )
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

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (!range) {
      setSelectedRange(undefined);
      return;
    }

    const normalizedFrom = range.from ? toStartOfDay(range.from) : undefined;
    const normalizedTo = range.to ? toStartOfDay(range.to) : undefined;

    setSelectedRange({
      from: normalizedFrom,
      to: normalizedTo,
    });
  };

  const maxGuestsAllowed = prop.maxGuests ?? prop.guests ?? 1;
  const hasValidSelection =
    Boolean(selectedRange?.from) && Boolean(selectedRange?.to);

  const handleReserve = async () => {
    if (!selectedRange?.from || !selectedRange?.to) {
      return;
    }

    const checkinDate = selectedRange.from;
    const checkoutDate = selectedRange.to;

    try {
      await logEvent(EVENT_TYPES.RESERVE_HOTEL, {
        id: prop.id,
        guests_set: guests,
        hotel: prop,
        selected_checkin: format(checkinDate, "yyyy-MM-dd"),
        selected_checkout: format(checkoutDate, "yyyy-MM-dd"),
        selected_dates_from: format(checkinDate, "yyyy-MM-dd"),
        selected_dates_to: format(checkoutDate, "yyyy-MM-dd"),
      });
      sessionStorage.setItem("reserveEventLogged", "true");
    } catch (error) {
      console.error("❌ logEvent failed", error);
    }

    router.push(
      `/stay/${params.id}/confirm?checkin=${encodeURIComponent(
        toUtcIsoWithTimezone(checkinDate)
      )}&checkout=${encodeURIComponent(
        toUtcIsoWithTimezone(checkoutDate)
      )}&guests=${guests}`
    );
  };

  return (
    <div className={propertyDetail.mainClass}>
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded text-sm shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md animate-fade-in">
            <h2 className="text-xl font-semibold mb-3 text-neutral-800">
              📤 {getText("share_title", "Share this property")}
            </h2>

            <input
              type="email"
              placeholder={getText(
                "share_email_placeholder",
                "Receiver's email"
              )}
              value={receiverEmail}
              onChange={(event) => {
                const value = event.target.value;
                setReceiverEmail(value);

                const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                setEmailError(
                  isValidEmail || value === ""
                    ? ""
                    : getText("invalid_email", "Invalid email address")
                );
              }}
              className="w-full border px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300"
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                id={getId("share_cancel_button")}
                onClick={() => {
                  setShowShareModal(false);
                  setReceiverEmail("");
                  setEmailError("");
                }}
                className="px-4 py-1.5 rounded-full text-sm bg-neutral-200 hover:bg-neutral-300"
              >
                {getText("cancel", "Cancel")}
              </button>
              <button
                id={getId("share_send_button")}
                disabled={!!emailError || !receiverEmail}
                onClick={() => {
                  setShowShareModal(false);
                  setToastMessage(
                    getText("share_link_sent", `Link sent to ${receiverEmail}`)
                  );
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
                {getText("send", "Send")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={propertyDetail.infoClass}>
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
            · {prop.reviews ?? 30} {getText("reviews", "reviews")}
          </span>
          <button
            onClick={() => {
              const newState = !isWishlisted;
              setIsWishlisted(newState);

              if (newState) {
                logEvent(EVENT_TYPES.ADD_TO_WISHLIST, {
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
              }

              setToastMessage(
                newState
                  ? getText("added_to_wishlist", "Added to wishlist ❤️")
                  : getText("removed_from_wishlist", "Removed from wishlist 💔")
              );
            }}
            className={buttons.iconClass}
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
            id={getId("share_button")}
            onClick={() => setShowShareModal(true)}
            className={buttons.secondaryClass}
          >
            {getText("share", "Share")}
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
          {prop.amenities?.map((amenity, index) => (
            <div
              className="flex items-start gap-4"
              key={amenity.title}
              id={`amenity-${index}`}
            >
              <span className="text-2xl pt-1">{amenity.icon}</span>
              <div>
                <div className="font-semibold text-neutral-900 text-[17px]">
                  {amenity.title}
                </div>
                <div className="text-neutral-500 text-sm -mt-0.5">
                  {amenity.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border rounded-2xl p-4 bg-white shadow-sm">
          <h2 className="font-semibold text-lg mb-3">
            {getText("select_dates", "Select your stay")}
          </h2>
          <Calendar
            numberOfMonths={2}
            mode="range"
            defaultMonth={selectedRange?.from ?? stayFrom}
            selected={selectedRange}
            onSelect={handleCalendarSelect}
            disabled={(date) => !isWithinAvailable(date)}
            initialFocus
          />
        </div>
      </div>

      <div className={propertyDetail.sidebarClass}>
        <div id="pricePerNight" className="text-2xl font-bold mb-1">
          ${prop.price.toFixed(2)}{" "}
          <span className="text-base text-neutral-600 font-medium">
            USD <span className="font-normal">night</span>
          </span>
        </div>
        <div className="flex gap-3 mt-3 mb-4">
          <div id="checkIn" className={forms.groupClass}>
            <div className={forms.labelClass}>
              {getText("check_in", "CHECK-IN")}
            </div>
            <div className="tracking-wide text-[15px]">
              {selectedRange?.from ? format(selectedRange.from, "MM/dd/yyyy") : "–"}
            </div>
          </div>
          <div id="checkOut" className={forms.groupClass}>
            <div className={forms.labelClass}>
              {getText("check_out", "CHECK-OUT")}
            </div>
            <div className="tracking-wide text-[15px]">
              {selectedRange?.to ? format(selectedRange.to, "MM/dd/yyyy") : "–"}
            </div>
          </div>
        </div>
        <div className={`${forms.groupClass} mb-3`}>
          <div className={forms.labelClass}>
            {getText("guests", "GUESTS")}
          </div>
          <input
            id={getId("guests_count")}
            className={forms.inputClass}
            value={guests}
            type="number"
            min={1}
            max={maxGuestsAllowed}
            onChange={(event) => {
              const rawValue = Number(event.target.value);
              if (!Number.isFinite(rawValue)) {
                return;
              }

              const nextValue = Math.max(1, Math.min(maxGuestsAllowed, rawValue));

              if (nextValue > guests) {
                logEvent(EVENT_TYPES.INCREASE_NUMBER_OF_GUESTS, {
                  from: guests,
                  to: nextValue,
                  hotel: prop,
                });
              }

              setGuests(nextValue);
            }}
          />
        </div>
        {hasValidSelection ? (
          <button
            id={getId("reserve_button")}
            className={buttons.primaryClass}
            onClick={handleReserve}
          >
            {getText("reserve", "Reserve")}
          </button>
        ) : (
          <button
            id={getId("check_availability_button")}
            disabled
            className="rounded-lg w-full py-3 text-neutral-400 font-semibold text-base bg-neutral-100 mb-3 shadow cursor-not-allowed"
          >
            {getText("check_availability", "Check Availability")}
          </button>
        )}
        <div className="text-center text-neutral-400 text-sm mb-4">
          {getText("no_charge_yet", "You won't be charged yet")}
        </div>
        <div className="flex flex-col gap-2 text-[15px]">
          <div className="flex items-center justify-between">
            <span className="underline">
              ${prop.price.toFixed(2)} USD x {nights}{" "}
              {nights === 1 ? getText("night", "night") : getText("nights", "nights")}
            </span>
            <span>${priceSubtotal.toFixed(2)} USD</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="underline">
              {getText("cleaning_fee", "Cleaning fee")}
            </span>
            <span>${cleaningFee} USD</span>
          </div>
          <hr />
          <div className="flex items-center justify-between font-bold text-neutral-900">
            <span>{getText("total", "Total")}</span>{" "}
            <span>${total.toFixed(2)} USD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PropertyDetailContent />
    </Suspense>
  );
}

