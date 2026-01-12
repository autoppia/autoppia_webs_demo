"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import GlobalHeader from "@/components/GlobalHeader";
import { EVENT_TYPES, logEvent } from "@/library/event";
import { simulatedTrips, rides } from "@/data/trips-enhanced";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

function formatDateTime(date: string, time: string) {
  if (!date || !time) return "--";
  const d = new Date(`${date}T${time}`);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });
}

export default function TripDetailsPage() {
  const router = useRouter();
  const dyn = useDynamicSystem();
  const { tripId } = useParams();

  // Active page for nav highlighting
  const [activeNav, setActiveNav] = useState<"mytrips" | "ride">("mytrips");

  // --- Modal state ---
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Get trip from storage or fallback
  const [activeTrip, setActiveTrip] = useState(() => {
    // First try to find in reserved trips
    if (typeof window !== "undefined") {
      try {
        const reservedTrips = JSON.parse(localStorage.getItem("reservedTrips") || "[]");
        const reservedTrip = reservedTrips.find((t: any) => t.id === tripId);
        if (reservedTrip) {
          return reservedTrip;
        }
      } catch (e) {
        console.error("Error reading reserved trips:", e);
      }
    }
    // Fallback to simulated trips
    return simulatedTrips.find((t) => t.id === tripId) || simulatedTrips[0];
  });

  // Handler to actually cancel
  function handleConfirmCancel() {
    // Log the CANCEL_RESERVATION event
    console.log("Logging CANCEL_RESERVATION", { tripId });
    
    // Check if this trip has reserved ride data (from RESERVE_RIDE event)
    const reservedRideData = (activeTrip as any).reserveRideData;
    
    if (reservedRideData) {
      // Use the actual reserved ride data from RESERVE_RIDE event
      logEvent(EVENT_TYPES.CANCEL_RESERVATION, {
        ...reservedRideData,
        tripId,
        timestamp: new Date().toISOString(),
        cancellationReason: 'user_requested',
        cancellationTime: new Date().toISOString()
      });
    } else {
      // Fallback to template data if reserved ride data is not available
      logEvent(EVENT_TYPES.CANCEL_RESERVATION, { 
        tripId,
        timestamp: new Date().toISOString(),
        tripData: activeTrip,
        cancellationReason: 'user_requested',
        cancellationTime: new Date().toISOString()
      });
    }
    
    if (typeof window !== "undefined") {
      // We use localStorage to store a simple array of cancelled trip ids
      let cancelled = [];
      try {
        cancelled = JSON.parse(localStorage.getItem("cancelledTrips") || "[]");
      } catch {
        cancelled = [];
      }
      cancelled.push(activeTrip.id);
      localStorage.setItem("cancelledTrips", JSON.stringify(cancelled));
    }
    router.push("/ride/trip/trips");
  }

  // On page load or when trip details are shown:
  useEffect(() => {
    console.log("Logging TRIP_DETAILS", { tripId });
    
    // Check if this trip has reserved ride data (from RESERVE_RIDE event)
    const reservedRideData = (activeTrip as any).reserveRideData;
    
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
      const rideTemplate = RIDE_TEMPLATES.find(r => r.name === activeTrip.ride.name) || RIDE_TEMPLATES[0];
      const oldPrice = Number((activeTrip.price * 1.1).toFixed(2));
      const scheduled = activeTrip.date && activeTrip.time ? `${activeTrip.date} ${activeTrip.time}` : "now";
      
      logEvent(EVENT_TYPES.TRIP_DETAILS, {
        rideId: RIDE_TEMPLATES.findIndex(r => r.name === activeTrip.ride.name) >= 0 
          ? RIDE_TEMPLATES.findIndex(r => r.name === activeTrip.ride.name) 
          : 0,
        rideName: activeTrip.ride.name,
        rideType: activeTrip.ride.name,
        price: activeTrip.price,
        oldPrice: oldPrice,
        seats: rideTemplate.seats,
        eta: "5 min away · " + (activeTrip.time || new Date().toTimeString().slice(0, 5)),
        pickup: activeTrip.pickup,
        dropoff: activeTrip.dropoff,
        scheduled: scheduled,
        timestamp: new Date().toISOString(),
        priceDifference: oldPrice - activeTrip.price,
        discountPercentage: ((oldPrice - activeTrip.price) / oldPrice * 100).toFixed(2),
        isRecommended: false,
        tripDetails: {
          pickup: activeTrip.pickup,
          dropoff: activeTrip.dropoff,
          scheduled: scheduled,
          rideType: activeTrip.ride.name,
          price: activeTrip.price,
          totalSeats: rideTemplate.seats,
          estimatedArrival: "5 min away · " + (activeTrip.time || new Date().toTimeString().slice(0, 5))
        }
      });
    }
  }, [tripId, activeTrip]);

  const rideIcon = activeTrip.ride.icon;

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <GlobalHeader />
      <div className="flex flex-col items-center pt-10 pb-32">
        <button
          className="flex text-lg items-center text-[#2095d2] mb-10 ml-[-620px] font-bold hover:underline"
          onClick={() => router.push("/ride/trip/trips")}
        >
          <svg
            width="22"
            height="22"
            fill="none"
            className="mr-2 -ml-1"
            viewBox="0 0 18 18"
          >
            <path
              d="M11 13l-4-4 4-4"
              stroke="#2095d2"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to trips
        </button>
        <div className="shadow max-w-2xl w-full bg-white rounded-xl py-12 px-8 flex flex-col relative">
          <span className="absolute right-4 top-4">
            <img
              src="https://ext.same-assets.com/407674263/1179166468.png"
              alt="Car"
              className="w-20 h-16 object-contain"
            />
          </span>
          <div className="text-3xl font-bold mb-4">
            Thank you for reserving your ride
          </div>
          <span className="inline-block mb-8 bg-[#e6f6fc] text-[#2095d2] px-2.5 py-1.5 text-[15px] font-medium rounded-md">
            {activeTrip.ride.name} reserved...
          </span>
          <div className="space-y-7 border-t border-b py-7">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <svg
                  width="25"
                  height="25"
                  className="mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    fill="#2095d2"
                  />
                  <rect x="7" y="8" width="10" height="2" rx="1" fill="#fff" />
                </svg>
                <div>
                  <div className="font-semibold text-lg">
                    Thu, July 18 at 12:00 PM (PDT)
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    Your driver will wait until 12:05 PM (PDT)
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <div className="flex flex-col items-center pr-2 pt-1">
                  <span className="w-3 h-3 rounded-full bg-[#2095d2] block"></span>
                  <span className="w-0.5 h-7 bg-[#2095d2] block mt-0.5"></span>
                  <span className="w-3 h-3 rounded-sm bg-[#2095d2] block"></span>
                </div>
                <div className="flex-1">
                  <div className="mb-5">
                    <span className="font-semibold text-base">
                      {activeTrip.pickup}
                    </span>
                    <div className="text-sm text-gray-500">
                      Pickup location
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-base">
                      {activeTrip.dropoff}
                    </span>
                    <div className="text-sm text-gray-500">
                      Dropoff location
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
                <rect x="2" y="8" width="16" height="8" rx="2" fill="#2095d2" />
                <rect x="4" y="12" width="12" height="2" rx="1" fill="#fff" />
              </svg>
              <span className="text-xl font-bold">
                ${activeTrip.price.toFixed(2)}
              </span>
              <span className="text-base text-gray-500 ml-2">
                {activeTrip.payment}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-7">
            You'll see driver and car details shortly before your pickup.
          </div>
          <div className="text-xs text-gray-600 mt-1 mb-3">
            5 minutes of wait time included to meet your ride. Cancel at no
            charge up to 1 hour in advance.
          </div>
          <button
            className={dyn.v3.getVariant("reserved-cancel-trip-button-class", CLASS_VARIANTS_MAP, "w-full bg-[#2095d2] rounded-md text-white font-bold py-3 text-base mt-3 flex items-center justify-center gap-2 hover:bg-[#187bb3] transition")}
            onClick={() => setShowCancelModal(true)}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              className="mr-1"
              viewBox="0 0 20 20"
            >
              <circle cx="10" cy="10" r="9" stroke="#fff" strokeWidth="2" />
              <path
                d="M7 7l6 6M13 7l-6 6"
                stroke="#fff"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            {dyn.v3.getVariant("reserved-cancel-trip-button-text", TEXT_VARIANTS_MAP, "Cancel this trip")}
          </button>
        </div>
      </div>
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto p-6 flex flex-col">
            <div className="text-2xl font-bold mb-2 flex items-center gap-2">
              <svg
                width="22"
                height="22"
                fill="none"
                className="inline-block"
                viewBox="0 0 20 20"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="9"
                  stroke="#2095d2"
                  strokeWidth="2"
                />
                <path
                  d="M7 7l6 6M13 7l-6 6"
                  stroke="#2095d2"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
              Cancel your reservation?
            </div>
            <div className="text-sm text-gray-700 mb-6">
              You won't be charged a cancellation fee.
            </div>
            <button
              className="w-full rounded-lg py-3 text-base font-bold bg-[#2095d2] text-white mb-3 flex items-center justify-center gap-2 hover:bg-[#187bb3] transition"
              onClick={handleConfirmCancel}
            >
              <svg
                width="20"
                height="20"
                fill="none"
                className="mr-1"
                viewBox="0 0 20 20"
              >
                <circle cx="10" cy="10" r="9" stroke="#fff" strokeWidth="2" />
                <path
                  d="M7 7l6 6M13 7l-6 6"
                  stroke="#fff"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
              Cancel reservation
            </button>
            <button
              className="w-full rounded-lg py-3 text-base font-bold border-2 border-[#2095d2] text-[#2095d2] bg-white flex items-center justify-center gap-2 hover:bg-[#e6f6fc] transition"
              onClick={() => setShowCancelModal(false)}
            >
              <svg
                width="20"
                height="20"
                fill="none"
                className="mr-1"
                viewBox="0 0 20 20"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="9"
                  stroke="#2095d2"
                  strokeWidth="2"
                />
                <path
                  d="M6 10h8"
                  stroke="#2095d2"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
              Keep reservation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
