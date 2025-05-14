"use client";
import { useParams } from "next/navigation";
import {
  CalendarIcon,
  Star,
  UserIcon,
  ChevronDownIcon,
  ClockIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from "date-fns";
import React from "react";
import Image from "next/image";

const restaurantData: Record<string, any> = {
  "royal-dine": {
    name: "The Royal Dine",
    image: "https://ext.same-assets.com/3952155396/849522504.jpeg",
    rating: 4.2,
    reviews: 20,
    price: "$50 to $100",
    cuisine: "French",
  },
  "vintage-bites": {
    name: "Vintage Bites",
    image: "https://ext.same-assets.com/3952155396/849522504.jpeg",
    rating: 4.2,
    reviews: 20,
    price: "$15 to $25",
    cuisine: "American",
    tags: ["cozy", "vintage", "charming"],
    desc: "Step into a retro-inspired eatery serving up classic dishes with a modern twist. The cozy and nostalgic atmosphere makes it a perfect spot for a trip down memory lane.",
    photos: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1555992336-03a23c5cfeba?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop",
    ],
  },
  "evening-delight": {
    name: "Evening Delight",
    image: "https://ext.same-assets.com/3952155396/849522504.jpeg",
    rating: 4.2,
    reviews: 20,
    price: "$30 to $60",
    cuisine: "Italian",
  },
  "river-view-cafe": {
    name: "River View Café",
    image: "https://ext.same-assets.com/3952155396/849522504.jpeg",
    rating: 4.2,
    reviews: 20,
    price: "$20 to $60",
    cuisine: "Café",
  },
  "fancy-lights-bistro": {
    name: "Fancy Lights Bistro",
    image: "https://ext.same-assets.com/3952155396/849522504.jpeg",
    rating: 4.33,
    reviews: 20,
    price: "$15 to $25",
    cuisine: "Mediterranean",
  },
};

