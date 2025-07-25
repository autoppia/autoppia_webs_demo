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

export default function Home() {
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
    const lastBookedNight = toStartOfDay(addDays(selTo, -1));
    return selFrom >= from && lastBookedNight <= to;
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

  return (
    <div className="flex flex-col w-full items-center mt-4 pb-12">
      {/* Search/Filter Bar */}
      <section className="w-full flex justify-center">
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
                    // logEvent(EVENT_TYPES.SEARCH_CLEARED, {
                    //   source: "location",
                    // });
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
                    // logEvent(EVENT_TYPES.SEARCH_CLEARED, { source: "date" });
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
                    // logEvent(EVENT_TYPES.SEARCH_CLEARED, { source: "guests" });
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
              logEvent(EVENT_TYPES.SEARCH_HOTEL, {
                searchTerm,
                dateRange: {
                  from: dateRange.from?.toISOString() ?? null,
                  to: dateRange.to?.toISOString() ?? null,
                },
                guests: {
                  adults: guests.adults,
                  children: guests.children,
                  infants: guests.infants,
                  pets: guests.pets,
                },
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
      </section>

      {/* Results grid placeholder */}
      <section className="w-full flex flex-col items-center mt-8">
        {paginatedResults.length === 0 ? (
          <div
            id="noResults"
            className="text-neutral-400 font-semibold text-lg mt-12"
          >
            No results found.
          </div>
        ) : (
          <div className="grid gap-7 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {paginatedResults.map((prop, i) => (
              <PropertyCard key={i + prop.title} {...prop} />
            ))}
          </div>
        )}
      </section>
      {totalPages > 1 && (
        <div className="flex mt-6 gap-2 items-center justify-center">
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
        </div>
      )}
    </div>
  );
}
