"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import { useDynamicSystem } from "@/dynamic/shared";
import { TEXT_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";
import { logEvent, EVENT_TYPES } from "@/library/event";

function formatDateTime(date: string, time: string) {
  if (!date || !time) return "";
  const d = new Date(`${date}T${time}`);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

// Ride templates mapping for image lookup
const RIDE_IMAGE_MAP: Record<string, string> = {
  "AutoDriverX": "/car1.png",
  "Comfort": "/car2.png",
  "AutoDriverXL": "/car3.png",
  "Executive": "/dashboard.jpg",
};

export default function ConfirmationPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    rideIdx: 0,
    pickup: "",
    dropoff: "",
    date: "",
    time: "",
  });
  const [selectedRideInfo, setSelectedRideInfo] = useState<{
    name: string;
    image: string;
    price: number;
    icon?: string;
  } | null>(null);
  const [reserveRideData, setReserveRideData] = useState<any>(null);
  const [tripSaved, setTripSaved] = useState(false);
  const router = useRouter();
  const dyn = useDynamicSystem();
  
  // Use selected ride info - this should always be set from sessionStorage
  const ride = selectedRideInfo || {
    name: "AutoDriverX",
    image: "/car1.png",
    price: 26.6,
  };
  
  // Get rideId from reserveRideData, fallback to data.rideIdx
  const rideIdForDriver = reserveRideData?.rideId ?? data.rideIdx;

  useEffect(() => {
    // Get rideIdx, pickup, dropoff, etc from sessionStorage (simulate state persistence)
    if (typeof window !== "undefined") {
      const rideIdx =
        Number(sessionStorage.getItem("__ud_selectedRideIdx")) || 0;
      const pickup = sessionStorage.getItem("__ud_pickup") || "";
      const dropoff = sessionStorage.getItem("__ud_dropoff") || "";
      const date = sessionStorage.getItem("ud_pickupdate") || "";
      const time = sessionStorage.getItem("ud_pickuptime") || "";
      setData({ rideIdx, pickup, dropoff, date, time });
      
      // Get selected ride information from sessionStorage - this is the source of truth
      const reserveRideDataStr = sessionStorage.getItem("__ud_reserveRideData");
      if (reserveRideDataStr) {
        try {
          const parsedReserveRideData = JSON.parse(reserveRideDataStr);
          // Store the complete reserveRideData for use in driver calculations
          setReserveRideData(parsedReserveRideData);
          // Use data directly from reserveRideData - this contains the actual selected ride info
          const rideName = parsedReserveRideData.rideName || parsedReserveRideData.rideType || "AutoDriverX";
          const ridePrice = parsedReserveRideData.price || 26.6;
          // Use image directly from reserveRideData, fallback to RIDE_IMAGE_MAP only if image is missing
          const rideImage = parsedReserveRideData.image || RIDE_IMAGE_MAP[rideName] || "/car1.png";
          
          setSelectedRideInfo({
            name: rideName,
            image: rideImage,
            price: ridePrice,
            icon: parsedReserveRideData.icon,
          });
        } catch (e) {
          console.error("Error parsing reserveRideData:", e);
          // If parsing fails, use minimal fallback
          setReserveRideData(null);
          setSelectedRideInfo({
            name: "AutoDriverX",
            image: "/car1.png",
            price: 26.6,
          });
        }
      } else {
        // If no reserveRideData, this shouldn't happen, but provide a fallback
        console.warn("No reserveRideData found in sessionStorage");
        setReserveRideData(null);
        setSelectedRideInfo({
          name: "AutoDriverX",
          image: "/car1.png",
          price: 26.6,
        });
      }
      
      // Save the reservation as an upcoming trip (only once)
      if (!tripSaved && rideIdx !== null && pickup && dropoff) {
        // Get ride info directly from sessionStorage - this is the source of truth
        const reserveRideDataStrForTrip = sessionStorage.getItem("__ud_reserveRideData");
        let rideToUse = {
          name: "AutoDriverX",
          image: "/car1.png",
          price: 26.6,
          icon: "",
        };
        
        if (reserveRideDataStrForTrip) {
          try {
            const reserveRideDataForTrip = JSON.parse(reserveRideDataStrForTrip);
            const rideNameForTrip = reserveRideDataForTrip.rideName || reserveRideDataForTrip.rideType || "AutoDriverX";
            const ridePriceForTrip = reserveRideDataForTrip.price || 26.6;
            // Use image directly from reserveRideDataForTrip, fallback to RIDE_IMAGE_MAP only if image is missing
            const rideImageForTrip = reserveRideDataForTrip.image || RIDE_IMAGE_MAP[rideNameForTrip] || "/car1.png";
            rideToUse = {
              name: rideNameForTrip,
              image: rideImageForTrip,
              price: ridePriceForTrip,
              icon: reserveRideDataForTrip.icon || "",
            };
          } catch (e) {
            console.error("Error parsing reserveRideData for trip:", e);
          }
        }
        // Use a consistent trip ID based on the reservation data to avoid duplicates
        const tripId = `reserved-${rideIdx}-${pickup.slice(0, 20)}-${dropoff.slice(0, 20)}-${date}-${time}`.replace(/[^a-zA-Z0-9-]/g, '-');
        
        // Get RESERVE_RIDE event data from sessionStorage if available (reuse the one we already parsed)
        let reserveRideData = null;
        if (reserveRideDataStrForTrip) {
          try {
            reserveRideData = JSON.parse(reserveRideDataStrForTrip);
          } catch (e) {
            console.error("Error parsing reserveRideData:", e);
          }
        }
        
        const newTrip = {
          id: tripId,
          status: "upcoming" as const,
          ride: rideToUse,
          pickup,
          dropoff,
          date: date || new Date().toISOString().split("T")[0],
          time: time || new Date().toTimeString().slice(0, 5),
          price: rideToUse.price,
          payment: "card",
          driver: {
            name: ["Michael Chen", "Sarah Johnson", "David Martinez", "Emily Rodriguez"][(reserveRideData?.rideId ?? rideIdx) % 4],
            car: "Vehicle",
            plate: "ABC-123",
            phone: "+1-555-0101",
            photo: `https://i.pravatar.cc/150?img=${((reserveRideData?.rideId ?? rideIdx) % 10) + 1}`,
          },
          // Store the complete RESERVE_RIDE event data for later use
          reserveRideData: reserveRideData || null,
        };
        
        // Save to localStorage
        try {
          const reservedTrips = JSON.parse(localStorage.getItem("reservedTrips") || "[]");
          // Check if trip already exists (avoid duplicates)
          if (!reservedTrips.find((t: any) => t.id === tripId)) {
            reservedTrips.push(newTrip);
            localStorage.setItem("reservedTrips", JSON.stringify(reservedTrips));
            setTripSaved(true);
          }
        } catch (error) {
          console.error("Error saving reserved trip:", error);
        }
      }
    }
    const id = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(id);
  }, [tripSaved]);
  return (
    <div className="min-h-screen bg-[#f5fbfc]">
      <GlobalHeader />
      <div className="flex gap-8 mt-8 px-10 pb-10 max-lg:flex-col max-lg:px-2 max-lg:gap-4">
        {/* Left panel: loader or confirmation */}
        <section className="w-[500px] bg-white rounded-2xl shadow-xl p-8 flex flex-col max-lg:w-full border border-gray-100 min-h-[500px]">
          {loading ? (
            <div className="flex flex-col h-full w-full justify-center items-center py-28">
              <svg
                className="animate-spin text-[#2095d2] mb-8"
                width="60"
                height="60"
                fill="none"
                viewBox="0 0 50 50"
              >
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  stroke="#2095d2"
                  strokeWidth="5"
                  className="opacity-30"
                />
                <path
                  d="M45 25A20 20 0 0 1 25 45"
                  stroke="#2095d2"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-xl font-medium text-[#2095d2]">
                Booking trip...
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* 1. Title */}
              <div className="mb-6">
                <div className="font-bold text-2xl leading-tight text-[#2095d2] mb-3">
                  Thank you for reserving your ride
                </div>
                <div className="w-full bg-[#e6f6fc] text-[#2095d2] px-4 py-2.5 text-[15px] font-medium rounded-md border border-[#2095d2] text-center">
                  {ride.name} reserved
                </div>
              </div>

              {/* 2. Price - Full width */}
              <div className="mb-6 w-full bg-gradient-to-r from-[#2095d2] to-[#1273a0] rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <svg width="28" height="28" fill="none" viewBox="0 0 20 20">
                      <rect
                        x="2"
                        y="8"
                        width="16"
                        height="8"
                        rx="2"
                        fill="#fff"
                      />
                      <rect x="4" y="12" width="12" height="2" rx="1" fill="#2095d2" />
                    </svg>
                    <div>
                      <div className="text-3xl font-bold">
                        ${(ride.price || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-blue-100 mt-1">
                        Visa ••••1270
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Large car image */}
              <div className="mb-6">
                <img
                  src={ride.image || "/car1.png"}
                  alt={ride.name}
                  className="w-full h-64 rounded-xl object-cover shadow-lg"
                />
              </div>

              {/* 4. Driver info with avatar and stats */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={`https://i.pravatar.cc/150?img=${(rideIdForDriver % 10) + 1}`}
                      alt="Driver"
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#2095d2]"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-xl text-gray-900">
                      {["Michael Chen", "Sarah Johnson", "David Martinez", "Emily Rodriguez"][rideIdForDriver % 4]}
                    </div>
                    <div className="text-sm text-gray-600">
                      Your driver
                    </div>
                  </div>
                </div>

                {/* Driver stats */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-[#2095d2]">
                      {["4.9", "4.8", "5.0", "4.7"][rideIdForDriver % 4]}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Rating</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-[#2095d2]">
                      {["1.2k", "850", "2.1k", "650"][rideIdForDriver % 4]}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Trips</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-[#2095d2]">
                      {["3", "2", "5", "2"][rideIdForDriver % 4]} min
                    </div>
                    <div className="text-xs text-gray-600 mt-1">ETA</div>
                  </div>
                </div>
              </div>

              {/* Additional trip details */}
              <div className="mt-auto pt-6 border-t border-gray-200">
                <div className="mb-4 flex items-start text-base">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    className="mr-3 mt-1"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="4"
                      fill="#2095d2"
                    />
                    <text
                      x="12"
                      y="17"
                      textAnchor="middle"
                      fontSize="11"
                      fill="#fff"
                    >
                      30
                    </text>
                  </svg>
                  <div>
                    <span className="font-bold text-[#2095d2]">
                      {formatDateTime(data.date, data.time)}
                    </span>
                    <br />
                    <span className="text-gray-600 text-sm">
                      Your driver will wait until 5 min after time.
                    </span>
                  </div>
                </div>
                <div className="mb-4 text-base">
                  <div className="flex gap-3 mb-2">
                    <span className="mt-1">
                      <svg
                        width="18"
                        height="18"
                        fill="#2095d2"
                        viewBox="0 0 20 20"
                      >
                        <circle cx="10" cy="10" r="8" />
                        <circle cx="10" cy="10" r="3" fill="#fff" />
                      </svg>
                    </span>
                    <div>
                      <div className="font-semibold text-[#2095d2] text-sm">
                        {data.pickup ? data.pickup.split(" - ")[0] : "--"}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {data.pickup ? data.pickup.split(" - ")[1] : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mb-2">
                    <span className="mt-1">
                      <svg
                        width="18"
                        height="18"
                        fill="#2095d2"
                        viewBox="0 0 20 20"
                      >
                        <circle cx="10" cy="10" r="8" />
                        <circle cx="10" cy="10" r="3" fill="#fff" />
                      </svg>
                    </span>
                    <div>
                      <div className="font-semibold text-[#2095d2] text-sm">
                        {data.dropoff ? data.dropoff.split(" - ")[0] : "--"}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {data.dropoff ? data.dropoff.split(" - ")[1] : ""}
                      </div>
                    </div>
                  </div>
                </div>
                {dyn.v1.addWrapDecoy("confirmation-view-track-trip-button", (
                  <button
                    className={`mt-4 w-full bg-[#2095d2] text-white font-bold rounded-md py-3 text-lg hover:bg-[#1273a0] transition ${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")}`}
                    onClick={() => {
                    // Get RESERVE_RIDE event data from sessionStorage if available
                    const reserveRideDataStr = sessionStorage.getItem("__ud_reserveRideData");
                    let reserveRideData = null;
                    if (reserveRideDataStr) {
                      try {
                        reserveRideData = JSON.parse(reserveRideDataStr);
                      } catch (e) {
                        console.error("Error parsing reserveRideData:", e);
                      }
                    }
                    
                    if (reserveRideData) {
                      // Use the actual reserved ride data from RESERVE_RIDE event
                      logEvent(EVENT_TYPES.TRIP_DETAILS, {
                        ...reserveRideData,
                        timestamp: new Date().toISOString(), // Update timestamp
                      });
                    } else {
                      // Fallback to template data if reserved ride data is not available
                      const RIDE_TEMPLATES = [
                        { name: "AutoDriverX", seats: 4, basePrice: 26.6 },
                        { name: "Comfort", seats: 4, basePrice: 31.5 },
                        { name: "AutoDriverXL", seats: 6, basePrice: 27.37 },
                        { name: "Executive", seats: 4, basePrice: 45.0 },
                      ];
                      const rideTemplate = RIDE_TEMPLATES.find(r => r.name === ride.name) || RIDE_TEMPLATES[0];
                      const oldPrice = Number((ride.price * 1.1).toFixed(2));
                      const scheduled = data.date && data.time ? `${data.date} ${data.time}` : "now";
                      
                      logEvent(EVENT_TYPES.TRIP_DETAILS, {
                        rideId: rideIdForDriver,
                        rideName: ride.name,
                        rideType: ride.name,
                        price: ride.price,
                        oldPrice: oldPrice,
                        seats: rideTemplate.seats,
                        eta: "5 min away · " + (data.time || new Date().toTimeString().slice(0, 5)),
                        pickup: data.pickup,
                        dropoff: data.dropoff,
                        scheduled: scheduled,
                        timestamp: new Date().toISOString(),
                        priceDifference: oldPrice - ride.price,
                        discountPercentage: ((oldPrice - ride.price) / oldPrice * 100).toFixed(2),
                        isRecommended: false,
                        tripDetails: {
                          pickup: data.pickup,
                          dropoff: data.dropoff,
                          scheduled: scheduled,
                          rideType: ride.name,
                          price: ride.price,
                          totalSeats: rideTemplate.seats,
                          estimatedArrival: "5 min away · " + (data.time || new Date().toTimeString().slice(0, 5))
                        }
                      });
                    }
                    setLoading(true);
                    setTimeout(() => {
                      router.push("/ride/trip/trips");
                    }, 800);
                  }}
                >
                    {dyn.v3.getVariant("view_track_trip", TEXT_VARIANTS_MAP, "View and track your trip")}
                  </button>
                ))}
                <div className="text-xs text-gray-600 mt-4 text-center">
                  You'll see driver and car details shortly before your pickup.
                </div>
              </div>
            </div>
          )}
        </section>
        <section className="flex-1 min-w-0">
          <div className="w-full h-full min-h-[640px] flex items-center justify-center rounded-2xl border border-gray-100 overflow-hidden bg-gray-100 relative">
            <img
              src="/ride.png"
              alt="Ride"
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