export default function RestaurantPage() {
  const params = useParams();
  const id = params.restaurantId as string;
  const r = restaurantData[id] || restaurantData["vintage-bites"];
  const [people, setPeople] = useState(2);
  const [date, setDate] = useState(new Date(2024, 6, 18));
  const [time, setTime] = useState("1:00 PM");
  const peopleOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  const timeOptions = [
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
  ];

  return (
    <main>
      {/* Banner Image */}
      <div className="w-full h-[340px] bg-gray-200 relative">
        <div className="relative w-full h-full">
          <Image src={r.image} alt={r.name} fill className="object-cover" />
        </div>
      </div>
      {/* Info and reservation */}
      <div className="flex flex-col md:flex-row justify-between gap-10 px-8 max-w-screen-2xl mx-auto">
        {/* Info (details section, tags, desc, photos) */}
        <div className="pt-12 pb-10 flex-1 min-w-0">
          {/* Title & details row */}
          <h1 className="text-4xl font-bold mb-2">{r.name}</h1>
          <div className="flex items-center gap-4 text-lg mb-4">
            <span className="flex items-center text-[#c24742] text-xl font-semibold">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i}>★</span>
              ))}
              <span className="text-gray-300">★</span>
            </span>
            <span className="text-base flex items-center gap-2">
              <span className="font-bold">
                {r.rating?.toFixed(2) ?? "4.20"}
              </span>{" "}
              <span className="text-gray-700">{r.reviews ?? 20} Reviews</span>
            </span>
            <span className="text-base flex items-center gap-2">
              💵 {r.price}
            </span>
            <span className="text-base flex items-center gap-2">
              {r.cuisine}
            </span>
          </div>
          {/* Tags/Pills */}
          <div className="flex gap-2 mb-4">
            {(r.tags || []).map((tag: string, index: number) => (
              <span
                key={tag}
                className="py-1 px-4 bg-gray-100 rounded-full text-gray-800 font-semibold text-base border"
              >
                {tag}
              </span>
            ))}
          </div>
          {/* Description */}
          {r.desc && (
            <div className="mb-7 text-[17px] text-gray-700 max-w-2xl">
              {r.desc}
            </div>
          )}
          {/* Photos Grid */}
          {r.photos && (
            <>
              <h2 className="text-2xl font-bold mb-3">
                {r.photos.length} photos
              </h2>
              <div className="grid grid-cols-3 gap-3 w-full max-w-2xl mb-9">
                {r.photos.map((url: string, i: number) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="rounded-lg object-cover aspect-square w-full h-[112px] md:h-[140px]"
                  />
                ))}
              </div>
            </>
          )}
          {/* Menu Section */}
          <section className="max-w-2xl w-full mb-10">
            <h2 className="text-2xl font-bold mb-3 mt-8">Menu</h2>
            <div className="flex gap-6 border-b mb-5">
              <button className="border-b-2 border-[#c24742] text-[#c24742] font-semibold px-4 py-2 -mb-px bg-white">
                Main Menu
              </button>
            </div>
            {/* Category: starters */}
            <div className="font-bold text-lg mb-3 mt-6">starters</div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Cheese Board</span>
              <span className="font-bold">$14.00</span>
              <span className="font-semibold">Smoked Salmon Tartine</span>
              <span className="font-bold">$12.00</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm mb-2">
              <span>assorted artisan cheeses</span>
              <span></span>
              <span>capers, crème fraîche</span>
              <span></span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Escargot</span>
              <span className="font-bold">$16.00</span>
              <span></span>
              <span></span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm mb-2">
              <span>with garlic butter</span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <hr className="my-6" />
            {/* Category: mains */}
            <div className="font-bold text-lg mb-3">mains</div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Coq au Vin</span>
              <span className="font-bold">$26.00</span>
              <span className="font-semibold">Ratatouille</span>
              <span className="font-bold">$20.00</span>
            </div>
            <div className="flex justify-center my-7">
              <button className="border px-10 py-3 text-lg rounded font-semibold bg-white hover:bg-gray-50">
                View full menu
              </button>
            </div>
          </section>
          {/* Reviews Section */}
          <section className="max-w-2xl w-full mb-10">
            <h2 className="text-2xl font-bold mb-5 mt-10">
              What 20 people are saying
            </h2>
            <div className="font-bold mb-2">Overall ratings and reviews</div>
            <div className="mb-4 text-gray-700">
              Reviews can only be made by diners who have booked through
              OpenDinning and dined at this restaurant.
            </div>
            {/* Ratings bar chart (simplified) */}
            <div className="mb-6 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-5 text-right">{star}</span>
                  <span className="w-20 bg-red-200 h-3 rounded">
                    <span
                      className={`block h-3 rounded bg-[#c24742]`}
                      style={{ width: `${star * 12}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
        {/* Reservation Box - now more detailed per screenshot */}
        <div className="rounded-xl border bg-white shadow-sm p-6 w-full max-w-sm mt-[-120px] md:mt-16 self-start">
          <h2 className="font-bold text-lg mb-2 text-center">
            Make a reservation
          </h2>
          <div className="flex flex-col gap-3">
            {/* People select (demo, not fully interactive) */}
            <div>
              <Button
                variant="outline"
                className="w-full justify-start text-left flex items-center"
              >
                <UserIcon className="h-5 w-5 text-gray-700 mr-2" />
                {people} {people === 1 ? "person" : "people"}{" "}
                <ChevronDownIcon className="ml-auto h-4 w-4" />
              </Button>
            </div>
            {/* Date/time row */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="w-1/2 flex items-center justify-start"
              >
                <CalendarIcon className="mr-2" /> {format(date, "MMM d, yyyy")}
              </Button>
              <Button
                variant="outline"
                className="w-1/2 flex items-center justify-start"
              >
                <ClockIcon className="mr-2" /> {time}
                <ChevronDownIcon className="ml-auto h-4 w-4" />
              </Button>
            </div>
            {/* Time slots */}
            <div className="mt-3">
              <div className="font-semibold mb-2">Select a time</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {["1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM"].map(
                  (t, i) =>
                    t !== "3:00 PM" ? (
                      <Button
                        key={t}
                        className="bg-[#c24742] hover:bg-[#a43a32] text-white font-semibold px-4 py-2 text-base"
                      >
                        {t}
                      </Button>
                    ) : (
                      <Button
                        key={t}
                        variant="outline"
                        className="text-[#c24742] border-[#c24742] px-4 py-2 text-base flex items-center gap-2"
                      >
                        <span>3:00 PM</span>{" "}
                        <span className="ml-2">🔔 Notify me</span>
                      </Button>
                    )
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full flex gap-2 items-center justify-center text-base font-semibold"
              >
                <span className="text-xl">🍽️</span> Additional sitting options
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
