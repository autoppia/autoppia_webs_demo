"use client";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { EVENT_TYPES, logEvent } from "@/components/library/events";

const restaurantImgs: Record<string, string> = {
  "royal-dine": "https://ext.same-assets.com/3952155396/849522504.jpeg",
  "vintage-bites": "https://ext.same-assets.com/3952155396/849522504.jpeg",
  "evening-delight": "https://ext.same-assets.com/3952155396/849522504.jpeg",
  "river-view-cafe": "https://ext.same-assets.com/3952155396/849522504.jpeg",
  "fancy-lights-bistro":
    "https://ext.same-assets.com/3952155396/849522504.jpeg",
};

const restaurantNames: Record<string, string> = {
  "royal-dine": "The Royal Dine",
  "vintage-bites": "Vintage Bites",
  "evening-delight": "Evening Delight",
  "river-view-cafe": "River View Café",
  "fancy-lights-bistro": "Fancy Lights Bistro",
};
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

export default function Page() {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeople, setSelectedPeople] = useState("2 people");
  const [selectedDate, setSelectedDate] = useState("Jul 18");
  const [selectedTime, setSelectedTime] = useState("1:30 PM");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [occasion, setOccasion] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [email, setEmail] = useState("user_name@gmail.com");
  const params = useParams();
  const search = useSearchParams();
  const restaurantId = params.restaurantId as string;
  const restaurantName = restaurantNames[restaurantId] || restaurantId;
  const imageUrl = restaurantImgs[restaurantId] || restaurantImgs["royal-dine"];

  const handleReservation = () => {
    if (!phoneNumber.trim()) {
      setPhoneError(true);
      return;
    }

    setPhoneError(false); // clear on valid submit
    logEvent(EVENT_TYPES.RESERVATION_COMPLETE, {
      restaurantId,
      date: selectedDate,
      time: selectedTime,
      people: selectedPeople,
      countryCode: selectedCountry.code,
      countryName: selectedCountry.name,
      phoneNumber,
      occasion,
      specialRequest,
      email
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000); // hide after 3s

    // Reset form values
    setPhoneNumber("");
    setOccasion("");
    setSpecialRequest("");
    setSelectedCountry(countries[0]);
  };

  return (
    <main>
      <nav className="w-full border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-20 px-4 gap-2">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="bg-[#c24742] px-3 py-1 rounded flex items-center h-9">
                <span className="font-bold text-white text-lg">
                  DINING-HOURS
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
            <button className="ml-2 px-4 py-2 rounded bg-[#c24742] text-white">
              Let's go
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Link
              className="text-sm text-gray-600 hover:text-[#c24742]"
              href="/help"
            >
              Get help
            </Link>
            <Link
              className="text-sm text-gray-600 hover:text-[#c24742]"
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
            src={imageUrl}
            alt={restaurantName}
            className="w-16 h-16 rounded-lg object-cover border"
          />
          <div className="flex flex-col gap-[2px]">
            <span className="font-bold text-2xl">{restaurantName}</span>
            <div className="flex items-center gap-5 text-gray-700 mt-1 text-[15px]">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <p>July 18</p>
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4 mr-1" />
                18:00
              </span>
              <span className="flex items-center gap-1">
                <UserIcon className="w-4 h-4 mr-1" />2 people
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
          className="w-full bg-[#c24742] hover:bg-[#a43a32] text-white py-6 mt-1 mb-4 text-lg rounded"
        >
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
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-20 py-5 rounded shadow-lg z-50">
          Reservation completed successfully!
        </div>
      )}
    </main>
  );
}
