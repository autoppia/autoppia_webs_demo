"use client";
import { useEffect, useState, useMemo } from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useSeed } from "@/context/SeedContext";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import GlobalHeader from "@/components/GlobalHeader";
import { logEvent, EVENT_TYPES } from "@/library/event";
import { type Trip, simulatedTrips } from "@/data/trips-enhanced";
import { DynamicDataProvider } from "@/dynamic/v2/data-provider";

function formatDateShort(date: string, time: string) {
  if (!date || !time) return "";
  const d = new Date(`${date}T${time}`);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function TripFilterBar({
  trips,
  locationFilter,
  setLocationFilter,
  destinationFilter,
  setDestinationFilter,
  priceFilter,
  setPriceFilter,
}: {
  trips: Trip[];
  locationFilter: string;
  setLocationFilter: (v: string) => void;
  destinationFilter: string;
  setDestinationFilter: (v: string) => void;
  priceFilter: string;
  setPriceFilter: (v: string) => void;
}) {
  const dyn = useDynamicSystem();

  const uniquePickups = useMemo(() => {
    const pickups = new Set(trips.map((t) => t.pickup));
    return Array.from(pickups).sort();
  }, [trips]);

  const uniqueDropoffs = useMemo(() => {
    const dropoffs = new Set(trips.map((t) => t.dropoff));
    return Array.from(dropoffs).sort();
  }, [trips]);

  const priceRanges = useMemo(() => {
    if (trips.length === 0) return [];
    const prices = trips.map((t) => t.price);
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    const mid = Math.round((min + max) / 2);
    return [
      { label: `Under $${mid}`, value: `0-${mid}` },
      { label: `$${mid} - $${max}`, value: `${mid}-${max}` },
      { label: `Over $${max}`, value: `${max}-99999` },
    ];
  }, [trips]);

  function handleFilterChange(type: string, value: string) {
    logEvent(EVENT_TYPES.FILTER_TRIPS, {
      filterType: type,
      filterValue: value,
      timestamp: new Date().toISOString(),
    });
  }

  return (
    dyn.v1.addWrapDecoy("trip-filter-bar", (
      <div
        id={dyn.v3.getVariant("trip-filter-bar", ID_VARIANTS_MAP, "trip-filter-bar")}
        className="flex flex-wrap gap-4 mb-8"
      >
        <div className="flex flex-col gap-1 min-w-[200px] flex-1">
          <label className="text-sm font-semibold text-gray-700">
            {dyn.v3.getVariant("filter-location-label", TEXT_VARIANTS_MAP, "Pickup Location")}
          </label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2095d2] focus:border-transparent"
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              handleFilterChange("location", e.target.value);
            }}
          >
            <option value="">All locations</option>
            {uniquePickups.map((p) => (
              <option key={p} value={p}>
                {p.length > 50 ? `${p.slice(0, 50)}...` : p}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[200px] flex-1">
          <label className="text-sm font-semibold text-gray-700">
            {dyn.v3.getVariant("filter-destination-label", TEXT_VARIANTS_MAP, "Destination")}
          </label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2095d2] focus:border-transparent"
            value={destinationFilter}
            onChange={(e) => {
              setDestinationFilter(e.target.value);
              handleFilterChange("destination", e.target.value);
            }}
          >
            <option value="">All destinations</option>
            {uniqueDropoffs.map((d) => (
              <option key={d} value={d}>
                {d.length > 50 ? `${d.slice(0, 50)}...` : d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-sm font-semibold text-gray-700">
            {dyn.v3.getVariant("filter-price-label", TEXT_VARIANTS_MAP, "Price Range")}
          </label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2095d2] focus:border-transparent"
            value={priceFilter}
            onChange={(e) => {
              setPriceFilter(e.target.value);
              handleFilterChange("price", e.target.value);
            }}
          >
            <option value="">Any price</option>
            {priceRanges.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    ))
  );
}

function AvailableTripCard({
  trip,
  index,
  onBook,
}: {
  trip: Trip;
  index: number;
  onBook: (trip: Trip) => void;
}) {
  const dyn = useDynamicSystem();

  return (
    dyn.v1.addWrapDecoy(`available-trip-card-${index}`, (
      <div
        id={dyn.v3.getVariant("available-trip-card", ID_VARIANTS_MAP, "available-trip-card")}
        className="bg-white border border-gray-200 rounded-2xl flex flex-col sm:flex-row items-stretch px-6 py-6 gap-6 mb-4 shadow-sm hover:shadow-md transition"
      >
        <img
          src={trip.ride.image || trip.ride.icon}
          alt={trip.ride.name}
          className="w-full sm:w-48 h-36 sm:h-40 object-cover rounded-xl flex-shrink-0"
        />
        <div className="flex-1 flex flex-col gap-2 justify-center min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-bold text-lg text-[#1b5fa7]">{trip.ride.name}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trip.status === "upcoming"
                ? "bg-green-100 text-green-700"
                : trip.status === "completed"
                ? "bg-gray-100 text-gray-600"
                : "bg-red-100 text-red-600"
            }`}>
              {trip.status}
            </span>
          </div>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <svg width="14" height="14" fill="none" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" stroke="#2095d2" strokeWidth="1.5" fill="none" />
              <path d="M10 6v4l2.5 1.5" stroke="#2095d2" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {formatDateShort(trip.date, trip.time)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#2095d2] inline-block flex-shrink-0" />
              <span className="truncate">{trip.pickup}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-[#2095d2] inline-block flex-shrink-0" />
              <span className="truncate">{trip.dropoff}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <img
              src={trip.driver.photo}
              alt={trip.driver.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            <span className="text-sm text-gray-700">{trip.driver.name}</span>
            <span className="text-xs text-gray-500">• {trip.driver.car}</span>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between gap-3 sm:min-w-[130px]">
          <div className="text-right">
            <div className="text-2xl font-bold text-[#2095d2]">${trip.price.toFixed(2)}</div>
            <div className="text-xs text-gray-500">{trip.payment}</div>
          </div>
          <button
            id={dyn.v3.getVariant("available-trip-book-button", ID_VARIANTS_MAP, "available-trip-book-button")}
            className={`px-5 py-2.5 bg-[#2095d2] text-white rounded-lg font-semibold text-sm shadow hover:bg-[#1273a0] transition flex items-center gap-2 ${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")}`}
            onClick={() => onBook(trip)}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
              <rect width="20" height="20" rx="10" fill="#fff" />
              <path d="M6.5 10.5L9 13l4.5-4.5" stroke="#2095d2" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {dyn.v3.getVariant("available-trips-book-button", TEXT_VARIANTS_MAP, "Book Trip")}
          </button>
        </div>
      </div>
    ))
  );
}

function useFilteredTrips(
  trips: Trip[],
  locationFilter: string,
  destinationFilter: string,
  priceFilter: string
): Trip[] {
  return useMemo(() => {
    let filtered = [...trips];
    if (locationFilter) {
      filtered = filtered.filter((t) => t.pickup === locationFilter);
    }
    if (destinationFilter) {
      filtered = filtered.filter((t) => t.dropoff === destinationFilter);
    }
    if (priceFilter) {
      const [min, max] = priceFilter.split("-").map(Number);
      filtered = filtered.filter((t) => t.price >= min && t.price <= max);
    }
    return filtered;
  }, [trips, locationFilter, destinationFilter, priceFilter]);
}

export default function AvailableTripsPage() {
  const dyn = useDynamicSystem();
  const router = useSeedRouter();
  const { seed } = useSeed();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    let cancelled = false;

    const dataProvider = DynamicDataProvider.getInstance();

    // Race: try server data with a timeout, fall back to simulatedTrips
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));

    async function loadFromProvider(): Promise<Trip[]> {
      await dataProvider.whenReady();
      dataProvider.reloadIfSeedChanged(seed);
      await dataProvider.whenReady();
      return dataProvider.getTrips();
    }

    Promise.race([loadFromProvider(), timeout])
      .then((result) => {
        if (cancelled) return;
        const serverTrips = Array.isArray(result) ? result : [];
        setTrips(serverTrips.length > 0 ? serverTrips : simulatedTrips);
      })
      .catch(() => {
        if (!cancelled) setTrips(simulatedTrips);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const unsubscribe = dataProvider.subscribeTrips((newTrips) => {
      if (!cancelled && newTrips.length > 0) {
        setTrips(newTrips);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [seed]);

  useEffect(() => {
    if (!loading && trips.length > 0) {
      logEvent(EVENT_TYPES.VIEW_AVAILABLE_TRIPS, {
        totalTrips: trips.length,
        timestamp: new Date().toISOString(),
      });
    }
  }, [loading, trips.length]);

  const filteredTrips = useFilteredTrips(trips, locationFilter, destinationFilter, priceFilter);

  function handleBookTrip(trip: Trip) {
    const reserveRideEventData = {
      rideId: 0,
      rideName: trip.ride.name,
      rideType: trip.ride.name,
      image: trip.ride.image,
      icon: trip.ride.icon,
      price: trip.price,
      oldPrice: Number((trip.price * 1.1).toFixed(2)),
      seats: 4,
      eta: `5 min away · ${trip.time || new Date().toTimeString().slice(0, 5)}`,
      pickup: trip.pickup,
      dropoff: trip.dropoff,
      scheduled: trip.date && trip.time ? `${trip.date} ${trip.time}` : "now",
      timestamp: new Date().toISOString(),
      priceDifference: Number((trip.price * 0.1).toFixed(2)),
      discountPercentage: "9.09",
      isRecommended: false,
      tripDetails: {
        pickup: trip.pickup,
        dropoff: trip.dropoff,
        scheduled: trip.date && trip.time ? `${trip.date} ${trip.time}` : "now",
        rideType: trip.ride.name,
        price: trip.price,
        totalSeats: 4,
        estimatedArrival: `5 min away · ${trip.time || new Date().toTimeString().slice(0, 5)}`,
      },
    };

    logEvent(EVENT_TYPES.BOOK_TRIP, {
      ...reserveRideEventData,
      tripId: trip.id,
      source: "available_trips",
    });

    logEvent(EVENT_TYPES.RESERVE_RIDE, reserveRideEventData);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("__ud_reserveRideData", JSON.stringify(reserveRideEventData));
      sessionStorage.setItem("__ud_selectedRideIdx", "0");
      sessionStorage.setItem("__ud_pickup", trip.pickup);
      sessionStorage.setItem("__ud_dropoff", trip.dropoff);
      if (trip.date) sessionStorage.setItem("ud_pickupdate", trip.date);
      if (trip.time) sessionStorage.setItem("ud_pickuptime", trip.time);
    }

    router.push("/ride/trip/confirmation");
  }

  return (
    dyn.v1.addWrapDecoy("available-trips-page", (
      <div className="min-h-screen bg-[#fafbfc]">
        <GlobalHeader />
        {loading ? (
          <div className="flex w-full h-[70vh] items-center justify-center">
            <div className="flex items-center gap-6">
              <svg
                className="animate-spin"
                width="28"
                height="28"
                fill="none"
                viewBox="0 0 40 40"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#2095d2"
                  strokeWidth="4"
                  className="opacity-40"
                />
                <path
                  d="M36 20A16 16 0 0 1 20 36"
                  stroke="#111"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-xl text-gray-800 font-normal">Loading available trips...</span>
            </div>
          </div>
        ) : (
          <div className="max-w-[1100px] mx-auto px-6 pt-10 pb-20">
            <div className="flex items-center justify-between mb-8">
              <h1
                id={dyn.v3.getVariant("available-trips-section", ID_VARIANTS_MAP, "available-trips-section")}
                className="text-3xl font-bold text-gray-900"
              >
                {dyn.v3.getVariant("available-trips-title", TEXT_VARIANTS_MAP, "Available Trips")}
              </h1>
              <button
                className="text-[#2095d2] font-semibold text-sm hover:underline flex items-center gap-1"
                onClick={() => router.push("/ride/trip/trips")}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 18 18">
                  <path d="M11 13l-4-4 4-4" stroke="#2095d2" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                My Trips
              </button>
            </div>

            <TripFilterBar
              trips={trips}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              destinationFilter={destinationFilter}
              setDestinationFilter={setDestinationFilter}
              priceFilter={priceFilter}
              setPriceFilter={setPriceFilter}
            />

            {filteredTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <svg width="48" height="48" fill="none" viewBox="0 0 48 48" className="mb-4 opacity-50">
                  <rect x="8" y="12" width="32" height="24" rx="4" stroke="#999" strokeWidth="2" fill="none" />
                  <path d="M12 20h24M12 26h16" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p className="text-lg font-medium">No trips match your filters</p>
                <p className="text-sm mt-1">Try adjusting the filters above</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Showing {filteredTrips.length} of {trips.length} trips
                </p>
                {filteredTrips.map((trip, idx) => (
                  <AvailableTripCard
                    key={trip.id}
                    trip={trip}
                    index={idx}
                    onBook={handleBookTrip}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    ))
  );
}
