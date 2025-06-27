"use client";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { EVENT_TYPES, logEvent } from "@/components/library/events";
import Cookies from 'js-cookie';
import dayjs from "dayjs";


const countries = [
  { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "BD", name: "Bangladesh", dial: "+880", flag: "🇧🇩" },
  { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
  { code: "EG", name: "Egypt", dial: "+20", flag: "🇪🇬" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", dial: "+62", flag: "🇮🇩" },
  { code: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
  { code: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽" },
  { code: "MY", name: "Malaysia", dial: "+60", flag: "🇲🇾" },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { code: "NL", name: "Netherlands", dial: "+31", flag: "🇳🇱" },
  { code: "PK", name: "Pakistan", dial: "+92", flag: "🇵🇰" },
  { code: "PH", name: "Philippines", dial: "+63", flag: "🇵🇭" },
  { code: "PL", name: "Poland", dial: "+48", flag: "🇵🇱" },
  { code: "RU", name: "Russia", dial: "+7", flag: "🇷🇺" },
  { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { code: "KR", name: "South Korea", dial: "+82", flag: "🇰🇷" },
  { code: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
  { code: "SE", name: "Sweden", dial: "+46", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", dial: "+41", flag: "🇨🇭" },
  { code: "TH", name: "Thailand", dial: "+66", flag: "🇹🇭" },
  { code: "TR", name: "Turkey", dial: "+90", flag: "🇹🇷" },
  { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "VN", name: "Vietnam", dial: "+84", flag: "🇻🇳" },
];
const photos = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2",
];

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
    photos,
  };
}

const reservationTime = Cookies.get("reservation_time");
const reservationPeople = Cookies.get("reservation_people");

export default function Page() {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
const [time, setTime] = useState("1:00 PM");
const [people, setPeople] = useState(2);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [occasion, setOccasion] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [reservationTime, setReservationTime] = useState<string | null>(null);
  const [reservationPeople, setReservationPeople] = useState<string | null>(null);
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  
  
  useEffect(() => {
    const savedDate = Cookies.get("reservation_date");
    const savedTime = Cookies.get("reservation_time");
    const savedPeople = Cookies.get("reservation_people");
  
    if (savedDate) {
      const d = new Date(savedDate);
      setDate(d);
      setFormattedDate(dayjs(d).format("MMM D"));
    } else {
      const now = new Date();
      setDate(now);
      setFormattedDate(dayjs(now).format("MMM D"));
    }
  
    if (savedTime) setReservationTime(savedTime);
    if (savedPeople) setReservationPeople(savedPeople);
  }, []);
  
  
  const [email, setEmail] = useState("user_name@gmail.com");
  const params = useParams();
  const search = useSearchParams();
  const restaurantId = params.restaurantId as string;
  // const restaurantName = restaurantNames[restaurantId] || restaurantId;
  // const imageUrl = restaurantImgs[restaurantId] || restaurantImgs["royal-dine"];
  const data = restaurantData[restaurantId] || restaurantData["restaurant-1"];



  const handleReservation = () => {
    if (!phoneNumber.trim()) {
      setPhoneError(true);
      return;
    }
  
    setPhoneError(false);
    logEvent(EVENT_TYPES.RESERVATION_COMPLETE, {
      restaurantId,
      date: formattedDate,
      time: reservationTime,
      people: reservationPeople,
      countryCode: selectedCountry.code,
      countryName: selectedCountry.name,
      phoneNumber,
      occasion,
      specialRequest,
      email,
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  
    setPhoneNumber("");
    setOccasion("");
    setSpecialRequest("");
    setSelectedCountry(countries[0]);
  };

  return (
    <main suppressHydrationWarning>
      <nav className="w-full border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-20 px-4 gap-2">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="bg-[#46a758] px-3 py-1 rounded flex items-center h-9">
                <span className="font-bold text-white text-lg">
                  AutoDining
                </span>
              </div>
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <input
              type="text"
              placeholder="Location, Restaurant, or Cuisine"
              className="rounded p-2 min-w-[250px] border border-gray-300"
              disabled
            />
            <button className="ml-2 px-4 py-2 rounded bg-[#46a758] text-white">
              Let's go
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Link
              className="text-sm text-gray-600 hover:text-[#46a758]"
              href="/help"
            >
              Get help
            </Link>
            <Link
              className="text-sm text-gray-600 hover:text-[#46a758]"
              href="/faqs"
            >
              FAQs
            </Link>
          </div>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 pb-10 pt-4">
        <h2 className="font-bold text-lg mt-8 mb-4">You’re almost done!</h2>
        <div className="flex items-center gap-3 mb-6">
          <img
               src={data.image}
               alt={data.name}
            className="w-16 h-16 rounded-lg object-cover border"
          />
          <div className="flex flex-col gap-[2px]">
            <span className="font-bold text-2xl">{data.name}</span>
            <div className="flex items-center gap-5 text-gray-700 mt-1 text-[15px]">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <p>{formattedDate ? formattedDate : "Select Date"}</p>
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4 mr-1" />
                {reservationTime ? reservationTime:"Select Time"}
              </span>
              <span className="flex items-center gap-1">
                <UserIcon className="w-4 h-4 mr-1" />{reservationPeople? reservationPeople: "Select"} people
              </span>
            </div>
          </div>
        </div>
        <h3 className="font-semibold text-lg mb-2 mt-4">Diner details</h3>
        <div className="flex gap-2 mb-3 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center space-x-2">
              <select
                className="border px-2 py-2 rounded-l bg-white cursor-pointer text-lg"
                value={selectedCountry.code}
                onChange={(e) => {
                  const country = countries.find(
                    (c) => c.code === e.target.value
                  )!;
                  setSelectedCountry(country);
                  logEvent(EVENT_TYPES.COUNTRY_SELECTED, {
                    countryCode: country.code,
                    countryName: country.name,
                  });
                }}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.dial}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Phone number"
                className="border border-l-0 px-3 py-2 w-full rounded-r focus:outline-none"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (e.target.value.trim()) setPhoneError(false);
                }}
              />
            </div>
            {phoneError && (
              <p className="text-red-500 text-sm mt-1 ml-1">
                Phone number is required.
              </p>
            )}
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border px-3 py-2 rounded min-w-[220px] bg-gray-100 text-gray-800"
            disabled
          />
        </div>
        <div className="flex gap-2 mb-4 flex-wrap">
          <select
            className="flex-1 border rounded px-3 py-2 bg-white min-w-[220px]"
            value={occasion}
            onChange={(e) => {
              setOccasion(e.target.value);
              logEvent(EVENT_TYPES.OCCASION_SELECTED, {
                occasion: e.target.value,
              });
            }}
          >
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
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
          />
        </div>
        <Button
          onClick={handleReservation}
          className="w-full bg-[#46a758] hover:bg-[#a43a32] text-white py-6 mt-1 mb-4 text-lg rounded"
        >
          Complete reservation
        </Button>
        <div className="text-xs text-gray-600 mt-3">
          By clicking “Complete reservation” you agree to the{" "}
          <Link href="#" className="text-[#46a758] underline">
            OpenDinning Terms of Use
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-[#46a758] underline">
            Privacy Policy
          </Link>
          . Message & data rates may apply. You can opt out of receiving text
          messages at any time in your account settings or by replying STOP.
        </div>
      </div>
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-20 py-5 rounded shadow-lg z-50">
          Reservation completed successfully!
        </div>
      )}
    </main>
  );
}
