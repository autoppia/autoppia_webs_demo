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
import { useV3Attributes } from "@/dynamic/v3-dynamic";
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
  const { getText, getId, getClass } = useV3Attributes();
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
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
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

  const maxPriceAvailable = useMemo(
    () => hotels.reduce((max, hotel) => Math.max(max, hotel.price), 0),
    [hotels]
  );

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

      if (maxPrice !== null && hotel.price > maxPrice) {
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
  }, [committedSearch, dateRange, guests, hotels, maxPrice, minRating, region]);

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

    if (guestCount > 0) {
      parts.push(
        `${guestCount} ${guestCount === 1 ? getText("guest", "guest") : getText("guests", "guests")}`
      );
    } else {
      return getText("add_guests", "Add guests");
    }

    if (guests.infants > 0) {
      parts.push(
        `${guests.infants} ${
          guests.infants === 1
            ? getText("infant", "infant")
            : getText("infants", "infants")
        }`
      );
    }

    if (guests.pets > 0) {
      parts.push(
        `${guests.pets} ${
          guests.pets === 1 ? getText("pet", "pet") : getText("pets", "pets")
        }`
      );
    }

    return parts.join(", ");
  }, [guests, getText]);

  const { seed: layoutSeed, layout } = useSeedLayout("stay");
  const SearchWrapperTag = (layout?.searchBar?.wrapper ?? "section") as keyof JSX.IntrinsicElements;
  const EventWrapperTag = (layout?.eventElements?.wrapper ?? "div") as keyof JSX.IntrinsicElements;
  const searchWrapperClass =
    layout?.searchBar?.className ?? "w-full flex justify-center";
  const eventWrapperClass = layout?.eventElements?.className ?? "";
  const defaultOrder = ["search", "dates", "guests", "reserve"];

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

  const searchButtonVariant = getClass("button-primary", "");

  const searchFieldNode = (
    <WherePopover searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
      <div
        id={getId("search_field")}
        className="flex-[2] flex flex-col px-3 py-2 rounded-[24px] cursor-pointer hover:bg-neutral-100 transition-all relative"
      >
        <span className="text-xs font-semibold text-neutral-500 pb-0.5">
          {getText("where_label", "Where")}
        </span>
        <span className="text-sm text-neutral-700">
          {searchTerm || getText("where_placeholder", "Search destinations")}
        </span>
        {searchTerm && (
          <button
            className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600 text-lg p-0 bg-transparent border-none outline-none"
            type="button"
            style={{ lineHeight: 1, background: "none" }}
            tabIndex={0}
            aria-label={getText("clear_search", "Clear search")}
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
  );

  const checkInNode = (
    <DateRangePopover selectedRange={dateRange} setSelectedRange={setDateRange}>
      <div
        id={getId("check_in_field")}
        className="flex-1 flex flex-col px-3 py-2 rounded-[24px] cursor-pointer hover:bg-neutral-100 transition-all relative"
      >
        <span className="text-xs font-semibold text-neutral-500 pb-0.5">
          {getText("check_in", "Check in")}
        </span>
        <span className="text-sm text-neutral-700">
          {dateRange.from
            ? format(dateRange.from, "MMM d")
            : getText("add_dates", "Add dates")}
        </span>
        {dateRange.from && (
          <button
            className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600 text-lg p-0 bg-transparent border-none outline-none"
            type="button"
            style={{ lineHeight: 1, background: "none" }}
            tabIndex={0}
            aria-label={getText("clear_dates", "Clear dates")}
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
  );

  const checkOutNode = (
    <DateRangePopover selectedRange={dateRange} setSelectedRange={setDateRange}>
      <div
        id={getId("check_out_field")}
        className="flex-1 flex flex-col px-3 py-2 rounded-[24px] cursor-pointer hover:bg-neutral-100 transition-all relative"
      >
        <span className="text-xs font-semibold text-neutral-500 pb-0.5">
          {getText("check_out", "Check out")}
        </span>
        <span className="text-sm text-neutral-700">
          {dateRange.to
            ? format(dateRange.to, "MMM d")
            : getText("add_dates", "Add dates")}
        </span>
        {dateRange.to && (
          <button
            className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600 text-lg p-0 bg-transparent border-none outline-none"
            type="button"
            style={{ lineHeight: 1, background: "none" }}
            tabIndex={0}
            aria-label={getText("clear_dates", "Clear dates")}
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
  );

  const guestsNode = (
    <GuestSelectorPopover counts={guests} setCounts={setGuests}>
      <div
        id={getId("guests_field")}
        className="flex flex-col px-3 py-2 rounded-[24px] cursor-pointer hover:bg-neutral-100 transition-all relative min-w-[180px]"
      >
        <span className="text-xs font-semibold text-neutral-500 pb-0.5">
          {getText("who", "Who")}
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
            aria-label={getText("clear_guests", "Clear guests")}
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
  );

  const reserveNode = (
    <button
      id={getId("search_button")}
      className={`${searchButtonVariant} ml-3 px-4 py-2 rounded-full bg-[#616882] text-white font-semibold text-lg flex items-center shadow-md border border-neutral-200 hover:bg-[#9ba6ce] focus:outline-none transition-all`}
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
      {getText("search_button", "Search")}
    </button>
  );

  const eventComponents: Record<string, JSX.Element> = {
    search: searchFieldNode,
    dates: (
      <div className="flex flex-1 gap-2 min-w-[260px]">{checkInNode}{checkOutNode}</div>
    ),
    guests: guestsNode,
    reserve: reserveNode,
  };

  const orderedComponents =
    (layout?.eventElements?.order ?? defaultOrder)
      .map((key) => eventComponents[key])
      .filter(Boolean);

  const renderedEventComponents =
    orderedComponents.length > 0
      ? orderedComponents
      : defaultOrder.map((key) => eventComponents[key]).filter(Boolean);

  const handleApplyFilters = () => {
    logEvent(EVENT_TYPES.APPLY_FILTERS, {
      minRating,
      maxPrice,
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

  return (
    <div className="flex flex-col w-full items-center mt-4 pb-12">
      <SearchWrapperTag className={`w-full flex justify-center ${searchWrapperClass}`}>
        <EventWrapperTag
          className={`rounded-[32px] shadow-md bg-white border flex flex-wrap gap-3 items-center px-2 py-1 min-w-[900px] max-w-3xl ${eventWrapperClass} !flex-row !items-center`}
        >
          {renderedEventComponents}
        </EventWrapperTag>
      </SearchWrapperTag>

      <section className="w-full flex flex-col items-center mt-8">
        <div className="w-full mb-6">
          <div className="w-full bg-white border border-neutral-200 shadow-sm rounded-full px-4 py-3 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Rating
              </span>
              <div className="flex gap-2">
                {[0, 4, 4.5, 4.7].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMinRating(value)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition ${
                      minRating === value
                        ? "bg-[#616882] text-white border-[#616882]"
                        : "bg-white border-neutral-300 text-neutral-700"
                    }`}
                  >
                    {value === 0 ? "Any" : `${value}+`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 min-w-[220px]">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Max price
              </span>
              <div className="flex items-center gap-3 w-full">
                <input
                  id="price-filter"
                  type="range"
                  min={50}
                  max={Math.max(500, maxPriceAvailable || 500)}
                  value={maxPrice ?? Math.max(500, maxPriceAvailable || 500)}
                  onChange={(event) => setMaxPrice(Number(event.target.value))}
                  className="accent-[#616882] w-full"
                />
                <span className="text-sm font-medium text-neutral-700 min-w-[70px] text-right">
                  {maxPrice ? `$${maxPrice}` : "No cap"}
                </span>
                <button
                  className="text-xs text-neutral-500 underline"
                  onClick={() => setMaxPrice(null)}
                  type="button"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Region
              </span>
              <select
                id="region-filter"
                className="border border-neutral-300 bg-white text-sm rounded-full px-3 py-2 text-neutral-800 shadow-sm"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
              >
                <option value="all">All</option>
                {regions.map((regionName) => (
                  <option key={regionName} value={regionName}>
                    {regionName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                className="px-4 py-2 rounded-full border border-neutral-300 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition"
                onClick={() => {
                  setMinRating(0);
                  setMaxPrice(null);
                  setRegion("all");
                }}
              >
                Reset
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-full bg-[#616882] text-white font-semibold hover:bg-[#7b86aa] transition shadow-sm"
                onClick={handleApplyFilters}
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {paginatedResults.length === 0 ? (
          <div
            id={getId("no_results")}
            className="text-neutral-400 font-semibold text-lg mt-12"
          >
            {getText("no_results", "No results")}
          </div>
        ) : (
          <div className="grid gap-7 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {paginatedResults.map((hotel, index) => (
              <PropertyCard
                key={`${hotel.id}-${index}`}
                {...hotel}
                wishlisted={wishlistReady && isInWishlist.has(hotel.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <div className="flex mt-6 gap-4 items-center justify-center">
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
