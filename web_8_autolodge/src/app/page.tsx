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
import { DASHBOARD_HOTELS } from "@/library/dataset";
import type { Hotel } from "@/types/hotel";

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
      // Wait for provider to be ready
      await dynamicDataProvider.whenReady();
      
      const providerHotels = dynamicDataProvider.getHotels();
      if (providerHotels.length > 0) {
        setHotels(providerHotels.map(normalizeHotelDates));
        console.log('[HomeContent] Hotels loaded:', providerHotels.length);
      } else {
        console.warn('[HomeContent] No hotels from provider, using fallback');
        setHotels(DASHBOARD_HOTELS as Hotel[]);
      }
      setIsLoadingHotels(false);
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

      return true;
    });
  }, [hotels, committedSearch, dateRange, guests]);

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
      return getText("add_guests");
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
      seedStructure,
    });
  };

  return (
    <div className="flex flex-col w-full items-center mt-4 pb-12">
      <section className="w-full flex justify-center">
        <div className="rounded-[32px] shadow-md bg-white flex flex-row items-center px-2 py-1 min-w-[900px] max-w-3xl border">
          <WherePopover searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
            <div
              id={getId("search_field")}
              className="flex-[2] flex flex-col px-3 py-2 rounded-[24px] cursor-pointer hover:bg-neutral-100 transition-all relative"
            >
              <span className="text-xs font-semibold text-neutral-500 pb-0.5">
                {getText("where_label")}
              </span>
              <span className="text-sm text-neutral-700">
                {searchTerm || getText("where_placeholder")}
              </span>
              {searchTerm && (
                <button
                  className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600 text-lg p-0 bg-transparent border-none outline-none"
                  type="button"
                  style={{ lineHeight: 1, background: "none" }}
                  tabIndex={0}
                  aria-label={getText("clear_search")}
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

          <DateRangePopover selectedRange={dateRange} setSelectedRange={setDateRange}>
            <div
              id={getId("check_in_field")}
              className="flex-1 flex flex-col px-3 py-2 rounded-[24px] cursor-pointer hover:bg-neutral-100 transition-all relative"
            >
              <span className="text-xs font-semibold text-neutral-500 pb-0.5">
                {getText("check_in")}
              </span>
              <span className="text-sm text-neutral-700">
                {dateRange.from
                  ? format(dateRange.from, "MMM d")
                  : getText("add_dates")}
              </span>
              {dateRange.from && (
                <button
                  className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600 text-lg p-0 bg-transparent border-none outline-none"
                  type="button"
                  style={{ lineHeight: 1, background: "none" }}
                  tabIndex={0}
                  aria-label={getText("clear_dates")}
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

          <DateRangePopover selectedRange={dateRange} setSelectedRange={setDateRange}>
            <div
              id={getId("check_out_field")}
              className="flex-1 flex flex-col px-3 py-2 rounded-[24px] cursor-pointer hover:bg-neutral-100 transition-all relative"
            >
              <span className="text-xs font-semibold text-neutral-500 pb-0.5">
                {getText("check_out")}
              </span>
              <span className="text-sm text-neutral-700">
                {dateRange.to
                  ? format(dateRange.to, "MMM d")
                  : getText("add_dates")}
              </span>
              {dateRange.to && (
                <button
                  className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600 text-lg p-0 bg-transparent border-none outline-none"
                  type="button"
                  style={{ lineHeight: 1, background: "none" }}
                  tabIndex={0}
                  aria-label={getText("clear_dates")}
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

          <GuestSelectorPopover counts={guests} setCounts={setGuests}>
            <div
              id={getId("guests_field")}
              className="flex-1 flex flex-col px-3 py-2 rounded-[24px] cursor-pointer hover:bg-neutral-100 transition-all relative"
            >
              <span className="text-xs font-semibold text-neutral-500 pb-0.5">
                {getText("who")}
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
                  aria-label={getText("clear_guests")}
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

          <button
            id={getId("search_button")}
            className={getClass(
              "search_button",
              "ml-3 px-4 py-2 rounded-full bg-[#616882] text-white font-semibold text-lg flex items-center shadow-md border border-neutral-200 hover:bg-[#9ba6ce] focus:outline-none transition-all"
            )}
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
            {getText("search_button")}
          </button>
        </div>
      </section>

      <section className="w-full flex flex-col items-center mt-8">
        {paginatedResults.length === 0 ? (
          <div
            id={getId("no_results")}
            className="text-neutral-400 font-semibold text-lg mt-12"
          >
            {getText("no_results")}
          </div>
        ) : (
          <div className="grid gap-7 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {paginatedResults.map((hotel, index) => (
              <PropertyCard key={`${hotel.id}-${index}`} {...hotel} />
            ))}
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <div className="flex mt-6 gap-2 items-center justify-center">
          <button
            onClick={() =>
              setCurrentPage((prev) => clamp(prev - 1, 1, totalPages))
            }
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={`page-${index + 1}`}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded border ${
                currentPage === index + 1 ? "bg-gray-300" : ""
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => clamp(prev + 1, 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50"
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

