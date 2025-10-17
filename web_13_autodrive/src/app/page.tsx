"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EVENT_TYPES, logEvent, EventType } from "@/library/event";
import DynamicLayout from "@/components/DynamicLayout";
import SiteElements from "@/components/SiteElements";

const SUGGESTIONS = [
  "1 Hotel San Francisco - 8 Mission St, San Francisco, CA 94105, USA",
  "100 Van Ness - 100 Van Ness Ave, San Francisco, CA 94102, USA",
  "1000 Chestnut Street Apartments - 1000 Chestnut St, San Francisco, CA 94109, USA",
  "1001 Castro Street - 1001 Castro St, San Francisco, CA 94114, USA",
    "The Ritz-Carlton - 600 Stockton St, San Francisco, CA 94108, USA",
    "Fairmont San Francisco - 950 Mason St, San Francisco, CA 94108, USA",
    "Hotel Nikko - 222 Mason St, San Francisco, CA 94102, USA",
    "Palace Hotel - 2 New Montgomery St, San Francisco, CA 94105, USA",
    "InterContinental San Francisco - 888 Howard St, San Francisco, CA 94103, USA",
    "Hotel Zephyr - 250 Beach St, San Francisco, CA 94133, USA",
    "Hotel Zoe Fisherman's Wharf - 425 North Point St, San Francisco, CA 94133, USA",
    "The Clift Royal Sonesta Hotel - 495 Geary St, San Francisco, CA 94102, USA",
    "The Marker San Francisco - 501 Geary St, San Francisco, CA 94102, USA",
    "Hilton San Francisco Union Square - 333 O'Farrell St, San Francisco, CA 94102, USA",
    "Parc 55 San Francisco - 55 Cyril Magnin St, San Francisco, CA 94102, USA",
    "Hotel Kabuki - 1625 Post St, San Francisco, CA 94115, USA",
    "Hotel G San Francisco - 386 Geary St, San Francisco, CA 94102, USA",
    "The Westin St. Francis - 335 Powell St, San Francisco, CA 94102, USA",
    "Hotel Vitale - 8 Mission St, San Francisco, CA 94105, USA",
    "Argonaut Hotel - 495 Jefferson St, San Francisco, CA 94109, USA",
    "Hotel Emblem - 562 Sutter St, San Francisco, CA 94102, USA",
    "Hotel Triton - 342 Grant Ave, San Francisco, CA 94108, USA",
    "Hotel North Beach - 935 Kearny St, San Francisco, CA 94133, USA",
    "Hotel Spero - 405 Taylor St, San Francisco, CA 94102, USA",
    "Hotel Caza - 1300 Columbus Ave, San Francisco, CA 94133, USA",
    "The Donatello - 501 Post St, San Francisco, CA 94102, USA",
    "Hotel Abri - 127 Ellis St, San Francisco, CA 94102, USA",
    "Hotel Fusion - 140 Ellis St, San Francisco, CA 94102, USA",
    "Hotel Whitcomb - 1231 Market St, San Francisco, CA 94103, USA",
    "Hotel Majestic - 1500 Sutter St, San Francisco, CA 94109, USA",

];

