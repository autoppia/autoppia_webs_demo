"use client";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import dayjs from "dayjs";
import { countries } from "@/library/dataset";
import { getRestaurantById, dynamicDataProvider } from "@/dynamic/v2";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { SeedLink } from "@/components/ui/SeedLink";
import { useSeed } from "@/context/SeedContext";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { cn } from "@/library/utils";

type RestaurantView = {
  id: string; name: string; image: string; rating: number;
  reviews: number; bookings: number; price: string; cuisine: string; desc: string;
};

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { seed } = useSeed();
  const v2Seed = seed;
  const restaurantId = params.restaurantId as string;
  const reservationTimeParam = decodeURIComponent(params.time as string);
  const reservationPeopleParam = searchParams.get("people");
  const reservationDateParam = searchParams.get("date");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [date, setDate] = useState<Date | undefined>();
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const [fullDate, setFullDate] = useState<string | null>(null);
  const [time, setTime] = useState(reservationTimeParam || "1:00 PM");
  const [people, setPeople] = useState(Number.parseInt(reservationPeopleParam || "2", 10));
  const [reservationTime, setReservationTime] = useState<string | null>(null);
  const [reservationPeople, setReservationPeople] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [occasion, setOccasion] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [email, setEmail] = useState("user_name@gmail.com");
  const dyn = useDynamicSystem();
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[booking/[restaurantId]/[time]/page] V2 status:", { v2Enabled: dyn.v2.isEnabled() });
    }
  }, [dyn.v2]);
  const [data, setData] = useState<RestaurantView | null>(null);
  const restaurantInfo = {
    restaurantId, restaurantName: data?.name ?? "", rating: data?.rating ?? 0,
    reviews: data?.reviews ?? 0, bookings: data?.bookings ?? 0, price: data?.price ?? "",
    cuisine: data?.cuisine ?? "", desc: data?.desc ?? "",
  };
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        await dynamicDataProvider.whenReady();
        await dynamicDataProvider.reload(seed ?? undefined);
        if (!mounted) return;
        const found = getRestaurantById(restaurantId);
        if (found) {
          const mapped: RestaurantView = {
            id: found.id, name: found.name, image: found.image,
            rating: Number(found.stars ?? 4), reviews: Number(found.reviews ?? 0),
            bookings: Number(found.bookings ?? 0), price: String(found.price ?? "$$"),
            cuisine: String(found.cuisine ?? "International"),
            desc: `Enjoy a delightful experience at ${found.name}, offering a fusion of flavors in the heart of ${found.area ?? "Downtown"}.`,
          };
          setData(mapped);
        } else { setData(null); }
      } catch (error) {
        console.error("[booking/[restaurantId]/[time]/page] Failed to load restaurant", error);
        if (!mounted) return;
        setData(null);
      }
    };
    run();
    return () => { mounted = false; };
  }, [restaurantId, seed]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: log once when data is set
  useEffect(() => {
    const computedFullDate = reservationDateParam ? dayjs(reservationDateParam).format("YYYY-MM-DD") : null;
    if (data) {
      logEvent(EVENT_TYPES.BOOK_RESTAURANT, {
        restaurantId, restaurantName: data.name, rating: data.rating, reviews: data.reviews,
        bookings: data.bookings, price: data.price, cuisine: data.cuisine, desc: data.desc,
        date: computedFullDate, time: reservationTime || time, people: reservationPeople || people,
      });
    }
  }, [data]);
  useEffect(() => {
    if (reservationDateParam) {
      const d = new Date(reservationDateParam);
      setDate(d);
      setFormattedDate(dayjs(d).format("MMM D"));
      setFullDate(dayjs(d).format("YYYY-MM-DD"));
    }
    if (reservationTimeParam) setReservationTime(reservationTimeParam);
    if (reservationPeopleParam) setReservationPeople(reservationPeopleParam);
  }, [reservationDateParam, reservationTimeParam, reservationPeopleParam]);
  const handleReservation = () => {
    if (!phoneNumber.trim()) { setPhoneError(true); return; }
    setPhoneError(false);
    logEvent(EVENT_TYPES.RESERVATION_COMPLETE, {
      ...restaurantInfo, date: fullDate, time: reservationTime, people: reservationPeople,
      countryCode: selectedCountry.code, countryName: selectedCountry.name,
      name, phoneNumber, occasion, specialRequest, email,
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
    setName(""); setPhoneNumber(""); setOccasion(""); setSpecialRequest(""); setSelectedCountry(countries[0]);
  };
  const inputClasses = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all text-sm";
  return (
    dyn.v1.addWrapDecoy("booking-page", (
      <main className="min-h-screen bg-background" suppressHydrationWarning id={dyn.v3.getVariant("booking-page", ID_VARIANTS_MAP, "booking-page")}>
        <Navbar />
      {/* Hero Banner */}
      {dyn.v1.addWrapDecoy("booking-banner", (
        <div className="w-full h-[300px] relative overflow-hidden" id={dyn.v3.getVariant("booking-banner", ID_VARIANTS_MAP, "booking-banner")}>
          <div className="relative w-full h-full">
            {data?.image && (
              <Image src={data.image} alt={data.name || "Restaurant"} fill className="object-cover"
                id={dyn.v3.getVariant("booking-banner-image", ID_VARIANTS_MAP, "booking-banner-image")} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        </div>
      ), "booking-banner-wrap")}
      <div className="max-w-xl mx-auto px-6 -mt-20 relative z-10 pb-16">
        <div className="glass rounded-3xl p-8 shadow-2xl shadow-black/40 animate-fade-in-up" style={{ animationFillMode: "forwards" }}>
          <p className="uppercase tracking-[0.3em] text-[10px] font-semibold text-amber-500 mb-3">
            {dyn.v3.getVariant("you_almost_done", undefined, "Almost there")}
          </p>
          <div className="flex items-center gap-4 mb-8">
            <img src={data?.image || "/images/restaurant1.jpg"} alt={data?.name || "Restaurant"} className="w-14 h-14 rounded-2xl object-cover border border-white/10" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-lg text-white tracking-tight">{data?.name ?? "Loading..."}</span>
              <div className="flex items-center gap-4 text-white/35 text-xs">
                <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5 text-amber-500/60" />{formattedDate ?? dyn.v3.getVariant("select_date", undefined, "Select date")}</span>
                <span className="flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5 text-amber-500/60" />{reservationTime ?? dyn.v3.getVariant("select_time", undefined, "Select time")}</span>
                <span className="flex items-center gap-1"><UserIcon className="w-3.5 h-3.5 text-amber-500/60" />{reservationPeople ?? dyn.v3.getVariant("select_people", undefined, "Select people")} {dyn.v3.getVariant("people", undefined, "people")}</span>
              </div>
            </div>
          </div>
          <div className="divider-gradient mb-6" />
          <h3 className="font-semibold text-xs text-white/50 mb-5 uppercase tracking-[0.2em]">
            {dyn.v3.getVariant("diner_details", undefined, "Your Details")}
          </h3>
          <div className="space-y-4">
            {/* Name */}
            {dyn.v1.addWrapDecoy("full-name-field", (
              <div id={dyn.v3.getVariant("full-name-field-container", ID_VARIANTS_MAP, "full-name-field-container")}>
                <label className="block text-xs font-medium text-white/40 mb-1.5" htmlFor={dyn.v3.getVariant("full-name-input", ID_VARIANTS_MAP, "full-name-input")} id={dyn.v3.getVariant("full-name-label", ID_VARIANTS_MAP, "full-name-label")}>
                  {dyn.v3.getVariant("full_name", TEXT_VARIANTS_MAP, "Full Name")}
                </label>
                <input type="text" id={dyn.v3.getVariant("full-name-input", ID_VARIANTS_MAP, "full-name-input")}
                  placeholder={dyn.v3.getVariant("full_name_placeholder", TEXT_VARIANTS_MAP, "Enter your full name")}
                  className={cn(dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "input-text"), inputClasses)}
                  value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            ), "full-name-field-wrap")}
            {/* Phone */}
            {dyn.v1.addWrapDecoy("phone-field", (
              <div id={dyn.v3.getVariant("phone-field-container", ID_VARIANTS_MAP, "phone-field-container")}>
                <label className="block text-xs font-medium text-white/40 mb-1.5" htmlFor={dyn.v3.getVariant("phone-number-input", ID_VARIANTS_MAP, "phone-number-input")} id={dyn.v3.getVariant("phone-number-label", ID_VARIANTS_MAP, "phone-number-label")}>
                  {dyn.v3.getVariant("phone_number", TEXT_VARIANTS_MAP, "Phone Number")}
                </label>
                <div className="flex">
                  <select
                    id={dyn.v3.getVariant("country-select", ID_VARIANTS_MAP, "country-select")}
                    className={cn(dyn.v3.getVariant("select-dropdown", CLASS_VARIANTS_MAP, "select-dropdown"), "bg-white/[0.04] border border-white/[0.08] border-r-0 rounded-l-xl px-3 py-2.5 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm")}
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const country = countries.find((c) => c.code === e.target.value);
                      if (country) {
                        setSelectedCountry(country);
                        logEvent(EVENT_TYPES.COUNTRY_SELECTED, { ...restaurantInfo, countryCode: country.code, countryName: country.name, restaurantName: data?.name ?? "" });
                      }
                    }}
                  >
                    {countries.map((c) => (<option key={c.code} value={c.code}>{c.flag} {c.dial}</option>))}
                  </select>
                  <input type="tel" id={dyn.v3.getVariant("phone-number-input", ID_VARIANTS_MAP, "phone-number-input")}
                    placeholder={dyn.v3.getVariant("phone_number_placeholder", TEXT_VARIANTS_MAP, "Phone number")}
                    className={cn(dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "input-text"), "flex-1 bg-white/[0.04] border border-white/[0.08] rounded-r-xl px-4 py-2.5 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all text-sm")}
                    value={phoneNumber}
                    onChange={(e) => { setPhoneNumber(e.target.value); if (e.target.value.trim()) setPhoneError(false); }} />
                </div>
                {phoneError && (
                  <p className="text-red-400 text-xs mt-1.5" id={dyn.v3.getVariant("phone-error", ID_VARIANTS_MAP, "phone-error")}>
                    {dyn.v3.getVariant("phone_required", TEXT_VARIANTS_MAP, "Phone number is required")}
                  </p>
                )}
              </div>
            ), "phone-field-wrap")}
            {/* Email */}
            {dyn.v1.addWrapDecoy("email-field", (
              <div id={dyn.v3.getVariant("email-field-container", ID_VARIANTS_MAP, "email-field-container")}>
                <label className="block text-xs font-medium text-white/40 mb-1.5" htmlFor={dyn.v3.getVariant("email-input", ID_VARIANTS_MAP, "email-input")} id={dyn.v3.getVariant("email-label", ID_VARIANTS_MAP, "email-label")}>
                  {dyn.v3.getVariant("email", TEXT_VARIANTS_MAP, "Email")}
                </label>
                <input type="email" id={dyn.v3.getVariant("email-input", ID_VARIANTS_MAP, "email-input")}
                  placeholder={dyn.v3.getVariant("email_placeholder", TEXT_VARIANTS_MAP, "your.email@example.com")}
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className={cn(dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "input-text"), inputClasses)} />
              </div>
            ), "email-field-wrap")}
            {/* Occasion */}
            {dyn.v1.addWrapDecoy("occasion-field", (
              <div id={dyn.v3.getVariant("occasion-field-container", ID_VARIANTS_MAP, "occasion-field-container")}>
                <label className="block text-xs font-medium text-white/40 mb-1.5" htmlFor={dyn.v3.getVariant("occasion-select", ID_VARIANTS_MAP, "occasion-select")} id={dyn.v3.getVariant("occasion-label", ID_VARIANTS_MAP, "occasion-label")}>
                  {dyn.v3.getVariant("select_occasion", TEXT_VARIANTS_MAP, "Occasion (Optional)")}
                </label>
                <select id={dyn.v3.getVariant("occasion-select", ID_VARIANTS_MAP, "occasion-select")}
                  className={cn(dyn.v3.getVariant("select-dropdown", CLASS_VARIANTS_MAP, "select-dropdown"), "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all text-sm")}
                  value={occasion}
                  onChange={(e) => { setOccasion(e.target.value); logEvent(EVENT_TYPES.OCCASION_SELECTED, { ...restaurantInfo, occasion: e.target.value }); }}>
                  <option value="">{dyn.v3.getVariant("select_occasion_placeholder", TEXT_VARIANTS_MAP, "Select an occasion (optional)")}</option>
                  <option value="birthday">{dyn.v3.getVariant("birthday", TEXT_VARIANTS_MAP, "Birthday")}</option>
                  <option value="anniversary">{dyn.v3.getVariant("anniversary", TEXT_VARIANTS_MAP, "Anniversary")}</option>
                  <option value="business">{dyn.v3.getVariant("business_meal", TEXT_VARIANTS_MAP, "Business Meal")}</option>
                  <option value="other">{dyn.v3.getVariant("other", TEXT_VARIANTS_MAP, "Other")}</option>
                </select>
              </div>
            ), "occasion-field-wrap")}
            {/* Special Request */}
            {dyn.v1.addWrapDecoy("special-request-field", (
              <div id={dyn.v3.getVariant("special-request-field-container", ID_VARIANTS_MAP, "special-request-field-container")}>
                <label className="block text-xs font-medium text-white/40 mb-1.5" htmlFor={dyn.v3.getVariant("special-requests-textarea", ID_VARIANTS_MAP, "special-requests-textarea")} id={dyn.v3.getVariant("special-requests-label", ID_VARIANTS_MAP, "special-requests-label")}>
                  {dyn.v3.getVariant("special_request", TEXT_VARIANTS_MAP, "Special Requests (Optional)")}
                </label>
                <textarea id={dyn.v3.getVariant("special-requests-textarea", ID_VARIANTS_MAP, "special-requests-textarea")}
                  placeholder={dyn.v3.getVariant("special_request_placeholder", TEXT_VARIANTS_MAP, "Any special requests or dietary requirements?")}
                  className={cn(dyn.v3.getVariant("textarea-text", CLASS_VARIANTS_MAP, "textarea-text"), inputClasses, "resize-none")}
                  rows={3} value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value)} />
              </div>
            ), "special-request-field-wrap")}
          </div>
          {dyn.v1.addWrapDecoy("confirm-booking-button", (
            <Button
              id={dyn.v3.getVariant("confirm_button", ID_VARIANTS_MAP, "confirm_button")}
              onClick={handleReservation}
              className={cn(dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "button-primary"), "w-full bg-amber-500 hover:bg-amber-400 text-black py-6 text-sm rounded-xl font-bold mt-6 transition-all hover:shadow-lg hover:shadow-amber-500/20")}
            >
              {dyn.v3.getVariant("confirm_booking", TEXT_VARIANTS_MAP, "Complete Reservation")}
            </Button>
          ), "confirm-booking-button-wrap")}
          <p className="text-[11px] text-white/25 mt-4 text-center leading-relaxed">
            By completing this reservation, you agree to our{" "}
            <Link href="#" className="text-amber-500/70 underline underline-offset-2">{dyn.v3.getVariant("terms_of_use", undefined, "Terms of Use")}</Link>{" "}
            and{" "}
            <Link href="#" className="text-amber-500/70 underline underline-offset-2">{dyn.v3.getVariant("privacy_policy", undefined, "Privacy Policy")}</Link>
            . {dyn.v3.getVariant("message_rates", undefined, "Message and data rates may apply.")}
          </p>
        </div>
      </div>
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-8 py-4 rounded-2xl shadow-2xl shadow-amber-500/30 z-50 text-sm font-bold animate-fade-in-up" style={{ animationFillMode: "forwards" }}>
          {dyn.v3.getVariant("confirmation_message", TEXT_VARIANTS_MAP, "Reservation confirmed!")}
        </div>
      )}
      </main>
    ), "booking-page-wrap")
  );
}
