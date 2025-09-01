"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import RideNavbar from "../../../components/RideNavbar";
import { EVENT_TYPES, logEvent } from "@/library/event";

// const PLACES = [
//   {
//     label: "1 Hotel San Francisco - 8 Mission St, San Francisco, CA 94105, USA",
//     main: "1 Hotel San Francisco",
//     sub: "8 Mission St, San Francisco, CA 94105, USA",
//   },
//   {
//     label: "100 Van Ness - 100 Van Ness Ave, San Francisco, CA 94102, USA",
//     main: "100 Van Ness",
//     sub: "100 Van Ness Ave, San Francisco, CA 94102, USA",
//   },
//   {
//     label:
//       "1000 Chestnut Street Apartments - 1000 Chestnut St, San Francisco, CA 94109, USA",
//     main: "1000 Chestnut Street Apartments",
//     sub: "1000 Chestnut St, San Francisco, CA 94109, USA",
//   },
//   {
//     label:
//       "1030 Post Street Apartments - 1030 Post St #112, San Francisco, CA 94109, USA",
//     main: "1030 Post Street Apartments",
//     sub: "1030 Post St #112, San Francisco, CA 94109, USA",
//   },
// ];
const PLACES = [
    {
        "label": "1 Hotel San Francisco - 8 Mission St, San Francisco, CA 94105, USA",
        "main": "1 Hotel San Francisco",
        "sub": "8 Mission St, San Francisco, CA 94105, USA",
    },
    {
        "label": "100 Van Ness - 100 Van Ness Ave, San Francisco, CA 94102, USA",
        "main": "100 Van Ness",
        "sub": "100 Van Ness Ave, San Francisco, CA 94102, USA",
    },
    {
        "label": "1000 Chestnut Street Apartments - 1000 Chestnut St, San Francisco, CA 94109, USA",
        "main": "1000 Chestnut Street Apartments",
        "sub": "1000 Chestnut St, San Francisco, CA 94109, USA",
    },
    {
        "label": "1030 Post Street Apartments - 1030 Post St #112, San Francisco, CA 94109, USA",
        "main": "1030 Post Street Apartments",
        "sub": "1030 Post St #112, San Francisco, CA 94109, USA",
    },
    {
        "label": "The Ritz-Carlton - 600 Stockton St, San Francisco, CA 94108, USA",
        "main": "The Ritz-Carlton",
        "sub": "600 Stockton St, San Francisco, CA 94108, USA",
    },
    {
        "label": "Fairmont San Francisco - 950 Mason St, San Francisco, CA 94108, USA",
        "main": "Fairmont San Francisco",
        "sub": "950 Mason St, San Francisco, CA 94108, USA",
    },
    {
        "label": "Hotel Nikko - 222 Mason St, San Francisco, CA 94102, USA",
        "main": "Hotel Nikko",
        "sub": "222 Mason St, San Francisco, CA 94102, USA",
    },
    {
        "label": "Palace Hotel - 2 New Montgomery St, San Francisco, CA 94105, USA",
        "main": "Palace Hotel",
        "sub": "2 New Montgomery St, San Francisco, CA 94105, USA",
    },
    {
        "label": "InterContinental San Francisco - 888 Howard St, San Francisco, CA 94103, USA",
        "main": "InterContinental San Francisco",
        "sub": "888 Howard St, San Francisco, CA 94103, USA",
    },
    {
        "label": "Hotel Zephyr - 250 Beach St, San Francisco, CA 94133, USA",
        "main": "Hotel Zephyr",
        "sub": "250 Beach St, San Francisco, CA 94133, USA",
    },
    {
        "label": "Hotel Zoe Fisherman’s Wharf - 425 North Point St, San Francisco, CA 94133, USA",
        "main": "Hotel Zoe Fisherman’s Wharf",
        "sub": "425 North Point St, San Francisco, CA 94133, USA",
    },
    {
        "label": "The Clift Royal Sonesta Hotel - 495 Geary St, San Francisco, CA 94102, USA",
        "main": "The Clift Royal Sonesta Hotel",
        "sub": "495 Geary St, San Francisco, CA 94102, USA",
    },
    {
        "label": "The Marker San Francisco - 501 Geary St, San Francisco, CA 94102, USA",
        "main": "The Marker San Francisco",
        "sub": "501 Geary St, San Francisco, CA 94102, USA",
    },
    {
        "label": "Hilton San Francisco Union Square - 333 O'Farrell St, San Francisco, CA 94102, USA",
        "main": "Hilton San Francisco Union Square",
        "sub": "333 O'Farrell St, San Francisco, CA 94102, USA",
    },
    {
        "label": "Parc 55 San Francisco - 55 Cyril Magnin St, San Francisco, CA 94102, USA",
        "main": "Parc 55 San Francisco",
        "sub": "55 Cyril Magnin St, San Francisco, CA 94102, USA",
    },
    {
        "label": "Hotel Kabuki - 1625 Post St, San Francisco, CA 94115, USA",
        "main": "Hotel Kabuki",
        "sub": "1625 Post St, San Francisco, CA 94115, USA",
    },
    {
        "label": "Hotel G San Francisco - 386 Geary St, San Francisco, CA 94102, USA",
        "main": "Hotel G San Francisco",
        "sub": "386 Geary St, San Francisco, CA 94102, USA",
    },
    {
        "label": "The Westin St. Francis - 335 Powell St, San Francisco, CA 94102, USA",
        "main": "The Westin St. Francis",
        "sub": "335 Powell St, San Francisco, CA 94102, USA",
    },
    {
        "label": "Hotel Vitale - 8 Mission St, San Francisco, CA 94105, USA",
        "main": "Hotel Vitale",
        "sub": "8 Mission St, San Francisco, CA 94105, USA",
    },
    {
        "label": "Argonaut Hotel - 495 Jefferson St, San Francisco, CA 94109, USA",
        "main": "Argonaut Hotel",
        "sub": "495 Jefferson St, San Francisco, CA 94109, USA",
    },
    {
        "label": "Hotel Emblem - 562 Sutter St, San Francisco, CA 94102, USA",
        "main": "Hotel Emblem",
        "sub": "562 Sutter St, San Francisco, CA 94102, USA",
    },
    {
        "label": "Hotel Triton - 342 Grant Ave, San Francisco, CA 94108, USA",
        "main": "Hotel Triton",
        "sub": "342 Grant Ave, San Francisco, CA 94108, USA",
    },
    {
        "label": "Hotel North Beach - 935 Kearny St, San Francisco, CA 94133, USA",
        "main": "Hotel North Beach",
        "sub": "935 Kearny St, San Francisco, CA 94133, USA",
    },
    {
        "label": "Hotel Spero - 405 Taylor St, San Francisco, CA 94102, USA",
        "main": "Hotel Spero",
        "sub": "405 Taylor St, San Francisco, CA 94102, USA",
    },
    {
        "label": "Hotel Caza - 1300 Columbus Ave, San Francisco, CA 94133, USA",
        "main": "Hotel Caza",
        "sub": "1300 Columbus Ave, San Francisco, CA 94133, USA",
    },
    {
        "label": "The Donatello - 501 Post St, San Francisco, CA 94102, USA",
        "main": "The Donatello",
        "sub": "501 Post St, San Francisco, CA 94102, USA",
    },
    {
        "label": "Hotel Abri - 127 Ellis St, San Francisco, CA 94102, USA",
        "main": "Hotel Abri",
        "sub": "127 Ellis St, San Francisco, CA 94102, USA",
    },
    {
        "label": "Hotel Fusion - 140 Ellis St, San Francisco, CA 94102, USA",
        "main": "Hotel Fusion",
        "sub": "140 Ellis St, San Francisco, CA 94102, USA",
    },
    {
        "label": "Hotel Whitcomb - 1231 Market St, San Francisco, CA 94103, USA",
        "main": "Hotel Whitcomb",
        "sub": "1231 Market St, San Francisco, CA 94103, USA",
    },
    {
        "label": "Hotel Majestic - 1500 Sutter St, San Francisco, CA 94109, USA",
        "main": "Hotel Majestic",
        "sub": "1500 Sutter St, San Francisco, CA 94109, USA",
    },
];


