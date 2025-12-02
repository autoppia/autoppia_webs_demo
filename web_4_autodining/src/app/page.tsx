"use client";
import React, { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { SeedLink } from "@/components/ui/SeedLink";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSeed } from "@/context/SeedContext";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { RestaurantsData } from "@/library/dataset";
import { getRestaurants, initializeRestaurants } from "@/dynamic/v2-data";
import type { RestaurantData } from "@/dynamic/v2-data";
import { useSearchParams } from "next/navigation";
// LAYOUT FIJO - Sin variaciones V1
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { isDataGenerationEnabled } from "@/shared/data-generator";
import { buildBookingHref } from "@/utils/bookingPaths";
import Navbar from "@/components/Navbar";
import fallbackRestaurants from "@/data/original/restaurants_1.json";

type UiRestaurant = {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  area: string;
  reviews: number;
  rating: number; // rating con decimales (ej: 4.6, 4.8)
  stars: number; // stars entero 1-5 ya redondeado
  price: string;
  bookings: number;
  times: string[];
};

// Default restaurants array from jsonData (fallback when dynamic data unavailable)
// Usar el JSON actualizado directamente que ya tiene rating y stars separados
const defaultRestaurants = (fallbackRestaurants as any[]).map(
  (item, index) => ({
    id: `restaurant-${item.id ?? index + 1}`,
    name: item.namepool,
    image: item.image || `/images/restaurant${(index % 19) + 1}.jpg`,
    rating: item.rating ?? 4.5,
    stars: item.stars ?? 5,
    reviews: item.reviews ?? 0,
    cuisine: item.cuisine,
    price: item.price ?? "$$",
    bookings: item.bookings ?? 0,
    area: item.area,
    times: ["1:00 PM"],
  })
);

const staticById = new Map(
  (fallbackRestaurants as any[]).map((item, index) => [
    item.id ?? `restaurant-${index + 1}`,
    {
      rating: item.rating ?? 4.5,
      stars: item.stars ?? 5,
      reviews: item.reviews ?? 0,
      bookings: item.bookings ?? 0,
      price: item.price ?? "$$",
      area: item.area,
      cuisine: item.cuisine,
    },
  ])
);

