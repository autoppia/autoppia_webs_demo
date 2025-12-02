"use client";

import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import dayjs from "dayjs";
import { countries } from "@/library/dataset";
import { initializeRestaurants, getRestaurants } from "@/dynamic/v2-data";
import { useSeedVariation } from "@/dynamic/v1-layouts";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { SeedLink } from "@/components/ui/SeedLink";
import { useSeed } from "@/context/SeedContext";
import Navbar from "@/components/Navbar";

type RestaurantView = {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  bookings: number;
  price: string;
  cuisine: string;
  desc: string;
};

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { seed: baseSeed, resolvedSeeds } = useSeed();
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
  const layoutSeed = resolvedSeeds.v1 ?? baseSeed;

  const restaurantId = params.restaurantId as string;
  const reservationTimeParam = decodeURIComponent(params.time as string);
  const reservationPeopleParam = searchParams.get("people");
  const reservationDateParam = searchParams.get("date");

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [date, setDate] = useState<Date | undefined>();
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const [fullDate, setFullDate] = useState<string | null>(null);
  const [time, setTime] = useState(reservationTimeParam || "1:00 PM");
  const [people, setPeople] = useState(
    parseInt(reservationPeopleParam || "2", 10)
  );
  const [reservationTime, setReservationTime] = useState<string | null>(null);
  const [reservationPeople, setReservationPeople] = useState<string | null>(
    null
  );
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [occasion, setOccasion] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [email, setEmail] = useState("user_name@gmail.com");
  const { getText, getId } = useV3Attributes();

  const [data, setData] = useState<RestaurantView | null>(null);

  // Create layout based on seed
  const layout = useMemo(() => {
    const wrap = layoutSeed % 2 === 0;
    const justifyClass = [
      "justify-start",
      "justify-center",
      "justify-end",
      "justify-between",
      "justify-around",
    ][layoutSeed % 5];
    const gapClass = ["gap-2", "gap-3", "gap-4", "gap-5", "gap-6"][
      layoutSeed % 5
    ];
    const marginTopClass = ["mt-0", "mt-4", "mt-8", "mt-12", "mt-16"][
      layoutSeed % 5
    ];
    const marginBottomClass = ["mb-0", "mb-4", "mb-8", "mb-12", "mb-16"][
      layoutSeed % 5
    ];

    return {
      wrap,
      justifyClass,
      gapClass,
      marginTopClass,
      marginBottomClass,
    };
  }, [layoutSeed]);

  // Use seed-based variations (pass v1 seed)
  const formVariation = useSeedVariation("form", undefined, layoutSeed);
  const bookButtonVariation = useSeedVariation(
    "bookButton",
    undefined,
    layoutSeed
  );
  const pageLayoutVariation = useSeedVariation(
    "pageLayout",
    undefined,
    layoutSeed
  );

  const restaurantInfo = {
    restaurantId,
    restaurantName: data?.name ?? "",
    rating: data?.rating ?? 0,
    reviews: data?.reviews ?? 0,
    bookings: data?.bookings ?? 0,
    price: data?.price ?? "",
    cuisine: data?.cuisine ?? "",
    desc: data?.desc ?? "",
  };

  useEffect(() => {
    initializeRestaurants(v2Seed ?? undefined).then(() => {
      const list = getRestaurants();
      const found = list.find((x) => x.id === restaurantId) || list[0];
      if (found) {
        const mapped: RestaurantView = {
          id: found.id,
          name: found.name,
          image: found.image,
          rating: Number(found.stars ?? 4),
          reviews: Number(found.reviews ?? 0),
          bookings: Number(found.bookings ?? 0),
          price: String(found.price ?? "$$"),
          cuisine: String(found.cuisine ?? "International"),
          desc: `Enjoy a delightful experience at ${
            found.name
          }, offering a fusion of flavors in the heart of ${
            found.area ?? "Downtown"
          }.`,
        };
        setData(mapped);
      }
    });
  }, [restaurantId, v2Seed]);

  useEffect(() => {
    const computedFullDate = reservationDateParam
      ? dayjs(reservationDateParam).format("YYYY-MM-DD")
      : null;
    if (data) {
      logEvent(EVENT_TYPES.BOOK_RESTAURANT, {
        restaurantId,
        restaurantName: data.name,
        rating: data.rating,
        reviews: data.reviews,
        bookings: data.bookings,
        price: data.price,
        cuisine: data.cuisine,
        desc: data.desc,
        date: computedFullDate,
        time: reservationTime || time,
        people: reservationPeople || people,
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
    if (!phoneNumber.trim()) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);
    logEvent(EVENT_TYPES.RESERVATION_COMPLETE, {
      ...restaurantInfo,
      date: fullDate,
      time: reservationTime,
      people: reservationPeople,
      countryCode: selectedCountry.code,
      countryName: selectedCountry.name,
      name,
      phoneNumber,
      occasion,
      specialRequest,
      email,
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
    setName("");
    setPhoneNumber("");
    setOccasion("");
    setSpecialRequest("");
    setSelectedCountry(countries[0]);
  };

  return (
    <main suppressHydrationWarning>
      <Navbar />

      {/* Hero Section */}
      <section className="mb-10 w-full px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-500 text-white px-8 py-10 shadow-2xl w-full">
          <div className="absolute inset-0 opacity-10 bg-[url('/images/restaurant1.jpg')] bg-cover bg-center" />
          <div className="relative max-w-3xl space-y-3">
            <p className="uppercase tracking-[0.3em] text-sm font-semibold">
              Curated dining
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Book standout tables, by cuisine, mood, or budget
            </h1>
            <p className="text-white/80 text-lg">
              Fresh picks updated daily. Choose your vibe, we'll handle the
              details.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 pb-10">
        <h2 className="font-bold text-lg mt-8 mb-4">
          {getText("you_almost_done")}
        </h2>
        <div className="flex items-center gap-3 mb-6">
          <img
            src={data?.image || "/images/restaurant1.jpg"}
            alt={data?.name || "Restaurant"}
            className="w-16 h-16 rounded-lg object-cover border"
          />
          <div className="flex flex-col gap-[2px]">
            <span className="font-bold text-2xl">
              {data?.name ?? "Loading..."}
            </span>
            <div className="flex items-center gap-5 text-gray-700 mt-1 text-[15px]">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {formattedDate ?? getText("select_date")}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4 mr-1" />
                {reservationTime ?? getText("select_time")}
              </span>
              <span className="flex items-center gap-1">
                <UserIcon className="w-4 h-4 mr-1" />
                {reservationPeople ?? getText("select_people")}{" "}
                {getText("people")}
              </span>
            </div>
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-4 mt-6">
          {getText("diner_details") || "Your Details"}
        </h3>
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#46a758] focus:border-[#46a758]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getText("phone_number") || "Phone Number"}
            </label>
            <div className="flex">
              <select
                id="select-country"
                className="border border-gray-300 border-r-0 rounded-l-lg px-3 py-2.5 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#46a758]"
                value={selectedCountry.code}
                onChange={(e) => {
                  const country = countries.find(
                    (c) => c.code === e.target.value
                  )!;
                  setSelectedCountry(country);
                  logEvent(EVENT_TYPES.COUNTRY_SELECTED, {
                    ...restaurantInfo,
                    countryCode: country.code,
                    countryName: country.name,
                    restaurantName: data?.name ?? "",
                  });
                }}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.dial}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder={getText("phone_number") || "Phone number"}
                className="flex-1 border border-gray-300 rounded-r-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#46a758] focus:border-[#46a758]"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (e.target.value.trim()) setPhoneError(false);
                }}
              />
            </div>
            {phoneError && (
              <p className="text-red-500 text-sm mt-1">
                {getText("phone_required") || "Phone number is required"}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#46a758] focus:border-[#46a758]"
            />
          </div>

          {/* Occasion Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getText("select_occasion") || "Occasion (Optional)"}
            </label>
            <select
              id="select-occasion"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#46a758] focus:border-[#46a758]"
              value={occasion}
              onChange={(e) => {
                setOccasion(e.target.value);
                logEvent(EVENT_TYPES.OCCASION_SELECTED, {
                  ...restaurantInfo,
                  occasion: e.target.value,
                });
              }}
            >
              <option value="">Select an occasion (optional)</option>
              <option value="birthday">
                {getText("birthday") || "Birthday"}
              </option>
              <option value="anniversary">
                {getText("anniversary") || "Anniversary"}
              </option>
              <option value="business">
                {getText("business_meal") || "Business Meal"}
              </option>
              <option value="other">{getText("other") || "Other"}</option>
            </select>
          </div>

          {/* Special Request Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getText("special_request") || "Special Requests (Optional)"}
            </label>
            <textarea
              placeholder={
                getText("special_request") ||
                "Any special requests or dietary requirements?"
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#46a758] focus:border-[#46a758] resize-none"
              rows={3}
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
            />
          </div>
        </div>

        <Button
          id={getId("confirm_button")}
          onClick={handleReservation}
          className="w-full bg-[#46a758] hover:bg-[#3d8f4a] text-white py-6 text-lg rounded-lg font-semibold mt-6 transition-colors shadow-sm"
          data-testid={bookButtonVariation.dataTestId}
        >
          {getText("confirm_booking") || "Complete Reservation"}
        </Button>

        <p className="text-xs text-gray-600 mt-3 text-center">
          By completing this reservation, you agree to our{" "}
          <Link href="#" className="text-[#46a758] underline">
            {getText("terms_of_use") || "Terms of Use"}
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-[#46a758] underline">
            {getText("privacy_policy") || "Privacy Policy"}
          </Link>
          . {getText("message_rates")}
        </p>
      </div>

      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-20 py-5 rounded shadow-lg z-50">
          {getText("confirmation_message")}
        </div>
      )}
    </main>
  );
}
