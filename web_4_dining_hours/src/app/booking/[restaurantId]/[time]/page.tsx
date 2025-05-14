"use client";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { EVENT_TYPES, logEvent } from "@/components/lib/events";

const restaurantImgs: Record<string, string> = {
  "royal-dine": "https://ext.same-assets.com/3952155396/849522504.jpeg",
  "vintage-bites": "https://ext.same-assets.com/3952155396/849522504.jpeg",
  "evening-delight": "https://ext.same-assets.com/3952155396/849522504.jpeg",
  "river-view-cafe": "https://ext.same-assets.com/3952155396/849522504.jpeg",
  "fancy-lights-bistro": "https://ext.same-assets.com/3952155396/849522504.jpeg",
};

const restaurantNames: Record<string, string> = {
  "royal-dine": "The Royal Dine",
  "vintage-bites": "Vintage Bites",
  "evening-delight": "Evening Delight",
  "river-view-cafe": "River View Café",
  "fancy-lights-bistro": "Fancy Lights Bistro",
};

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const params = useParams();
  const search = useSearchParams();

  const restaurantId = params.restaurantId as string;
  const restaurantName = restaurantNames[restaurantId] || restaurantId;
  const imageUrl = restaurantImgs[restaurantId] || restaurantImgs["royal-dine"];

  const date = search.get("date") || "Jul 18";
  const time = (params.time as string) || "1:30 PM";
  const people = search.get("people") || "2 people";

  useEffect(() => {
    logEvent(EVENT_TYPES.PEOPLE_COUNT, { people });
    logEvent(EVENT_TYPES.DATE_DETAIL, { date });
    logEvent(EVENT_TYPES.TIME_DETAIL, { time });
  }, [people, date, time]);

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      logEvent(EVENT_TYPES.SEARCH_RESTAURANT, { query: searchQuery });
    }
  };

  return (
    <main>
      <nav className="w-full border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-20 px-4 gap-2">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="bg-[#c24742] px-3 py-1 rounded flex items-center h-9">
                <span className="font-bold text-white text-lg">DINING-HOURS</span>
              </div>
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Location, Restaurant, or Cuisine"
              className="rounded p-2 min-w-[250px] border border-gray-300"
            />
            <button
              onClick={handleSearch}
              className="ml-2 px-4 py-2 rounded bg-[#c24742] text-white"
            >
              Let's go
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Link className="text-sm text-gray-600 hover:text-[#c24742]" href="/help">
              Get help
            </Link>
            <Link className="text-sm text-gray-600 hover:text-[#c24742]" href="/faqs">
              FAQs
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pb-10 pt-4">
        <h2 className="font-bold text-lg mt-8 mb-4">You’re almost done!</h2>
        <div className="flex items-center gap-3 mb-6">
          <img
            src={imageUrl}
            alt={restaurantName}
            className="w-16 h-16 rounded-lg object-cover border"
          />
          <div className="flex flex-col gap-[2px]">
            <span className="font-bold text-2xl">{restaurantName}</span>
            <div className="flex items-center gap-5 text-gray-700 mt-1 text-[15px]">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {date}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4 mr-1" />
                {time}
              </span>
              <span className="flex items-center gap-1">
                <UserIcon className="w-4 h-4 mr-1" />
                {people}
              </span>
            </div>
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-2 mt-4">Diner details</h3>
        <div className="flex gap-2 mb-3 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <div className="flex relative">
              <span className="inline-flex items-center px-2 border rounded-l bg-white">
                🇺🇸 +1
              </span>
              <input
                type="tel"
                placeholder=" "
                className="border border-l-0 rounded-r focus:outline-none px-3 py-2 w-full"
                defaultValue=""
              />
            </div>
          </div>
          <input
            type="email"
            placeholder="user_name@gmail.com"
            className="flex-1 border px-3 py-2 rounded min-w-[220px] bg-gray-100 text-gray-800"
          />
        </div>
        <div className="flex gap-2 mb-4 flex-wrap">
          <select className="flex-1 border rounded px-3 py-2 bg-white min-w-[220px]">
            <option value="">Select an occasion (optional)</option>
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="business">Business meal</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Add a special request (optional)"
            className="flex-1 border px-3 py-2 rounded min-w-[220px]"
          />
        </div>
        <Button className="w-full bg-[#c24742] hover:bg-[#a43a32] text-white py-6 mt-1 mb-4 text-lg rounded">
          Complete reservation
        </Button>
        <div className="text-xs text-gray-600 mt-3">
          By clicking “Complete reservation” you agree to the{" "}
          <Link href="#" className="text-[#c24742] underline">
            OpenDinning Terms of Use
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-[#c24742] underline">
            Privacy Policy
          </Link>
          . Message & data rates may apply. You can opt out of receiving text
          messages at any time in your account settings or by replying STOP.
        </div>
      </div>
    </main>
  );
}