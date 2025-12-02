"use client";
import { useParams } from "next/navigation";
import {
  CalendarIcon,
  UserIcon,
  ChevronDownIcon,
  ClockIcon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import React, { useMemo, useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Image from "next/image";
import { useSeed } from "@/context/SeedContext";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useSeedVariation } from "@/dynamic/v1-layouts";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { initializeRestaurants, getRestaurants } from "@/dynamic/v2-data";
import { isDataGenerationEnabled } from "@/shared/data-generator";
import { SeedLink } from "@/components/ui/SeedLink";
import { buildBookingHref } from "@/utils/bookingPaths";

const photos = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=150&h=150",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=150&h=150",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=150&h=150",
];

type RestaurantView = {
  id: string;
  name: string;
  image: string;
  rating: number; // rating con decimales
  stars: number; // stars entero 1-5
  reviews: number;
  bookings: number;
  price: string;
  cuisine: string;
  tags: string[];
  desc: string;
  photos: string[];
};
export default function RestaurantPage() {
  const params = useParams();
  const id = params.restaurantId as string;
  const [r, setR] = useState<RestaurantView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [people, setPeople] = useState<number | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [showFullMenu, setShowFullMenu] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { getText, getId } = useV3Attributes();

  // Define labels with fallbacks
  const personLabel = getText("person") || "Guest";
  const peopleLabel = getText("people") || "Guests";
  const pickLabel = getText("pick") || "Pick";
  const selectDateLabel = getText("date_picker") || "Select date";
  const selectTimeLabel = getText("select_time") || "Select time";
  const viewFullMenuLabel = getText("view_full_menu") || "View Full Menu";
  const collapseMenuLabel = getText("collapse_menu") || "Collapse Menu";
  const bookNowLabel = getText("book_now") || "Book Now";

  const { seed, resolvedSeeds } = useSeed();
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
  const layoutSeed = resolvedSeeds.v1 ?? seed;

  // Use seed-based variations (pass v1 seed)
  const bookButtonVariation = useSeedVariation(
    "bookButton",
    undefined,
    layoutSeed
  );
  const imageContainerVariation = useSeedVariation(
    "imageContainer",
    undefined,
    layoutSeed
  );

  // LAYOUT FIJO - Siempre como seed 6
  const layout = {
    wrap: false, // seed 6 % 2 = 0 (false)
    justifyClass: "justify-start", // seed 6 % 5 = 1 → índice 1
    marginTopClass: "mt-0", // seed 6 % 5 = 1 → índice 1
    justify: "flex-start", // seed 6 % 5 = 1 → índice 1
    marginTop: 0, // seed 6 % 5 = 1 → índice 1
  };

  useEffect(() => {
    // Ensure data is initialized and loaded from DB or generator as configured
    let mounted = true;
    const run = async () => {
      setIsLoading(true);
      const genEnabled = isDataGenerationEnabled();
      if (genEnabled) setIsGenerating(true);
      try {
        await initializeRestaurants(v2Seed ?? undefined);
        if (!mounted) return;
        const list = getRestaurants();
        const found = list.find((x) => x.id === id) || list[0];
        if (found) {
          // Usar rating y stars separados
          const rating = (found as any).rating ?? found.stars ?? 4.5;
          const stars = (found as any).stars ?? Math.round(rating);

          const mapped: RestaurantView = {
            id: found.id,
            name: found.name,
            image: found.image,
            rating: Number(rating),
            stars: Number(stars),
            reviews: Number(found.reviews ?? 0),
            bookings: Number(found.bookings ?? 0),
            price: String(found.price ?? "$$"),
            cuisine: String(found.cuisine ?? "International"),
            tags: ["cozy", "modern", "casual"],
            desc: `Enjoy a delightful experience at ${
              found.name
            }, offering a fusion of flavors in the heart of ${
              found.area ?? "Downtown"
            }.`,
            photos,
          };
          setR(mapped);
        }
      } finally {
        if (!mounted) return;
        setIsLoading(false);
        setIsGenerating(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [id, v2Seed]);

  useEffect(() => {
    if (!r) return; // evita enviar si aún no hay datos
    logEvent(EVENT_TYPES.VIEW_RESTAURANT, {
      restaurantId: id,
      restaurantName: r?.name ?? "",
      cuisine: r?.cuisine ?? "",
      desc: r?.desc ?? "",
      area: "test",
      reviews: r?.reviews ?? 0,
      bookings: r?.bookings ?? 0,
      rating: r?.rating ?? 4.5,
      stars: r?.stars ?? 5,
    });
  }, [id, r]);
  const formattedDate = date ? format(date, "yyyy-MM-dd") : "2025-05-20";

  const handleToggleMenu = () => {
    const newState = !showFullMenu;
    setShowFullMenu(newState);

    // Define menu data that should be included in both events
    const menuData = [
      {
        category: "Mains",
        items: [
          { name: "Coq au Vin", price: "$26.00" },
          { name: "Ratatouille", price: "$20.00" },
        ],
      },
    ];

    logEvent(
      newState ? EVENT_TYPES.VIEW_FULL_MENU : EVENT_TYPES.COLLAPSE_MENU,
      {
        restaurantId: id,
        restaurantName: r?.name ?? "",
        cuisine: r?.cuisine ?? "",
        desc: r?.desc ?? "",
        area: "test",
        reviews: r?.reviews ?? 0,
        bookings: r?.bookings ?? 0,
        rating: r?.rating ?? 0,
        action: newState ? "view_full_menu" : "collapse_menu",
        time,
        date: formattedDate,
        people,
        menu: menuData,
      }
    );
  };
  const peopleOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  const handlePeopleSelect = (n: number) => {
    setPeople(n);
    logEvent(EVENT_TYPES.PEOPLE_DROPDOWN_OPENED, { people: n });
  };
  const handleTimeSelect = (t: string) => {
    setTime(t);
    logEvent(EVENT_TYPES.TIME_DROPDOWN_OPENED, { time: t });
  };
  const timeOptions = [
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
  ];
  function toLocalISO(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    const tzOffset = -date.getTimezoneOffset();
    const sign = tzOffset >= 0 ? "+" : "-";
    const offsetHours = pad(Math.floor(Math.abs(tzOffset) / 60));
    const offsetMinutes = pad(Math.abs(tzOffset) % 60);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
  }
  const handleDateSelect = (d: Date | undefined) => {
    setDate(d);
    if (d) {
      logEvent(EVENT_TYPES.DATE_DROPDOWN_OPENED, { date: toLocalISO(d) });
    }
  };

  const wrapperClass = `flex ${layout.justifyClass} ${
    layout.marginTopClass
  } mb-7 ${layout.wrap ? "flex-wrap" : ""}`;
  return (
    <main>
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90">
          <div className="flex flex-col items-center gap-4">
            <div
              className="h-12 w-12 rounded-full border-4 border-gray-300 border-t-[#46a758] animate-spin"
              aria-hidden="true"
            />
            <div className="text-gray-700 text-base font-medium text-center">
              Data is being generated by AI this may take some time
            </div>
          </div>
        </div>
      )}
      {/* Banner Image */}
      <div
        className={`w-full h-[340px] bg-gray-200 ${imageContainerVariation.position} ${imageContainerVariation.className}`}
        data-testid={imageContainerVariation.dataTestId}
      >
        <div className="relative w-full h-full">
          {r && (
            <Image src={r.image} alt={r.name} fill className="object-cover" />
          )}
        </div>
      </div>
      {/* Info and reservation */}
      <div className="flex flex-col md:flex-row justify-between gap-10 px-4 md:px-8 w-full max-w-[1400px] mx-auto">
        {/* Info (details section, tags, desc, photos) */}
        <div className="pt-8 md:pt-12 pb-10 flex-1 min-w-0">
          {/* Title & details row */}
          <h1 className="text-4xl font-bold mb-2">{r?.name ?? "Loading..."}</h1>
          <div className="flex items-center gap-4 text-lg mb-4">
            <span className="flex items-center text-[#46a758] text-xl font-semibold">
              {Array.from({ length: r?.stars ?? 5 }).map((_, i) => (
                <span key={i}>★</span>
              ))}
              {Array.from({ length: 5 - (r?.stars ?? 5) }).map((_, i) => (
                <span key={`empty-${i}`} className="text-gray-300">
                  ★
                </span>
              ))}
            </span>
            <span className="text-base flex items-center gap-2">
              <span className="font-bold">
                {r?.rating?.toFixed(1) ?? "4.5"}
              </span>
              <span className="text-gray-700">{r?.reviews ?? 0} Reviews</span>
            </span>
            <span className="text-base flex items-center gap-2">
              💵 {r?.price ?? "$$"}
            </span>
            <span className="text-base flex items-center gap-2">
              {r?.cuisine ?? "International"}
            </span>
          </div>
          {/* Tags/Pills */}
          <div className="flex gap-2 mb-4">
            {(r?.tags || []).map((tag: string, index: number) => (
              <span
                key={tag}
                className="py-1 px-4 bg-gray-100 rounded-full text-gray-800 font-semibold text-base border"
              >
                {tag}
              </span>
            ))}
          </div>
          {/* Description */}
          {r?.desc && (
            <div className="mb-8 text-lg text-gray-700 leading-relaxed">
              {r.desc}
            </div>
          )}
          {/* Photos Grid */}
          {r?.photos && (
            <>
              <h2 className="text-2xl font-bold mb-5 mt-10">Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
                {r.photos.map((url: string, i: number) => (
                  <img
                    key={i}
                    src={url}
                    alt={`${r?.name} photo ${i + 1}`}
                    className="rounded-lg object-cover aspect-square w-full h-[160px] md:h-[200px] hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                  />
                ))}
              </div>
            </>
          )}
          {/* Menu Section */}
          <section className="w-full mb-10">
            <h2 className="text-2xl font-bold mb-4 mt-8">
              {getText("menu") || "Menu"}
            </h2>
            <div className="bg-white border rounded-lg p-6">
              <div className="flex gap-6 border-b mb-6 pb-2">
                <button className="border-b-2 border-[#46a758] text-[#46a758] font-semibold px-4 py-2 -mb-px bg-white">
                  {getText("main_menu") || "Main Menu"}
                </button>
              </div>
              <div className="space-y-8">
                <div>
                  <div className="font-bold text-lg mb-4 text-gray-900">
                    {getText("starters") || "Starters"}
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b pb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          Cheese Board
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Assorted artisan cheeses with honey and nuts
                        </div>
                      </div>
                      <div className="text-right font-bold text-gray-900 ml-4">
                        $14.00
                      </div>
                    </div>
                    <div className="flex justify-between items-start border-b pb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          Smoked Salmon Tartine
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Capers, crème fraîche, dill, and red onion
                        </div>
                      </div>
                      <div className="text-right font-bold text-gray-900 ml-4">
                        $12.00
                      </div>
                    </div>
                    <div className="flex justify-between items-start border-b pb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          Escargot
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Traditional French preparation with garlic butter
                        </div>
                      </div>
                      <div className="text-right font-bold text-gray-900 ml-4">
                        $16.00
                      </div>
                    </div>
                  </div>
                </div>
                {showFullMenu && (
                  <div>
                    <div className="font-bold text-lg mb-4 text-gray-900">
                      {getText("mains") || "Main Courses"}
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start border-b pb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            Coq au Vin
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Classic French braised chicken in wine sauce
                          </div>
                        </div>
                        <div className="text-right font-bold text-gray-900 ml-4">
                          $26.00
                        </div>
                      </div>
                      <div className="flex justify-between items-start border-b pb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            Ratatouille
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Provençal vegetable stew with herbs
                          </div>
                        </div>
                        <div className="text-right font-bold text-gray-900 ml-4">
                          $20.00
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-center pt-4">
                  <Button
                    className="border-2 border-gray-300 px-8 py-2.5 rounded-lg font-semibold bg-white hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={handleToggleMenu}
                  >
                    {showFullMenu ? collapseMenuLabel : viewFullMenuLabel}
                  </Button>
                </div>
              </div>
            </div>
          </section>
          {/* Additional Info Section */}
          <section className="w-full mb-10 mt-10">
            <h2 className="text-2xl font-bold mb-6">About This Place</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-base mb-2 text-gray-900 flex items-center gap-2">
                  <span>🍽️</span> Cuisine
                </h3>
                <p className="text-gray-700 font-medium">
                  {r?.cuisine ?? "International"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-base mb-2 text-gray-900 flex items-center gap-2">
                  <span>💰</span> Price Range
                </h3>
                <p className="text-gray-700 font-medium">{r?.price ?? "$$"}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-base mb-2 text-gray-900 flex items-center gap-2">
                  <span>📍</span> Location
                </h3>
                <p className="text-gray-700 font-medium">
                  {r?.desc?.includes("heart of")
                    ? r.desc.split("heart of")[1]?.replace(".", "")?.trim()
                    : "Downtown"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-base mb-2 text-gray-900 flex items-center gap-2">
                  <span>⏰</span> Popular Times
                </h3>
                <p className="text-gray-700 font-medium">7:00 PM - 9:00 PM</p>
              </div>
            </div>
          </section>

          {/* Reviews Section - Simplified */}
          <section className="w-full mb-10">
            <h2 className="text-2xl font-bold mb-6">
              {getText("reviews_tab") || "Customer Reviews"}
            </h2>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-6 mb-6">
                <div className="text-5xl font-bold text-gray-900">
                  {r?.rating?.toFixed(1) ?? "4.5"}
                </div>
                <div>
                  <div className="flex items-center text-[#46a758] text-2xl mb-2">
                    {Array.from({ length: r?.stars ?? 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <div className="text-gray-600 text-base font-medium">
                    Based on {r?.reviews ?? 0} verified reviews
                  </div>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Customers consistently praise the exceptional atmosphere and
                outstanding food quality at {r?.name ?? "this restaurant"}.
                Recent reviews highlight the excellent service, authentic
                flavors, and memorable dining experience. Many guests return
                regularly and recommend it to friends and family.
              </p>
            </div>
          </section>
        </div>
        {/* Reservation Box - sticky and always visible */}
        <div className="rounded-xl border-2 border-gray-200 bg-white shadow-lg p-6 w-full max-w-sm md:sticky md:top-8 self-start">
          <h2 className="font-bold text-xl mb-4 text-center text-gray-900">
            {getText("make_reservation") || "Make a Reservation"}
          </h2>
          <div className="flex flex-col gap-4">
            {/* People select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {getText("number_of_guests") || "Number of Guests"}
              </label>
              <Popover
                open={peopleOpen}
                onOpenChange={setPeopleOpen}
                modal={false}
              >
                <PopoverTrigger asChild>
                  <Button
                    id={getId("people_picker")}
                    variant="outline"
                    className="w-full flex items-center justify-between border-gray-300 hover:border-[#46a758]"
                  >
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-700">
                        {people
                          ? `${people} ${
                              people === 1 ? personLabel : peopleLabel
                            }`
                          : `${pickLabel} ${peopleLabel}`}
                      </span>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-1" align="start">
                  {peopleOptions.map((n) => (
                    <Button
                      key={n}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        handlePeopleSelect(n);
                        setPeopleOpen(false);
                      }}
                    >
                      {n} {n === 1 ? personLabel : peopleLabel}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
            {/* Date/time row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {getText("date") || "Date"}
                </label>
                <Popover
                  open={dateOpen}
                  onOpenChange={setDateOpen}
                  modal={false}
                >
                  <PopoverTrigger asChild>
                    <Button
                      id={getId("date_picker")}
                      variant="outline"
                      className="w-full flex items-center justify-between border-gray-300 hover:border-[#46a758]"
                    >
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">
                          {date ? format(date, "MMM d") : selectDateLabel}
                        </span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => {
                        handleDateSelect(d);
                        setDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {getText("time") || "Time"}
                </label>
                <Popover
                  open={timeOpen}
                  onOpenChange={setTimeOpen}
                  modal={false}
                >
                  <PopoverTrigger asChild>
                    <Button
                      id={getId("time_picker")}
                      variant="outline"
                      className="w-full flex items-center justify-between border-gray-300 hover:border-[#46a758]"
                    >
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">
                          {time ? time : selectTimeLabel}
                        </span>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-36 p-1" align="start">
                    {timeOptions.map((t) => (
                      <Button
                        key={t}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          handleTimeSelect(t);
                          setTimeOpen(false);
                        }}
                      >
                        {t}
                      </Button>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {/* Booking button - always visible */}
            <SeedLink
              href={buildBookingHref(id, time || "1:00 PM", {
                date: formattedDate,
                people: people || 2,
              })}
              onClick={() =>
                logEvent(EVENT_TYPES.BOOK_RESTAURANT, {
                  restaurantId: id,
                  restaurantName: r?.name ?? "",
                  cuisine: r?.cuisine ?? "",
                  desc: r?.desc ?? "",
                  area: "test",
                  reviews: r?.reviews ?? 0,
                  bookings: r?.bookings ?? 0,
                  rating: r?.rating ?? 0,
                  date: formattedDate,
                  time: time || "1:00 PM",
                  people: people || 2,
                })
              }
            >
              <Button
                id={getId("book_button")}
                className="w-full bg-[#46a758] hover:bg-[#3d8f4a] text-white px-6 py-3 rounded-lg font-semibold text-base shadow-sm transition-colors"
                data-testid={bookButtonVariation.dataTestId}
              >
                {bookNowLabel || "Book Now"}
              </Button>
            </SeedLink>
          </div>
        </div>
      </div>
    </main>
  );
}
