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
import { EVENT_TYPES, logEvent } from "@/components/library/events";

const restaurantData: Record<string, {
  name: string;
  image: string;
  rating: number;
  reviews: number;
  bookings: number;
  price: string;
  cuisine: string;
  tags: string[];
  desc: string;
  photos: string[];
}> = {};

const namePool = [
  "The Royal Dine", "Vintage Bites", "Evening Delight", "River View Café", "Fancy Lights Bistro",
  "Urban Palate", "Tandoori House", "Zen Sushi", "El Toro", "Bella Vita",
  "Coastal Catch", "Harvest Table", "Crimson Spoon", "Golden Lotus", "The Hungry Fork",
  "Ocean's Plate", "Fire & Spice", "Olive & Vine", "La Bella Cucina", "Sunset Grill",
  "Noir Brasserie", "Blue Orchid", "Saffron Garden", "Rustic Roots", "Amber Lounge",
  "Bistro Lumière", "Maple Hearth", "Oak & Ember", "Peppercorn Place", "The Local Dish",
  "Cedar Grove Café", "Soleil Bistro", "Brickhouse Eats", "Wanderlust Grill", "The Nest",
  "Cafe Verona", "Midtown Meals", "Ginger & Thyme", "Lavender & Sage", "Hearthstone Inn",
  "Juniper Table", "The Garden Fork", "Twilight Tapas", "Meadow & Moor", "The Vine",
  "Ember Flame", "Miso Modern", "The Borough", "Copper Kitchen", "Pine & Poppy"
];

const cuisines = ["French", "Italian", "American", "Japanese", "Mexican", "Indian", "Thai", "Café", "Mediterranean"];
const areas = ["Mission District", "SOMA", "North Beach", "Downtown", "Hayes Valley", "Nob Hill", "Japantown", "Embarcadero", "Marina"];
const staticReviews = [18, 22, 35, 47, 53, 62, 71, 28, 39, 44, 55, 66, 72, 80, 91, 24, 31, 42, 48, 60, 70, 15, 33, 45, 59, 63, 76, 81, 95, 38, 49, 51, 58, 64, 77, 82, 87, 90, 96, 99, 19, 26, 29, 36, 46, 54, 61, 73, 85, 88];
const staticBookings = [6, 12, 17, 23, 27, 32, 37, 40, 43, 50, 57, 65, 67, 69, 74, 79, 84, 86, 89, 92, 94, 97, 98, 100, 13, 14, 16, 20, 21, 25, 30, 34, 41, 52, 56, 68, 75, 78, 83, 93, 7, 8, 9, 10, 11, 35, 38, 60, 70, 90];
const staticStars = [3, 4, 5, 4, 5, 3, 4, 5, 3, 4, 3, 5, 4, 5, 3, 4, 5, 3, 4, 5, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 4, 5, 3, 4, 5, 3, 4, 5, 4, 3, 4, 5, 3, 4, 5, 3, 4, 5, 4];
const staticPrices = ["$$", "$$$", "$$$$", "$$", "$$$", "$$$$", "$$", "$$$", "$$$$", "$$", "$$$", "$$$$", "$$", "$$$", "$$$$", "$$", "$$$", "$$$$", "$$", "$$$", "$$$$", "$$", "$$$", "$$$$", "$$", "$$$", "$$$$", "$$", "$$$", "$$$$", "$$", "$$$", "$$$$", "$$", "$$$", "$$$$", "$$", "$$$", "$$$$", "$$", "$$$", "$$$$", "$$", "$$$", "$$$$", "$$", "$$$", "$$$$", "$$", "$$$"];

const photos = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2",
];

for (let i = 0; i < 50; i++) {
  const id = `restaurant-${i + 1}`;
  restaurantData[id] = {
    name: namePool[i],
    image: `/images/restaurant${(i % 19) + 1}.jpg`,
    rating: staticStars[i],
    reviews: staticReviews[i],
    bookings: staticBookings[i],
    price: staticPrices[i],
    cuisine: cuisines[i % cuisines.length],
    tags: ["cozy", "modern", "casual"],
    desc: `Enjoy a delightful experience at ${namePool[i]}, offering a fusion of flavors in the heart of ${areas[i % areas.length]}.`,
    photos: photos,
  };
}


export default function RestaurantPage() {
  const params = useParams();
  const id = params.restaurantId as string;
  const r = restaurantData[id] || restaurantData["vintage-bites"];
  const [people, setPeople] = useState();
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState();
  const [showFullMenu, setShowFullMenu] = useState(false);

  const formattedDate = format(date, "yyyy-MM-dd");

  const handleToggleMenu = () => {
    const newState = !showFullMenu;
    setShowFullMenu(newState);

    logEvent(newState ? EVENT_TYPES.VIEW_FULL_MENU : EVENT_TYPES.COLLAPSE_MENU, {
      restaurantId: id,
      restaurantName: r.name,
      action: newState ? "view_full_menu" : "collapse_menu",
      time,
      date: formattedDate,
      people,
      menu: newState ? [
        { category: "Mains", items: [
          { name: "Coq au Vin", price: "$26.00" },
          { name: "Ratatouille", price: "$20.00" }
        ] }
      ] : [],
    });
  };

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
            <span className="flex items-center text-[#46a758] text-xl font-semibold">
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
              <button className="border-b-2 border-[#46a758] text-[#46a758] font-semibold px-4 py-2 -mb-px bg-white">
                Main Menu
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <div className="font-bold text-lg mb-3">Starters</div>
                <div className="grid grid-cols-2 gap-y-2">
                  <div>
                    <div className="font-semibold">Cheese Board</div>
                    <div className="text-sm text-gray-600">assorted artisan cheeses</div>
                  </div>
                  <div className="text-right font-bold">$14.00</div>

                  <div>
                    <div className="font-semibold">Smoked Salmon Tartine</div>
                    <div className="text-sm text-gray-600">capers, crème fraîche</div>
                  </div>
                  <div className="text-right font-bold">$12.00</div>

                  <div>
                    <div className="font-semibold">Escargot</div>
                    <div className="text-sm text-gray-600">with garlic butter</div>
                  </div>
                  <div className="text-right font-bold">$16.00</div>
                </div>
              </div>
              {showFullMenu && (
                <div>
                  <div className="font-bold text-lg mb-3">Mains</div>
                  <div className="grid grid-cols-2 gap-y-2">
                    <div className="font-semibold">Coq au Vin</div>
                    <div className="text-right font-bold">$26.00</div>
                    <div className="font-semibold">Ratatouille</div>
                    <div className="text-right font-bold">$20.00</div>
                  </div>
                </div>
              )}
              <div className="flex justify-center my-7">
                <Button
                  className="border px-10 py-3 text-lg rounded font-semibold bg-white hover:bg-gray-50 text-black"
                  onClick={handleToggleMenu}
                >
                  {showFullMenu ? "Collapse menu" : "View full menu"}
                </Button>
              </div>
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
                      className={`block h-3 rounded bg-[#46a758]`}
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
                        className="bg-[#46a758] hover:bg-[#357040] text-white font-semibold px-4 py-2 text-base"
                      >
                        {t}
                      </Button>
                    ) : (
                      <Button
                        key={t}
                        variant="outline"
                        className="text-[#46a758] border-[#46a758] px-4 py-2 text-base flex items-center gap-2"
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
