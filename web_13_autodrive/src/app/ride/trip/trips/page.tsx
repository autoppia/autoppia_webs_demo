"use client";
import { useEffect, useState } from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useSeedLayout } from "@/dynamic/v3-dynamic";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import GlobalHeader from "@/components/GlobalHeader";
import { logEvent, EVENT_TYPES } from "@/library/event";
import {simulatedTrips, rides, DriverType, RideType, Trip} from "@/data/trips-enhanced";


function formatDateShort(date: string, time: string) {
  if (!date || !time) return "";
  const d = new Date(`${date}T${time}`);
  return d.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TripCard({ trip, onCancel, index }: { trip: Trip; onCancel?: (tripId: string) => void; index: number }) {
  const router = useSeedRouter();
  const dyn = useDynamicSystem();
  const { getElementAttributes, getText } = useSeedLayout();

  const handleTripDetailsClick = () => {
    // Check if this trip has reserved ride data (from RESERVE_RIDE event)
    const reservedRideData = (trip as any).reserveRideData;

    if (reservedRideData) {
      // Use the actual reserved ride data from RESERVE_RIDE event
      logEvent(EVENT_TYPES.TRIP_DETAILS, {
        ...reservedRideData,
        timestamp: new Date().toISOString(), // Update timestamp
      });
    } else {
      // Fallback to template data if reserved ride data is not available (for simulated trips)
      const RIDE_TEMPLATES = [
        { name: "AutoDriverX", seats: 4, basePrice: 26.6 },
        { name: "Comfort", seats: 4, basePrice: 31.5 },
        { name: "AutoDriverXL", seats: 6, basePrice: 27.37 },
        { name: "Executive", seats: 4, basePrice: 45.0 },
      ];
      const rideTemplate = RIDE_TEMPLATES.find(r => r.name === trip.ride.name) || RIDE_TEMPLATES[0];
      const oldPrice = Number((trip.price * 1.1).toFixed(2));
      const scheduled = trip.date && trip.time ? `${trip.date} ${trip.time}` : "now";

      logEvent(EVENT_TYPES.TRIP_DETAILS, {
        rideId: RIDE_TEMPLATES.findIndex(r => r.name === trip.ride.name) >= 0
          ? RIDE_TEMPLATES.findIndex(r => r.name === trip.ride.name)
          : 0,
        rideName: trip.ride.name,
        rideType: trip.ride.name,
        price: trip.price,
        oldPrice: oldPrice,
        seats: rideTemplate.seats,
        eta: "5 min away · " + (trip.time || new Date().toTimeString().slice(0, 5)),
        pickup: trip.pickup,
        dropoff: trip.dropoff,
        scheduled: scheduled,
        timestamp: new Date().toISOString(),
        priceDifference: oldPrice - trip.price,
        discountPercentage: ((oldPrice - trip.price) / oldPrice * 100).toFixed(2),
        isRecommended: false,
        tripDetails: {
          pickup: trip.pickup,
          dropoff: trip.dropoff,
          scheduled: scheduled,
          rideType: trip.ride.name,
          price: trip.price,
          totalSeats: rideTemplate.seats,
          estimatedArrival: "5 min away · " + (trip.time || new Date().toTimeString().slice(0, 5))
        }
      });
    }

    // Navigate to trip details page
    router.push(`/ride/trip/trips/${trip.id}`);
  };

  const handleCancel = () => {
    if (onCancel) {
      // Check if this trip has reserved ride data (from RESERVE_RIDE event)
      const reservedRideData = (trip as any).reserveRideData;

      if (reservedRideData) {
        // Use the actual reserved ride data from RESERVE_RIDE event
        logEvent(EVENT_TYPES.CANCEL_RESERVATION, {
          ...reservedRideData,
          tripId: trip.id,
          timestamp: new Date().toISOString(),
          cancellationReason: 'user_requested',
          cancellationTime: new Date().toISOString()
        });
      } else {
        // Fallback to template data if reserved ride data is not available
        logEvent(EVENT_TYPES.CANCEL_RESERVATION, {
          tripId: trip.id,
          timestamp: new Date().toISOString(),
          tripData: trip,
          cancellationReason: 'user_requested',
          cancellationTime: new Date().toISOString()
        });
      }
      onCancel(trip.id);
    }
  };

  return (
    dyn.v1.addWrapDecoy(`trips-upcoming-ride-card-${index}`, (
      <div className="bg-white border border-gray-200 rounded-2xl flex items-center px-8 py-6 gap-7 mb-6 shadow-sm">
      <img
        src={trip.ride.image || trip.ride.icon}
        alt="Car"
        className="w-40 h-32 object-cover rounded-lg border border-gray-100"
      />
      <div className="flex-1 flex flex-col gap-1">
        <div className="font-bold text-xl mb-1 flex items-center gap-3 text-[#1b5fa7]">
          Confirmed
          <span className="font-normal text-base text-gray-700">
            {trip.ride.name}
          </span>
        </div>
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-green-500" />
          {formatDateShort(trip.date, trip.time)}
        </div>
        <div className="text-xs text-gray-500">{trip.pickup} → {trip.dropoff}</div>
      </div>
      <div className="flex flex-col justify-between items-end h-full gap-2">
        <button
          id={dyn.v3.getVariant("trips-card-details-button-id", ID_VARIANTS_MAP, "trips-card-details")}
          className={dyn.v3.getVariant("trips-card-details-button-class", CLASS_VARIANTS_MAP, "flex items-center gap-2 px-4 py-2 bg-[#2095d2] text-white rounded-lg font-semibold text-sm shadow hover:bg-[#1273a0] transition")}
          onClick={handleTripDetailsClick}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
            <rect width="20" height="20" rx="10" fill="#fff" />
            <path
              d="M6.5 10.5L9 13l4.5-4.5"
              stroke="#2095d2"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          {dyn.v3.getVariant("trips-card-details-button-text", TEXT_VARIANTS_MAP, getText('trips-card-details', 'Trip Details'))}
        </button>
        {onCancel && (
          <button
            className={dyn.v3.getVariant("trips-cancel-button-class", CLASS_VARIANTS_MAP, "flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold text-sm border border-red-200 hover:bg-red-100 transition")}
            onClick={handleCancel}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
              <path
                d="M5 5l10 10M15 5l-10 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {dyn.v3.getVariant("trips-cancel-button-text", TEXT_VARIANTS_MAP, getText('trips-cancel', 'Cancel'))}
          </button>
        )}
      </div>
      </div>
    ))
  );
}

function PastSection() {
  const router = useSeedRouter();
  const { getElementAttributes, getText } = useSeedLayout();
  const featured = {
    address: "100 Van Ness",
    datetime: "7/17/2025 • 11:55:31 AM",
    price: 24.75,
    map: "/map-static.png",
  };
  const cards = [
    {
      title: "1 Hotel San Francisco",
      datetime: "7/17/2025 • 11:21:08 AM",
      price: 26.6,
      car: "/car1.png",
    },
    {
      title: "The Landing San Francisco Apartments",
      datetime: "6/13/2024 • 6:17:48 PM",
      price: 24.7,
      car: "/car2.png",
    },
    {
      title: "Avis Car Rental",
      datetime: "6/13/2024 • 10:45:32 AM",
      price: 24.7,
      car: "/car3.png",
    },
    {
      title: "The Landing San Francisco Apartments",
      datetime: "6/12/2024 • 9:04:31 PM",
      price: 19.0,
      car: "/car4.png",
    },
  ];
  return (
    <>
      <div className="mt-16 mb-5">
        <span className="text-[2rem] font-bold text-black" {...getElementAttributes('trips-past-title', 0)}>{getText('trips-past-title', 'Past')}</span>
      </div>
      <div className="flex items-center gap-4 mb-3">
        <button className="flex items-center gap-2 text-base text-black font-medium bg-gray-100 px-4 py-2 rounded-full" {...getElementAttributes('trips-filter-personal', 0)}>
          <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
            <circle cx="9" cy="9" r="8.5" stroke="#222" strokeWidth="1.3" />
            <path
              d="M7 7.3v1.3c0 .9.7 1.4 1.4 1.4.8 0 1.6-.5 1.6-1.4v-1.3"
              stroke="#222"
              strokeWidth="1"
            />
          </svg>{" "}
          {getText('trips-filter-personal', 'Personal')}
        </button>
        <button className="flex items-center gap-2 text-base text-black font-medium bg-gray-100 px-4 py-2 rounded-full" {...getElementAttributes('trips-filter-all', 0)}>
          <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
            <rect width="18" height="18" rx="4" fill="#111" />
            <path d="M5 9h8" stroke="#fff" strokeWidth="1.4" />
          </svg>{" "}
          {getText('trips-filter-all', 'All Trips')}
        </button>
      </div>
      <div className="bg-gray-100 rounded-xl flex items-center px-8 py-6 gap-7 mb-6 w-full max-w-3xl">
        <img
          src={featured.map}
          alt="Map"
          className="rounded-md w-[280px] h-[180px] object-cover"
        />
        <div className="flex-1 flex flex-col gap-1">
          <div className="text-[1.2rem] font-bold mb-1">{featured.address}</div>
          <div className="text-gray-900">{featured.datetime}</div>
          <div className="text-[15px]">${featured.price}</div>
        </div>
        <div className="flex flex-col gap-0.5 items-end">
          <div className="flex gap-6 text-xs mt-3">
            <button
              className="flex items-center gap-1 text-black"
              onClick={() => router.push("/help")}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                <path
                  d="M10 18c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8Z"
                  stroke="#2095d2"
                  strokeWidth="1.3"
                />
                <circle cx="10" cy="10" r="5" fill="#8CB4FF" />
                <path d="M10.5 6.5v4l3 1.5" stroke="#333" strokeWidth="1.1" />
              </svg>{" "}
              {getText('trips-help', 'Help')}
            </button>
            <button className="flex items-center gap-1 text-black" {...getElementAttributes('trips-details', 0)}>
              <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                <rect width="20" height="20" rx="4" fill="#2095d2" />
                <path
                  d="M8 14h4M8 6h.01M14 6h-4v4m0-4v4"
                  stroke="#fff"
                  strokeWidth="1.1"
                />
              </svg>{" "}
              {getText('trips-details', 'Details')}
            </button>
            <button className="flex items-center gap-1 text-black" {...getElementAttributes('trips-rebook', 0)}>
              <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                <rect
                  x="3"
                  y="3"
                  width="14"
                  height="14"
                  rx="7"
                  fill="#CBCBCB"
                />
                <path
                  d="M9 14v-4a2 2 0 1 1 2-2h-1"
                  stroke="#2095d2"
                  strokeWidth="1.1"
                />
              </svg>{" "}
              {getText('trips-rebook', 'Rebook')}
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 w-full max-w-4xl">
        {cards.map((card) => (
          <div
            className="bg-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-stretch px-6 py-6 gap-6 mb-4 border border-gray-200 min-w-0"
            key={card.title + card.datetime}
          >
            <img
              src={card.car}
              alt="Car"
              className="w-full sm:w-64 h-40 sm:h-44 object-cover mb-3 sm:mb-0 flex-shrink-0 rounded-xl shadow-sm"
            />
            <div className="flex-1 flex flex-col gap-1 justify-center min-w-0 w-full">
              <div className="font-bold text-[1.25rem] mb-1 truncate max-w-full break-words">
                {card.title}
              </div>
              <div className="text-gray-800 text-sm mb-1 truncate max-w-full break-words">
                {card.datetime}
              </div>
              <div className="text-lg font-semibold text-[#2095d2] mb-1">${card.price}</div>
              <div className="flex gap-5 mt-3 flex-wrap">
                <button
                  className="flex items-center gap-1 text-black text-sm"
                  onClick={() => router.push("/help")}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                    <path
                      d="M10 18c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8Z"
                      stroke="#2095d2"
                      strokeWidth="1.3"
                    />
                    <circle cx="10" cy="10" r="5" fill="#8CB4FF" />
                    <path
                      d="M10.5 6.5v4l3 1.5"
                      stroke="#333"
                      strokeWidth="1.1"
                    />
                  </svg>
                  Help
                </button>
                <button className="flex items-center gap-1 text-black text-sm">
                  <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                    <rect width="20" height="20" rx="4" fill="#2095d2" />
                    <path
                      d="M8 14h4M8 6h.01M14 6h-4v4m0-4v4"
                      stroke="#fff"
                      strokeWidth="1.1"
                    />
                  </svg>
                  Details
                </button>
                <button className="flex items-center gap-1 text-black text-sm">
                  <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                    <rect
                      x="3"
                      y="3"
                      width="14"
                      height="14"
                      rx="7"
                      fill="#CBCBCB"
                    />
                    <path
                      d="M9 14v-4a2 2 0 1 1 2-2h-1"
                      stroke="#2095d2"
                      strokeWidth="1.1"
                    />
                  </svg>
                  Rebook
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* More button hidden when there are no more trips */}
    </>
  );
}

export default function TripsDashboardPage() {
  const { getElementAttributes, getText } = useSeedLayout();
  const dyn = useDynamicSystem();
  const [loading, setLoading] = useState<boolean>(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [cancelledIds, setCancelledIds] = useState<string[]>([]);
  const router = useSeedRouter();

  // Helper to read cancelledTrips from localStorage
  function readCancelledTrips(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const c = JSON.parse(localStorage.getItem("cancelledTrips") || "[]");
      return Array.isArray(c) ? c : [];
    } catch {
      return [];
    }
  }

  // Helper to read reserved trips from localStorage
  function readReservedTrips(): Trip[] {
    if (typeof window === "undefined") return [];
    try {
      const r = JSON.parse(localStorage.getItem("reservedTrips") || "[]");
      return Array.isArray(r) ? r : [];
    } catch {
      return [];
    }
  }

  // On mount, load trips and cancelledIds
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const reservedTrips = readReservedTrips();
      // Merge reserved trips with simulated trips, avoiding duplicates
      const allTrips = [...simulatedTrips];
      reservedTrips.forEach((reservedTrip) => {
        if (!allTrips.find((t) => t.id === reservedTrip.id)) {
          allTrips.push(reservedTrip);
        }
      });
      setTrips(allTrips);
      setCancelledIds(readCancelledTrips());
      setLoading(false);
    }, 1200);
  }, []);

  // Handler to cancel a reservation
  const handleCancelReservation = (tripId: string) => {
    // Add to cancelled trips
    const cancelled = readCancelledTrips();
    if (!cancelled.includes(tripId)) {
      cancelled.push(tripId);
      localStorage.setItem("cancelledTrips", JSON.stringify(cancelled));
    }

    // Remove from reserved trips if it's a reserved trip
    try {
      const reservedTrips = readReservedTrips();
      const updatedReserved = reservedTrips.filter((t: Trip) => t.id !== tripId);
      localStorage.setItem("reservedTrips", JSON.stringify(updatedReserved));
    } catch (error) {
      console.error("Error removing reserved trip:", error);
    }

    // Update state
    setCancelledIds([...cancelledIds, tripId]);
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  // Listen for navigation and localStorage changes to update cancelledIds and trips
  useEffect(() => {
    // Handler for storage event (cross-tab)
    function handleStorage(e: StorageEvent) {
      if (e.key === "cancelledTrips") {
        setCancelledIds(readCancelledTrips());
      }
      if (e.key === "reservedTrips") {
        const reservedTrips = readReservedTrips();
        setTrips((prev) => {
          const allTrips = [...simulatedTrips];
          reservedTrips.forEach((reservedTrip: Trip) => {
            if (!allTrips.find((t) => t.id === reservedTrip.id)) {
              allTrips.push(reservedTrip);
            }
          });
          return allTrips;
        });
      }
    }
    // Handler for navigation (popstate)
    function handlePopState() {
      setCancelledIds(readCancelledTrips());
      const reservedTrips = readReservedTrips();
      setTrips((prev) => {
        const allTrips = [...simulatedTrips];
        reservedTrips.forEach((reservedTrip: Trip) => {
          if (!allTrips.find((t) => t.id === reservedTrip.id)) {
            allTrips.push(reservedTrip);
          }
        });
        return allTrips;
      });
    }
    window.addEventListener("storage", handleStorage);
    window.addEventListener("popstate", handlePopState);
    // Also, on focus, re-read in case of changes
    window.addEventListener("focus", handlePopState);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("focus", handlePopState);
    };
  }, []);

  // Filter out any cancelled trips in upcoming
  const upcomingDisplay = trips.filter(
    (t) => t.status === "upcoming" && !cancelledIds.includes(t.id)
  );

  return (
    dyn.v1.addWrapDecoy("trips-page", (
      <div className="min-h-screen bg-[#fafbfc]">
        <GlobalHeader />
      {loading ? (
        <div className="flex w-full h-[70vh] items-center justify-center">
          <div className="flex items-center gap-6 w-full max-w-[500px] justify-end pr-12">
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
            <span className="text-xl text-gray-800 font-normal" {...getElementAttributes('trips-loading', 0)}>
              {getText('trips-loading', 'Loading trips page...')}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex gap-6 mt-10 max-w-[1200px] mx-auto max-md:flex-col">
          <div className="w-[60%] max-md:w-full">
            <section>
              <div className="text-3xl font-bold mb-6" {...getElementAttributes('trips-upcoming-title', 0)}>{getText('trips-upcoming-title', 'Upcoming')}</div>
              {upcomingDisplay.map((trip, idx) => (
                <TripCard key={trip.id} trip={trip} onCancel={handleCancelReservation} index={idx} />
              ))}
            </section>
            <PastSection />
          </div>
          <aside className="hidden lg:block lg:w-[340px]">
            <div className="sticky top-24">
              <img
                src="/ride.jpg"
                alt="Get a ride illustration"
                className="rounded-xl mb-5 w-[300px] h-[180px] object-cover"
              />
              <div className="font-bold text-xl mb-1 w-full" {...getElementAttributes('trips-aside-title', 0)}>
                {getText('trips-aside-title', 'Get a ride in minutes')}
              </div>
              <div className="text-base mb-5 w-full" {...getElementAttributes('trips-aside-desc', 0)}>
                {getText('trips-aside-desc', 'Book an AutoDriver from a web browser, no app install necessary.')}
              </div>
              <button
                className="bg-[#2095d2] text-white rounded-md px-5 py-3 w-full font-bold text-base shadow hover:bg-[#1273a0] transition"
                onClick={() => router.push("/ride/trip")}
              >
                {getText('trips-aside-cta', 'Request a ride')}
              </button>
            </div>
          </aside>
        </div>
      )}
      </div>
    ))
  );
}
