"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, isWithinInterval, parseISO } from "date-fns";
import { useState, useEffect } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { REGION_HOTELS } from "@/library/dataset";
import { useRef } from "react";

function toStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toUtcIsoWithTimezone(date: Date) {
  return date.toISOString().replace("Z", "+00:00");
}

export default function ConfirmPage() {
  const guestsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const prop = REGION_HOTELS[Number(params.id)] ?? REGION_HOTELS[0];
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
    from: urlCheckin ? new Date(urlCheckin) : stayFrom,
    to: urlCheckout ? new Date(urlCheckout) : stayTo,
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
    if (f) search.push(`checkin=${format(f, "yyyy-MM-dd")}`);
    if (t) search.push(`checkout=${format(t, "yyyy-MM-dd")}`);
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("United States");

  const cardFilled = cardNumber.trim().replace(/\s/g, "").length >= 14; // lenient for demo
  const expFilled = exp.trim().length >= 3;
  const cvvFilled = cvv.trim().length >= 3;
  const zipFilled = zip.trim().length > 0;
  const countryFilled = country.trim().length > 0;
  const canPay =
    cardFilled && expFilled && cvvFilled && zipFilled && countryFilled;
  const showCardError = hasTriedSubmit && !cardFilled;
  const showExpError = hasTriedSubmit && !expFilled;
  const showCvvError = hasTriedSubmit && !cvvFilled;
  const showZipError = hasTriedSubmit && !zipFilled;
  const showCountryError = hasTriedSubmit && !countryFilled;
  useEffect(() => {
    if (dateRange.from && dateRange.to && guests && params.id) {
      logEvent(EVENT_TYPES.RESERVE_HOTEL, {
        id: params.id,
        checkin: dateRange.from,
        checkout: dateRange.to,
        guests,
      });
    }
  }, []); // empty deps = run once on mount

  return (
    <div className="w-full" style={{ marginTop: "38px" }}>
      <button
        className="flex items-center gap-2 text-neutral-700 text-base font-medium hover:underline focus:underline focus:outline-none transition cursor-pointer mb-7 px-0 py-0"
        onClick={() => {
          logEvent(EVENT_TYPES.BACK_TO_ALL_HOTELS, { hotel: prop });
          router.push("/");
        }}
        type="button"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
          <path
            d="M18.5 23l-8-9 8-9"
            stroke="#18181b"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to all hotels
      </button>
      <div className="w-full py-1 grid grid-cols-1 md:grid-cols-[1fr_390px] gap-9">
        {/* LEFT COLUMN */}
        <div className="min-w-0">
          <h1 className="font-bold text-2xl mb-8">Confirm and pay</h1>
          <section className="mb-9">
            <div className="font-semibold text-xl mb-5 mt-1">Your trip</div>
            {/* Trip rows */}
            <div className="flex flex-col gap-3 mb-2">
              <div className="flex items-center gap-5 text-[16.5px] w-full relative">
                <div className="font-medium min-w-[56px] text-neutral-900">
                  Dates
                </div>
                <div className="flex-1 text-neutral-800 tracking-wide">
                  {dateRange.from && format(dateRange.from, "MMM d")} –{" "}
                  {dateRange.to && format(addDays(dateRange.to, -1), "MMM d")}
                </div>
                <button
                  onClick={() => {
                    setDateOpen((x) => !x);
                    setGuestsOpen(false);
                  }}
                  className="ml-2 text-[#ff5a5f] text-base font-medium hover:underline focus:underline focus:outline-none px-1"
                >
                  Edit
                </button>
                {dateOpen && (
                  <div className="absolute left-0 top-8 z-40 bg-white p-3 rounded-2xl shadow-xl border">
                    <Calendar
                      numberOfMonths={2}
                      fromDate={undefined}
                      toDate={undefined}
                      selected={{
                        from: dateRange.from ?? undefined,
                        to: dateRange.to ?? undefined,
                      }}
                      mode="range"
                      onSelect={(range) => {
                        if (
                          range &&
                          (range.from !== dateRange.from ||
                            range.to !== dateRange.to)
                        ) {
                          setDateRange({
                            from: range.from ?? null,
                            to: range.to ?? null,
                          });
                          logEvent(EVENT_TYPES.EDIT_CHECK_IN_OUT_DATES, {
                            checkin: range.from
                              ? toUtcIsoWithTimezone(range.from)
                              : null,
                            checkout: range.to
                              ? toUtcIsoWithTimezone(range.to)
                              : null,
                            source: "calendar_picker",
                            hotel: prop, // Pass the whole hotel object
                          });
                          setDateOpen(false);
                          pushWith({
                            checkin: range.from!,
                            checkout: range.to!,
                          });
                        }
                      }}
                      initialFocus
                    />
                  </div>
                )}
              </div>
            </div>
            <hr className="my-6" />
          </section>
          <section className="mb-12">
            <div className="font-semibold text-[19px] mb-4 flex items-center justify-between">
              Pay with
            </div>
            <div className="border rounded-2xl bg-white overflow-hidden mb-5">
              <div className="flex items-center px-4 py-4 text-base font-medium cursor-pointer select-none gap-2">
                <svg width="23" height="23" fill="none" viewBox="0 0 20 20">
                  <rect width="20" height="20" rx="7" fill="#f6f6f6" />
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect
                      x="2.5"
                      y="8.5"
                      width="15"
                      height="3"
                      rx="1.5"
                      fill="#222"
                    />
                  </svg>
                </svg>
                Credit or debit card
                <svg
                  width="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="ml-auto"
                >
                  <path d="M7 10l5 5 5-5" stroke="#222" strokeWidth="1.8" />
                </svg>
              </div>
              <div className="border-t px-0.5 pb-2 pt-3">
                <div className="px-3">
                  <label className="block text-xs mb-1 font-semibold text-neutral-600">
                    Card number
                  </label>
                  <input
                    id="cardNumber"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    className={`w-full border rounded-md px-3 py-2 text-[16px] tracking-wider bg-white focus:ring-2 ring-neutral-200 ${
                      hasTriedSubmit &&
                      cardNumber.trim().replace(/\s/g, "").length < 14
                        ? "border-red-500 ring-red-200"
                        : ""
                    }`}
                    maxLength={19}
                  />

                  {hasTriedSubmit &&
                    cardNumber.trim().replace(/\s/g, "").length < 14 && (
                      <p className="text-red-500 text-sm mt-1">
                        Card number is required
                      </p>
                    )}
                </div>
                <div className="flex gap-2 mt-2 px-3">
                  <div className="flex-1">
                    <label className="block text-xs mb-1 font-semibold text-neutral-600">
                      Expiration
                    </label>
                    <input
                      id="exp"
                      type="text"
                      value={exp}
                      placeholder="MM / YY"
                      onChange={(e) => setExp(e.target.value)}
                      className={`w-full border rounded-md px-3 py-2 text-[16px] bg-white focus:ring-2 ring-neutral-200 ${
                        hasTriedSubmit && exp.trim().length < 3
                          ? "border-red-500 ring-red-200"
                          : ""
                      }`}
                    />
                    {hasTriedSubmit && exp.trim().length < 3 && (
                      <p className="text-red-500 text-sm mt-1">
                        Expiration is required
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs mb-1 font-semibold text-neutral-600">
                      CVV
                    </label>
                    <input
                      id="cvv"
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      className={`w-full border rounded-md px-3 py-2 text-[16px] bg-white focus:ring-2 ring-neutral-200 ${
                        hasTriedSubmit && cvv.trim().length < 3
                          ? "border-red-500 ring-red-200"
                          : ""
                      }`}
                    />
                    {hasTriedSubmit && cvv.trim().length < 3 && (
                      <p className="text-red-500 text-sm mt-1">
                        CVV is required
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 px-3">
                  <label className="block text-xs mb-1 font-semibold text-neutral-600">
                    ZIP code
                  </label>
                  <input
                    id="zip"
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="ZIP code"
                    className={`w-full border rounded-md px-3 py-2 text-[16px] bg-white focus:ring-2 ring-neutral-200 ${
                      hasTriedSubmit && zip.trim().length === 0
                        ? "border-red-500 ring-red-200"
                        : ""
                    }`}
                  />
                  {hasTriedSubmit && zip.trim().length === 0 && (
                    <p className="text-red-500 text-sm mt-1">
                      ZIP code is required
                    </p>
                  )}
                </div>
                <div className="mt-2 px-3 mb-4">
                  <label className="block text-xs mb-1 font-semibold text-neutral-600">
                    Country/region
                  </label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-[16px] bg-white focus:ring-2 ring-neutral-200"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Germany</option>
                    <option>France</option>
                    <option>India</option>
                    <option>Japan</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
          <section className="mb-12 pt-2 border-t border-neutral-200">
            <div className="font-bold text-[20px] mb-1 mt-5">
              Message the Host
            </div>
            <div className="text-neutral-600 text-sm mb-4">
              Share why you're traveling, who's coming with you, and what you
              love about the space.
            </div>
            <div className="flex items-center gap-4 mb-2 bg-neutral-100 rounded-lg p-3 w-fit">
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
              value={hostMessage}
              onChange={(e) => setHostMessage(e.target.value)}
              rows={4}
              placeholder={`Hi ${prop.host.name} I'll be staying...`}
              className="w-full border rounded-lg px-3 py-3 text-[16px] bg-white mb-3 resize-none"
            />
            <button
              onClick={() => {
                if (hostMessage.trim() !== "") {
                  logEvent(EVENT_TYPES.MESSAGE_HOST, {
                    message: hostMessage.trim(),
                    hostName: prop.host.name,
                    source: "message_host_section",
                    hotel: prop, // Pass the whole hotel object
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
          </section>
          {toast && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-green-50 border border-green-800 text-green-800 rounded-lg p-5 text-center text-xl font-semibold shadow">
              {toast}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: price summary and confirm button */}
        <div className="w-full min-w-[325px] max-w-xs bg-white shadow-md rounded-2xl border flex flex-col p-6 sticky top-8 h-fit self-start">
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
            onClick={() => {
              setHasTriedSubmit(true);

              if (!canPay) {
                return; // Don't proceed if any field is incomplete
              }
              logEvent(EVENT_TYPES.CONFIRM_AND_PAY, {
                checkin: dateRange.from ? dateRange.from.toISOString() : null,
                checkout: dateRange.to ? dateRange.to.toISOString() : null,
                guests,
                listingTitle: prop.title,
                pricePerNight: prop.price,
                nights,
                priceSubtotal,
                cleaningFee,
                serviceFee,
                total,
                paymentMethod: "credit_card",
                cardNumber,
                expiration: exp,
                cvv,
                country,
                source: "confirmation_page",
                hotel: prop, // Pass the whole hotel object
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
        </div>
      </div>
    </div>
  );
}