function AutocompleteInput({
  placeholder,
  icon,
  value,
  setValue,
  eventType,
}: {
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  setValue: (v: string) => void;
  eventType: EventType;
}) {
  const [show, setShow] = useState(false);
  const options = SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase())
  );
  return (
    <div className="relative w-full">
      <div className="flex items-center w-full bg-white border border-gray-200 rounded-md focus-within:border-[#2095d2] transition">
        <span className="pl-3 pr-2 text-lg text-gray-400 flex items-center">
          {icon}
        </span>
        <input
          className="flex-1 px-0 py-3 bg-transparent border-none focus:outline-none text-base placeholder:text-gray-400"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShow(true);
            console.log(`🔍 Input "${placeholder}" changed:`, { 
              eventType, 
              value: e.target.value
            });
            
            // Log the enter event (existing functionality)
            logEvent(eventType, { 
              value: e.target.value,
              inputType: placeholder.toLowerCase().includes('location') ? 'location' : 'destination',
              timestamp: new Date().toISOString()
            });
            
            // Log search event when user types (new functionality)
            if (e.target.value.trim()) {
              const searchEventType = placeholder.toLowerCase().includes('location') 
                ? EVENT_TYPES.SEARCH_LOCATION 
                : EVENT_TYPES.SEARCH_DESTINATION;
              
              logEvent(searchEventType, { 
                value: e.target.value,
                inputType: placeholder.toLowerCase().includes('location') ? 'location' : 'destination',
                timestamp: new Date().toISOString(),
                searchType: 'typing'
              });
            }
          }}
          onFocus={() => setShow(true)}
          onBlur={() => setTimeout(() => setShow(false), 120)}
        />
        <span className="px-3 text-gray-400">
          <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
            <path
              fill="currentColor"
              d="M15.54 14.13l-3.65-3.65a5.24 5.24 0 0 0 1.03-3.13 5.25 5.25 0 1 0-5.25 5.25c1.15 0 2.22-.39 3.13-1.03l3.65 3.65a.75.75 0 1 0 1.06-1.06zm-9.29-3.63a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0z"
            />
          </svg>
        </span>
      </div>
      {show && (
        <div className="absolute left-0 right-0 bg-white shadow-lg rounded-b-md py-2 mt-1 z-20 border border-t-0 border-gray-200">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-gray-500 text-sm">No results</div>
          ) : (
            options.map((s, i) => (
              <button
                type="button"
                key={s}
                className="flex items-center text-left w-full px-4 py-2 hover:bg-gray-100 transition text-sm text-gray-800"
                onMouseDown={(e) => {
                  e.preventDefault();
                  console.log(`🎯 Dropdown option selected for "${placeholder}":`, { eventType, value: s });
                  setValue(s);
                  setShow(false);
                  logEvent(eventType, { 
                    value: s,
                    inputType: placeholder.toLowerCase().includes('location') ? 'location' : 'destination',
                    selectionMethod: 'dropdown',
                    timestamp: new Date().toISOString()
                  });
                  console.log(`✅ logEvent called for dropdown selection "${placeholder}"`);
                }}
              >
                <span className="mr-2 text-gray-400">{icon}</span>
                <span>{s}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ProfileDropdown({
  open,
  setOpen,
  router,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  router: ReturnType<typeof useRouter>;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}>
      <div
        className="absolute right-4 top-14 min-w-[340px] max-w-[98vw] bg-white rounded-2xl shadow-2xl py-4 px-1 z-50 flex flex-col select-none"
        style={{ boxShadow: "0 6px 32px rgba(0,0,0,.22)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pb-3 flex items-center border-b">
          <div className="flex-1">
            <div className="text-xl font-bold">Federico Lopez</div>
            <div className="flex items-center text-sm text-gray-600 gap-1 mt-1">
              <span className="text-[#FBBF24] text-[16px] mr-0.5">★</span>4.89 •
              Uber One
            </div>
          </div>
          <span className="rounded-full bg-gray-100 w-[44px] h-[44px] flex items-center justify-center ml-1">
            <svg width="26" height="26" fill="none" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" stroke="#bbb" strokeWidth="2" />
              <ellipse cx="10" cy="8" rx="3.1" ry="3.2" fill="#ececec" />
              <ellipse cx="10" cy="18" rx="5" ry="4" fill="#ececec" />
            </svg>
          </span>
        </div>
        <div className="flex gap-3 px-4 py-4">
          <button
            className="flex flex-col items-center justify-center w-20 cursor-pointer"
            onClick={() => {
              setOpen(false);
              router.push("/help");
            }}
          >
            <span className="rounded bg-gray-100 w-[38px] h-[38px] shadow flex items-center justify-center mb-1">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="#444" strokeWidth="2" />
                <path d="M12 8v4l2.3 2.3" stroke="#444" strokeWidth="1.4" />
              </svg>
            </span>
            <span className="text-xs font-medium text-black">Help</span>
          </button>
          <button
            className="flex flex-col items-center justify-center w-20 cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <span className="rounded bg-gray-100 w-[38px] h-[38px] shadow flex items-center justify-center mb-1">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <rect width="20" height="14" x="2" y="5" rx="4" fill="#111" />
                <rect width="5" height="8" x="5" y="8" rx="2.5" fill="#fff" />
              </svg>
            </span>
            <span className="text-xs font-medium text-black">Wallet</span>
          </button>
          <button
            className="flex flex-col items-center justify-center w-20 cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <span className="rounded bg-gray-100 w-[38px] h-[38px] shadow flex items-center justify-center mb-1">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <rect
                  width="18"
                  height="18"
                  x="3"
                  y="3"
                  rx="4"
                  fill="#f3f3f3"
                />
                <rect width="10" height="4" x="7" y="8" rx="2" fill="#333" />
              </svg>
            </span>
            <span className="text-xs font-medium text-black">Activity</span>
          </button>
        </div>
        <div className="flex flex-col divide-y">
          <button
            className="flex items-center px-5 py-3 gap-3 hover:bg-gray-100 text-[16px] font-medium"
            onClick={() => setOpen(false)}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" stroke="#444" strokeWidth="2" />
              <ellipse cx="10" cy="8" rx="3.1" ry="3.2" fill="#ececec" />
              <ellipse cx="10" cy="18" rx="5" ry="4" fill="#ececec" />
            </svg>{" "}
            Manage account
          </button>
          <button
            className="flex items-center px-5 py-3 gap-3 hover:bg-gray-100 text-[16px] font-medium"
            onClick={() => {
              setOpen(false);
              router.push("/ride/trip");
            }}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
              <rect x="4" y="4" width="12" height="12" rx="6" fill="#222" />
              <path
                d="M10 7v3l2 2"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>{" "}
            Ride
          </button>
          <button
            className="flex items-center px-5 py-3 gap-3 hover:bg-gray-100 text-[16px] font-medium"
            onClick={() => setOpen(false)}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
              <rect x="5" y="7" width="10" height="6" rx="2" fill="#222" />
              <path d="M10 3v4M10 13v4" stroke="#222" strokeWidth="1.5" />
            </svg>{" "}
            Drive & deliver
          </button>
          <button
            className="flex items-center px-5 py-3 gap-3 hover:bg-gray-100 text-[16px] font-medium"
            onClick={() => setOpen(false)}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <rect width="18" height="14" x="3" y="7" rx="4" fill="#fff" />
              <rect width="5" height="8" x="5" y="10" rx="2.5" fill="#111" />
            </svg>{" "}
            Uber for Business
          </button>
        </div>
        <div className="mt-3 px-5">
          <button className="w-full bg-gray-100 rounded-lg py-3 text-base font-semibold text-red-600 hover:bg-gray-200 mt-2 mb-1">
            Sing Out
          </button>
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);

  // Header component
  const header = (
    <header className="bg-white shadow-md w-full sticky top-0 z-20">
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-2 px-4">
        <div
          className="font-bold text-xl tracking-tight text-[#2095d2] cursor-pointer hover:opacity-80 transition"
          onClick={() => router.push("/")}
        >
          AutoDriver
        </div>
        <ul className="hidden md:flex space-x-6">
          <li>
            <button
              className="hover:text-[#2095d2] transition"
              onClick={() => router.push("/ride/trip")}
            >
              Ride
            </button>
          </li>
          <li>
            <Link href="#" className="hover:text-[#2095d2] transition">
              Drive
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-[#2095d2] transition">
              Business
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-[#2095d2] transition">
              AutoDriver Eats
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-[#2095d2] transition">
              About
            </Link>
          </li>
        </ul>
        <div className="flex items-center space-x-2">
          <Link
            href="#"
            className="px-3 py-1 text-sm rounded hover:bg-gray-100 transition hidden md:block"
          >
            ES
          </Link>
          <Link
            href="/help"
            className="px-3 py-1 text-sm rounded hover:bg-gray-100 transition hidden md:block"
          >
            Help
          </Link>
          <button
            className="bg-[#2095d2] text-white text-sm px-4 py-1 rounded-md font-semibold shadow hover:bg-[#1273a0] transition relative"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            Federico
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 18 18"
              className="inline-block ml-2"
            >
              <path d="M6 8l3 3 3-3" stroke="#fff" strokeWidth="2.1" />
            </svg>
          </button>
          <ProfileDropdown
            open={profileOpen}
            setOpen={setProfileOpen}
            router={router}
          />
        </div>
      </nav>
    </header>
  );

  // Hero section component
  const hero = (
    <section className="flex flex-col md:flex-row items-center justify-center min-h-[calc(100vh-80px)] px-4 max-w-7xl mx-auto w-full gap-10">
      {/* Hero text and form */}
      <div className="flex-1 flex flex-col items-center md:items-start justify-center z-10">
        <h1 className="font-extrabold text-4xl md:text-5xl mb-2 text-[#2095d2] text-center md:text-left drop-shadow">
          Go anywhere with AutoDriver
        </h1>
        <h2 className="text-2xl md:text-3xl mb-7 text-gray-900 text-center md:text-left font-medium">
          Your ride, your way.
          <br className="hidden md:inline" /> Request, explore, arrive.
        </h2>
        <div className="w-full max-w-md mx-auto md:mx-0 mt-2 bg-white rounded-xl shadow-md p-6 flex flex-col space-y-4 mb-8 border border-gray-100">
          <button
            className="bg-[#2095d2] text-white px-6 py-4 rounded-md font-bold text-xl hover:bg-[#1273a0] transition shadow-lg"
            onClick={() => {
              console.log("Logging GET_TRIP_CLICK");
              logEvent(EVENT_TYPES.SEE_PRICES, { 
                timestamp: new Date().toISOString(),
                sourcePage: 'home',
                buttonType: 'get_trip',
                action: 'navigate_to_trip_form'
              });
              router.push("/ride/trip");
            }}
          >
            Get a Trip
          </button>
        </div>
      </div>
      {/* Car image */}
      <div className="flex-1 flex items-center justify-center z-0">
        <img
          src="/dashboard.jpg"
          alt="Car"
          className="w-[22rem] h-64 md:w-[36rem] md:h-[22rem] object-contain drop-shadow-xl"
        />
      </div>
    </section>
  );

  // Booking section component (placeholder for now)
  const booking = (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md p-6 flex flex-col space-y-4 border border-gray-100">
      <h3 className="text-lg font-semibold mb-3">Quick Booking</h3>
      <button
        className="bg-[#2095d2] text-white px-6 py-3 rounded-md font-bold hover:bg-[#1273a0] transition"
        onClick={() => {
          logEvent(EVENT_TYPES.EXPLORE_FEATURES, { 
            timestamp: new Date().toISOString(),
            sourcePage: 'home',
            feature: 'quick_booking'
          });
          router.push("/ride/trip");
        }}
      >
        Book Now
      </button>
    </div>
  );

  // Map section component (placeholder for now)
  const map = (
    <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-gray-500">Map View</div>
    </div>
  );

  // Rides section component (placeholder for now)
  const rides = (
    <div className="w-full bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h3 className="text-lg font-semibold mb-3">Available Rides</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span>AutoDriverX</span>
          <span className="font-bold text-[#2095d2]">$26.60</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span>Comfort</span>
          <span className="font-bold text-[#2095d2]">$31.50</span>
        </div>
      </div>
    </div>
  );

  // Footer component (placeholder for now)
  const footer = (
    <footer className="bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto text-center text-gray-600">
        <p>&copy; 2024 AutoDriver. All rights reserved.</p>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#eaf6fd] via-[#f5fbfc] to-[#eaf6fd] overflow-x-hidden">
      <DynamicLayout
        header={header}
        main={
          <SiteElements>
            {{
              header,
              hero,
              booking,
              map,
              rides,
              footer
            }}
          </SiteElements>
        }
        footer={footer}
      />
    </div>
  );
}

export default function Home() {
  // In the future, logic can be added here to decide which page to show.
  return <HomePage />;
}