function PlaceSelect({
  value,
  setValue,
  placeholder,
  open,
  setOpen,
}: {
  value: string | null;
  setValue: (x: string | null) => void;
  placeholder: string;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [inputWidth, setInputWidth] = useState<number | null>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, setOpen]);

  useEffect(() => {
    if (ref.current && open) {
      const width = ref.current.getBoundingClientRect().width;
      setInputWidth(width);
    }
  }, [open]);

  return (
    <div ref={ref} className="mb-3 w-full relative">
      <div
        className={`flex items-center px-3 py-2 rounded border bg-white shadow-sm focus-within:border-[#2095d2] cursor-pointer relative ${
          open ? "border-[#2095d2] ring-2 ring-[#2095d2]" : "border-gray-300"
        }`}
        onClick={() => {
          if (!isTyping) {
            setOpen(true);
          }
        }}
        tabIndex={0}
        style={{ paddingRight: 42 }}
      >
        <span className="text-gray-600 mr-2">
          <svg
            width="18"
            height="18"
            className=""
            fill="none"
            viewBox="0 0 20 20"
          >
            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="#2095d2"
              strokeWidth="2"
              fill="#e6f6fc"
            />
            <circle cx="10" cy="10" r="3" fill="#2095d2" />
          </svg>
        </span>
        <input
          value={isTyping ? searchValue : (value ? value : "")}
          readOnly={!isTyping}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none text-[16px] placeholder:text-gray-400 pr-8"
          style={{ paddingRight: 32 }}
          onFocus={() => {
            if (!isTyping) {
              setIsTyping(true);
              setSearchValue("");
            }
            // Log enter event when user focuses on input
            const enterEventType = placeholder.toLowerCase().includes('pickup') 
              ? EVENT_TYPES.ENTER_LOCATION 
              : EVENT_TYPES.ENTER_DESTINATION;
            
            logEvent(enterEventType, { 
              inputType: placeholder.toLowerCase().includes('pickup') ? 'location' : 'destination',
              timestamp: new Date().toISOString(),
              page: 'trip_form',
              action: 'focus'
            });
          }}
          onBlur={() => {
            // Delay to allow for dropdown selection
            setTimeout(() => {
              if (!open) {
                setIsTyping(false);
                setSearchValue("");
              }
            }, 200);
          }}
          onChange={(e) => {
            if (isTyping) {
              const newValue = e.target.value;
              setSearchValue(newValue);
              
              // Open dropdown when user starts typing
              if (!open && newValue.trim()) {
                setOpen(true);
              }
              
              // Log SEARCH event when user types
              if (newValue.trim()) {
                const searchEventType = placeholder.toLowerCase().includes('pickup') 
                  ? EVENT_TYPES.SEARCH_LOCATION 
                  : EVENT_TYPES.SEARCH_DESTINATION;
                
                const matchedResults = PLACES.filter((option) => 
                  option.label.toLowerCase().includes(newValue.toLowerCase()) ||
                  option.main.toLowerCase().includes(newValue.toLowerCase()) ||
                  option.sub.toLowerCase().includes(newValue.toLowerCase())
                );
                
                logEvent(searchEventType, { 
                  value: newValue,
                  inputType: placeholder.toLowerCase().includes('pickup') ? 'location' : 'destination',
                  timestamp: new Date().toISOString(),
                  searchType: 'typing',
                  page: 'trip_form',
                  matchedResults: matchedResults.length,
                  hasMatches: matchedResults.length > 0,
                  searchLength: newValue.length
                });
              }
            }
          }}
        />
        {open ? (
          <button
            tabIndex={-1}
            type="button"
            aria-label="Close dropdown"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white"
            style={{ pointerEvents: "auto" }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 19 19">
              <circle cx="9.5" cy="9.5" r="7" stroke="#222" strokeWidth="1.3" />
              <path
                d="M12 8.41 10.41 10 12 11.59a1 1 0 0 1-1.42 1.42L9 11.41 7.41 13a1 1 0 0 1-1.42-1.42L7.59 10 6 8.41A1 1 0 0 1 7.41 7L9 8.59 10.59 7A1 1 0 0 1 12 8.41Z"
                fill="#222"
              />
            </svg>
          </button>
        ) : (
          value && (
            <button
              tabIndex={-1}
              type="button"
              aria-label="Clear selection"
              onClick={(e) => {
                e.stopPropagation();
                setValue(null);
                setIsTyping(false);
                setSearchValue("");
              }}
              className="absolute right-8 top-1/2 -translate-y-1/2 z-10 bg-white"
              style={{ pointerEvents: "auto" }}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 19 19">
                <circle
                  cx="9.5"
                  cy="9.5"
                  r="7"
                  stroke="#222"
                  strokeWidth="1.5"
                />
                <path
                  d="M12 8.41 10.41 10 12 11.59a1 1 0 0 1-1.42 1.42L9 11.41 7.41 13a1 1 0 0 1-1.42-1.42L7.59 10 6 8.41A1 1 0 0 1 7.41 7L9 8.59 10.59 7A1 1 0 0 1 12 8.41Z"
                  fill="#222"
                />
              </svg>
            </button>
          )
        )}
        {!open && !value && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="14" height="14" fill="none" viewBox="0 0 10 10">
              <path d="M2 4l3 3 3-3" stroke="#888" strokeWidth="1.3" />
            </svg>
          </span>
        )}
      </div>
      {open && (
        <div
          ref={menuRef}
          className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          style={{
            minWidth: "100%",
            maxWidth: inputWidth ? inputWidth : "100%",
            width: inputWidth || undefined,
          }}
        >
{(() => {
            const filteredOptions = PLACES.filter((option) => {
              if (!isTyping || !searchValue.trim()) {
                return true; // Show all options when not typing or search is empty
              }
              
              const searchLower = searchValue.toLowerCase();
              return (
                option.label.toLowerCase().includes(searchLower) ||
                option.main.toLowerCase().includes(searchLower) ||
                option.sub.toLowerCase().includes(searchLower)
              );
            });

            // Add custom option if user is typing and there are no exact matches
            const hasExactMatch = filteredOptions.some(option => 
              option.label.toLowerCase() === searchValue.toLowerCase()
            );
            
            const showCustomOption = isTyping && searchValue.trim() && !hasExactMatch;
            
            return (
              <>
                {filteredOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                setValue(option.label);
                setOpen(false);
                setIsTyping(false);
                setSearchValue("");
                
                // Log ENTER event when user selects from dropdown
                const enterEventType = placeholder.toLowerCase().includes('pickup') 
                  ? EVENT_TYPES.ENTER_LOCATION 
                  : EVENT_TYPES.ENTER_DESTINATION;
                
                logEvent(enterEventType, { 
                  value: option.label,
                  inputType: placeholder.toLowerCase().includes('pickup') ? 'location' : 'destination',
                  timestamp: new Date().toISOString(),
                  page: 'trip_form',
                  selectionMethod: 'dropdown',
                  selectedOption: {
                    main: option.main,
                    sub: option.sub,
                    full: option.label
                  },
                  wasTyping: isTyping,
                  searchValue: isTyping ? searchValue : null
                });
                
                if (typeof window !== "undefined") {
                  sessionStorage.setItem(
                    placeholder === "Pickup location"
                      ? "__ud_pickup"
                      : "__ud_dropoff",
                    option.label
                  );
                }
              }}
              className={`flex gap-3 w-full text-left items-start px-3 py-3 border-b last:border-b-0 border-gray-100 hover:bg-[#e6f6fc] ${
                value === option.label ? "bg-[#f6fafc]" : ""
              }`}
            >
              <span className="mt-0.5">
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="#2095d2"
                    strokeWidth="2"
                    fill="#e6f6fc"
                  />
                  <circle cx="10" cy="10" r="3" fill="#2095d2" />
                </svg>
              </span>
              <span className="flex flex-col">
                <span
                  className={`text-black text-[15px] leading-[1.2] ${
                    value === option.label ? "font-bold" : ""
                  }`}
                >
                  {option.main}
                </span>
                <span className="text-xs text-gray-700 leading-tight mt-0.5">
                  {option.sub}
                </span>
              </span>
            </button>
                ))}
                
                {showCustomOption && (
                  <button
                    key="custom-option"
                    type="button"
                    onClick={() => {
                      setValue(searchValue);
                      setOpen(false);
                      setIsTyping(false);
                      const customOption = searchValue;
                      setSearchValue("");
                      
                      // Log ENTER event for custom value
                      const enterEventType = placeholder.toLowerCase().includes('pickup') 
                        ? EVENT_TYPES.ENTER_LOCATION 
                        : EVENT_TYPES.ENTER_DESTINATION;
                      
                      logEvent(enterEventType, { 
                        value: customOption,
                        inputType: placeholder.toLowerCase().includes('pickup') ? 'location' : 'destination',
                        timestamp: new Date().toISOString(),
                        page: 'trip_form',
                        selectionMethod: 'custom_input',
                        isCustomValue: true,
                        searchValue: customOption
                      });
                      
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem(
                          placeholder === "Pickup location"
                            ? "__ud_pickup"
                            : "__ud_dropoff",
                          customOption
                        );
                      }
                    }}
                    className="flex gap-3 w-full text-left items-start px-3 py-3 border-b last:border-b-0 border-gray-100 hover:bg-[#e6f6fc] bg-blue-50"
                  >
                    <span className="mt-0.5">
                      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                        <rect
                          x="4"
                          y="4"
                          width="12"
                          height="12"
                          rx="6"
                          stroke="#2095d2"
                          strokeWidth="2"
                          fill="#e6f6fc"
                        />
                        <path
                          d="M10 7v6M7 10h6"
                          stroke="#2095d2"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span className="flex flex-col">
                      <span className="text-black text-[15px] leading-[1.2] font-medium">
                        Use "{searchValue}"
                      </span>
                      <span className="text-xs text-gray-700 leading-tight mt-0.5">
                        Custom location
                      </span>
                    </span>
                  </button>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

const rides = [
  {
    name: "AutoDriverX",
    icon: "https://ext.same-assets.com/407674263/3757967630.png",
    image: "/car1.jpg",
    eta: "1 min away · 1:39 PM",
    desc: "Affordable rides, all to yourself",
    seats: 4,
    price: 26.6,
    oldPrice: 28.0,
    recommended: true,
  },
  {
    name: "Comfort",
    icon: "https://ext.same-assets.com/407674263/2600779409.svg",
    image: "/car2.jpg",
    eta: "2 min away · 1:40 PM",
    desc: "Newer cars with extra legroom",
    seats: 4,
    price: 31.5,
    oldPrice: 35.0,
    recommended: false,
  },
  {
    name: "AutoDriverXL",
    icon: "https://ext.same-assets.com/407674263/2882408466.svg",
    image: "/car3.jpg",
    eta: "3 min away · 1:41 PM",
    desc: "Affordable rides for groups up to 6",
    seats: 6,
    price: 27.37,
    oldPrice: 32.2,
    recommended: false,
  },
];

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-32">
      <svg
        className="animate-spin text-blue-500"
        width="58"
        height="58"
        fill="none"
        viewBox="0 0 58 58"
      >
        <circle
          cx="29"
          cy="29"
          r="25"
          stroke="#2095d2"
          strokeWidth="6"
          className="opacity-30"
        />
        <path
          d="M54 29A25 25 0 0 1 29 54"
          stroke="#2095d2"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
      <p className="mt-10 text-lg font-medium text-[#212121]">
        Preparing available options for your trip, please wait...
      </p>
    </div>
  );
}

export default function RideTripPage() {
  const router = useRouter();
  const [pickupOpen, setPickupOpen] = useState(false);
  const [dropoffOpen, setDropoffOpen] = useState(false);
  const [pickup, setPickup] = useState<string | null>(null);
  const [dropoff, setDropoff] = useState<string | null>(null);
  const [pickupScheduled, setPickupScheduled] = useState<null | {
    date: string;
    time: string;
  }>(null);
  const [showRides, setShowRides] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRideIdx, setSelectedRideIdx] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pick = sessionStorage.getItem("__ud_pickup");
    const drop = sessionStorage.getItem("__ud_dropoff");
    if (pick && PLACES.map((p) => p.label).includes(pick)) setPickup(pick);
    if (drop && PLACES.map((d) => d.label).includes(drop)) setDropoff(drop);

    const date = sessionStorage.getItem("ud_pickupdate");
    const time = sessionStorage.getItem("ud_pickuptime");
    if (date && time) setPickupScheduled({ date, time });
    else setPickupScheduled(null);
  }, []);

  function formatDateTime(date: string, time: string) {
    // MMM DD, HH:MM AM/PM
    const d = new Date(`${date}T${time}`);
    const mmmd = d.toLocaleString("en-US", { month: "short", day: "numeric" });
    const hma = d.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${mmmd}, ${hma}`;
  }



  function handleSearch() {
    if (pickup && dropoff) {
      // 🔹 log the SEARCH event
      logEvent(EVENT_TYPES.SEARCH, {
        pickup,
        dropoff,
        scheduled: pickupScheduled
          ? `${pickupScheduled.date} ${pickupScheduled.time}`
          : "now",
        timestamp: new Date().toISOString(),
        hasPickup: !!pickup,
        hasDropoff: !!dropoff,
        isScheduled: !!pickupScheduled,
        pickupLength: pickup?.length || 0,
        dropoffLength: dropoff?.length || 0
      });
  
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setShowRides(true);
      }, 2000);
    }
  }
  

  useEffect(() => {
    if (!pickup || !dropoff) {
      setShowRides(false);
      setLoading(false);
    }
  }, [pickup, dropoff]);

  // For SSR/CSR compatibility, get pathname reactively
  const [currentPath, setCurrentPath] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  // Determine if "My trips" is active
  let isTripsActive = false;
  if (typeof window !== "undefined") {
    isTripsActive = window.location.pathname === "/ride/trip/trips";
  } else {
    isTripsActive = currentPath === "/ride/trip/trips";
  }

  return (
    <div className="min-h-screen w-full bg-[#f5fbfc]">
      <RideNavbar activeTab="ride" />
      <div className="flex gap-8 mt-8 px-10 pb-32 max-lg:flex-col max-lg:px-2 max-lg:gap-4">
        <section className="w-[340px] bg-white rounded-xl shadow p-6 flex flex-col gap-2 max-lg:w-full">
          <div className="text-lg font-semibold mb-3">Get a trip</div>
          <PlaceSelect
            value={pickup}
            setValue={setPickup}
            placeholder="Pickup location"
            open={pickupOpen}
            setOpen={setPickupOpen}
          />
          <PlaceSelect
            value={dropoff}
            setValue={setDropoff}
            placeholder="Dropoff location"
            open={dropoffOpen}
            setOpen={setDropoffOpen}
          />
          <div
            className="flex items-center bg-gray-100 rounded-md px-4 py-3 mb-3 text-base font-[500] cursor-pointer border border-gray-200 h-12 select-none mt-0"
            onClick={() => router.push("/ride/trip/pickupnow")}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              className="mr-2"
              viewBox="0 0 20 20"
            >
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="#fff"
                stroke="#2095d2"
                strokeWidth="1.5"
              />
              <path
                d="M6 10h4.2a2 2 0 0 1 2 2v2"
                stroke="#2095d2"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-bold mr-1 text-[#2095d2]">
              {pickupScheduled ? "Pick up:" : "Pickup now"}
            </span>
            {pickupScheduled ? (
              <span className="ml-1 font-[500]">
                {formatDateTime(pickupScheduled.date, pickupScheduled.time)}
              </span>
            ) : null}
            <svg
              width="16"
              height="16"
              fill="none"
              className="ml-auto"
              viewBox="0 0 16 16"
            >
              <path
                d="M6 4l4 4-4 4"
                stroke="#2095d2"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 text-sm font-medium mb-4">
            <svg
              width="15"
              height="15"
              fill="none"
              viewBox="0 0 16 16"
              className="mr-2"
            >
              <circle
                cx="7.5"
                cy="7.5"
                r="6.5"
                stroke="#2095d2"
                strokeWidth="1.4"
                fill="#e6f6fc"
              />
              <path
                d="M6.9 6.9a1.2 1.2 0 1 1 2.2 0c0 .6-.5 1-1.1 1-.7 0-1.1-.4-1.1-1zM7.5 10.2c.9 0 2.1.2 2.5.6-.4.4-1.6.7-2.5.7s-2.1-.3-2.5-.7c.4-.4 1.6-.6 2.5-.6z"
                fill="#2095d2"
              />
            </svg>
            <span>For me</span>
            <svg
              width="10"
              height="10"
              fill="none"
              viewBox="0 0 10 10"
              className="ml-auto"
            >
              <path d="M2 4l3 3 3-3" stroke="#2095d2" strokeWidth="1.3" />
            </svg>
          </div>
          <button
            onClick={handleSearch}
            className={`rounded-md h-10 font-bold mb-2 transition ${
              !pickup || !dropoff || loading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#2095d2] text-white hover:bg-[#1273a0]"
            }`}
            disabled={!pickup || !dropoff || loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </section>
        {loading ? (
          <section className="flex-1 flex flex-col items-center justify-center">
            <Spinner />
          </section>
        ) : pickup && dropoff && showRides ? (
          <section className="flex-1 max-w-2xl max-lg:max-w-full">
            <h1 className="text-3xl font-bold mb-2">Choose a ride</h1>
            <div className="text-lg font-semibold mb-4">Recommended</div>
            <div className="space-y-3">
              {rides.map((ride, idx) => (
                <div
                  key={ride.name}
                  onClick={() => {
                    setSelectedRideIdx(idx);
                    // 🔹 log the SELECT_CAR event
                    logEvent(EVENT_TYPES.SELECT_CAR, {
                      rideId: idx,
                      rideName: ride.name,
                      rideType: ride.name,
                      price: ride.price,
                      oldPrice: ride.oldPrice,
                      seats: ride.seats,
                      eta: ride.eta,
                      pickup,
                      dropoff,
                      scheduled: pickupScheduled
                        ? `${pickupScheduled.date} ${pickupScheduled.time}`
                        : "now",
                      timestamp: new Date().toISOString(),
                      priceDifference: ride.oldPrice - ride.price,
                      discountPercentage: ((ride.oldPrice - ride.price) / ride.oldPrice * 100).toFixed(2),
                      isRecommended: ride.recommended || false
                    });
                  }}
                  className={
                    "flex items-center gap-4 rounded-xl px-6 py-5 cursor-pointer transition" +
                    (selectedRideIdx === idx
                      ? " border-2 border-[#2095d2] bg-[#e6f6fc] shadow-sm"
                      : " border border-transparent bg-gray-100")
                  }
                  tabIndex={0}
                  style={{
                    outline:
                      selectedRideIdx === idx ? "2px solid #2095d2" : "none",
                  }}
                >
                  <img
                    src={ride.image}
                    alt={ride.name}
                    className="rounded-lg w-16 h-14 object-contain bg-gray-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-lg">{ride.name}</span>
                      <svg
                        width="17"
                        height="17"
                        fill="none"
                        viewBox="0 0 16 16"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="12"
                          height="12"
                          rx="6"
                          stroke="#2095d2"
                          strokeWidth="1"
                          fill="#e6f6fc"
                        />
                        <text
                          x="8"
                          y="11"
                          textAnchor="middle"
                          fontSize="9"
                          fill="#2095d2"
                        >
                          {ride.seats}
                        </text>
                      </svg>
                    </div>
                    <div className="text-xs text-gray-600 font-semibold mb-0.5">
                      {ride.eta}
                    </div>
                    <div className="text-xs text-gray-600">{ride.desc}</div>
                  </div>
                  <div className="text-right pr-1">
                    <div className="font-bold text-xl text-[#2095d2]">
                      ${ride.price.toFixed(2)}
                    </div>
                    <div className="line-through text-xs text-gray-400">
                      ${ride.oldPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
        <section className="flex-1 min-w-0">
          <div className="w-full h-full min-h-[640px] flex items-center justify-center rounded-2xl border border-gray-100 overflow-hidden bg-gray-100">
            <img
              src="/map.jpg"
              alt="Map"
              className="object-none w-full max-h-[700px]"
            />
          </div>
        </section>
      </div>
      {pickup && dropoff && showRides && (
        <div className="fixed z-50 left-1/2 bottom-8 -translate-x-1/2 max-w-lg w-[calc(100vw-32px)] drop-shadow-xl bg-transparent pointer-events-none max-lg:bottom-2">
          <div className="flex items-center bg-white rounded-xl shadow-lg px-6 py-5 gap-6 max-lg:min-w-0 max-lg:w-full max-lg:px-3 pointer-events-auto">
            <div className="flex items-center gap-2 mr-6">
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <rect
                  x="1"
                  y="4"
                  width="18"
                  height="12"
                  rx="3"
                  fill="#8FCB81"
                />
                <path
                  d="M3 10h14"
                  stroke="#fff"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
              <span className="text-[#2095d2] font-bold">Cash</span>
            </div>
            <button
              className={`flex-1 font-bold px-6 py-2 rounded-md text-lg shadow transition disabled:bg-gray-200 disabled:text-gray-400 ${
                selectedRideIdx === null
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#2095d2] text-white hover:bg-[#1273a0]"
              }`}
              disabled={selectedRideIdx === null}
              onClick={() => {
                if (selectedRideIdx !== null) {
                  const selectedRide = rides[selectedRideIdx];
                  // 🔹 log the RESERVE_RIDE event
                  logEvent(EVENT_TYPES.RESERVE_RIDE, {
                    rideId: selectedRideIdx,
                    rideName: selectedRide.name,
                    rideType: selectedRide.name,
                    price: selectedRide.price,
                    oldPrice: selectedRide.oldPrice,
                    seats: selectedRide.seats,
                    eta: selectedRide.eta,
                    pickup,
                    dropoff,
                    scheduled: pickupScheduled
                      ? `${pickupScheduled.date} ${pickupScheduled.time}`
                      : "now",
                    timestamp: new Date().toISOString(),
                    priceDifference: selectedRide.oldPrice - selectedRide.price,
                    discountPercentage: ((selectedRide.oldPrice - selectedRide.price) / selectedRide.oldPrice * 100).toFixed(2),
                    isRecommended: selectedRide.recommended || false,
                    tripDetails: {
                      pickup,
                      dropoff,
                      scheduled: pickupScheduled
                        ? `${pickupScheduled.date} ${pickupScheduled.time}`
                        : "now",
                      rideType: selectedRide.name,
                      price: selectedRide.price,
                      totalSeats: selectedRide.seats,
                      estimatedArrival: selectedRide.eta
                    },
                  });
                  
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem(
                      "__ud_selectedRideIdx",
                      String(selectedRideIdx)
                    );
                    sessionStorage.setItem("__ud_pickup", pickup || "");
                    sessionStorage.setItem("__ud_dropoff", dropoff || "");
                  }
                  router.push("/ride/trip/confirmation");
                }
              }}
            >
              {selectedRideIdx === null ? "Select a ride" : "Reserve ride"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
