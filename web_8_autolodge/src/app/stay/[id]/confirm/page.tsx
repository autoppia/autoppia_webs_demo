"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, isWithinInterval, parseISO } from "date-fns";
import { useState, useEffect } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { DASHBOARD_HOTELS } from "@/library/dataset";
import { useRef } from "react";
import { useSeedLayout } from "@/library/utils";
import { DynamicWrapper } from "@/components/DynamicWrapper";
import { Suspense } from "react";

function toStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toUtcIsoWithTimezone(date: Date) {
  return date.toISOString().replace("Z", "+00:00");
}

function ConfirmPageContent() {
  const { seed, layout } = useSeedLayout();
  const guestsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const prop = DASHBOARD_HOTELS[Number(params.id)] ?? DASHBOARD_HOTELS[0];
  const stayFrom = new Date(prop.datesFrom);
  const stayTo = new Date(prop.datesTo);
  // Load selection from search params (or defaults)
  const urlCheckin = search.get("checkin");
  const urlCheckout = search.get("checkout");
  const urlGuests = search.get("guests");
  const [dateOpen, setDateOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: urlCheckin ? new Date(urlCheckin) : toStartOfDay(stayFrom),
    to: urlCheckout ? new Date(urlCheckout) : toStartOfDay(stayTo),
  });
  const [guests, setGuests] = useState(Number(urlGuests) || 1);
  const [prevGuests, setPrevGuests] = useState(1);
  // For pricing
  const nights =
    dateRange.from && dateRange.to
      ? (toStartOfDay(dateRange.to).getTime() -
          toStartOfDay(dateRange.from).getTime()) /
        (1000 * 60 * 60 * 24)
      : 0;

  const cleaningFee = 15;
  const serviceFee = 34;
  const priceSubtotal = prop.price * nights;
  const total = priceSubtotal + cleaningFee + serviceFee;
  function isWithinAvailable(date: Date) {
    return isWithinInterval(date, {
      start: stayFrom,
      end: addDays(stayTo, -1),
    });
  }
  // Update confirm page with params
  function pushWith(newVals: {
    checkin?: Date;
    checkout?: Date;
    guests?: number;
  }) {
    const search = [];
    const f = newVals.checkin || dateRange.from;
    const t = newVals.checkout || dateRange.to;
    if (f) search.push(`checkin=${toUtcIsoWithTimezone(f)}`);
    if (t) search.push(`checkout=${toUtcIsoWithTimezone(t)}`);
    search.push(`guests=${newVals.guests ?? guests}`);
    router.replace(`/stay/${params.id}/confirm?` + search.join("&"));
  }
  const [hostMessage, setHostMessage] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const hostYear = 2014;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2700);
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2700);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) {
        setGuestsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Payment form state
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("United States");

  // Validation
  const canPay =
    cardNumber.length >= 13 &&
    exp.length === 5 &&
    cvv.length >= 3 &&
    zip.length >= 3 &&
    country.length > 0;

  // Create event elements based on layout order
  const createEventElement = (eventType: string) => {
    switch (eventType) {
      case 'search':
        return (
          <DynamicWrapper key="search" as="div" className="mb-6">
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-xl font-semibold mb-4">Search Options</h2>
              <div className="text-sm text-neutral-600">
                Current search: {prop.location}
              </div>
            </div>
          </DynamicWrapper>
        );
      case 'view':
        return (
          <DynamicWrapper key="view" as="div" className="mb-6">
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="flex items-center gap-3">
                <img
                  src={prop.image}
                  alt={prop.title}
                  width={80}
                  height={60}
                  className="rounded-lg object-cover"
                />
                <div>
                  <div className="font-semibold">{prop.title}</div>
                  <div className="text-sm text-neutral-600">{prop.location}</div>
                </div>
              </div>
            </div>
          </DynamicWrapper>
        );
      case 'reserve':
        return (
          <DynamicWrapper key="reserve" as="div" className="mb-6">
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-xl font-semibold mb-4">Reservation Summary</h2>
              <div className="text-sm text-neutral-600">
                {nights} nights • {guests} guests
              </div>
            </div>
          </DynamicWrapper>
        );
      case 'confirm':
        return (
          <DynamicWrapper key="confirm" as="div" className="w-full min-w-[325px] max-w-xs bg-white shadow-md rounded-2xl border flex flex-col p-6 sticky top-8 h-fit self-start">
            <div className="flex gap-3 mb-3 items-center">
              <img
                src={prop.image}
                width={64}
                height={48}
                className="rounded-xl object-cover border"
                alt={prop.title}
              />
              <div>
                <div className="font-semibold text-base leading-tight mb-0">
                  {prop.title}
                </div>
                <div className="text-xs text-neutral-600 mb-0.5">
                  Entire condo
                </div>
                <div className="flex items-center gap-0.5 text-[15px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#FF5A5F"
                    width={15}
                    height={15}
                    viewBox="0 0 24 24"
                    stroke="none"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <b>{prop.rating.toFixed(2)}</b>
                  <span className="text-neutral-400 ml-1">
                    ({prop.reviews ?? 30} reviews)
                  </span>
                </div>
              </div>
            </div>
            <hr className="my-3 mt-0.5" />
            <div className="font-bold mb-3">Price details</div>
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
              <div className="flex items-center justify-between">
                <span className="underline">Staynb service fee</span>{" "}
                <span>${serviceFee} USD</span>
              </div>
              <hr />
              <div className="flex items-center justify-between font-bold text-neutral-900">
                <span>Total (USD)</span> <span>${total.toFixed(2)} USD</span>
              </div>
            </div>
            <button
              className="mt-7 rounded-lg w-full py-4 text-white font-semibold text-[18px] bg-[#616882] hover:bg-[#7d87aa] transition shadow focus:outline-none disabled:opacity-50 disabled:pointer-events-none"
              id="confirm-and-pay-btn"
              onClick={() => {
                setHasTriedSubmit(true);

                if (!canPay) {
                  return; // Don't proceed if any field is incomplete
                }
                logEvent(EVENT_TYPES.CONFIRM_AND_PAY, {
                  guests_set: guests,
                  nights,
                  priceSubtotal,
                  cleaningFee,
                  serviceFee,
                  total,
                  cardNumber,
                  expiration: exp,
                  cvv,
                  zip,
                  country,
                  hotel: prop,
                });

                showToast("✅ Reservation complete! Thank you! 🙏");
                // ✅ Reset form fields
                setCardNumber("");
                setExp("");
                setCvv("");
                setZip("");
                setCountry("United States");
                setHasTriedSubmit(false);
              }}
            >
              Confirm and pay
            </button>
          </DynamicWrapper>
        );
      case 'message':
        return (
          <DynamicWrapper key="message" as="section" className="bg-white rounded-2xl border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Message your host</h2>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={prop.host.avatar}
                alt={prop.title}
                width={44}
                height={44}
                className="rounded-full border"
              />
              <div>
                <div className="font-medium text-neutral-900">
                  {prop.host.name}
                </div>
                <div className="text-neutral-500 text-xs">
                  Joined in {hostYear}
                </div>
              </div>
            </div>
            <textarea
              id="host-message-input"
              value={hostMessage}
              onChange={(e) => setHostMessage(e.target.value)}
              rows={4}
              placeholder={`Hi ${prop.host.name} I'll be staying...`}
              className="w-full border rounded-lg px-3 py-3 text-[16px] bg-white mb-3 resize-none"
            />
            <button
              id="send-host-message-btn"
              onClick={() => {
                if (hostMessage.trim() !== "") {
                  logEvent(EVENT_TYPES.MESSAGE_HOST, {
                    message: hostMessage.trim(),
                    hostName: prop.host.name,
                    source: "message_host_section",
                    hotel: prop,
                  });

                  showToast(" ✅ Message sent.");
                  setHostMessage("");
                }
              }}
              className="bg-[#616882] hover:bg-[#504546] text-white font-semibold px-6 py-2 rounded-lg mb-2 transition disabled:opacity-50 disabled:pointer-events-none"
              disabled={!hostMessage.trim()}
            >
              Send
            </button>
          </DynamicWrapper>
        );
      case 'dates':
        return (
          <DynamicWrapper key="dates" as="section" className="bg-white rounded-2xl border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Edit your dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Check-in
                </label>
                <input
                  type="date"
                  value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : null;
                    if (newDate) {
                      logEvent(EVENT_TYPES.EDIT_CHECK_IN_OUT_DATES, {
                        from: newDate.toISOString(),
                        to: dateRange.to?.toISOString() || null,
                        hotel: prop,
                      });
                    }
                    setDateRange(prev => ({ ...prev, from: newDate }));
                  }}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Check-out
                </label>
                <input
                  type="date"
                  value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : null;
                    if (newDate) {
                      logEvent(EVENT_TYPES.EDIT_CHECK_IN_OUT_DATES, {
                        from: dateRange.from?.toISOString() || null,
                        to: newDate.toISOString(),
                        hotel: prop,
                      });
                    }
                    setDateRange(prev => ({ ...prev, to: newDate }));
                  }}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </DynamicWrapper>
        );
      case 'guests':
        return (
          <DynamicWrapper key="guests" as="section" className="bg-white rounded-2xl border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Number of guests</h2>
            <div className="flex items-center gap-4">
              <label className="block text-sm font-medium text-neutral-700">
                Guests:
              </label>
              <input
                type="number"
                min={1}
                max={prop.guests}
                value={guests}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value > guests) {
                    logEvent(EVENT_TYPES.INCREASE_NUMBER_OF_GUESTS, {
                      from: guests,
                      to: value,
                      hotel: prop,
                    });
                  }
                  setGuests(value);
                }}
                className="w-20 border rounded-lg px-3 py-2"
              />
            </div>
          </DynamicWrapper>
        );
      case 'wishlist':
        return (
          <DynamicWrapper key="wishlist" as="div" className="mb-6">
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-xl font-semibold mb-4">Save for Later</h2>
              <button
                onClick={() => {
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
                  showToast("Added to wishlist ❤️");
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Add to Wishlist
              </button>
            </div>
          </DynamicWrapper>
        );
      case 'share':
        return (
          <DynamicWrapper key="share" as="div" className="mb-6">
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-xl font-semibold mb-4">Share Property</h2>
              <button
                onClick={() => {
                  logEvent(EVENT_TYPES.SHARE_HOTEL, {
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
                  showToast("Share link copied to clipboard!");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Share Property
              </button>
            </div>
          </DynamicWrapper>
        );
      case 'back':
        return (
          <DynamicWrapper key="back" as="div" className="mb-6">
            <button
              onClick={() => {
                logEvent(EVENT_TYPES.BACK_TO_ALL_HOTELS, {
                  from: "confirm_page",
                  hotel: prop,
                });
                router.push('/');
              }}
              className="px-4 py-2 text-sm rounded-full bg-gray-600 text-white hover:bg-gray-700 transition"
            >
              Back to All Hotels
            </button>
          </DynamicWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <DynamicWrapper as={layout.propertyDetail.wrapper} className={layout.propertyDetail.className}>
        {layout.eventElements.order.map(createEventElement)}
      </DynamicWrapper>
      
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-green-50 border border-green-800 text-green-800 rounded-lg p-5 text-center text-xl font-semibold shadow">
          {toast}
        </div>
      )}
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmPageContent />
    </Suspense>
  );
}
