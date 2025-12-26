"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { WherePopover } from "@/components/WherePopover";
import { DateRangePopover } from "@/components/DateRangePopover";
import { GuestSelectorPopover } from "@/components/GuestSelectorPopover";
import { PropertyCard } from "@/components/PropertyCard";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { dynamicDataProvider } from "@/dynamic/v2-data";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { useSeedLayout } from "@/library/utils";
import type { Hotel } from "@/types/hotel";
import { useWishlist } from "@/hooks/useWishlist";

type GuestsCount = {
  adults: number;
  children: number;
  infants: number;
  pets: number;
};

function parseDateParam(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function normalizeHotelDates(hotel: Hotel): Hotel {
  return {
    ...hotel,
    datesFrom: hotel.datesFrom,
    datesTo: hotel.datesTo,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function HomeContent() {
  const dyn = useDynamicSystem();
  const dynamicV3TextVariants: Record<string, string[]> = {
    where_label: ["Where", "Destination", "Location"],
    where_placeholder: ["Search destinations", "Find a stay", "Discover places"],
    add_dates: ["Add dates", "Choose dates", "Select dates"],
    check_in: ["Check in", "Arrival", "Start date"],
    check_out: ["Check out", "Departure", "End date"],
    who: ["Who", "Guests", "Travelers"],
    add_guests: ["Add guests", "Choose guests", "Guests?"],
    clear_search: ["Clear search", "Reset search", "Remove query"],
    clear_dates: ["Clear dates", "Reset dates", "Remove dates"],
    clear_guests: ["Clear guests", "Reset guests", "Remove guests"],
    search_button: ["Search", "Find stays", "Explore stays"],
    guest_label: ["guest", "traveler", "visitor"],
    guests_label: ["guests", "travelers", "visitors"],
    infant_label: ["infant", "baby", "little one"],
    infants_label: ["infants", "babies", "little ones"],
    pet_label: ["pet", "animal", "companion"],
    pets_label: ["pets", "animals", "companions"],
    no_results: ["No results", "Nothing found", "No stays match"],
    region_label: ["Region", "Area", "Country"],
    rating_label: ["Rating", "Score", "Guest rating"],
  };
  const searchParams = useSearchParams();
  const {
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    ready: wishlistReady,
  } = useWishlist();

  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });
  const [guests, setGuests] = useState<GuestsCount>({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoadingHotels, setIsLoadingHotels] = useState(true);
  const [minRating, setMinRating] = useState<number>(0);
  const [region, setRegion] = useState<string>("all");

  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    const urlFrom = parseDateParam(searchParams.get("from")) ?? null;
    const urlTo = parseDateParam(searchParams.get("to")) ?? null;

    const nextGuests: GuestsCount = {
      adults: Number(searchParams.get("adults") ?? 0),
      children: Number(searchParams.get("children") ?? 0),
      infants: Number(searchParams.get("infants") ?? 0),
      pets: Number(searchParams.get("pets") ?? 0),
    };

    setSearchTerm(urlSearch);
    setCommittedSearch(urlSearch);
    setDateRange({
      from: urlFrom,
      to: urlTo,
    });
    setGuests(nextGuests);
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [committedSearch, dateRange, guests]);

  // Listen for data refresh events from DynamicDataProvider
  useEffect(() => {
    const loadHotels = async () => {
      try {
        // Wait for provider to be ready
        await dynamicDataProvider.whenReady();

        const providerHotels = dynamicDataProvider.getHotels();
        setHotels(providerHotels.map(normalizeHotelDates));
        console.log('[HomeContent] Hotels loaded:', providerHotels.length);
      } catch (error) {
        console.error('[HomeContent] Error loading hotels:', error);
      } finally {
        setIsLoadingHotels(false);
      }
    };

    const handleDataRefresh = () => {
      console.log('[HomeContent] Handling v2-seed change event');
      // Add small delay to ensure DynamicDataProvider has finished refreshing
      setTimeout(() => {
        const providerHotels = dynamicDataProvider.getHotels();
        if (providerHotels.length > 0) {
          setHotels(providerHotels.map(normalizeHotelDates));
          console.log('[HomeContent] Hotels refreshed:', providerHotels.length);
        }
      }, 100);
    };

    // Initial load
    loadHotels();

    // Listen for v2-seed changes
    window.addEventListener("autolodge:v2SeedChange", handleDataRefresh);

    return () => {
      window.removeEventListener("autolodge:v2SeedChange", handleDataRefresh);
    };
  }, []);

  const regions = useMemo(() => {
    const unique = new Set<string>();
    hotels.forEach((hotel) => {
      const [, country] = hotel.location.split(",").map((part) => part.trim());
      if (country) {
        unique.add(country);
      }
    });
    return Array.from(unique);
  }, [hotels]);

  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      if (committedSearch.trim()) {
        const term = committedSearch.toLowerCase();
        const matches =
          hotel.location.toLowerCase().includes(term) ||
          hotel.title.toLowerCase().includes(term);
        if (!matches) {
          return false;
        }
      }

      if (dateRange.from && dateRange.to) {
        const hotelFrom = parseDateParam(hotel.datesFrom);
        const hotelTo = parseDateParam(hotel.datesTo);
        if (!hotelFrom || !hotelTo) {
          return false;
        }

        const selectedFrom = dateRange.from;
        const selectedTo = dateRange.to;

        if (!selectedFrom || !selectedTo) {
          return false;
        }

        const overlaps =
          selectedFrom.getTime() <= hotelTo.getTime() &&
          hotelFrom.getTime() <= selectedTo.getTime();
        if (!overlaps) {
          return false;
        }
      }

      const totalGuests = guests.adults + guests.children;
      if (totalGuests > 0 && totalGuests > hotel.maxGuests) {
        return false;
      }

      if (minRating > 0 && hotel.rating < minRating) {
        return false;
      }

      if (region !== "all") {
        const [, country] = hotel.location.split(",").map((part) => part.trim());
        if (!country || country.toLowerCase() !== region.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [committedSearch, dateRange, guests, hotels, minRating, region]);

  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / itemsPerPage));
  const paginatedResults = useMemo(
    () =>
      filteredHotels.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [filteredHotels, currentPage]
  );

  const summaryGuests = useMemo(() => {
    const guestCount = guests.adults + guests.children;
    const parts: string[] = [];
    const guestWord = dyn.v3.getVariant("guests_label", dynamicV3TextVariants, "guests");
    const guestWordSingular = dyn.v3.getVariant("guest_label", dynamicV3TextVariants, "guest");

    if (guestCount > 0) {
      parts.push(`${guestCount} ${guestCount === 1 ? guestWordSingular : guestWord}`);
    } else {
      return dyn.v3.getVariant("add_guests", dynamicV3TextVariants, "Add guests");
    }

    if (guests.infants > 0) {
      parts.push(
        `${guests.infants} ${
          guests.infants === 1
            ? dyn.v3.getVariant("infant_label", dynamicV3TextVariants, "infant")
            : dyn.v3.getVariant("infants_label", dynamicV3TextVariants, "infants")
        }`
      );
    }

    if (guests.pets > 0) {
      parts.push(
        `${guests.pets} ${
          guests.pets === 1
            ? dyn.v3.getVariant("pet_label", dynamicV3TextVariants, "pet")
            : dyn.v3.getVariant("pets_label", dynamicV3TextVariants, "pets")
        }`
      );
    }

    return parts.join(", ");
  }, [dyn.v3, guests, dynamicV3TextVariants]);

  const { seed: layoutSeed, layout } = useSeedLayout("stay");
  const SearchWrapperTag = (layout?.searchBar?.wrapper ?? "section") as keyof JSX.IntrinsicElements;
  const EventWrapperTag = (layout?.eventElements?.wrapper ?? "div") as keyof JSX.IntrinsicElements;
  const searchWrapperClass =
    layout?.searchBar?.className ?? "w-full flex justify-center";
  const eventWrapperClass = layout?.eventElements?.className ?? "";
  const defaultOrder = ["search", "dates", "guests", "reserve"];
  const baseEventOrder = layout?.eventElements?.order ?? defaultOrder;

  const handleSearch = () => {
    setCommittedSearch(searchTerm);
    logEvent(EVENT_TYPES.SEARCH_HOTEL, {
      searchTerm,
      dateRange: {
        from: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : null,
        to: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : null,
      },
      guests: {
        adults: guests.adults,
        children: guests.children,
        infants: guests.infants,
        pets: guests.pets,
      },
      seedStructure: layoutSeed,
    });
  };

  const searchButtonVariant = dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "");

  const searchFieldNode = dyn.v1.addWrapDecoy("search-field", (
    <WherePopover searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
      <div
        id={dyn.v3.getVariant("search-input", ID_VARIANTS_MAP, "search_field")}
        className={`md:flex-[2] flex-1 min-w-[220px] min-h-[96px] flex flex-col justify-center px-3 py-2 rounded-[20px] cursor-pointer hover:bg-neutral-100 transition-all relative ${dyn.v3.getVariant("search-chip", CLASS_VARIANTS_MAP, "")}`}
      >
        <span className="text-xs font-semibold text-neutral-500 pb-0.5">
          {dyn.v3.getVariant("where_label", dynamicV3TextVariants, "Where")}
        </span>
        <span className="text-sm text-neutral-700">
          {searchTerm || dyn.v3.getVariant("where_placeholder", dynamicV3TextVariants, "Search destinations")}
        </span>
        {searchTerm && (
          <button
            className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600 text-lg p-0 bg-transparent border-none outline-none"
            type="button"
            style={{ lineHeight: 1, background: "none" }}
            tabIndex={0}
            aria-label={dyn.v3.getVariant("clear_search", dynamicV3TextVariants, "Clear search")}
            onClick={(event) => {
              event.stopPropagation();
              setSearchTerm("");
              setCommittedSearch("");
            }}
          >
            ×
          </button>
        )}
      </div>
    </WherePopover>
  ));

  const checkInNode = dyn.v1.addWrapDecoy("check-in-field", (
    <DateRangePopover selectedRange={dateRange} setSelectedRange={setDateRange}>
      <div
        id={dyn.v3.getVariant("check_in_field", ID_VARIANTS_MAP, "check_in_field")}
        className="flex-1 min-w-[170px] min-h-[96px] flex flex-col justify-center px-3 py-2 rounded-[20px] cursor-pointer hover:bg-neutral-100 transition-all relative"
      >
        <span className="text-xs font-semibold text-neutral-500 pb-0.5">
          {dyn.v3.getVariant("check_in", dynamicV3TextVariants, "Check in")}
        </span>
        <span className="text-sm text-neutral-700">
          {dateRange.from
            ? format(dateRange.from, "MMM d")
            : dyn.v3.getVariant("add_dates", dynamicV3TextVariants, "Add dates")}
        </span>
        {dateRange.from && (
          <button
            className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600 text-lg p-0 bg-transparent border-none outline-none"
            type="button"
            style={{ lineHeight: 1, background: "none" }}
            tabIndex={0}
            aria-label={dyn.v3.getVariant("clear_dates", dynamicV3TextVariants, "Clear dates")}
            onClick={(event) => {
              event.stopPropagation();
              setDateRange({ from: null, to: null });
            }}
          >
            ×
          </button>
        )}
      </div>
    </DateRangePopover>
  ));

  const checkOutNode = dyn.v1.addWrapDecoy("check-out-field", (
    <DateRangePopover selectedRange={dateRange} setSelectedRange={setDateRange}>
      <div
        id={dyn.v3.getVariant("check_out_field", ID_VARIANTS_MAP, "check_out_field")}
        className="flex-1 min-w-[170px] min-h-[96px] flex flex-col justify-center px-3 py-2 rounded-[20px] cursor-pointer hover:bg-neutral-100 transition-all relative"
      >
        <span className="text-xs font-semibold text-neutral-500 pb-0.5">
          {dyn.v3.getVariant("check_out", dynamicV3TextVariants, "Check out")}
        </span>
        <span className="text-sm text-neutral-700">
          {dateRange.to
            ? format(dateRange.to, "MMM d")
            : dyn.v3.getVariant("add_dates", dynamicV3TextVariants, "Add dates")}
        </span>
        {dateRange.to && (
          <button
            className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600 text-lg p-0 bg-transparent border-none outline-none"
            type="button"
            style={{ lineHeight: 1, background: "none" }}
            tabIndex={0}
            aria-label={dyn.v3.getVariant("clear_dates", dynamicV3TextVariants, "Clear dates")}
            onClick={(event) => {
              event.stopPropagation();
              setDateRange({ from: null, to: null });
            }}
          >
            ×
          </button>
        )}
      </div>
    </DateRangePopover>
  ));

  const guestsNode = dyn.v1.addWrapDecoy("guests-field", (
    <GuestSelectorPopover counts={guests} setCounts={setGuests}>
      <div
        id={dyn.v3.getVariant("guests_field", ID_VARIANTS_MAP, "guests_field")}
        className="flex flex-col justify-center px-3 py-2 rounded-[20px] cursor-pointer hover:bg-neutral-100 transition-all relative min-w-[160px] max-w-[220px] min-h-[96px]"
      >
        <span className="text-xs font-semibold text-neutral-500 pb-0.5">
          {dyn.v3.getVariant("who", dynamicV3TextVariants, "Who")}
        </span>
        <span className="text-sm text-neutral-700">{summaryGuests}</span>
        {(guests.adults > 0 ||
          guests.children > 0 ||
          guests.infants > 0 ||
          guests.pets > 0) && (
          <button
            className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600 text-lg p-0 bg-transparent border-none outline-none"
            type="button"
            style={{ lineHeight: 1, background: "none" }}
            tabIndex={0}
            aria-label={dyn.v3.getVariant("clear_guests", dynamicV3TextVariants, "Clear guests")}
            onClick={(event) => {
              event.stopPropagation();
              setGuests({ adults: 0, children: 0, infants: 0, pets: 0 });
            }}
          >
            ×
          </button>
        )}
      </div>
    </GuestSelectorPopover>
  ));

  const reserveNode = dyn.v1.addWrapDecoy("search-button", (
    <div className="w-full h-full flex items-center justify-start lg:justify-end">
      <button
        id={dyn.v3.getVariant("search-submit-button", ID_VARIANTS_MAP, "search_button")}
        className={`${searchButtonVariant} w-full lg:w-auto px-5 h-12 min-h-[48px] rounded-full bg-[#616882] text-white font-semibold text-lg flex items-center justify-center shadow-md border border-neutral-200 hover:bg-[#9ba6ce] focus:outline-none transition-all`}
        onClick={handleSearch}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          className="mr-1"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-3.5-3.5" />
        </svg>
        {dyn.v3.getVariant("search_button", dynamicV3TextVariants, "Search")}
      </button>
    </div>
  ));

  const eventComponents: Record<string, JSX.Element> = {
    search: searchFieldNode,
    dates: dyn.v1.addWrapDecoy("search-dates", (
      <div className="flex flex-1 gap-2 min-w-[260px]">{checkInNode}{checkOutNode}</div>
    )),
    guests: guestsNode,
    reserve: reserveNode,
  };

  const renderedEventComponents =
    baseEventOrder.map((key) => {
      const node = eventComponents[key];
      if (!node) return null;
      const spanClass =
        key === "dates" ? "sm:col-span-2 lg:col-span-2" : "sm:col-span-1";
      return (
        <div
          key={key}
          className={`h-full w-full flex items-stretch justify-start ${spanClass}`}
        >
          {node}
        </div>
      );
    }).filter(Boolean);

  const handleApplyFilters = () => {
    logEvent(EVENT_TYPES.APPLY_FILTERS, {
      rating: minRating,
      region,
      results: filteredHotels.length,
    });
    setCurrentPage(1);
  };

  const handleToggleWishlist = (hotelId: number) => {
    const hotel = hotels.find((item) => item.id === hotelId);
    if (!hotel) return;
    const alreadyWishlisted = isInWishlist.has(hotelId);

    if (alreadyWishlisted) {
      removeFromWishlist(hotelId);
      logEvent(EVENT_TYPES.REMOVE_FROM_WISHLIST, {
        id: hotel.id,
        title: hotel.title,
        location: hotel.location,
        price: hotel.price,
        rating: hotel.rating,
      });
    } else {
      addToWishlist(hotel);
      logEvent(EVENT_TYPES.ADD_TO_WISHLIST, {
        id: hotel.id,
        title: hotel.title,
        location: hotel.location,
        price: hotel.price,
        rating: hotel.rating,
      });
    }
  };

  const orderedPaginatedResults = useMemo(() => {
    const order = dyn.v1.changeOrderElements("home-property-cards", paginatedResults.length);
    return order.map((idx) => paginatedResults[idx]).filter(Boolean);
  }, [dyn.seed, paginatedResults]);

  return (
    <div className="flex flex-col w-full items-center mt-4 pb-12">
      {dyn.v1.addWrapDecoy("search-bar-container", (
      <SearchWrapperTag
        id={dyn.v3.getVariant("search-form", ID_VARIANTS_MAP, "search-bar")}
        className={`w-full flex justify-center px-3 ${searchWrapperClass}`}
      >
        {dyn.v1.addWrapDecoy("search-bar-shell", (
          <EventWrapperTag
            className={`rounded-[32px] shadow-md bg-white border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-stretch px-5 py-5 w-full max-w-5xl ${eventWrapperClass} ${dyn.v3.getVariant("search-bar-class", CLASS_VARIANTS_MAP, "")}`}
            style={{ gridTemplateColumns: "repeat(4, minmax(180px, 1fr)) auto" }}
          >
            {renderedEventComponents}
          </EventWrapperTag>
        ))}
      </SearchWrapperTag>
      ))}

      <div className="w-full mt-6">
        {dyn.v1.addWrapDecoy("filters-bar", (
          <div className="w-full max-w-5xl mx-auto bg-white border border-neutral-200 shadow-sm rounded-full px-5 py-2 grid grid-cols-1 sm:grid-cols-[auto,1fr,auto] items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                {dyn.v3.getVariant("rating_label", dynamicV3TextVariants, "Rating")}
              </span>
              <select
                id={dyn.v3.getVariant("rating_filter", ID_VARIANTS_MAP, "rating-filter")}
                className={`h-10 border border-neutral-300 bg-white text-sm rounded-full px-3 text-neutral-800 shadow-sm ${dyn.v3.getVariant("filter_select", CLASS_VARIANTS_MAP, "")}`}
                value={minRating}
                onChange={(event) => setMinRating(Number(event.target.value))}
              >
                <option value={0}>{dyn.v3.getVariant("rating_any", dynamicV3TextVariants, "Any")}</option>
                <option value={4}>4.0+</option>
                <option value={4.5}>4.5+</option>
                <option value={4.7}>4.7+</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                {dyn.v3.getVariant("region_label", dynamicV3TextVariants, "Region")}
              </span>
              <select
                id={dyn.v3.getVariant("region_filter", ID_VARIANTS_MAP, "region-filter")}
                className={`h-10 border border-neutral-300 bg-white text-sm rounded-full px-3 text-neutral-800 shadow-sm ${dyn.v3.getVariant("filter_select", CLASS_VARIANTS_MAP, "")}`}
                value={region}
                onChange={(event) => setRegion(event.target.value)}
              >
                <option value="all">{dyn.v3.getVariant("region_all", dynamicV3TextVariants, "All")}</option>
                {regions.map((regionName) => (
                  <option key={regionName} value={regionName}>
                    {regionName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 sm:justify-end">
              <button
                type="button"
                className="h-10 px-4 rounded-full border border-neutral-300 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition"
                onClick={() => {
                  setMinRating(0);
                  setRegion("all");
                }}
              >
                {dyn.v3.getVariant("reset_filters", dynamicV3TextVariants, "Reset")}
              </button>
              <button
                type="button"
                className={`h-10 px-4 rounded-full bg-[#616882] text-white font-semibold hover:bg-[#7b86aa] transition shadow-sm ${dyn.v3.getVariant("apply_button", CLASS_VARIANTS_MAP, "")}`}
                onClick={handleApplyFilters}
              >
                {dyn.v3.getVariant("apply_filters", dynamicV3TextVariants, "Apply")}
              </button>
            </div>
          </div>
        ))}
      </div>

      <section className="w-full flex flex-col items-center mt-8">
        {orderedPaginatedResults.length === 0 ? (
          <div
            id={dyn.v3.getVariant("no_results", ID_VARIANTS_MAP, "no_results")}
            className="text-neutral-400 font-semibold text-lg mt-12"
          >
            {dyn.v3.getVariant("no_results", dynamicV3TextVariants, "No results")}
          </div>
        ) : (
          dyn.v1.addWrapDecoy("home-grid", (
            <div className="grid gap-7 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {orderedPaginatedResults.map((hotel, index) => (
                <PropertyCard
                  key={`${hotel.id}-${index}`}
                  {...hotel}
                  wishlisted={wishlistReady && isInWishlist.has(hotel.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          ))
        )}
      </section>

      {totalPages > 1 && (
        <div className="flex mt-6 gap-2 items-center justify-center">
          <button
            onClick={() =>
              setCurrentPage((prev) => clamp(prev - 1, 1, totalPages))
            }
            disabled={currentPage === 1}
            className="px-4 py-2 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors"
          >
            Prev
          </button>
          <span className="text-sm text-neutral-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => clamp(prev + 1, 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#616882] mx-auto mb-4" />
            <p className="text-neutral-600">Loading hotels...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
