"use client";
import { WherePopover } from "@/components/WherePopover";
import { DateRangePopover } from "@/components/DateRangePopover";
import { GuestSelectorPopover } from "@/components/GuestSelectorPopover";
import { PropertyCard } from "@/components/PropertyCard";
import * as React from "react";
import { addDays } from "date-fns";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { DASHBOARD_HOTELS } from "@/library/dataset";
import Image from "next/image";
import { useSeedLayout } from "@/library/utils";
import { DynamicWrapper } from "@/components/DynamicWrapper";
import { Suspense } from "react";
import { getEffectiveSeed, isDynamicModeEnabled } from "@/utils/dynamicDataProvider";
import { useRouter, useSearchParams } from "next/navigation";

function HomeContent() {
  const { seed, layout } = useSeedLayout();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Log dynamic HTML status for debugging
  React.useEffect(() => {
    const isDynamic = isDynamicModeEnabled();
    console.log('Dynamic HTML enabled:', isDynamic);
    console.log('Current seed:', seed);
    console.log('Layout configuration:', layout);
    console.log('Event elements order:', layout.eventElements.order);
  }, [seed, layout]);
  
  // Range state: { from, to }
  const [dateRange, setDateRange] = React.useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  const [guests, setGuests] = React.useState({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
  });
  const [searchTerm, setSearchTerm] = React.useState("");
  const [committedSearch, setCommittedSearch] = React.useState("");

  // Initialize search state from URL parameters
  React.useEffect(() => {
    const urlSearchTerm = searchParams.get('search');
    const urlFromDate = searchParams.get('from');
    const urlToDate = searchParams.get('to');
    const urlAdults = searchParams.get('adults');
    const urlChildren = searchParams.get('children');
    const urlInfants = searchParams.get('infants');
    const urlPets = searchParams.get('pets');

    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      setCommittedSearch(urlSearchTerm);
    }

    if (urlFromDate && urlToDate) {
      setDateRange({
        from: new Date(urlFromDate),
        to: new Date(urlToDate)
      });
    }

    if (urlAdults || urlChildren || urlInfants || urlPets) {
      setGuests({
        adults: parseInt(urlAdults || '0', 10),
        children: parseInt(urlChildren || '0', 10),
        infants: parseInt(urlInfants || '0', 10),
        pets: parseInt(urlPets || '0', 10)
      });
    }
  }, [searchParams]);

  // Function to update URL with search parameters while preserving seed
  const updateUrlWithSearchParams = (searchData: {
    searchTerm?: string;
    dateRange?: { from: Date | null; to: Date | null };
    guests?: { adults: number; children: number; infants: number; pets: number };
  }) => {
    const params = new URLSearchParams();
    
    // Preserve seed if it exists
    if (seed) {
      params.set('seed', seed.toString());
    }
    
    // Add search parameters
    if (searchData.searchTerm) {
      params.set('search', searchData.searchTerm);
    }
    
    if (searchData.dateRange?.from && searchData.dateRange?.to) {
      params.set('from', searchData.dateRange.from.toISOString().split('T')[0]);
      params.set('to', searchData.dateRange.to.toISOString().split('T')[0]);
    }
    
    if (searchData.guests) {
      if (searchData.guests.adults > 0) params.set('adults', searchData.guests.adults.toString());
      if (searchData.guests.children > 0) params.set('children', searchData.guests.children.toString());
      if (searchData.guests.infants > 0) params.set('infants', searchData.guests.infants.toString());
      if (searchData.guests.pets > 0) params.set('pets', searchData.guests.pets.toString());
    }
    
    // Update URL without causing a page reload
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  const calendarLabel = (kind: "in" | "out") => {
    if (kind === "in" && dateRange.from)
      return dateRange.from.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    if (kind === "out" && dateRange.to)
      return dateRange.to.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    return "Add dates";
  };

  const guestSummary = () => {
    const g = guests.adults + guests.children;
    const i = guests.infants;
    const p = guests.pets;
    let str = g > 0 ? `${g} guest${g > 1 ? "s" : ""}` : "Add guests";
    if (i > 0) str += `, ${i} infant${i > 1 ? "s" : ""}`;
    if (p > 0) str += `, ${p} pet${p > 1 ? "s" : ""}`;
    return str;
  };

  // Filtering logic
  const totalSelectedGuests = guests.adults + guests.children;


  function toStartOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function inDateRange(
    propFrom: Date,
    propTo: Date,
    selectedFrom: Date,
    selectedTo: Date
  ): boolean {
    const from = toStartOfDay(propFrom);
    const to = toStartOfDay(propTo);
    const selFrom = toStartOfDay(selectedFrom);
    const selTo = toStartOfDay(selectedTo);
    
    // Check if there's any overlap between the selected date range and property's available range
    // Two date ranges overlap if: start1 <= end2 AND start2 <= end1
    // In our case: selFrom <= to AND from <= selTo
    return selFrom <= to && from <= selTo;
  }

  const filtered = DASHBOARD_HOTELS.filter((card) => {
    if (committedSearch.trim()) {
      const term = committedSearch.toLowerCase();
      if (
        !(
          card.location.toLowerCase().includes(term) ||
          card.title.toLowerCase().includes(term)
        )
      ) {
        return false;
      }
    }

    if (
      dateRange.from &&
      dateRange.to &&
      !inDateRange(
        new Date(card.datesFrom),
        new Date(card.datesTo),
        dateRange.from,
        dateRange.to
      )
    ) {
      return false;
    }

    if (totalSelectedGuests > 0 && totalSelectedGuests > card.maxGuests) {
      return false;
    }

    return true;
  });

  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedResults = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [committedSearch, dateRange, guests]);

  // Create event elements based on layout order
  const createEventElement = (eventType: string) => {
    console.log('Creating event element:', eventType);
    switch (eventType) {
      case 'search':
        console.log('Rendering search element');
        return (
          <DynamicWrapper key="search" as={layout.searchBar.wrapper} className={layout.searchBar.className}>
            <div className="rounded-[32px] shadow-md bg-white flex flex-row items-center px-2 py-1 min-w-[900px] max-w-3xl border">
              {/* Where */}
              <WherePopover searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <div
                  id="searchField"
                  className="flex-[2] flex flex-col px-3 py-2 rounded-[24px] cursor-pointer hover:bg-neutral-100 transition-all relative"
                >
                  <span className="text-xs font-semibold text-neutral-500 pb-0.5">
                    Where
                  </span>
                  <span className="text-sm text-neutral-700">
                    {searchTerm ? searchTerm : "Search destinations"}
                  </span>
                  {searchTerm && (
                    <button
                      className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600 text-lg p-0 bg-transparent border-none outline-none"
                      type="button"
                      style={{ lineHeight: 1, background: "none" }}
                      tabIndex={0}
                      aria-label="Clear search"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchTerm("");
                        setCommittedSearch("");
                        
                        // Update URL to remove search term while preserving seed
                        updateUrlWithSearchParams({
                          searchTerm: "",
                          dateRange,
                          guests
                        });
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </WherePopover>
              {/* Check in */}
              <DateRangePopover
                selectedRange={dateRange}
                setSelectedRange={setDateRange}
              >
                <div
                  id="checkInField"
                  className="flex-1 flex flex-col px-3 py-2 rounded-[24px] cursor-pointer hover:bg-neutral-100 transition-all relative"
                >
                  <span className="text-xs font-semibold text-neutral-500 pb-0.5">
                    Check in
                  </span>
                  <span className="text-sm text-neutral-700">
                    {calendarLabel("in")}
                  </span>
                  {dateRange.from && (
                    <button
                      className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600 text-lg p-0 bg-transparent border-none outline-none"
                      type="button"
                      style={{ lineHeight: 1, background: "none" }}
                      tabIndex={0}
                      aria-label="Clear check-in/check-out"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDateRange({ from: null, to: null });
                        
                        // Update URL to remove date range while preserving seed
                        updateUrlWithSearchParams({
                          searchTerm,
                          dateRange: { from: null, to: null },
                          guests
                        });
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </DateRangePopover>
              {/* Check out */}
              <DateRangePopover
                selectedRange={dateRange}
                setSelectedRange={setDateRange}
              >
                <div
                  id="checkOutField"
                  className="flex-1 flex flex-col px-3 py-2 rounded-[24px] cursor-pointer hover:bg-neutral-100 transition-all"
                >
                  <span className="text-xs font-semibold text-neutral-500 pb-0.5">
                    Check out
                  </span>
                  <span className="text-sm text-neutral-700">
                    {calendarLabel("out")}
                  </span>
                </div>
              </DateRangePopover>
              {/* Who */}
              <GuestSelectorPopover counts={guests} setCounts={setGuests}>
                <div
                  id="guestsField"
                  className="flex-1 flex flex-col px-3 py-2 rounded-[24px] cursor-pointer hover:bg-neutral-100 transition-all relative"
                >
                  <span className="text-xs font-semibold text-neutral-500 pb-0.5">
                    Who
                  </span>
                  <span className="text-sm text-neutral-700">{guestSummary()}</span>
                  {(guests.adults > 0 ||
                    guests.children > 0 ||
                    guests.infants > 0 ||
                    guests.pets > 0) && (
                    <button
                      className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600 text-lg p-0 bg-transparent border-none outline-none"
                      type="button"
                      style={{ lineHeight: 1, background: "none" }}
                      tabIndex={0}
                      aria-label="Clear guests"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGuests({ adults: 0, children: 0, infants: 0, pets: 0 });
                        
                        // Update URL to remove guests while preserving seed
                        updateUrlWithSearchParams({
                          searchTerm,
                          dateRange,
                          guests: { adults: 0, children: 0, infants: 0, pets: 0 }
                        });
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </GuestSelectorPopover>
              {/* Search button */}
              <button
                id="searchButton"
                className="ml-3 px-4 py-2 rounded-full bg-[#616882] text-white font-semibold text-lg flex items-center shadow-md border border-neutral-200 hover:bg-[#9ba6ce] focus:outline-none transition-all"
                onClick={() => {
                  setCommittedSearch(searchTerm);
                  
                  // Update URL with search parameters while preserving seed
                  updateUrlWithSearchParams({
                    searchTerm,
                    dateRange,
                    guests
                  });
                  
                  logEvent(EVENT_TYPES.SEARCH_HOTEL, {
                    searchTerm,
                    dateRange: {
                      from: dateRange.from
                        ? (() => {
                            const fromDate = new Date(dateRange.from);
                            fromDate.setDate(fromDate.getDate() + 1);
                            return fromDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
                          })()
                        : null,
                      to: dateRange.to
                        ? (() => {
                            const toDate = new Date(dateRange.to);
                            toDate.setDate(toDate.getDate() + 1);
                            return toDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
                          })()
                        : null,
                    },
                    guests: {
                      adults: guests.adults,
                      children: guests.children,
                      infants: guests.infants,
                      pets: guests.pets,
                    },
                    seed: seed, // Include seed in event logging
                  });
                }}
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
                Search
              </button>
            </div>
            
            {/* Clear All Filters Button */}
            {(committedSearch || dateRange.from || dateRange.to || guests.adults > 0 || guests.children > 0 || guests.infants > 0 || guests.pets > 0) && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCommittedSearch("");
                    setDateRange({ from: null, to: null });
                    setGuests({ adults: 0, children: 0, infants: 0, pets: 0 });
                    
                    // Update URL to clear all filters while preserving seed
                    updateUrlWithSearchParams({
                      searchTerm: "",
                      dateRange: { from: null, to: null },
                      guests: { adults: 0, children: 0, infants: 0, pets: 0 }
                    });
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </DynamicWrapper>
        );
      case 'view':
        return (
          <DynamicWrapper key="view" as="div" className="w-full flex flex-col mt-8">
            {/* Search Results Summary */}
            {(committedSearch || dateRange.from || dateRange.to || guests.adults > 0 || guests.children > 0 || guests.infants > 0 || guests.pets > 0) && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Search Results</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {committedSearch && <div>📍 <strong>Location:</strong> {committedSearch}</div>}
                  {dateRange.from && dateRange.to && (
                    <div>📅 <strong>Dates:</strong> {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}</div>
                  )}
                  {(guests.adults > 0 || guests.children > 0 || guests.infants > 0 || guests.pets > 0) && (
                    <div>
                      👥 <strong>Guests:</strong> 
                      {guests.adults > 0 && ` ${guests.adults} adult${guests.adults > 1 ? 's' : ''}`}
                      {guests.children > 0 && `, ${guests.children} child${guests.children > 1 ? 'ren' : ''}`}
                      {guests.infants > 0 && `, ${guests.infants} infant${guests.infants > 1 ? 's' : ''}`}
                      {guests.pets > 0 && `, ${guests.pets} pet${guests.pets > 1 ? 's' : ''}`}
                    </div>
                  )}
                  {seed && (
                    <div>🎨 <strong>Layout:</strong> Seed {seed} (Variant {((seed - 1) % 10) + 1})</div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Found {filtered.length} hotel{filtered.length !== 1 ? 's' : ''} matching your criteria
                  </div>
                </div>
              </div>
            )}
            
            {paginatedResults.length === 0 ? (
              <div
                id="noResults"
                className="text-neutral-400 font-semibold text-lg mt-12"
              >
                No results found.
              </div>
            ) : (
              <div className="grid gap-7 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 w-full">
                {paginatedResults.map((prop, i) => (
                  <Suspense key={i + prop.title} fallback={<div className="bg-gray-200 rounded-3xl h-80 animate-pulse" />}>
                    <PropertyCard {...prop} />
                  </Suspense>
                ))}
              </div>
            )}
          </DynamicWrapper>
        );
      case 'reserve':
        return (
          <DynamicWrapper key="reserve" as="div" className="mt-6 text-center">
            <button
              onClick={() => {
                logEvent(EVENT_TYPES.RESERVE_HOTEL, {
                  searchTerm: committedSearch,
                  dateRange,
                  guests,
                });
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Reserve Selected Hotels
            </button>
          </DynamicWrapper>
        );
      case 'guests':
        return (
          <DynamicWrapper key="guests" as="div" className="mt-4 text-center">
            <div className="text-sm text-neutral-600">
              Total guests: {guests.adults + guests.children + guests.infants}
            </div>
          </DynamicWrapper>
        );
      case 'dates':
        return (
          <DynamicWrapper key="dates" as="div" className="mt-4 text-center">
            <div className="text-sm text-neutral-600">
              {dateRange.from && dateRange.to ? (
                <>
                  {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                </>
              ) : (
                "Select dates"
              )}
            </div>
          </DynamicWrapper>
        );
      case 'message':
        return (
          <DynamicWrapper key="message" as="div" className="mt-4 text-center">
            <button
              onClick={() => {
                logEvent(EVENT_TYPES.MESSAGE_HOST, {
                  searchTerm: committedSearch,
                });
              }}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Contact Hosts
            </button>
          </DynamicWrapper>
        );
      case 'confirm':
        return (
          <DynamicWrapper key="confirm" as="div" className="mt-4 text-center">
            <button
              onClick={() => {
                logEvent(EVENT_TYPES.CONFIRM_AND_PAY, {
                  searchTerm: committedSearch,
                  dateRange,
                  guests,
                });
              }}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Confirm & Pay
            </button>
          </DynamicWrapper>
        );
      case 'wishlist':
        return (
          <DynamicWrapper key="wishlist" as="div" className="mt-4 text-center">
            <button
              onClick={() => {
                logEvent(EVENT_TYPES.ADD_TO_WISHLIST, {
                  searchTerm: committedSearch,
                });
              }}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Add to Wishlist
            </button>
          </DynamicWrapper>
        );
      case 'share':
        return (
          <DynamicWrapper key="share" as="div" className="mt-4 text-center">
            <button
              onClick={() => {
                logEvent(EVENT_TYPES.SHARE_HOTEL, {
                  searchTerm: committedSearch,
                });
              }}
              className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              Share Results
            </button>
          </DynamicWrapper>
        );
      case 'back':
        return (
          <DynamicWrapper key="back" as="div" className="flex mt-6 gap-2 items-center justify-center">
            {totalPages > 1 && (
              <>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
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
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Next
                </button>
              </>
            )}
          </DynamicWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full mt-4 pb-12">
      <DynamicWrapper as={layout.eventElements.wrapper} className={layout.eventElements.className}>
        {layout.eventElements.order.map(createEventElement)}
      </DynamicWrapper>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