function StarRating({ count }: { count: number }) {
  // count ya viene como entero (1-5) del JSON, no necesitamos round
  // Solo asegurar que esté en el rango válido
  const clamped = Math.max(1, Math.min(5, Math.floor(count)));
  return (
    <span className="text-lg align-middle mr-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < clamped ? "text-yellow-400" : "text-gray-400"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function RestaurantCard({
  r,
  date,
  people,
  time,
}: {
  r: {
    id: string;
    name: string;
    cuisine: string;
    area: string;
    reviews: number;
    rating: number; // rating con decimales
    stars: number; // stars entero 1-5
    price: string;
    bookings: number;
    image: string;
    times: string[];
  };
  date: Date | undefined;
  people: number;
  time: string;
}) {
  const searchParams = useSearchParams();
  const seedParam = searchParams?.get("seed");
  const seed = Number(seedParam) || 1;
  const { getText, getId } = useV3Attributes();
  const personLabel = getText("person") || "Guest";
  const peopleLabel = getText("people") || "Guests";

  const formattedDate = date ? format(date, "yyyy-MM-dd") : "2025-05-20";

  // LAYOUT COMPLETAMENTE FIJO - Sin variaciones

  const viewDetailsLabel = getText("view_details") || "View details";
  const bookNowLabel = getText("book_now") || "Book now";

  // Usar rating para el número y stars para las estrellas
  const ratingValue = r.rating ?? 4.5; // Para mostrar el número (con decimales)
  const starsCount = r.stars ?? 5; // Para mostrar las estrellas (ya viene redondeado)
  const reviewsCount = r.reviews || 0;
  const priceTag = r.price || "$$";

  return (
    <div
      className="w-[320px] flex-shrink-0 rounded-xl overflow-hidden shadow-lg bg-white hover:-translate-y-1 transition-all duration-300 hover:shadow-xl"
    >
      <div className="relative w-full h-[280px] overflow-hidden">
        <img
          src={r.image}
          alt={r.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Badges at top */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-10">
          <span className="px-3 py-1.5 rounded-full bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold shadow-lg">
            {r.cuisine}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-yellow-500/90 backdrop-blur-sm text-white text-xs font-bold shadow-lg">
            {priceTag}
          </span>
        </div>

        {/* Content overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <SeedLink href={`/restaurant/${encodeURIComponent(r.id)}`}>
            <h3 className="font-bold text-xl mb-0 hover:text-[#46a758] transition-colors drop-shadow-lg">
              {r.name}
            </h3>
          </SeedLink>
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-0">
              <StarRating count={starsCount} /> {/* Usar stars (entero) */}
              <span className="text-sm font-semibold drop-shadow">
                {ratingValue.toFixed(1)} {/* Usar rating (con decimales) */}
                {reviewsCount > 0 && ` (${reviewsCount} reviews)`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-200 opacity-80 font-bold">
                {r.area}
              </span>
              <SeedLink
                id={getId("view_details_button")}
                href={`/restaurant/${encodeURIComponent(r.id)}`}
                className="text-sm bg-[#46a758] hover:bg-[#3d8f4a] text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                onClick={() =>
                  logEvent(EVENT_TYPES.VIEW_RESTAURANT, { restaurantId: r.id })
                }
              >
                {viewDetailsLabel || "View details"}
              </SeedLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardScroller({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const tickingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { getText } = useV3Attributes();
  const { seed } = useSeed(); // Get seed from context for data-testid

  // LAYOUT FIJO - Sin variaciones
  const childCount = React.Children.count(children);

  const checkScroll = () => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      // Usar un pequeño margen para evitar problemas de precisión
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scheduleCheck = () => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    rafIdRef.current = window.requestAnimationFrame(() => {
      checkScroll();
      tickingRef.current = false;
    });
  };

  useEffect(() => {
    checkScroll();
    let ro: ResizeObserver | null = null;
    if (ref.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => scheduleCheck());
      ro.observe(ref.current);
    }
    window.addEventListener("resize", scheduleCheck);
    // Verificar también cuando cambian los children
    scheduleCheck();
    return () => {
      window.removeEventListener("resize", scheduleCheck);
      if (ro && ref.current) ro.disconnect();
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      tickingRef.current = false;
    };
  }, [children]); // Agregar children como dependencia para actualizar cuando cambien

  const scroll = (direction: "left" | "right") => {
    if (ref.current) {
      // Ancho de tarjeta (320px) + gap (16px) = 336px
      // Scroll por el ancho exacto de una tarjeta
      const cardWidth = 320;
      const gap = 16;
      const scrollAmount = cardWidth + gap;

      const newScrollLeft =
        ref.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      ref.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });

      // Log scroll event
      logEvent(EVENT_TYPES.SCROLL_VIEW, { direction, title });
    }
  };

  if (childCount === 0) {
    return null;
  }

  return (
    <div className="relative group">
      {/* Flecha izquierda - fuera del contenedor */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 
            w-12 h-12 flex items-center justify-center
            bg-white/95 backdrop-blur-sm border-2 border-gray-200 
            rounded-full shadow-xl hover:shadow-2xl
            hover:bg-emerald-50 hover:border-emerald-400 hover:scale-110
            transition-all duration-300 ease-out"
          data-testid={`scroll-left-${seed ?? 1}`}
          aria-label={getText("scroll_left") || "Scroll left"}
        >
          <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-emerald-600" />
        </button>
      )}

      {/* Flecha derecha - fuera del contenedor */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 
            w-12 h-12 flex items-center justify-center
            bg-white/95 backdrop-blur-sm border-2 border-gray-200 
            rounded-full shadow-xl hover:shadow-2xl
            hover:bg-emerald-50 hover:border-emerald-400 hover:scale-110
            transition-all duration-300 ease-out"
          data-testid={`scroll-right-${seed ?? 1}`}
          aria-label={getText("scroll_right") || "Scroll right"}
        >
          <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-emerald-600" />
        </button>
      )}

      {/* Contenedor con padding para mostrar media tarjeta del siguiente */}
      <div
        ref={ref}
        className="flex gap-4 pb-4 px-5 scroll-smooth overflow-x-auto overflow-y-hidden no-scrollbar"
        onScroll={scheduleCheck}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// LAYOUT FIJO - Sin variaciones

