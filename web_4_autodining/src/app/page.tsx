"use client";
import React, { useCallback, useState, useRef, useEffect, useMemo, Suspense } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon, UserIcon, ChevronLeft, ChevronRight, Search, MapPin, Star } from "lucide-react";
import { useSeed } from "@/context/SeedContext";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { getRestaurants, initializeRestaurants } from "@/dynamic/v2";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";
import { cn } from "@/library/utils";
import Navbar from "@/components/Navbar";

type UiRestaurant = {
  id: string; name: string; image: string; cuisine: string; area: string;
  reviews: number; rating: number; stars: number; price: string; bookings: number; times: string[]; tags: string[];
};

const defaultRestaurants: UiRestaurant[] = [];

function StarRating({ count }: { count: number }) {
  const clamped = Math.max(1, Math.min(5, Math.floor(count)));
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => i).map((i) => (
        <Star key={`star-${i}`} className={cn("w-3.5 h-3.5", i < clamped ? "text-amber-400 fill-amber-400" : "text-white/20")} />
      ))}
    </span>
  );
}

function RestaurantCard({ r, date: _date, people: _people, time: _time, index }: {
  r: { id: string; name: string; cuisine: string; area: string; reviews: number; rating: number; stars: number; price: string; bookings: number; image: string; times: string[] };
  date: Date | undefined; people: number; time: string; index?: number;
}) {
  const dyn = useDynamicSystem();
  const viewDetailsLabel = dyn.v3.getVariant("see_details", TEXT_VARIANTS_MAP, "View details");
  const ratingValue = r.rating ?? 4.5;
  const starsCount = r.stars ?? 5;
  const reviewsCount = r.reviews || 0;
  const priceTag = r.price || "$$";
  return (
    dyn.v1.addWrapDecoy(`restaurant-card-${r.id}`, (
      <SeedLink
        href={`/restaurant/${encodeURIComponent(r.id)}`}
        className="block w-[320px] flex-shrink-0"
        onClick={() => logEvent(EVENT_TYPES.VIEW_RESTAURANT, { restaurantId: r.id })}
      >
        <div
          className={cn(
            "w-full rounded-2xl overflow-hidden bg-card border border-white/[0.06] card-lift group cursor-pointer",
            "opacity-0 animate-fade-in-up",
            index !== undefined && index < 8 ? `animate-delay-${(index % 4) * 100 + 100}` : ""
          )}
          style={index !== undefined ? { animationDelay: `${(index % 4) * 80}ms`, animationFillMode: "forwards" } : undefined}
          id={dyn.v3.getVariant("restaurant-card", ID_VARIANTS_MAP, `restaurant-card-${r.id}`)}
        >
          {dyn.v1.addWrapDecoy(`restaurant-card-image-${r.id}`, (
            <div className="relative w-full h-[200px] overflow-hidden">
              <img
                src={r.image} alt={r.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                id={dyn.v3.getVariant("restaurant-image", ID_VARIANTS_MAP, `restaurant-image-${r.id}`)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              {dyn.v1.addWrapDecoy(`restaurant-card-badges-${r.id}`, (
                <div
                  className="absolute top-3 left-3 right-3 flex justify-between items-start z-10"
                  id={dyn.v3.getVariant("restaurant-badges", ID_VARIANTS_MAP, `restaurant-badges-${r.id}`)}
                >
                  <span
                    className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white/80 text-[11px] font-medium border border-white/10"
                    id={dyn.v3.getVariant("restaurant-cuisine-badge", ID_VARIANTS_MAP, `restaurant-cuisine-${r.id}`)}
                  >{r.cuisine}</span>
                  <span
                    className="px-2.5 py-1 rounded-full bg-amber-500/90 text-black text-[11px] font-bold"
                    id={dyn.v3.getVariant("restaurant-price-badge", ID_VARIANTS_MAP, `restaurant-price-${r.id}`)}
                  >{priceTag}</span>
                </div>
              ))}
            </div>
          ))}
          {dyn.v1.addWrapDecoy(`restaurant-card-content-${r.id}`, (
            <div
              className="p-5 space-y-3"
              id={dyn.v3.getVariant("restaurant-card-content", ID_VARIANTS_MAP, `restaurant-content-${r.id}`)}
            >
              {dyn.v1.addWrapDecoy(`restaurant-card-title-${r.id}`, (
                <h3
                  className="font-bold text-base text-white group-hover:text-amber-400 transition-colors duration-300 leading-tight"
                  id={dyn.v3.getVariant("restaurant-name", ID_VARIANTS_MAP, `restaurant-name-${r.id}`)}
                >{r.name}</h3>
              ))}
              {dyn.v1.addWrapDecoy(`restaurant-card-rating-${r.id}`, (
                <div
                  className="flex items-center gap-2"
                  id={dyn.v3.getVariant("restaurant-rating", ID_VARIANTS_MAP, `restaurant-rating-${r.id}`)}
                >
                  <StarRating count={starsCount} />
                  <span className="text-xs font-semibold text-white/70">{ratingValue.toFixed(1)}</span>
                  {reviewsCount > 0 && <span className="text-[11px] text-white/30">({reviewsCount})</span>}
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                <span
                  className="text-[11px] text-white/30 flex items-center gap-1"
                  id={dyn.v3.getVariant("restaurant-area", ID_VARIANTS_MAP, `restaurant-area-${r.id}`)}
                >
                  <MapPin className="w-3 h-3" />{r.area}
                </span>
                <span
                  id={dyn.v3.getVariant("view_details_button", ID_VARIANTS_MAP, `view-details-${r.id}`)}
                  className={cn(dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "button-primary"), "text-[12px] bg-amber-500 hover:bg-amber-400 text-black px-4 py-1.5 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20")}
                >{viewDetailsLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </SeedLink>
    ), `restaurant-card-wrap-${r.id}`)
  );
}

function CardScroller({ children, title }: { children: React.ReactNode; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const tickingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const dyn = useDynamicSystem();
  const { seed } = useSeed();
  const childCount = React.Children.count(children);
  const checkScroll = useCallback(() => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);
  const scheduleCheck = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    rafIdRef.current = window.requestAnimationFrame(() => {
      checkScroll();
      tickingRef.current = false;
    });
  }, [checkScroll]);
  useEffect(() => {
    checkScroll();
    let ro: ResizeObserver | null = null;
    if (ref.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => scheduleCheck());
      ro.observe(ref.current);
    }
    window.addEventListener("resize", scheduleCheck);
    scheduleCheck();
    return () => {
      window.removeEventListener("resize", scheduleCheck);
      if (ro && ref.current) ro.disconnect();
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      tickingRef.current = false;
    };
  }, [checkScroll, scheduleCheck]);
  const scroll = (direction: "left" | "right") => {
    if (ref.current) {
      const cardWidth = 320;
      const gap = 16;
      const scrollAmount = cardWidth + gap;
      const newScrollLeft = ref.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
      ref.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
      logEvent(EVENT_TYPES.SCROLL_VIEW, { direction, title });
    }
  };
  if (childCount === 0) return null;
  return (
    dyn.v1.addWrapDecoy(`card-scroller-${title}`, (
      <div
        className="relative group"
        id={dyn.v3.getVariant("card-scroller", ID_VARIANTS_MAP, `card-scroller-${title}`)}
      >
        {canScrollLeft && (
          dyn.v1.addWrapDecoy(`card-scroller-left-btn-${title}`, (
            <button
              onClick={() => scroll("left")}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-20
                w-10 h-10 flex items-center justify-center
                bg-amber-500 text-black
                rounded-full shadow-xl shadow-amber-500/30
                hover:bg-amber-400 hover:scale-110
                transition-all duration-300 opacity-0 group-hover:opacity-100"
              data-testid={`scroll-left-${seed ?? 1}`}
              aria-label={dyn.v3.getVariant("scroll_left", undefined, "Scroll left")}
              id={dyn.v3.getVariant("scroll-left-button", ID_VARIANTS_MAP, `scroll-left-${title}`)}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ))
        )}
        {canScrollRight && (
          dyn.v1.addWrapDecoy(`card-scroller-right-btn-${title}`, (
            <button
              onClick={() => scroll("right")}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-20
                w-10 h-10 flex items-center justify-center
                bg-amber-500 text-black
                rounded-full shadow-xl shadow-amber-500/30
                hover:bg-amber-400 hover:scale-110
                transition-all duration-300 opacity-0 group-hover:opacity-100"
              data-testid={`scroll-right-${seed ?? 1}`}
              aria-label={dyn.v3.getVariant("scroll_right", undefined, "Scroll right")}
              id={dyn.v3.getVariant("scroll-right-button", ID_VARIANTS_MAP, `scroll-right-${title}`)}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ))
        )}
        {dyn.v1.addWrapDecoy(`card-scroller-content-${title}`, (
          <div
            ref={ref}
            className="flex gap-4 pb-4 px-1 scroll-smooth overflow-x-auto overflow-y-hidden no-scrollbar"
            onScroll={scheduleCheck}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            id={dyn.v3.getVariant("card-scroller-content", ID_VARIANTS_MAP, `card-scroller-content-${title}`)}
          >
            {children}
          </div>
        ))}
      </div>
    ), `card-scroller-wrap-${title}`)
  );
}

function HomePageContent() {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [list, setList] = useState<UiRestaurant[]>(defaultRestaurants);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("1:00 PM");
  const [people, setPeople] = useState(2);
  const [search, setSearch] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dyn = useDynamicSystem();
  const personLabel = dyn.v3.getVariant("person", undefined, "Guest");
  const peopleLabel = dyn.v3.getVariant("people", undefined, "Guests");
  const { seed } = useSeed();
  const v2Seed = seed;
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const tagOptions = [
    "top-rated",
    "local favourite",
    "outdoor seating",
    "good for groups",
    "romantic",
    "gourmet",
    "sushi",
    "pasta",
    "burgers",
    "spicy",
    "tapas",
  ];
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[page.tsx] Debug dinámico:", { seed: dyn.seed, v1Enabled: isV1Enabled(), v2Enabled: dyn.v2.isEnabled(), v3Enabled: isV3Enabled() });
    }
  }, [dyn.seed, dyn.v2]);
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
      logEvent(EVENT_TYPES.DATE_SELECTED, { date: isoDate });
    }
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim()) logEvent(EVENT_TYPES.SEARCH_RESTAURANT, { query: value });
    }, 500);
  };
  const handleTimeSelect = (t: string) => {
    setTime(t);
    logEvent(EVENT_TYPES.TIME_DROPDOWN_OPENED, { time: t });
    logEvent(EVENT_TYPES.TIME_SELECTED, { time: t });
  };
  const handlePeopleSelect = (n: number) => {
    setPeople(n);
    logEvent(EVENT_TYPES.PEOPLE_DROPDOWN_OPENED, { people: n });
    logEvent(EVENT_TYPES.PEOPLE_SELECTED, { people: n });
  };
  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    logEvent(EVENT_TYPES.TAG_FILTER_SELECTED, { tag: tag ?? "all" });
  };
  function matches(r: UiRestaurant): boolean {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q) || r.area.toLowerCase().includes(q);
    const matchesTag = !selectedTag || r.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  }
  const filtered = list.filter(matches);
  const peopleOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  const timeOptions = ["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM"];
  const lastV2SeedRef = useRef<number | null>(null);
  const lastBaseSeedRef = useRef<number | null>(null);
  useEffect(() => {
    if (lastBaseSeedRef.current !== null && lastBaseSeedRef.current !== seed) {
      console.log(`[autodining] Base seed changed from ${lastBaseSeedRef.current} to ${seed}, resetting cache`);
      lastV2SeedRef.current = null;
    }
    lastBaseSeedRef.current = seed;
  }, [seed]);
  useEffect(() => {
    const currentV2Seed = v2Seed ?? seed;
    if (currentV2Seed === null || currentV2Seed === undefined) return;
    if (lastV2SeedRef.current === currentV2Seed) return;
    let cancelled = false;
    const loadRestaurants = async () => {
      console.log(`[autodining] V2 Data - Seed: ${currentV2Seed} (from base seed: ${seed})`);
      lastV2SeedRef.current = currentV2Seed;
      setIsLoading(true);
      try {
        await initializeRestaurants(currentV2Seed);
        if (!cancelled) {
          const fresh = getRestaurants().map((r) => {
            const rating = r.rating ?? 4.5;
            const stars = r.stars ?? Math.round(rating);
            return {
              id: r.id, name: r.name, image: r.image,
              cuisine: r.cuisine ?? "International", area: r.area ?? "Downtown",
              reviews: r.reviews ?? 64, rating, stars,
              price: r.price ?? "$$", bookings: r.bookings ?? 0, times: ["1:00 PM"],
              tags: r.tags ?? [],
            };
          });
          const mapped = fresh.length > 0 ? fresh : defaultRestaurants;
          setList(mapped);
          setIsReady(mapped.length > 0);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadRestaurants();
    return () => { cancelled = true; };
  }, [v2Seed, seed]);
  const expensiveRestaurants = useMemo(() => {
    const expensive = filtered.filter((r) => {
      const priceCount = (r.price || "").match(/\$/g)?.length || 0;
      return priceCount >= 4;
    }).slice(0, 8);
    const order = dyn.v1.changeOrderElements("expensive-restaurants", expensive.length);
    return order.map((idx) => expensive[idx]);
  }, [filtered, dyn.v1]);
  const mediumRestaurants = useMemo(() => {
    const medium = filtered.filter((r) => {
      const priceCount = (r.price || "").match(/\$/g)?.length || 0;
      return priceCount >= 2 && priceCount <= 3;
    }).slice(0, 8);
    const order = dyn.v1.changeOrderElements("medium-restaurants", medium.length);
    return order.map((idx) => medium[idx]);
  }, [filtered, dyn.v1]);
  const cheapRestaurants = useMemo(() => {
    const cheap = filtered.filter((r) => {
      const priceCount = (r.price || "").match(/\$/g)?.length || 0;
      return priceCount === 1;
    }).slice(0, 8);
    const order = dyn.v1.changeOrderElements("cheap-restaurants", cheap.length);
    return order.map((idx) => cheap[idx]);
  }, [filtered, dyn.v1]);
  return (
    <main suppressHydrationWarning className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Section */}
      <section className="relative">
        <div className="animated-gradient noise relative overflow-hidden text-white px-8 py-24 md:py-32">
          {/* Decorative orbs */}
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            <p className="uppercase tracking-[0.5em] text-[11px] font-semibold text-amber-500">Curated dining experiences</p>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
              Discover your next<br />
              <span className="text-gradient">unforgettable</span> meal
            </h1>
            <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">Handpicked restaurants, seamless reservations. From intimate dinners to grand celebrations.</p>
          </div>
        </div>
        {/* Search and Filters - floating bar */}
        {dyn.v1.addWrapDecoy("home-search-section", (
          <section
            className="flex justify-center -mt-8 mb-12 relative z-20 px-6"
            style={{ minHeight: "auto", visibility: "visible", display: "flex" }}
          >
            <div className="flex flex-wrap gap-3 items-center glass rounded-2xl p-3 shadow-2xl shadow-black/30 max-w-4xl w-full">
              {dyn.v1.addWrapDecoy("home-search-input-container", (
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    id={dyn.v3.getVariant("search-input", ID_VARIANTS_MAP, "search-input")}
                    type="text"
                    placeholder={dyn.v3.getVariant("search_placeholder", TEXT_VARIANTS_MAP, "Search restaurant, cuisine...")}
                    className={cn(
                      dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "input-text"),
                      "w-full h-10 pl-10 pr-4 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all text-sm"
                    )}
                    value={search}
                    onChange={handleSearchChange}
                  />
                </div>
              ))}
              <div className="h-8 w-px bg-white/10 hidden md:block" />
              {dyn.v1.addWrapDecoy("home-date-selector", (
                <Popover open={dateOpen} onOpenChange={setDateOpen} modal={false}>
                  <PopoverTrigger asChild>
                    <Button
                      id={dyn.v3.getVariant("date_picker", ID_VARIANTS_MAP, "date_picker")}
                      variant="outline"
                      className={cn(
                        dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "button-secondary"),
                        "w-[170px] justify-start text-left font-normal rounded-xl border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-amber-500/30 text-white/70 text-sm h-10 transition-all"
                      )}
                      onClick={() => logEvent(EVENT_TYPES.DATE_DROPDOWN_OPENED, { action: "open" })}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-amber-500/70" />
                      {date ? format(date, "MMM d, yyyy") : <span className="text-white/30">{dyn.v3.getVariant("select_date", TEXT_VARIANTS_MAP, "Select date")}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]" align="start" side="bottom" sideOffset={8}>
                    <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
                  </PopoverContent>
                </Popover>
              ))}
              {dyn.v1.addWrapDecoy("home-time-selector", (
                <Popover open={timeOpen} onOpenChange={setTimeOpen} modal={false}>
                  <PopoverTrigger asChild>
                    <Button
                      id={dyn.v3.getVariant("time_picker", ID_VARIANTS_MAP, "time_picker")}
                      variant="outline"
                      className={cn(
                        dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "button-secondary"),
                        "w-[130px] justify-start text-left font-normal rounded-xl border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-amber-500/30 text-white/70 text-sm h-10 transition-all"
                      )}
                      onClick={() => logEvent(EVENT_TYPES.TIME_DROPDOWN_OPENED, { action: "open" })}
                    >
                      <ClockIcon className="mr-2 h-4 w-4 text-amber-500/70" />
                      {time}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]" align="start" side="bottom" sideOffset={8}>
                    <div className="p-2">
                      {timeOptions.map((t) => (
                        <Button key={t} variant="ghost" className="w-full justify-start text-sm" onClick={() => { handleTimeSelect(t); setTimeOpen(false); }}>
                          {t}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ))}
              {dyn.v1.addWrapDecoy("home-guests-selector", (
                <Popover open={peopleOpen} onOpenChange={setPeopleOpen} modal={false}>
                  <PopoverTrigger asChild>
                    <Button
                      id={dyn.v3.getVariant("people_picker", ID_VARIANTS_MAP, "people_picker")}
                      variant="outline"
                      className={cn(
                        dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "button-secondary"),
                        "w-[130px] justify-start text-left font-normal rounded-xl border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-amber-500/30 text-white/70 text-sm h-10 transition-all"
                      )}
                      onClick={() => logEvent(EVENT_TYPES.PEOPLE_DROPDOWN_OPENED, { action: "open" })}
                    >
                      <UserIcon className="mr-2 h-4 w-4 text-amber-500/70" />
                      {people} {people === 1 ? personLabel : peopleLabel}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]" align="start" side="bottom" sideOffset={8}>
                    <div className="p-2">
                      {peopleOptions.map((n) => (
                        <Button key={n} variant="ghost" className="w-full justify-start text-sm" onClick={() => { handlePeopleSelect(n); setPeopleOpen(false); }}>
                          {n} {n === 1 ? personLabel : peopleLabel}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          </section>
        ))}
        {dyn.v1.addWrapDecoy("home-tags-section", (
          <div className="flex justify-center px-6 pb-6">
            <div className="flex flex-wrap gap-2 max-w-5xl w-full justify-center">
              <button
                type="button"
                onClick={() => handleTagSelect(null)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  !selectedTag
                    ? "bg-amber-500 text-black border-amber-500/60 shadow-md shadow-amber-500/20"
                    : "bg-white/[0.04] text-white/60 border-white/[0.08] hover:text-white hover:border-amber-500/30"
                )}
              >
                All
              </button>
              {tagOptions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagSelect(tag)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize",
                    selectedTag === tag
                      ? "bg-amber-500 text-black border-amber-500/60 shadow-md shadow-amber-500/20"
                      : "bg-white/[0.04] text-white/60 border-white/[0.08] hover:text-white hover:border-amber-500/30"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
      {/* Main Content - Cards */}
      {isLoading || !isReady || list.length === 0 ? null : (
        dyn.v1.addWrapDecoy("home-sections", (
          <div className="max-w-[1400px] mx-auto px-8 pb-20 space-y-16">
            {/* Expensive Restaurants ($$$$) */}
            {expensiveRestaurants.length > 0 && (
              dyn.v1.addWrapDecoy("section-expensive", (
                <section id={dyn.v3.getVariant("section_expensive", ID_VARIANTS_MAP, "section_expensive")}>
                  <div className="mb-6 flex items-end justify-between">
                    <div>
                      <p className="uppercase tracking-[0.3em] text-[10px] font-semibold text-amber-500 mb-1.5">Premium</p>
                      <h2 className="text-2xl font-bold text-white tracking-tight">{dyn.v3.getVariant("section_expensive_title", TEXT_VARIANTS_MAP, "Fine dining")}</h2>
                    </div>
                    <p className="text-white/30 text-sm hidden md:block">Fine dining experiences for special occasions</p>
                  </div>
                  <div className="divider-gradient mb-6" />
                  <CardScroller title={dyn.v3.getVariant("section_expensive_title", TEXT_VARIANTS_MAP, "Fine dining")}>
                    {expensiveRestaurants.map((r, i) => (
                      <RestaurantCard key={`${r.id}-expensive`} r={r} date={date} people={people} time={time} index={i} />
                    ))}
                  </CardScroller>
                </section>
              ), "section-expensive-wrap")
            )}
            {/* Medium Price Restaurants */}
            {mediumRestaurants.length > 0 && (
              dyn.v1.addWrapDecoy("section-medium", (
                <section id={dyn.v3.getVariant("section_medium", ID_VARIANTS_MAP, "section_medium")}>
                  <div className="mb-6 flex items-end justify-between">
                    <div>
                      <p className="uppercase tracking-[0.3em] text-[10px] font-semibold text-amber-500 mb-1.5">Popular</p>
                      <h2 className="text-2xl font-bold text-white tracking-tight">{dyn.v3.getVariant("section_medium_title", TEXT_VARIANTS_MAP, "Everyday favorites")}</h2>
                    </div>
                    <p className="text-white/30 text-sm hidden md:block">Great value restaurants for everyday dining</p>
                  </div>
                  <div className="divider-gradient mb-6" />
                  <CardScroller title={dyn.v3.getVariant("section_medium_title", TEXT_VARIANTS_MAP, "Everyday favorites")}>
                    {mediumRestaurants.map((r, i) => (
                      <RestaurantCard key={`${r.id}-medium`} r={r} date={date} people={people} time={time} index={i} />
                    ))}
                  </CardScroller>
                </section>
              ), "section-medium-wrap")
            )}
            {/* Cheap Restaurants */}
            {cheapRestaurants.length > 0 && (
              dyn.v1.addWrapDecoy("section-cheap", (
                <section id={dyn.v3.getVariant("section_cheap", ID_VARIANTS_MAP, "section_cheap")}>
                  <div className="mb-6 flex items-end justify-between">
                    <div>
                      <p className="uppercase tracking-[0.3em] text-[10px] font-semibold text-amber-500 mb-1.5">Great value</p>
                      <h2 className="text-2xl font-bold text-white tracking-tight">{dyn.v3.getVariant("section_cheap_title", TEXT_VARIANTS_MAP, "Budget eats")}</h2>
                    </div>
                    <p className="text-white/30 text-sm hidden md:block">Budget-friendly without compromising quality</p>
                  </div>
                  <div className="divider-gradient mb-6" />
                  <CardScroller title={dyn.v3.getVariant("section_cheap_title", TEXT_VARIANTS_MAP, "Budget eats")}>
                    {cheapRestaurants.map((r, i) => (
                      <RestaurantCard key={`${r.id}-cheap`} r={r} date={date} people={people} time={time} index={i} />
                    ))}
                  </CardScroller>
                </section>
              ), "section-cheap-wrap")
            )}
          </div>
        ), "home-sections-wrap")
      )}
    </main>
  );
}

function HomePageLoading() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-8 py-32">
        <div className="animate-pulse space-y-8 flex flex-col items-center">
          <div className="h-4 bg-white/10 rounded-full w-40" />
          <div className="h-12 bg-white/10 rounded-2xl w-96" />
          <div className="h-4 bg-white/5 rounded-full w-72" />
          <div className="flex gap-4 mt-12">
            <div className="h-72 bg-white/5 rounded-2xl w-[320px]" />
            <div className="h-72 bg-white/5 rounded-2xl w-[320px]" />
            <div className="h-72 bg-white/5 rounded-2xl w-[320px]" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageLoading />}>
      <HomePageContent />
    </Suspense>
  );
}
