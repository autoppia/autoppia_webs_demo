"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, isWithinInterval, parseISO } from "date-fns";
import { useState, useEffect, useMemo } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { DASHBOARD_HOTELS } from "@/library/dataset";
import { useRef } from "react";
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
  const guestsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const prop = useMemo(() => {
    const numId = Number(params.id);
    const hotel = DASHBOARD_HOTELS.find(hotel => hotel.id === numId);
    return hotel ?? DASHBOARD_HOTELS[0];
  }, [params.id]);
  const stayFrom = new Date(prop.datesFrom);
  const stayTo = new Date(prop.datesTo);
  // Load selection from search params (or defaults)
  const urlCheckin = search.get("checkin");
  const urlCheckout = search.get("checkout");
  const urlGuests = search.get("guests");

  // Validate URL parameters
  const parseDateSafely = (dateStr: string | null): Date | null => {
    if (!dateStr) return null;
    try {
      const parsed = parseISO(dateStr);
      if (isNaN(parsed.getTime())) return null;
      return toStartOfDay(parsed);
    } catch (e) {
      console.error(`Invalid date format for ${dateStr}:`, e);
      return null;
    }
  };

  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: parseDateSafely(urlCheckin) ?? toStartOfDay(stayFrom),
    to: parseDateSafely(urlCheckout) ?? toStartOfDay(stayTo),
  });
  const [guests, setGuests] = useState(Number(urlGuests) || 1);
  const [prevGuests, setPrevGuests] = useState(1);
  const [dateOpen, setDateOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
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
    if (f) search.push(`checkin=${format(f, "yyyy-MM-dd")}`);
    if (t) search.push(`checkout=${format(t, "yyyy-MM-dd")}`);
    search.push(`guests=${newVals.guests ?? guests}`);
    router.replace(`/stay/${params.id}/confirm?` + search.join("&"));
  }

  const [hostMessage, setHostMessage] = useState("");
  const [toast, setToast] = useState<string | null>(null);

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


  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Booking Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Information */}
          <div className="bg-white rounded-lg border p-6">
            <h1 className="text-2xl font-bold mb-4">Confirm your booking</h1>
            <div className="flex items-start gap-4">
              <img
                src={prop.image}
                alt={prop.title}
                width={120}
                height={90}
                className="rounded-lg object-cover"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">{prop.title}</h2>
                <p className="text-gray-600 mb-2">{prop.location}</p>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#FF5A5F"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    stroke="none"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <span className="font-medium">{prop.rating.toFixed(2)}</span>
                  <span className="text-gray-500">({prop.reviews ?? 30} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Your trip</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guests
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
          </div>

          {/* Message Host */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Message your host</h3>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={prop.host.avatar}
                alt={prop.host.name}
                width={40}
                height={40}
                className="rounded-full border"
              />
              <div>
                <div className="font-medium text-gray-900">
                  {prop.host.name}
                </div>
                <div className="text-gray-500 text-sm">
                  Host
                </div>
              </div>
            </div>
            <textarea
              id="host-message-input"
              value={hostMessage}
              onChange={(e) => setHostMessage(e.target.value)}
              rows={3}
              placeholder={`Hi ${prop.host.name}, I'm looking forward to my stay...`}
              className="w-full border rounded-lg px-3 py-3 text-sm bg-white mb-3 resize-none"
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

                  showToast("Message sent successfully!");
                  setHostMessage("");
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:pointer-events-none"
              disabled={!hostMessage.trim()}
            >
              Send message
            </button>
          </div>
        </div>

        {/* Right Column - Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6 sticky top-8">
            <div className="font-bold mb-4 text-lg">Price details</div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>
                  ${prop.price.toFixed(2)} USD × {nights} nights
                </span>
                <span>${priceSubtotal.toFixed(2)} USD</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cleaning fee</span>
                <span>${cleaningFee} USD</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Service fee</span>
                <span>${serviceFee} USD</span>
              </div>
              <hr />
              <div className="flex items-center justify-between font-bold text-lg">
                <span>Total (USD)</span>
                <span>${total.toFixed(2)} USD</span>
              </div>
            </div>
            <button
              className="mt-6 rounded-lg w-full py-4 text-white font-semibold text-lg bg-blue-600 hover:bg-blue-700 transition shadow focus:outline-none disabled:opacity-50 disabled:pointer-events-none"
              id="confirm-and-pay-btn"
              onClick={() => {
                setHasTriedSubmit(true);

                if (!canPay) {
                  return;
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

                showToast("✅ Reservation complete! Thank you!");
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
          </div>
        </div>
      </div>
      
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