// Client-only component that uses seed from context
function HomePageContent() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [list, setList] = useState<UiRestaurant[]>(defaultRestaurants);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("1:00 PM");
  const [people, setPeople] = useState(2);
  const [search, setSearch] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { getText, getId } = useV3Attributes();
  const searchParams = useSearchParams();
  const personLabel = getText("person") || "Guest";
  const peopleLabel = getText("people") || "Guests";

  const { seed, resolvedSeeds } = useSeed();
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
  const seedParam = searchParams?.get("seed");
  // Layout completamente fijo - layoutSeed ya no se usa para variaciones

  // Redirect to default seed=6 if none provided
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!seedParam) {
      const url = new URL(window.location.href);
      url.searchParams.set("seed", "6");
      router.replace(`${url.pathname}?${url.searchParams.toString()}`);
    }
  }, [seedParam, router]);

  // LAYOUT COMPLETAMENTE FIJO - Sin variaciones

  // LAYOUT COMPLETAMENTE FIJO - Sin variaciones
  const searchButtonLabel = getText("search_button") || "Search";
  const searchButtonClassName = "ml-3 px-8 py-3 rounded-lg text-lg bg-[#46a758] text-white hover:bg-[#3d8f4a] transition-colors shadow-sm min-w-[120px]";

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
      const isoDate = toLocalISO(d);
      logEvent(EVENT_TYPES.DATE_DROPDOWN_OPENED, { date: isoDate });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    // Only log search event after user stops typing (debounce) to avoid breaking layout
    // The search event no longer triggers layout variations, so we can log it less frequently
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        logEvent(EVENT_TYPES.SEARCH_RESTAURANT, { query: value });
      }
    }, 500);
  };

  const handleTimeSelect = (t: string) => {
    setTime(t);
    logEvent(EVENT_TYPES.TIME_DROPDOWN_OPENED, { time: t });
  };

  const handlePeopleSelect = (n: number) => {
    setPeople(n);
    logEvent(EVENT_TYPES.PEOPLE_DROPDOWN_OPENED, { people: n });
  };

  function matches(r: UiRestaurant): boolean {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.area.toLowerCase().includes(q)
    );
  }

  const filtered = list.filter(matches);
  const peopleOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  const timeOptions = [
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
  ];

  // Track the last v2Seed we used to avoid duplicate loads
  const lastV2SeedRef = useRef<number | null>(null);
  const lastBaseSeedRef = useRef<number | null>(null);

  // Reset lastV2SeedRef when base seed changes (user changed seed in URL)
  useEffect(() => {
    if (lastBaseSeedRef.current !== null && lastBaseSeedRef.current !== seed) {
      console.log(
        `[autodining] Base seed changed from ${lastBaseSeedRef.current} to ${seed}, resetting cache`
      );
      lastV2SeedRef.current = null; // Force reload with new seed
    }
    lastBaseSeedRef.current = seed;
  }, [seed]);

  useEffect(() => {
    // Only load if v2Seed is valid and different from last load
    const currentV2Seed = v2Seed ?? resolvedSeeds.base;
    if (currentV2Seed === null || currentV2Seed === undefined) {
      return; // Wait for valid seed
    }

    // Skip if we already loaded with this seed
    if (lastV2SeedRef.current === currentV2Seed) {
      return;
    }

    let cancelled = false;

    const loadRestaurants = async () => {
      console.log(
        `[autodining] V2 Data - Seed: ${currentV2Seed} (from base seed: ${seed})`
      );
      lastV2SeedRef.current = currentV2Seed; // Mark as loading
      setIsLoading(true);
      const genEnabled = isDataGenerationEnabled();
      if (genEnabled) setIsGenerating(true);
      try {
        // Pass v2Seed to initializeRestaurants when v2 is enabled
        await initializeRestaurants(currentV2Seed); // waits for DB/gen

        // Only update state if this effect hasn't been cancelled
        if (!cancelled) {
          const fresh = getRestaurants().map((r) => {
            const staticDefaults =
              staticById.get(r.id) ||
              staticById.get(r.id?.toString().replace("restaurant-", ""));

            // Priorizar valores directos del restaurante, luego defaults, luego fallback
            const rating = (r as any).rating ?? staticDefaults?.rating ?? 4.5;
            const stars =
              (r as any).stars ?? staticDefaults?.stars ?? Math.round(rating);
            const reviews = r.reviews ?? staticDefaults?.reviews ?? 64;
            const bookings = r.bookings ?? staticDefaults?.bookings ?? 0;
            const price = r.price ?? staticDefaults?.price ?? "$$";

            return {
              id: r.id,
              name: r.name,
              image: r.image,
              cuisine: r.cuisine ?? staticDefaults?.cuisine ?? "International",
              area: r.area ?? staticDefaults?.area ?? "Downtown",
              reviews,
              rating,
              stars,
              price,
              bookings,
              times: ["1:00 PM"],
            };
          });
          const mapped = fresh.length > 0 ? fresh : defaultRestaurants;
          setList(mapped);
          setIsReady(mapped.length > 0);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsGenerating(false);
        }
      }
    };

    loadRestaurants();

    // Cleanup: cancel if seed changes before async completes
    return () => {
      cancelled = true;
    };
  }, [v2Seed, resolvedSeeds.base, resolvedSeeds.v2, seed]);

  const expensiveRestaurants = useMemo(() => {
    return filtered
      .filter((r) => {
        const priceCount = (r.price || "").match(/\$/g)?.length || 0;
        return priceCount >= 4; // $$$$ or more
      })
      .slice(0, 8);
  }, [filtered]);

  const mediumRestaurants = useMemo(() => {
    return filtered
      .filter((r) => {
        const priceCount = (r.price || "").match(/\$/g)?.length || 0;
        return priceCount >= 2 && priceCount <= 3; // $$ or $$$
      })
      .slice(0, 8);
  }, [filtered]);

  const cheapRestaurants = useMemo(() => {
    return filtered
      .filter((r) => {
        const priceCount = (r.price || "").match(/\$/g)?.length || 0;
        return priceCount === 1; // $
      })
      .slice(0, 8);
  }, [filtered]);

  return (
    <main suppressHydrationWarning>
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
      {/* Navigation/Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="mb-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-500 text-white px-8 py-10 shadow-2xl">
          <div className="absolute inset-0 opacity-10 bg-[url('/images/restaurant1.jpg')] bg-cover bg-center" />
          <div className="relative max-w-3xl space-y-3">
            <p className="uppercase tracking-[0.3em] text-sm font-semibold">
              Curated dining
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Book standout tables, by cuisine, mood, or budget
            </h1>
            <p className="text-white/80 text-lg">
              Fresh picks updated daily. Choose your vibe, we’ll handle the
              details.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="px-3 py-1 bg-white/15 rounded-full text-sm backdrop-blur-sm">
                Trending tonight
              </span>
              <span className="px-3 py-1 bg-white/15 rounded-full text-sm backdrop-blur-sm">
                Chef-owned
              </span>
              <span className="px-3 py-1 bg-white/15 rounded-full text-sm backdrop-blur-sm">
                Group friendly
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <section
          className="flex flex-wrap gap-4 items-end mt-6 relative w-full"
          style={{ minHeight: "auto", visibility: "visible", display: "flex" }}
        >
          <Popover open={dateOpen} onOpenChange={setDateOpen} modal={false}>
            <PopoverTrigger asChild>
              <Button
                id={getId("date_picker")}
                variant="outline"
                className="w-[200px] justify-start text-left font-normal"
                onClick={() =>
                  logEvent(EVENT_TYPES.DATE_DROPDOWN_OPENED, { action: "open" })
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "PPP")
                ) : (
                  <span>{getText("date_picker")}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 z-[100]"
              align="start"
              side="bottom"
              sideOffset={8}
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover open={timeOpen} onOpenChange={setTimeOpen} modal={false}>
            <PopoverTrigger asChild>
              <Button
                id={getId("time_picker")}
                variant="outline"
                className="w-[150px] justify-start text-left font-normal"
                onClick={() =>
                  logEvent(EVENT_TYPES.TIME_DROPDOWN_OPENED, { action: "open" })
                }
              >
                <ClockIcon className="mr-2 h-4 w-4" />
                {time}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 z-[100]"
              align="start"
              side="bottom"
              sideOffset={8}
            >
              <div className="p-2">
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
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={peopleOpen} onOpenChange={setPeopleOpen} modal={false}>
            <PopoverTrigger asChild>
              <Button
                id={getId("people_picker")}
                variant="outline"
                className="w-[150px] justify-start text-left font-normal"
                onClick={() =>
                  logEvent(EVENT_TYPES.PEOPLE_DROPDOWN_OPENED, {
                    action: "open",
                  })
                }
              >
                <UserIcon className="mr-2 h-4 w-4" />
                {people} {people === 1 ? personLabel : peopleLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 z-[100]"
              align="start"
              side="bottom"
              sideOffset={8}
            >
              <div className="p-2">
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
              </div>
            </PopoverContent>
          </Popover>
          {/* Search box & button */}
          <input
            id={getId("search_input")}
            type="text"
            placeholder={getText("search_placeholder") || "Search"}
            className="min-w-[400px] flex-1 px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#46a758] focus:border-[#46a758]"
            value={search}
            onChange={handleSearchChange}
          />
          <button
            id={getId("search_button")}
            className={searchButtonClassName}
          >
            {searchButtonLabel}
          </button>
        </section>

        {/* Main Content - Cards, Sections, etc. */}
        {isLoading || !isReady || list.length === 0 ? null : (
          <>
            {/* Expensive Restaurants ($$$$) */}
            {expensiveRestaurants.length > 0 && (
              <section
                id={getId("section_expensive")}
                className="px-4"
              >
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">
                    {getText("section_expensive") || "Expensive"}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Fine dining experiences for special occasions
                  </p>
                </div>
                <CardScroller
                  title={getText("section_expensive")}
                >
                  {expensiveRestaurants.map((r) => (
                    <RestaurantCard
                      key={r.id + "-expensive"}
                      r={r}
                      date={date}
                      people={people}
                      time={time}
                    />
                  ))}
                </CardScroller>
              </section>
            )}

            {/* Medium Price Restaurants ($$-$$$) */}
            {mediumRestaurants.length > 0 && (
              <section
                id={getId("section_medium")}
                className="px-4 mt-8"
              >
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">
                    {getText("section_medium") || "Mid ticket"}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Great value restaurants for everyday dining
                  </p>
                </div>
                <CardScroller
                  title={getText("section_medium")}
                  layoutSeed={layoutSeed}
                >
                  {mediumRestaurants.map((r) => (
                    <RestaurantCard
                      key={r.id + "-medium"}
                      r={r}
                      date={date}
                      people={people}
                      time={time}
                    />
                  ))}
                </CardScroller>
              </section>
            )}

            {/* Cheap Restaurants ($) */}
            {cheapRestaurants.length > 0 && (
              <section
                id={getId("section_cheap")}
                className="px-4 mt-8"
              >
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">
                    {getText("section_cheap") || "Cheap"}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Budget-friendly options without compromising quality
                  </p>
                </div>
                <CardScroller
                  title={getText("section_cheap")}
                  layoutSeed={layoutSeed}
                >
                  {cheapRestaurants.map((r) => (
                    <RestaurantCard
                      key={r.id + "-cheap"}
                      r={r}
                      date={date}
                      people={people}
                      time={time}
                    />
                  ))}
                </CardScroller>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}

// Loading component for Suspense fallback
function HomePageLoading() {
  return (
    <main>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    </main>
  );
}

// Main export with Suspense boundary
export default function HomePage() {
  return (
    <Suspense fallback={<HomePageLoading />}>
      <HomePageContent />
    </Suspense>
  );
}
