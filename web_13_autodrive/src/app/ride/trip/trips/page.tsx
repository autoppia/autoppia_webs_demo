"use client";
import { useEffect, useState } from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useSeedLayout } from "@/dynamic/v3-dynamic";
import RideNavbar from "../../../../components/RideNavbar";
import { logEvent, EVENT_TYPES } from "@/library/event";
import {simulatedTrips, rides, DriverType, RideType, Trip} from "@/library/dataset";


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

function TripCard({ trip }: { trip: Trip }) {
  const router = useSeedRouter();
  const { getElementAttributes, getText } = useSeedLayout();
  
  const handleTripDetailsClick = () => {
    // Log the TRIP_DETAILS event
    logEvent(EVENT_TYPES.TRIP_DETAILS, { 
      trip_id: trip.id, 
      ride_name: trip.ride.name,
      timestamp: new Date().toISOString(),
      trip_status: trip.status,
      trip_date: trip.date,
      trip_time: trip.time,
      trip_price: trip.price,
      trip_payment: trip.payment,
      driver_name: trip.driver.name,
      pickup_location: trip.pickup,
      dropoff_location: trip.dropoff
    });
    
    // Navigate to trip details page
    router.push(`/ride/trip/trips/${trip.id}`);
  };
  
  return (
    <div className="bg-gray-100 rounded-2xl flex items-center px-8 py-7 gap-7 mb-6">
      <img
        src={trip.ride.icon}
        alt="Car"
        className="w-36 h-24 object-contain mr-6"
      />
      <div className="flex-1 flex flex-col gap-1">
        <div className="font-bold text-xl mb-1 flex items-center gap-3">
          Confirmed
          <span className="font-normal text-base text-gray-700">
            {trip.ride.name}
          </span>
        </div>
        <div className="text-gray-800 text-base">
          {formatDateShort(trip.date, trip.time)}
        </div>
      </div>
      <div className="flex flex-col justify-between items-end h-full gap-2">
        <button
          {...getElementAttributes('trips-card-details', 0)}
          className="flex items-center gap-2 px-4 py-1 mt-0 bg-white border border-gray-300 rounded-lg text-black font-medium text-sm"
          onClick={handleTripDetailsClick}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
            <rect width="20" height="20" rx="10" fill="#2095d2" />
            <path
              d="M6.5 10.5L9 13l4.5-4.5"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          {getText('trips-card-details', 'Trip Details')}
        </button>
      </div>
    </div>
  );
}

function PastSection() {
  const router = useSeedRouter();
  const { getElementAttributes, getText } = useSeedLayout();
  const featured = {
    address: "100 Van Ness",
    datetime: "7/17/2025 • 11:55:31 AM",
    price: 24.75,
    map: "/map.png",
  };
  const cards = [
    {
      title: "1 Hotel San Francisco",
      datetime: "7/17/2025 • 11:21:08 AM",
      price: 26.6,
      car: "/car1.jpg",
    },
    {
      title: "The Landing San Francisco Apartments",
      datetime: "6/13/2024 • 6:17:48 PM",
      price: 24.7,
      car: "/car2.jpg",
    },
    {
      title: "Avis Car Rental",
      datetime: "6/13/2024 • 10:45:32 AM",
      price: 24.7,
      car: "/car3.jpg",
    },
    {
      title: "The Landing San Francisco Apartments",
      datetime: "6/12/2024 • 9:04:31 PM",
      price: 19.0,
      car: "/car1.jpg",
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
          className="rounded-md w-[220px] h-[150px] object-cover"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {cards.map((card) => (
          <div
            className="bg-white rounded-2xl shadow flex flex-col md:flex-row items-center px-6 py-6 gap-5 mb-6 border border-gray-200 min-w-0"
            key={card.title + card.datetime}
          >
            <img
              src={card.car}
              alt="Car"
              className="w-24 h-16 object-contain md:mr-6 mb-3 md:mb-0 flex-shrink-0"
            />
            <div className="flex-1 flex flex-col gap-1 justify-center min-w-0 w-full">
              <div className="font-bold text-[1.15rem] mb-1 truncate max-w-full break-words">
                {card.title}
              </div>
              <div className="text-gray-800 text-sm mb-0.5 truncate max-w-full break-words">
                {card.datetime}
              </div>
              <div className="text-base">${card.price}</div>
              <div className="flex gap-4 mt-3 flex-wrap">
                <button
                  className="flex items-center gap-1 text-black text-xs"
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
                <button className="flex items-center gap-1 text-black text-xs">
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
                <button className="flex items-center gap-1 text-black text-xs">
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
      <div className="w-full flex items-center justify-end pr-3 mt-2 mb-10">
        <button className="text-[#2095d2] rounded-lg px-4 py-2 text-[15px] font-semibold hover:bg-[#e6f6fc] transition">
          More
        </button>
      </div>
    </>
  );
}

export default function TripsDashboardPage() {
  const { getElementAttributes, getText } = useSeedLayout();
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

  // On mount, load trips and cancelledIds
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTrips(simulatedTrips);
      setCancelledIds(readCancelledTrips());
      setLoading(false);
    }, 1200);
  }, []);

  // Listen for navigation and localStorage changes to update cancelledIds
  useEffect(() => {
    // Handler for storage event (cross-tab)
    function handleStorage(e: StorageEvent) {
      if (e.key === "cancelledTrips") {
        setCancelledIds(readCancelledTrips());
      }
    }
    // Handler for navigation (popstate)
    function handlePopState() {
      setCancelledIds(readCancelledTrips());
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
    <div className="min-h-screen bg-[#fafbfc]">
      <RideNavbar activeTab="mytrips" />
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
              {upcomingDisplay.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
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
  );
}
