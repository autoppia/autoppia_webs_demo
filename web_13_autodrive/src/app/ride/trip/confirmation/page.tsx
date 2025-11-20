"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RideNavbar from "../../../../components/RideNavbar";
import { rides } from "@/data/trips-enhanced";

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

export default function ConfirmationPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    rideIdx: 0,
    pickup: "",
    dropoff: "",
    date: "",
    time: "",
  });
  const ride = rides[data.rideIdx] ?? rides[0];
  const router = useRouter();

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
    }
    const id = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="min-h-screen bg-[#f5fbfc]">
      <RideNavbar activeTab="ride" />
      <div className="flex gap-8 mt-8 px-10 pb-10 max-lg:flex-col max-lg:px-2 max-lg:gap-4">
        {/* Left panel: loader or confirmation */}
        <section className="w-[380px] bg-white rounded-2xl shadow-xl p-8 flex flex-col max-lg:w-full border border-gray-100 min-h-[500px]">
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
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={ride.image}
                  alt={ride.name}
                  className="w-16 h-16 rounded-xl bg-[#e6f6fc] object-contain border border-[#2095d2]"
                />
                <div>
                  <div className="font-bold text-2xl leading-tight text-[#2095d2]">
                    Thank you for reserving your ride
                  </div>
                  <span className="inline-block bg-[#e6f6fc] text-[#2095d2] px-3 py-1.5 text-[14px] font-medium rounded-md mt-2 border border-[#2095d2]">
                    {ride.name} reserved
                  </span>
                </div>
              </div>
              <div className="border-b mt-4 mb-6 border-[#2095d2]"></div>
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
                  <span className="text-gray-600">
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
                    <div className="font-semibold text-[#2095d2]">
                      {data.pickup ? data.pickup.split(" - ")[0] : "--"}
                    </div>
                    <div className="text-gray-500 text-[15px]">
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
                    <div className="font-semibold text-[#2095d2]">
                      {data.dropoff ? data.dropoff.split(" - ")[0] : "--"}
                    </div>
                    <div className="text-gray-500 text-[15px]">
                      {data.dropoff ? data.dropoff.split(" - ")[1] : ""}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-4 flex items-center gap-3">
                <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
                  <rect
                    x="2"
                    y="8"
                    width="16"
                    height="8"
                    rx="2"
                    fill="#2095d2"
                  />
                  <rect x="4" y="12" width="12" height="2" rx="1" fill="#fff" />
                </svg>
                <span className="text-lg font-bold text-[#2095d2]">
                  ${ride.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-600 ml-2">
                  Visa ••••1270
                </span>
              </div>
              <button
                className="mt-6 w-full bg-[#2095d2] text-white font-bold rounded-md py-3 text-lg hover:bg-[#1273a0] transition"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    router.push("/ride/trip/trips");
                  }, 800);
                }}
              >
                View and track your trip
              </button>
              <div className="text-xs text-gray-600 mt-6">
                You'll see driver and car details shortly before your pickup.
              </div>
            </div>
          )}
        </section>
        <section className="flex-1 min-w-0">
          <div className="w-full h-full min-h-[640px] flex items-center justify-center rounded-2xl border border-gray-100 overflow-hidden bg-gray-100">
            <img
              src="/map.jpg"
              alt="Map"
              // className="object-contain max-h-[320px] w-full"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
