"use client";
import React, { useState, useRef, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
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
import { useSearchParams } from "next/navigation";
import { useSeedVariation } from "@/library/utils";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { withSeed, withSeedAndParams } from "@/utils/seedRouting";
import { isDataGenerationEnabled } from "@/shared/data-generator";

type UiRestaurant = {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  area: string;
  reviews: number;
  stars: number;
  price: string;
  bookings: number;
  times: string[];
};

// Default restaurants array from jsonData (fallback when dynamic data unavailable)
const defaultRestaurants = RestaurantsData.map((item, index) => ({
  id: `restaurant-${item.id}`,
  name: item.namepool,
  image: `/images/restaurant${(index % 19) + 1}.jpg`,
  stars: item.staticStars,
  reviews: item.staticReviews,
  cuisine: item.cuisine,
  price: item.staticPrices,
  bookings: item.staticBookings,
  area: item.area,
  times: ["1:00 PM"],
}));

function StarRating({ count }: { count: number }) {
  return (
    <span className="text-[#46a758] text-xl align-middle mr-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < count ? "★" : "☆"}</span>
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
    stars: number;
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

  const formattedDate = date ? format(date, "yyyy-MM-dd") : "2025-05-20";

  // Use seed-based variations with event support
  const restaurantCardVariation = useSeedVariation("restaurantCard");
  const bookButtonVariation = useSeedVariation("bookButton");

  // Create layout based on seed
  const layout = {
    wrap: seed % 2 === 0, // Even seeds wrap, odd seeds don't
    justify: ["flex-start", "center", "flex-end", "space-between", "space-around"][seed % 5],
  };

  return (
    <div
      className={`w-[255px] flex-shrink-0 rounded-xl border shadow-sm bg-white overflow-hidden`}
      data-testid={restaurantCardVariation.dataTestId}
      style={restaurantCardVariation.style}
    >
      <div className="w-full h-40 overflow-hidden">
        <img
          src={r.image}
          alt={r.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg">{r.name}</h3>
          <div className="flex items-center">
            <StarRating count={r.stars} />
            <span className="text-sm text-gray-600">({r.reviews})</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-2">{r.cuisine}</p>
        <p className="text-gray-500 text-xs mb-3">{r.area}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{r.price}</span>
          <span className="text-xs text-gray-500">{r.bookings} {getText("booked_today")}</span>
        </div>
        <div className={`mt-3 flex ${layout.wrap ? 'flex-wrap' : 'flex-nowrap'} ${layout.justify} gap-2`}>
          <Link
            id={getId("view_details_button")}
            href={withSeed(`/restaurant/${r.id}`, searchParams)}
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() => logEvent(EVENT_TYPES.VIEW_RESTAURANT, { restaurantId: r.id })}
          >
            {getText("view_details")}
          </Link>
          <Link
            id={getId("book_button")}
            href={withSeedAndParams(`/booking/${r.id}/${time}`, { people: String(people), date: formattedDate }, searchParams)}
            className={`${bookButtonVariation.className} text-sm`}
            data-testid={bookButtonVariation.dataTestId}
            style={{ position: bookButtonVariation.position as any }}
            onClick={() => logEvent(EVENT_TYPES.BOOK_RESTAURANT, { restaurantId: r.id })}
          >
            {getText("book_now")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function CardScroller({ children, title, layoutSeed }: { children: React.ReactNode; title: string; layoutSeed: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const tickingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { getText } = useV3Attributes();
  const { seed } = useSeed(); // Get seed from context for data-testid

  const cardContainerVariation = useSeedVariation("cardContainer", undefined, layoutSeed);
  const childCount = React.Children.count(children);

  const checkScroll = () => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
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
    if (ref.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => scheduleCheck());
      ro.observe(ref.current);
    }
    window.addEventListener("resize", scheduleCheck);
    return () => {
      window.removeEventListener("resize", scheduleCheck);
      if (ro && ref.current) ro.disconnect();
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      tickingRef.current = false;
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = 300;
      const newScrollLeft = ref.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
      ref.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
      
      // Log scroll event
      logEvent(EVENT_TYPES.SCROLL_VIEW, { direction, title });
    }
  };

  if (childCount === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/*{canScrollLeft && (*/}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow-lg hover:bg-gray-50"
          data-testid={`scroll-left-${seed ?? 1}`}
          aria-label={getText("scroll_left")}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      {/*)}*/}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow-lg hover:bg-gray-50"
          data-testid={`scroll-right-${seed ?? 1}`}
          aria-label={getText("scroll_right")}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
      {/* Scrollable Content */}
      <div
        ref={ref}
        className={`flex gap-4 pb-4 scroll-smooth pl-1 pr-10 overflow-x-auto overflow-y-hidden`}
        data-testid={cardContainerVariation.dataTestId}
        onScroll={scheduleCheck}
      >
        {children}
      </div>
    </div>
  );
}

function getLayoutVariant(seed: number) {
  return {
    marginTop: ["mt-4", "mt-6", "mt-8", "mt-10", "mt-12"][seed % 5],
    wrapButton: seed % 3 === 0, // Every 3rd seed wraps the button
  };
}

// Client-only component that uses seed from context
function HomePageContent() {
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
  const { getText, getId } = useV3Attributes();
  const searchParams = useSearchParams();

  const { seed, resolvedSeeds } = useSeed();
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
  const layoutSeed = resolvedSeeds.v1 ?? seed;
  
  // Calculate layout variation (1-10) from v1 seed
  // COMMON FORMULA across all webs
  const layoutVariation = useMemo(() => {
    if (layoutSeed < 1 || layoutSeed > 300) return 1;
    return ((layoutSeed % 30) + 1) % 10 || 10;
  }, [layoutSeed]);
  
  // Log v1 info when it changes (only once per unique v1 seed)
  const lastV1SeedRef = useRef<number | null>(null);
  useEffect(() => {
    const currentV1Seed = resolvedSeeds.v1 ?? resolvedSeeds.base;
    // Only log if v1 seed actually changed
    if (lastV1SeedRef.current !== currentV1Seed) {
      if (resolvedSeeds.v1 !== null) {
        console.log(`[autodining] V1 Layout - Seed: ${resolvedSeeds.v1}, Variation: #${layoutVariation} (of 10)`);
      } else if (resolvedSeeds.base) {
        console.log(`[autodining] V1 Layout - Using base seed: ${resolvedSeeds.base}, Variation: #${layoutVariation} (of 10)`);
      }
      lastV1SeedRef.current = currentV1Seed;
    }
  }, [resolvedSeeds.v1, resolvedSeeds.base, layoutVariation]);
  
  const { marginTop, wrapButton } = useMemo(
    () => getLayoutVariant(layoutSeed),
    [layoutSeed]
  );

  // Use seed-based variations with event support (pass v1 seed)
  const searchBarVariation = useSeedVariation("searchBar", undefined, layoutSeed);
  const searchButtonVariation = useSeedVariation("searchButton", undefined, layoutSeed);
  const pageLayoutVariation = useSeedVariation("pageLayout", undefined, layoutSeed);
  const sectionLayoutVariation = useSeedVariation("sectionLayout", undefined, layoutSeed);
  


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
    logEvent(EVENT_TYPES.SEARCH_RESTAURANT, { query: value });
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
      console.log(`[autodining] Base seed changed from ${lastBaseSeedRef.current} to ${seed}, resetting cache`);
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
      console.log(`[autodining] V2 Data - Seed: ${currentV2Seed} (from base seed: ${seed})`);
      lastV2SeedRef.current = currentV2Seed; // Mark as loading
      setIsLoading(true);
      const genEnabled = isDataGenerationEnabled();
      if (genEnabled) setIsGenerating(true);
      try {
        // Pass v2Seed to initializeRestaurants when v2 is enabled
        await initializeRestaurants(currentV2Seed); // waits for DB/gen
        
        // Only update state if this effect hasn't been cancelled
        if (!cancelled) {
          const fresh = getRestaurants().map((r) => ({
            id: r.id,
            name: r.name,
            image: r.image,
            cuisine: r.cuisine ?? "International",
            area: r.area ?? "Downtown",
            reviews: r.reviews ?? 0,
            stars: r.stars ?? 4,
            price: r.price ?? "$$",
            bookings: r.bookings ?? 0,
            times: ["1:00 PM"],
          }));
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

  const iconRestaurants = useMemo(() => list.slice(15, 30), [list]);
  const awardRestaurants = useMemo(() => list.slice(30, 50), [list]);

  return (
    <main suppressHydrationWarning>
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-gray-300 border-t-[#46a758] animate-spin" aria-hidden="true" />
            <div className="text-gray-700 text-base font-medium text-center">
              Data is being generated by AI this may take some time
            </div>
          </div>
        </div>
      )}
      {/* Navigation/Header */}
      <nav className="w-full border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-20 px-4 gap-2">
          <div className="flex items-center gap-3">
            <SeedLink href={withSeed("/", searchParams)}>
              <div className="bg-[#46a758] px-3 py-1 rounded flex items-center h-9">
                <span className="font-bold text-white text-lg">{getText("app_title")}</span>
              </div>
            </SeedLink>
          </div>

          <div className="flex items-center gap-4">
            <SeedLink
              className="text-sm text-gray-600 hover:text-[#46a758]"
              href={withSeed("/help", searchParams)}
            >
              {getText("get_help")}
            </SeedLink>
            <SeedLink
              className="text-sm text-gray-600 hover:text-[#46a758]"
              href={withSeed("/about", searchParams)}
            >
              {getText("about")}
            </SeedLink>
            <SeedLink
              className="text-sm text-gray-600 hover:text-[#46a758]"
              href={withSeed("/contact", searchParams)}
            >
              {getText("contact")}
            </SeedLink>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={pageLayoutVariation.className} data-testid={pageLayoutVariation.dataTestId}>
        <h1 className="text-4xl font-bold mb-6">{getText("hero_title")}</h1>
        
        {/* Search and Filters */}
        <section className="flex flex-wrap gap-4 items-end">
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                id={getId("date_picker")}
                variant="outline"
                className="w-[200px] justify-start text-left font-normal"
                onClick={() => logEvent(EVENT_TYPES.DATE_DROPDOWN_OPENED, { action: 'open' })}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>{getText("date_picker")}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover open={timeOpen} onOpenChange={setTimeOpen}>
            <PopoverTrigger asChild>
              <Button
                id={getId("time_picker")}
                variant="outline"
                className="w-[150px] justify-start text-left font-normal"
                onClick={() => logEvent(EVENT_TYPES.TIME_DROPDOWN_OPENED, { action: 'open' })}
              >
                <ClockIcon className="mr-2 h-4 w-4" />
                {time}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
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

          <Popover open={peopleOpen} onOpenChange={setPeopleOpen}>
            <PopoverTrigger asChild>
              <Button
                id={getId("people_picker")}
                variant="outline"
                className="w-[150px] justify-start text-left font-normal"
                onClick={() => logEvent(EVENT_TYPES.PEOPLE_DROPDOWN_OPENED, { action: 'open' })}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                {people} {people === 1 ? getText("person") : getText("people")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
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
                    {n} {n === 1 ? getText("person") : getText("people")}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          {/* Search box & button */}
          <input
            id={getId("search_input")}
            type="text"
            placeholder={getText("search_placeholder")}
            className={`${searchBarVariation.className} min-w-[250px] flex-1`}
            data-testid={searchBarVariation.dataTestId}
            value={search}
            onChange={handleSearchChange}
          />
          {wrapButton ? (
            <div data-testid={`wrapper-${seed ?? 1}`}>
              <button
                id={getId("search_button")}
                className={searchButtonVariation.className}
                data-testid={searchButtonVariation.dataTestId}
                style={{ position: searchButtonVariation.position as any }}
              >
                {getText("search_button")}
              </button>
            </div>
          ) : (
            <button
              id={getId("search_button")}
              className={searchButtonVariation.className}
              data-testid={searchButtonVariation.dataTestId}
              style={{ position: searchButtonVariation.position as any }}
            >
              {getText("search_button")}
            </button>
          )}
        </section>

        {/* Main Content - Cards, Sections, etc. */}
        {isLoading || !isReady || list.length === 0 ? null : wrapButton ? (
          <div data-testid={`section-wrapper-${seed ?? 1}`}>
            <section
              id={getId("section_lunch")}
              className={`${sectionLayoutVariation.className} px-4 ${marginTop}`}
              data-testid={sectionLayoutVariation.dataTestId}
            >
              <h2 className="text-2xl font-bold mb-4">{getText("section_lunch")}</h2>
              <CardScroller title={getText("section_lunch")} layoutSeed={layoutSeed}>
                {filtered.map((r) => (
                  <RestaurantCard
                    key={r.id + "-lunch"}
                    r={r}
                    date={date}
                    people={people}
                    time={time}
                    layoutSeed={layoutSeed}
                  />
                ))}
              </CardScroller>
            </section>
          </div>
        ) : (
          <section
            id={getId("section_lunch")}
            className={`${sectionLayoutVariation.className} px-4 ${marginTop}`}
            data-testid={sectionLayoutVariation.dataTestId}
          >
            <h2 className="text-2xl font-bold mb-4">{getText("section_lunch")}</h2>
            <CardScroller title={getText("section_lunch")} layoutSeed={layoutSeed}>
              {filtered.map((r) => (
                <RestaurantCard
                  key={r.id + "-lunch"}
                  r={r}
                  date={date}
                  people={people}
                  time={time}
                  layoutSeed={layoutSeed}
                />
              ))}
            </CardScroller>
          </section>
        )}

        {/* Introducing OpenDinning Icons Section */}
        {wrapButton ? (
          <div data-testid={`icon-section-wrapper-${seed ?? 1}`}>
            <section
              id={getId("section_icons")}
              className={`${sectionLayoutVariation.className} ${marginTop} rounded-xl bg-[#f7f7f6] border px-4`}
              data-testid={sectionLayoutVariation.dataTestId}
            >
              <div className="flex flex-row justify-between items-center mb-1">
                <div>
                  <h2 className="text-2xl md:text-2xl font-bold">
                    {getText("section_icons")}
                  </h2>
                  <div className="text-base text-gray-600 mt-1 mb-3">
                    {getText("section_icons_subtitle")}
                  </div>
                </div>
                <button className="border px-5 py-2 rounded-md text-base font-semibold hover:bg-gray-100 whitespace-nowrap h-12">
                  {getText("explore_icons")}
                </button>
              </div>
              <CardScroller title={getText("section_icons")} layoutSeed={layoutSeed}>
                {iconRestaurants.map((r) => (
                  <RestaurantCard
                    key={r.id + "-icon"}
                    r={r}
                    date={date}
                    people={people}
                    time={time}
                    layoutSeed={layoutSeed}
                  />
                ))}
              </CardScroller>
            </section>
          </div>
        ) : (
          <section
            id={getId("section_icons")}
            className={`${sectionLayoutVariation.className} ${marginTop} rounded-xl bg-[#f7f7f6] border px-4`}
            data-testid={sectionLayoutVariation.dataTestId}
          >
            <div className="flex flex-row justify-between items-center mb-1">
              <div>
                <h2 className="text-2xl md:text-2xl font-bold">
                  {getText("section_icons")}
                </h2>
                <div className="text-base text-gray-600 mt-1 mb-3">
                  {getText("section_icons_subtitle")}
                </div>
              </div>
              <button className="border px-5 py-2 rounded-md text-base font-semibold hover:bg-gray-100 whitespace-nowrap h-12">
                {getText("explore_icons")}
              </button>
            </div>
            <CardScroller title={getText("section_icons")} layoutSeed={layoutSeed}>
              {iconRestaurants.map((r) => (
                <RestaurantCard
                  key={r.id + "-icon"}
                  r={r}
                  date={date}
                  people={people}
                  time={time}
                  layoutSeed={layoutSeed}
                />
              ))}
            </CardScroller>
          </section>
        )}

        {/* Award Winners Section */}
        {wrapButton ? (
          <div data-testid={`award-section-wrapper-${seed ?? 1}`}>
            <section id={getId("section_awards")} className={`${sectionLayoutVariation.className} ${marginTop} px-4`} data-testid={sectionLayoutVariation.dataTestId}>
              <h2 className="text-2xl font-bold mb-4">{getText("section_awards")}</h2>
              <CardScroller title={getText("section_awards")} layoutSeed={layoutSeed}>
                {awardRestaurants.map((r) => (
                  <RestaurantCard
                    key={r.id + "-award"}
                    r={r}
                    date={date}
                    people={people}
                    time={time}
                    layoutSeed={layoutSeed}
                  />
                ))}
              </CardScroller>
            </section>
          </div>
        ) : (
          <section id={getId("section_awards")} className={`${sectionLayoutVariation.className} ${marginTop} px-4`} data-testid={sectionLayoutVariation.dataTestId}>
            <h2 className="text-2xl font-bold mb-4">{getText("section_awards")}</h2>
            <CardScroller title={getText("section_awards")} layoutSeed={layoutSeed}>
              {awardRestaurants.map((r) => (
                <RestaurantCard
                  key={r.id + "-award"}
                  r={r}
                  date={date}
                  people={people}
                  time={time}
                  layoutSeed={layoutSeed}
                />
              ))}
            </CardScroller>
          </section>
        )}
      </section>
    </main>
  );
}

// Loading component for Suspense fallback
function HomePageLoading() {
  return (
    <main>
      <nav className="w-full border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-20 px-4 gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-[#46a758] px-3 py-1 rounded flex items-center h-9">
              <span className="font-bold text-white text-lg">AutoDining</span>
            </div>
          </div>
        </div>
      </nav>
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
