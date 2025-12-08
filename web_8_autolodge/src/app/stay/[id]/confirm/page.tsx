"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { addDays, format, isWithinInterval, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { dynamicDataProvider } from "@/dynamic/v2-data";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { useSeedStructureNavigation } from "../../../../hooks/useSeedStructureNavigation";

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
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}


function ConfirmPageContent() {
  const { getText, getId } = useV3Attributes();
  const { navigateWithSeedStructure } = useSeedStructureNavigation();
  const router = useSeedRouter();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const prop = useMemo(() => {
    const numId = Number(params.id);
    const hotel = dynamicDataProvider.getHotelById(numId);
    return hotel ?? dynamicDataProvider.getHotels()[0];
  }, [params.id]);
  const stayFrom = useMemo(() => {
    const parsed = parseLocalDate(prop.datesFrom);
    return parsed ? toStartOfDay(parsed) : toStartOfDay(new Date());
  }, [prop.datesFrom]);
  const stayTo = useMemo(() => {
    const parsed = parseLocalDate(prop.datesTo);
    return parsed ? toStartOfDay(parsed) : addDays(stayFrom, 1);
  }, [prop.datesTo, stayFrom]);
  // Load selection from search params (or defaults)
  const urlCheckin = search.get("checkin");
  const urlCheckout = search.get("checkout");
  const urlGuests = search.get("guests");
  const bookingSource = search.get("source") ?? "direct";

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

  const guests = useMemo(() => {
    const parsed = Number(urlGuests);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [urlGuests]);

  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: parseDateSafely(urlCheckin) ?? toStartOfDay(stayFrom),
    to: parseDateSafely(urlCheckout) ?? toStartOfDay(stayTo),
  });
  const [dateOpen, setDateOpen] = useState(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  // For pricing
  const nights =
    dateRange.from && dateRange.to
      ? Math.max(
          0,
          (toStartOfDay(dateRange.to).getTime() -
            toStartOfDay(dateRange.from).getTime()) /
            (1000 * 60 * 60 * 24)
        )
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

  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  // Payment form state
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("United States");

  const sanitizedCardNumber = cardNumber.replace(/\D/g, "");
  const cardFilled = sanitizedCardNumber.length >= 12;
  const expFilled = /^\d{2}\s?\/\s?\d{2}$/.test(exp.trim());
  const cvvFilled = /^\d{3,4}$/.test(cvv.trim());
  const zipFilled = zip.trim().length >= 4;
  const countryFilled = country.trim().length > 0;

  // Validation
  const canPay =
    paymentMethod === "cash" ||
    (cardFilled && expFilled && cvvFilled && zipFilled && countryFilled);
  const showCardError = hasTriedSubmit && paymentMethod === "card" && !cardFilled;
  const showExpError = hasTriedSubmit && paymentMethod === "card" && !expFilled;
  const showCvvError = hasTriedSubmit && paymentMethod === "card" && !cvvFilled;
  const showZipError = hasTriedSubmit && paymentMethod === "card" && !zipFilled;
  const showCountryError =
    hasTriedSubmit && paymentMethod === "card" && !countryFilled;

  useEffect(() => {
    const storageKey = "reserveEventLogged";
    const alreadyLogged =
      typeof window !== "undefined"
        ? sessionStorage.getItem(storageKey)
        : null;

    if (
      dateRange.from &&
      dateRange.to &&
      guests &&
      params.id &&
      !alreadyLogged
    ) {
      logEvent(EVENT_TYPES.RESERVE_HOTEL, {
        id: prop.id,
        guests_set: guests,
        hotel: prop,
        selected_checkin: format(dateRange.from, "yyyy-MM-dd"),
        selected_checkout: format(dateRange.to, "yyyy-MM-dd"),
        selected_dates_from: format(dateRange.from, "yyyy-MM-dd"),
        selected_dates_to: format(dateRange.to, "yyyy-MM-dd"),
      });
      sessionStorage.setItem(storageKey, "true");
    }

    return () => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(storageKey);
      }
    };
  }, [dateRange.from, dateRange.to, guests, params.id, prop]);

  return (
    <div className="w-full" style={{ marginTop: "38px" }}>
      <button
        className="flex items-center gap-2 text-neutral-700 text-base font-medium hover:underline focus:underline focus:outline-none transition cursor-pointer mb-7 px-0 py-0"
        onClick={() => {
          logEvent(EVENT_TYPES.BACK_TO_ALL_HOTELS, { hotel: prop });
          navigateWithSeedStructure("/");
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
        {getText("back_to_hotels", "Back to all hotels")}
      </button>
      <div className="w-full py-1 grid grid-cols-1 md:grid-cols-[1fr_390px] gap-9">
        {/* LEFT COLUMN */}
        <div className="min-w-0">
          <h1 className="font-bold text-2xl mb-8">{getText("confirm_and_pay_title", "Confirm and pay")}</h1>
          <section className="mb-9">
            <div className="font-semibold text-xl mb-5 mt-1">{getText("your_trip", "Your trip")}</div>
            {/* Trip rows */}
            <div className="flex flex-col gap-3 mb-2">
              <div className="flex items-center gap-5 text-[16.5px] w-full relative">
                <div className="font-medium min-w-[56px] text-neutral-900">
                  {getText("dates", "Dates")}
                </div>
                <div className="flex-1 text-neutral-800 tracking-wide">
                  {dateRange.from && format(dateRange.from, "MMM d")} –{" "}
                  {dateRange.to && format(dateRange.to, "MMM d")} {/* Display actual checkout date */}
                </div>
                <button
                  onClick={() => {
                    setDateOpen((x) => {
                      const willOpen = !x;

                      if (willOpen) {
                        // Clear previous selection when opening
                        setDateRange({ from: null, to: null });
                      }

                      return willOpen;
                    });
                  }}
                  id={getId("edit_dates_button")}
                  className="ml-2 text-[#ff5a5f] text-base font-medium hover:underline focus:underline focus:outline-none px-1"
                >
                  {getText("edit", "Edit")}
                </button>
                {dateOpen && (
                  <div
                    id="dateRangeCalendar"
                    className="absolute left-0 top-8 z-40 bg-white p-3 rounded-2xl shadow-xl border"
                  >
                    <Calendar
                      numberOfMonths={2}
                      disabled={(date) => !isWithinAvailable(date)}
                      selected={{
                        from: dateRange.from ?? undefined,
                        to: dateRange.to ?? undefined,
                      }}
                      mode="range"
                      onSelect={(range: DateRange | undefined) => {
                        if (!range) return;

                        const { from, to } = range;

                        // Validate to date to ensure it matches the selected day
                        let adjustedTo = to;
                        if (to) {
                          adjustedTo = toStartOfDay(to);
                        }

                        setDateRange({ from: from ?? null, to: adjustedTo ?? null });

                        if (from && adjustedTo) {
                          logEvent(EVENT_TYPES.EDIT_CHECK_IN_OUT_DATES, {
                            dateRange: {
                              from: format(from, "yyyy-MM-dd"),
                              to: format(adjustedTo, "yyyy-MM-dd"), // Log actual checkout date
                            },
                            source: "calendar_picker",
                            hotel: prop,
                          });

                          setDateOpen(false);

                          pushWith({
                            checkin: from,
                            checkout: adjustedTo,
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
            <div className="font-semibold text-[19px] mb-4 flex items-center justify-between">{getText("pay_with", "Pay with")}</div>
            <div className="flex flex-col gap-3 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment-method"
                  checked={paymentMethod === "card"}
                  onChange={() => {
                    setPaymentMethod("card");
                    logEvent(EVENT_TYPES.PAYMENT_METHOD_SELECTED, {
                      method: "card",
                      hotelId: prop.id,
                    });
                  }}
                />
                <span className="text-base font-medium">
                  {getText("card_method", "Credit or debit card")}
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment-method"
                  checked={paymentMethod === "cash"}
                  onChange={() => {
                    setPaymentMethod("cash");
                    logEvent(EVENT_TYPES.PAYMENT_METHOD_SELECTED, {
                      method: "cash_on_arrival",
                      hotelId: prop.id,
                    });
                  }}
                />
                <span className="text-base font-medium">
                  Cash on arrival
                </span>
              </label>
            </div>

            <div className="border rounded-2xl bg-white overflow-hidden mb-5">
              <div className="flex items-center px-4 py-4 text-base font-medium select-none gap-2">
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
                {getText("card_method", "Credit or debit card")}
                <svg
                  width="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="ml-auto"
                >
                  <path d="M7 10l5 5 5-5" stroke="#222" strokeWidth="1.8" />
                </svg>
              </div>
              <div className={`border-t px-0.5 pb-2 pt-3 ${paymentMethod !== "card" ? "opacity-60 pointer-events-none" : ""}`}>
                <div className="px-3">
                  <label className="block text-xs mb-1 font-semibold text-neutral-600">{getText("card_number", "Card number")}</label>
                  <input
                    id={getId("card_number_input")}
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder={getText("card_number_placeholder", "0000 0000 0000 0000")}
                    className={`w-full border rounded-md px-3 py-2 text-[16px] tracking-wider bg-white focus:ring-2 ring-neutral-200 ${
                      showCardError ? "border-red-500 ring-red-200" : ""
                    }`}
                    maxLength={19}
                    disabled={paymentMethod !== "card"}
                  />
                  {showCardError && (
                    <p className="text-red-500 text-sm mt-1">{getText("card_number_required", "Card number is required")}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-2 px-3">
                  <div className="flex-1">
                    <label className="block text-xs mb-1 font-semibold text-neutral-600">{getText("expiration", "Expiration")}</label>
                    <input
                      id={getId("card_exp_input")}
                      type="text"
                      value={exp}
                      placeholder={getText("expiration_placeholder", "MM / YY")}
                      onChange={(e) => setExp(e.target.value)}
                      className={`w-full border rounded-md px-3 py-2 text-[16px] bg-white focus:ring-2 ring-neutral-200 ${
                        showExpError ? "border-red-500 ring-red-200" : ""
                      }`}
                      disabled={paymentMethod !== "card"}
                    />
                    {showExpError && (
                      <p className="text-red-500 text-sm mt-1">{getText("expiration_required", "Expiration is required")}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs mb-1 font-semibold text-neutral-600">{getText("cvv", "CVV")}</label>
                    <input
                      id={getId("card_cvv_input")}
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder={getText("cvv_placeholder", "123")}
                      className={`w-full border rounded-md px-3 py-2 text-[16px] bg-white focus:ring-2 ring-neutral-200 ${
                        showCvvError ? "border-red-500 ring-red-200" : ""
                      }`}
                      disabled={paymentMethod !== "card"}
                    />
                    {showCvvError && (
                      <p className="text-red-500 text-sm mt-1">{getText("cvv_required", "CVV is required")}</p>
                    )}
                  </div>
                </div>
                <div className="mt-2 px-3">
                  <label className="block text-xs mb-1 font-semibold text-neutral-600">{getText("zip_code", "ZIP code")}</label>
                  <input
                    id={getId("zip_input")}
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder={getText("zip_placeholder", "ZIP code")}
                    className={`w-full border rounded-md px-3 py-2 text-[16px] bg-white focus:ring-2 ring-neutral-200 ${
                      showZipError ? "border-red-500 ring-red-200" : ""
                    }`}
                    disabled={paymentMethod !== "card"}
                  />
                  {showZipError && (
                    <p className="text-red-500 text-sm mt-1">{getText("zip_required", "ZIP code is required")}</p>
                  )}
                </div>
                <div className="mt-2 px-3 mb-4">
                  <label className="block text-xs mb-1 font-semibold text-neutral-600">{getText("country_region", "Country/region")}</label>
                  <select
                    id={getId("country_select")}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-[16px] bg-white focus:ring-2 ring-neutral-200"
                    disabled={paymentMethod !== "card"}
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
            {paymentMethod === "cash" && (
              <div className="border rounded-xl bg-amber-50 text-amber-900 px-4 py-3 text-sm">
                Pay the host on arrival. We will hold your reservation until check-in.
              </div>
            )}
          </section>
          <section className="mb-12 pt-2 border-t border-neutral-200">
            <div className="font-bold text-[20px] mb-1 mt-5">{getText("message_host_title", "Message the Host")}</div>
            <div className="text-neutral-600 text-sm mb-4">
              {getText("message_host_hint", "Share why you're traveling, who's coming with you, and what you love about the space.")}
            </div>
            <div className="flex items-center gap-4 mb-2 bg-neutral-100 rounded-lg p-3 w-fit">
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
              id={getId("host_message_input")}
              value={hostMessage}
              onChange={(e) => setHostMessage(e.target.value)}
              rows={4}
              placeholder={getText("host_message_placeholder", `Hi ${prop.host.name} I'll be staying...`)}
              className="w-full border rounded-lg px-3 py-3 text-[16px] bg-white mb-3 resize-none"
            />
            <button
              id={getId("send_host_message_button")}
              onClick={() => {
                if (hostMessage.trim() !== "") {
                  logEvent(EVENT_TYPES.MESSAGE_HOST, {
                    message: hostMessage.trim(),
                    hostName: prop.host.name,
                    source: "message_host_section",
                    hotel: prop,
                  });

                  showToast(getText("message_sent", " ✅ Message sent."));
                  setHostMessage("");
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:pointer-events-none"
              disabled={!hostMessage.trim()}
            >
              {getText("send", "Send")}
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
          <div className="font-bold mb-3">{getText("price_details", "Price details")}</div>
          <div className="flex flex-col gap-2 text-[15px]">
            <div className="flex items-center justify-between">
              <span className="underline">
                ${prop.price.toFixed(2)} USD x {nights} nights
              </span>
              <span>${priceSubtotal.toFixed(2)} USD</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="underline">{getText("cleaning_fee", "Cleaning fee")}</span>{" "}
              <span>${cleaningFee} USD</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="underline">{getText("service_fee", "Service fee")}</span>{" "}
              <span>${serviceFee} USD</span>
            </div>
            <hr />
            <div className="flex items-center justify-between font-bold text-neutral-900">
              <span>{getText("total_usd", "Total (USD)")}</span> <span>${total.toFixed(2)} USD</span>
            </div>
          </div>
          <button
            className="mt-7 rounded-lg w-full py-4 text-white font-semibold text-[18px] bg-[#616882] hover:bg-[#7d87aa] transition shadow focus:outline-none disabled:opacity-50 disabled:pointer-events-none"
            id={getId("confirm_and_pay_button")}
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
                paymentMethod,
                cardNumber: paymentMethod === "card" ? cardNumber : undefined,
                expiration: paymentMethod === "card" ? exp : undefined,
                cvv: paymentMethod === "card" ? cvv : undefined,
                zip: paymentMethod === "card" ? zip : undefined,
                country: paymentMethod === "card" ? country : undefined,
                source: bookingSource,
                hotel: prop,
              });

              showToast(getText("reservation_complete", "✅ Reservation complete! Thank you! 🙏"));
              // Reset form fields
              if (paymentMethod === "card") {
                setCardNumber("");
                setExp("");
                setCvv("");
                setZip("");
                setCountry("United States");
              }
              setHasTriedSubmit(false);
            }}
          >
            {getText("confirm_and_pay_button", "Confirm and pay")}
          </button>
        </div>
      </div>
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
