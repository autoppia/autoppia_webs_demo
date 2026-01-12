"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import GlobalHeader from "@/components/GlobalHeader";
import { EVENT_TYPES, logEvent } from "@/library/event";
import DynamicLayout from "@/components/DynamicLayout";
import SiteElements from "@/components/SiteElements";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { useSeed } from "@/context/SeedContext";
import { cn } from "@/library/utils";

const PLACES = [
  {
    label: "1 Hotel San Francisco - 8 Mission St, San Francisco, CA 94105, USA",
    main: "1 Hotel San Francisco",
    sub: "8 Mission St, San Francisco, CA 94105, USA",
  },
  {
    label: "100 Van Ness - 100 Van Ness Ave, San Francisco, CA 94102, USA",
    main: "100 Van Ness",
    sub: "100 Van Ness Ave, San Francisco, CA 94102, USA",
  },
  {
    label:
      "1000 Chestnut Street Apartments - 1000 Chestnut St, San Francisco, CA 94109, USA",
    main: "1000 Chestnut Street Apartments",
    sub: "1000 Chestnut St, San Francisco, CA 94109, USA",
  },
  {
    label:
      "1030 Post Street Apartments - 1030 Post St #112, San Francisco, CA 94109, USA",
    main: "1030 Post Street Apartments",
    sub: "1030 Post St #112, San Francisco, CA 94109, USA",
  },
  {
    label: "The Ritz-Carlton - 600 Stockton St, San Francisco, CA 94108, USA",
    main: "The Ritz-Carlton",
    sub: "600 Stockton St, San Francisco, CA 94108, USA",
  },
  {
    label:
      "Fairmont San Francisco - 950 Mason St, San Francisco, CA 94108, USA",
    main: "Fairmont San Francisco",
    sub: "950 Mason St, San Francisco, CA 94108, USA",
  },
  {
    label: "Hotel Nikko - 222 Mason St, San Francisco, CA 94102, USA",
    main: "Hotel Nikko",
    sub: "222 Mason St, San Francisco, CA 94102, USA",
  },
  {
    label: "Palace Hotel - 2 New Montgomery St, San Francisco, CA 94105, USA",
    main: "Palace Hotel",
    sub: "2 New Montgomery St, San Francisco, CA 94105, USA",
  },
  {
    label:
      "InterContinental San Francisco - 888 Howard St, San Francisco, CA 94103, USA",
    main: "InterContinental San Francisco",
    sub: "888 Howard St, San Francisco, CA 94103, USA",
  },
  {
    label: "Hotel Zephyr - 250 Beach St, San Francisco, CA 94133, USA",
    main: "Hotel Zephyr",
    sub: "250 Beach St, San Francisco, CA 94133, USA",
  },
  {
    label:
      "Hotel Zoe Fisherman's Wharf - 425 North Point St, San Francisco, CA 94133, USA",
    main: "Hotel Zoe Fisherman's Wharf",
    sub: "425 North Point St, San Francisco, CA 94133, USA",
  },
  {
    label:
      "The Clift Royal Sonesta Hotel - 495 Geary St, San Francisco, CA 94102, USA",
    main: "The Clift Royal Sonesta Hotel",
    sub: "495 Geary St, San Francisco, CA 94102, USA",
  },
  {
    label:
      "The Marker San Francisco - 501 Geary St, San Francisco, CA 94102, USA",
    main: "The Marker San Francisco",
    sub: "501 Geary St, San Francisco, CA 94102, USA",
  },
  {
    label:
      "Hilton San Francisco Union Square - 333 O'Farrell St, San Francisco, CA 94102, USA",
    main: "Hilton San Francisco Union Square",
    sub: "333 O'Farrell St, San Francisco, CA 94102, USA",
  },
  {
    label:
      "Parc 55 San Francisco - 55 Cyril Magnin St, San Francisco, CA 94102, USA",
    main: "Parc 55 San Francisco",
    sub: "55 Cyril Magnin St, San Francisco, CA 94102, USA",
  },
  {
    label: "Hotel Kabuki - 1625 Post St, San Francisco, CA 94115, USA",
    main: "Hotel Kabuki",
    sub: "1625 Post St, San Francisco, CA 94115, USA",
  },
  {
    label: "Hotel G San Francisco - 386 Geary St, San Francisco, CA 94102, USA",
    main: "Hotel G San Francisco",
    sub: "386 Geary St, San Francisco, CA 94102, USA",
  },
  {
    label:
      "The Westin St. Francis - 335 Powell St, San Francisco, CA 94102, USA",
    main: "The Westin St. Francis",
    sub: "335 Powell St, San Francisco, CA 94102, USA",
  },
  {
    label: "Hotel Vitale - 8 Mission St, San Francisco, CA 94105, USA",
    main: "Hotel Vitale",
    sub: "8 Mission St, San Francisco, CA 94105, USA",
  },
  {
    label: "Argonaut Hotel - 495 Jefferson St, San Francisco, CA 94109, USA",
    main: "Argonaut Hotel",
    sub: "495 Jefferson St, San Francisco, CA 94109, USA",
  },
  {
    label: "Hotel Emblem - 562 Sutter St, San Francisco, CA 94102, USA",
    main: "Hotel Emblem",
    sub: "562 Sutter St, San Francisco, CA 94102, USA",
  },
  {
    label: "Hotel Triton - 342 Grant Ave, San Francisco, CA 94108, USA",
    main: "Hotel Triton",
    sub: "342 Grant Ave, San Francisco, CA 94108, USA",
  },
  {
    label: "Hotel North Beach - 935 Kearny St, San Francisco, CA 94133, USA",
    main: "Hotel North Beach",
    sub: "935 Kearny St, San Francisco, CA 94133, USA",
  },
  {
    label: "Hotel Spero - 405 Taylor St, San Francisco, CA 94102, USA",
    main: "Hotel Spero",
    sub: "405 Taylor St, San Francisco, CA 94102, USA",
  },
  {
    label: "Hotel Caza - 1300 Columbus Ave, San Francisco, CA 94133, USA",
    main: "Hotel Caza",
    sub: "1300 Columbus Ave, San Francisco, CA 94133, USA",
  },
  {
    label: "The Donatello - 501 Post St, San Francisco, CA 94102, USA",
    main: "The Donatello",
    sub: "501 Post St, San Francisco, CA 94102, USA",
  },
  {
    label: "Hotel Abri - 127 Ellis St, San Francisco, CA 94102, USA",
    main: "Hotel Abri",
    sub: "127 Ellis St, San Francisco, CA 94102, USA",
  },
  {
    label: "Hotel Fusion - 140 Ellis St, San Francisco, CA 94102, USA",
    main: "Hotel Fusion",
    sub: "140 Ellis St, San Francisco, CA 94102, USA",
  },
  {
    label: "Hotel Whitcomb - 1231 Market St, San Francisco, CA 94103, USA",
    main: "Hotel Whitcomb",
    sub: "1231 Market St, San Francisco, CA 94103, USA",
  },
  {
    label: "Hotel Majestic - 1500 Sutter St, San Francisco, CA 94109, USA",
    main: "Hotel Majestic",
    sub: "1500 Sutter St, San Francisco, CA 94109, USA",
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
  const dyn = useDynamicSystem();
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

  // Determine component key based on placeholder
  const componentKey = placeholder.toLowerCase().includes("pickup")
    ? "location-input-field"
    : "destination-input-field";

  return (
    dyn.v1.addWrapDecoy(
      componentKey,
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
          value={isTyping ? searchValue : value ? value : ""}
          readOnly={!isTyping}
          placeholder={placeholder}
          className={cn(
            "flex-1 bg-transparent border-none outline-none text-[16px] placeholder:text-gray-400 pr-8",
            dyn.v3.getVariant(
              placeholder.toLowerCase().includes("pickup") 
                ? "location-input-field-class" 
                : "destination-input-field-class",
              CLASS_VARIANTS_MAP,
              ""
            )
          )}
          style={{ paddingRight: 32 }}
          onFocus={() => {
            if (!isTyping) {
              setIsTyping(true);
              setSearchValue("");
            }
            // Log enter event when user focuses on input
            const enterEventType = placeholder.toLowerCase().includes("pickup")
              ? EVENT_TYPES.ENTER_LOCATION
              : EVENT_TYPES.ENTER_DESTINATION;

            logEvent(enterEventType, {
              inputType: placeholder.toLowerCase().includes("pickup")
                ? "location"
                : "destination",
              timestamp: new Date().toISOString(),
              page: "trip_form",
              action: "focus",
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
          onKeyDown={(e) => {
            if (isTyping && e.key === "Enter" && searchValue.trim()) {
              e.preventDefault();

              // Check if there's an exact match
              const exactMatch = PLACES.find(
                (option) =>
                  option.label.toLowerCase() === searchValue.toLowerCase()
              );

              if (exactMatch) {
                // Use exact match if found
                setValue(exactMatch.label);
                setOpen(false);
                setIsTyping(false);
                setSearchValue("");

                // Log ENTER event for exact match
                const enterEventType = placeholder
                  .toLowerCase()
                  .includes("pickup")
                  ? EVENT_TYPES.ENTER_LOCATION
                  : EVENT_TYPES.ENTER_DESTINATION;

                logEvent(enterEventType, {
                  value: exactMatch.label,
                  inputType: placeholder.toLowerCase().includes("pickup")
                    ? "location"
                    : "destination",
                  timestamp: new Date().toISOString(),
                  page: "trip_form",
                  selectionMethod: "enter_key_exact_match",
                  selectedOption: {
                    main: exactMatch.main,
                    sub: exactMatch.sub,
                    full: exactMatch.label,
                  },
                });

                if (typeof window !== "undefined") {
                  sessionStorage.setItem(
                    placeholder === "Pickup location"
                      ? "__ud_pickup"
                      : "__ud_dropoff",
                    exactMatch.label
                  );
                }
              } else {
                // Use custom value if no exact match
                setValue(searchValue);
                setOpen(false);
                setIsTyping(false);
                const customOption = searchValue;
                setSearchValue("");

                // Log ENTER event for custom value
                const enterEventType = placeholder
                  .toLowerCase()
                  .includes("pickup")
                  ? EVENT_TYPES.ENTER_LOCATION
                  : EVENT_TYPES.ENTER_DESTINATION;

                logEvent(enterEventType, {
                  value: customOption,
                  inputType: placeholder.toLowerCase().includes("pickup")
                    ? "location"
                    : "destination",
                  timestamp: new Date().toISOString(),
                  page: "trip_form",
                  selectionMethod: "enter_key_custom",
                  isCustomValue: true,
                  searchValue: customOption,
                });

                if (typeof window !== "undefined") {
                  sessionStorage.setItem(
                    placeholder === "Pickup location"
                      ? "__ud_pickup"
                      : "__ud_dropoff",
                    customOption
                  );
                }
              }
            }
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
                const searchEventType = placeholder
                  .toLowerCase()
                  .includes("pickup")
                  ? EVENT_TYPES.SEARCH_LOCATION
                  : EVENT_TYPES.SEARCH_DESTINATION;

                const matchedResults = PLACES.filter(
                  (option) =>
                    option.label
                      .toLowerCase()
                      .includes(newValue.toLowerCase()) ||
                    option.main
                      .toLowerCase()
                      .includes(newValue.toLowerCase()) ||
                    option.sub.toLowerCase().includes(newValue.toLowerCase())
                );

                logEvent(searchEventType, {
                  value: newValue,
                  inputType: placeholder.toLowerCase().includes("pickup")
                    ? "location"
                    : "destination",
                  timestamp: new Date().toISOString(),
                  searchType: "typing",
                  page: "trip_form",
                  matchedResults: matchedResults.length,
                  hasMatches: matchedResults.length > 0,
                  searchLength: newValue.length,
                });
              }
            }
          }}
        />
        {isTyping && searchValue.trim() && (
          <div className="text-xs text-gray-500 mt-1 px-1">
            Press Enter to use "{searchValue}"
          </div>
        )}
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
            const hasExactMatch = filteredOptions.some(
              (option) =>
                option.label.toLowerCase() === searchValue.toLowerCase()
            );

            const showCustomOption =
              isTyping && searchValue.trim() && !hasExactMatch;

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
                      const enterEventType = placeholder
                        .toLowerCase()
                        .includes("pickup")
                        ? EVENT_TYPES.ENTER_LOCATION
                        : EVENT_TYPES.ENTER_DESTINATION;

                      logEvent(enterEventType, {
                        value: option.label,
                        inputType: placeholder.toLowerCase().includes("pickup")
                          ? "location"
                          : "destination",
                        timestamp: new Date().toISOString(),
                        page: "trip_form",
                        selectionMethod: "dropdown",
                        selectedOption: {
                          main: option.main,
                          sub: option.sub,
                          full: option.label,
                        },
                        wasTyping: isTyping,
                        searchValue: isTyping ? searchValue : null,
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
                      <svg
                        width="20"
                        height="20"
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
                      const enterEventType = placeholder
                        .toLowerCase()
                        .includes("pickup")
                        ? EVENT_TYPES.ENTER_LOCATION
                        : EVENT_TYPES.ENTER_DESTINATION;

                      logEvent(enterEventType, {
                        value: customOption,
                        inputType: placeholder.toLowerCase().includes("pickup")
                          ? "location"
                          : "destination",
                        timestamp: new Date().toISOString(),
                        page: "trip_form",
                        selectionMethod: "custom_input",
                        isCustomValue: true,
                        searchValue: customOption,
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
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 20 20"
                      >
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
    )
  );
}

const RIDE_TEMPLATES = [
  {
    name: "AutoDriverX",
    icon: "https://ext.same-assets.com/407674263/3757967630.png",
    image: "/car1.png",
    desc: "Affordable rides, all to yourself",
    seats: 4,
    basePrice: 26.6,
  },
  {
    name: "Comfort",
    icon: "https://ext.same-assets.com/407674263/2600779409.svg",
    image: "/car2.png",
    desc: "Newer cars with extra legroom",
    seats: 4,
    basePrice: 31.5,
  },
  {
    name: "AutoDriverXL",
    icon: "https://ext.same-assets.com/407674263/2882408466.svg",
    image: "/car3.png",
    desc: "Affordable rides for groups up to 6",
    seats: 6,
    basePrice: 27.37,
  },
  {
    name: "Executive",
    icon: "https://ext.same-assets.com/407674263/1505241019.svg",
    image: "/dashboard.jpg",
    desc: "Premium rides with professional drivers",
    seats: 4,
    basePrice: 45.0,
  },
];

const seededRandom = (seed: number) => {
  let value = seed || 1;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
};

function formatEta(minutesFromNow: number): string {
  const etaTime = new Date();
  etaTime.setMinutes(etaTime.getMinutes() + minutesFromNow);
  const timeString = etaTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${minutesFromNow} min away · ${timeString}`;
}

function generateSeededRides(seed: number) {
  const rng = seededRandom(seed);
  const recommendedIdx = Math.floor(rng() * RIDE_TEMPLATES.length);

  return RIDE_TEMPLATES.map((template, idx) => {
    const surgeMultiplier = 0.85 + rng() * 0.4; // 0.85 - 1.25
    const price = Number((template.basePrice * surgeMultiplier).toFixed(2));
    const oldPrice = Number((price * (1.05 + rng() * 0.15)).toFixed(2));
    const minutesAway = 1 + Math.floor(rng() * 5);

    return {
      ...template,
      price,
      oldPrice,
      eta: formatEta(minutesAway),
      recommended: idx === recommendedIdx,
    };
  });
}

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

export default function Home() {
  const router = useSeedRouter();
  const dyn = useDynamicSystem();
  const { resolvedSeeds } = useSeed();
  const v2Seed = resolvedSeeds.v2 ?? dyn.seed;
  const dynamicV3TextVariants: Record<string, string[]> = useMemo(() => ({
    booking_heading: ["Book your ride", "Plan a trip", "Reserve your ride", "Schedule a drive", "Arrange pickup"],
    booking_subtitle: [
      "Enter your pickup and destination to get started",
      "Share where you are going",
      "Set pickup and dropoff to view rides",
      "Tell us your trip details",
      "Plan your journey"
    ],
    pickup_placeholder: ["Pickup location", "Where from?", "Enter pickup", "Start location", "Where are you?"],
    dropoff_placeholder: ["Dropoff location", "Where to?", "Enter dropoff", "Destination", "Dropoff address"],
    pickup_now_label: ["Pickup now", "Pickup ASAP", "Right now", "Immediate pickup", "Ride now"],
    pickup_label: ["Pick up:", "Pickup at", "Scheduled pickup", "Your pickup time", "Pickup details"],
    for_me_label: ["For me", "For myself", "Personal ride", "My ride", "Just me"],
    searching_label: ["Searching...", "Loading rides...", "Finding options...", "Looking for drivers...", "Preparing routes..."],
    search_button: ["Search", "Find rides", "See rides", "Get options", "Start search"],
    choose_ride_title: ["Choose a ride", "Pick your ride", "Select a car", "Choose option", "Select your ride"],
    recommended_label: ["Recommended", "Top pick", "Suggested", "Best match", "Popular choice"],
    cash_label: ["Cash", "Pay cash", "Cash payment", "Cash option", "Pay with cash"],
    reserve_cta: ["Reserve UberX", "Reserve ride", "Confirm ride", "Book now", "Reserve now"],
    stats_total: ["Total Trips", "Completed trips", "All rides", "Trips done", "Finished rides"],
    stats_active: ["Active Riders", "Active users", "Riders online", "People riding", "Current riders"],
    stats_drivers: ["Available Drivers", "Drivers online", "Drivers ready", "Nearby drivers", "Active drivers"],
    map_label: ["Live map", "Trip map", "Route map", "City map", "Map view"],
    hero_label: ["AutoDriver smart ride booking", "Ride faster with AutoDriver", "Smooth trips with AutoDriver", "Plan trips easily", "Trusted rides"],
    overlay_pay: ["Cash", "Wallet", "Pay now", "Payment", "Pay on ride"],
    overlay_cta: ["Reserve UberX", "Reserve ride", "Book this ride", "Confirm selection", "Reserve now"],
  }), []);
  const dynamicIds = useMemo(
    () => ({
      bookingSection: dyn.v3.getVariant("booking-section", ID_VARIANTS_MAP, "booking-section"),
      bookingImage: dyn.v3.getVariant("booking-image", ID_VARIANTS_MAP, "booking-image"),
      pickupInput: dyn.v3.getVariant("pickup-input", ID_VARIANTS_MAP, "pickup-input"),
      dropoffInput: dyn.v3.getVariant("dropoff-input", ID_VARIANTS_MAP, "dropoff-input"),
      pickupNow: dyn.v3.getVariant("pickup-now", ID_VARIANTS_MAP, "pickup-now"),
      searchButton: dyn.v3.getVariant("search-button", ID_VARIANTS_MAP, "search-button"),
      statsCardTrips: dyn.v3.getVariant("stats-trips", ID_VARIANTS_MAP, "stats-trips"),
      statsCardRiders: dyn.v3.getVariant("stats-riders", ID_VARIANTS_MAP, "stats-riders"),
      statsCardDrivers: dyn.v3.getVariant("stats-drivers", ID_VARIANTS_MAP, "stats-drivers"),
      ridesTitle: dyn.v3.getVariant("choose-ride-title", ID_VARIANTS_MAP, "choose-ride-title"),
      ridesSubtitle: dyn.v3.getVariant("recommended-label", ID_VARIANTS_MAP, "recommended-label"),
      rideCard: dyn.v3.getVariant("ride-card", ID_VARIANTS_MAP, "ride-card"),
      ridePrice: dyn.v3.getVariant("ride-price", ID_VARIANTS_MAP, "ride-price"),
      rideList: dyn.v3.getVariant("ride-list", ID_VARIANTS_MAP, "ride-list"),
      mapContainer: dyn.v3.getVariant("map-container", ID_VARIANTS_MAP, "map-container"),
      overlayCta: dyn.v3.getVariant("overlay-cta", ID_VARIANTS_MAP, "overlay-cta"),
      overlayPayment: dyn.v3.getVariant("overlay-payment", ID_VARIANTS_MAP, "overlay-payment"),
    }),
    [dyn]
  );
  const dynamicClasses = useMemo(
    () => ({
      primaryButton: dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, ""),
      secondaryButton: dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""),
      card: dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, ""),
      navLink: dyn.v3.getVariant("nav-link", CLASS_VARIANTS_MAP, ""),
      gridContainer: dyn.v3.getVariant("grid-container", CLASS_VARIANTS_MAP, ""),
    }),
    [dyn]
  );
  const pageText = useMemo(
    () => ({
      bookingTitle: dyn.v3.getVariant("booking_heading", dynamicV3TextVariants, "Book your ride"),
      bookingSubtitle: dyn.v3.getVariant("booking_subtitle", dynamicV3TextVariants, "Enter your pickup and destination to get started"),
      pickupPlaceholder: dyn.v3.getVariant("pickup_placeholder", dynamicV3TextVariants, "Pickup location"),
      dropoffPlaceholder: dyn.v3.getVariant("dropoff_placeholder", dynamicV3TextVariants, "Dropoff location"),
      pickupNow: dyn.v3.getVariant("pickup_now_label", dynamicV3TextVariants, "Pickup now"),
      pickupLabel: dyn.v3.getVariant("pickup_label", dynamicV3TextVariants, "Pick up:"),
      forMe: dyn.v3.getVariant("for_me_label", dynamicV3TextVariants, "For me"),
      searching: dyn.v3.getVariant("searching_label", dynamicV3TextVariants, "Searching..."),
      searchCta: dyn.v3.getVariant("search_button", dynamicV3TextVariants, "Search"),
      chooseRide: dyn.v3.getVariant("choose_ride_title", dynamicV3TextVariants, "Choose a ride"),
      recommended: dyn.v3.getVariant("recommended_label", dynamicV3TextVariants, "Recommended"),
      cash: dyn.v3.getVariant("cash_label", dynamicV3TextVariants, "Cash"),
      reserve: dyn.v3.getVariant("reserve_cta", dynamicV3TextVariants, "Reserve UberX"),
      statsTrips: dyn.v3.getVariant("stats_total", dynamicV3TextVariants, "Total Trips"),
      statsActive: dyn.v3.getVariant("stats_active", dynamicV3TextVariants, "Active Riders"),
      statsDrivers: dyn.v3.getVariant("stats_drivers", dynamicV3TextVariants, "Available Drivers"),
      mapLabel: dyn.v3.getVariant("map_label", dynamicV3TextVariants, "Live map"),
      heroCopy: dyn.v3.getVariant("hero_label", dynamicV3TextVariants, "AutoDriver smart ride booking"),
      overlayPayment: dyn.v3.getVariant("overlay_pay", dynamicV3TextVariants, "Cash"),
      overlayCta: dyn.v3.getVariant("overlay_cta", dynamicV3TextVariants, "Reserve UberX"),
    }),
    [dyn.seed, dynamicV3TextVariants]
  );
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
  const [rides, setRides] = useState(() => generateSeededRides(v2Seed ?? 1));
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeRiders: 0,
    availableDrivers: 0,
  });

  useEffect(() => {
    setRides(generateSeededRides(v2Seed ?? 1));
    setSelectedRideIdx(null);
  }, [v2Seed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pick = sessionStorage.getItem("__ud_pickup");
    const drop = sessionStorage.getItem("__ud_dropoff");
    if (pick) setPickup(pick);
    if (drop) setDropoff(drop);

    const date = sessionStorage.getItem("ud_pickupdate");
    const time = sessionStorage.getItem("ud_pickuptime");
    if (date && time) setPickupScheduled({ date, time });
    else setPickupScheduled(null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Calculate total trips from localStorage (cancelled trips are tracked)
    let totalTrips = 0;
    try {
      const cancelledTrips = JSON.parse(
        localStorage.getItem("cancelledTrips") || "[]"
      );
      // Base trips completed (simulatedTrips has 3, but we can count more)
      totalTrips = 3 + cancelledTrips.length;
    } catch {
      totalTrips = 3;
    }

    // Simulate active riders and available drivers based on seed for consistency
    const seed = v2Seed ?? 1;
    const activeRiders = 1247 + ((seed * 47) % 523);
    const availableDrivers = 458 + ((seed * 32) % 142);

    setStats({
      totalTrips: totalTrips || 12, // Fallback to 12 if no trips
      activeRiders,
      availableDrivers,
    });
  }, [v2Seed]);

  useEffect(() => {
    logEvent(EVENT_TYPES.EXPLORE_FEATURES, {
      page: "home",
      seed: dyn.seed,
      timestamp: new Date().toISOString(),
    });
  }, [dyn.seed]);

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
        dropoffLength: dropoff?.length || 0,
      });

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setShowRides(true);
        logEvent(EVENT_TYPES.SEE_PRICES, {
          pickup,
          dropoff,
          scheduled: pickupScheduled ? `${pickupScheduled.date} ${pickupScheduled.time}` : "now",
          rideCount: rides.length,
          timestamp: new Date().toISOString(),
        });
      }, 20);
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

  const orderedRides = useMemo(() => {
    if (!rides || rides.length === 0) return [];
    const order = dyn.v1.changeOrderElements("home-rides", rides.length);
    return order.map((idx) => rides[idx]).filter(Boolean);
  }, [dyn.seed, rides]);

  // Header component
  const header = <GlobalHeader excludeItems={["ride"]} />;

  // Booking section component
  const booking = dyn.v1.addWrapDecoy(
    "booking-card",
    <section
      id={dynamicIds.bookingSection}
      className={`w-[500px] bg-white rounded-xl shadow-lg p-8 flex flex-col gap-5 max-lg:w-full h-[calc(100vh-6rem)] ${dynamicClasses.card}`}
    >
      <div className="mb-2">
        <h2 className="text-xl font-bold mb-1" id={dyn.v3.getVariant("trip-get-trip-heading", ID_VARIANTS_MAP, "trip-get-trip-heading")}>
          {pageText.bookingTitle}
        </h2>
        <p className="text-sm text-gray-600">{pageText.bookingSubtitle}</p>
      </div>
      <div className="mb-4 flex-1 min-h-0">
        <img
          src="/dashboard.jpg"
          alt="Dashboard"
          id={dynamicIds.bookingImage}
          className="w-full h-full rounded-lg object-cover shadow-sm"
        />
      </div>
      <PlaceSelect
        value={pickup}
        setValue={setPickup}
        placeholder={pageText.pickupPlaceholder}
        open={pickupOpen}
        setOpen={setPickupOpen}
      />
      <PlaceSelect
        value={dropoff}
        setValue={setDropoff}
        placeholder={pageText.dropoffPlaceholder}
        open={dropoffOpen}
        setOpen={setDropoffOpen}
      />
      {dyn.v1.addWrapDecoy(
        "pickup-now-toggle",
        <div
          className="flex items-center bg-gray-100 rounded-md px-4 py-3 mb-3 text-base font-[500] cursor-pointer border border-gray-200 h-12 select-none mt-0"
          onClick={() => router.push("/ride/trip/pickupnow")}
          id={dynamicIds.pickupNow}
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
          <span className={cn("font-bold mr-1 text-[#2095d2]", dyn.v3.getVariant("homepage-pickup-span-class", CLASS_VARIANTS_MAP, ""))}>
            {pickupScheduled ? pageText.pickupLabel : pageText.pickupNow}
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
            <path d="M6 4l4 4-4 4" stroke="#2095d2" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
      )}
      {dyn.v1.addWrapDecoy(
        "passenger-toggle",
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
          <span>{pageText.forMe}</span>
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
      )}
      <button
        id={dynamicIds.searchButton}
        onClick={handleSearch}
        className={`rounded-md h-10 font-bold mb-2 transition ${!pickup || !dropoff || loading ? "bg-gray-200 text-gray-500 cursor-not-allowed" : `bg-[#2095d2] text-white hover:bg-[#1273a0] ${dynamicClasses.primaryButton}`}`}
        disabled={!pickup || !dropoff || loading}
      >
        {loading ? pageText.searching : pageText.searchCta}
      </button>

      {/* Stats Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4" id={dyn.v3.getVariant("stats-grid", ID_VARIANTS_MAP, "stats-grid")}>
          {dyn.v1.changeOrderElements("stats-cards", 3).map((idx) => {
            if (idx === 0) {
              return (
                <div key="stat-trips" id={dynamicIds.statsCardTrips} className="flex flex-col items-center text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2095d2]/10 mb-2">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 20 20"
                      className="text-[#2095d2]"
                    >
                      <path
                        d="M10 2L3 7v11h14V7l-7-5z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <path d="M7 10h6M7 14h6" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-[#2095d2]">{stats.totalTrips}+</div>
                  <div className="text-xs text-gray-600 mt-0.5">{pageText.statsTrips}</div>
                </div>
              );
            }
            if (idx === 1) {
              return (
                <div key="stat-riders" id={dynamicIds.statsCardRiders} className="flex flex-col items-center text-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100/50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 mb-2">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 20 20"
                      className="text-green-600"
                    >
                      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      <path
                        d="M4 17v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{stats.activeRiders.toLocaleString()}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{pageText.statsActive}</div>
                </div>
              );
            }
            return (
              <div key="stat-drivers" id={dynamicIds.statsCardDrivers} className="flex flex-col items-center text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 mb-2">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 20 20"
                    className="text-purple-600"
                  >
                    <rect x="4" y="5" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path d="M6 8h8M6 11h5" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-purple-600">{stats.availableDrivers}</div>
                <div className="text-xs text-gray-600 mt-0.5">{pageText.statsDrivers}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

  // Rides section component
  const ridesSection = loading ? (
    <section className="flex-1 flex flex-col items-center justify-center">
      <Spinner />
    </section>
  ) : pickup && dropoff && showRides ? (
    dyn.v1.addWrapDecoy(
      "ride-section",
      <section
        className="flex-1"
        style={{ width: "100%", maxWidth: "none", minWidth: 0 }}
        id={dynamicIds.rideList}
      >
        <h1 className="text-3xl font-bold mb-2" id={dynamicIds.ridesTitle}>
          {pageText.chooseRide}
        </h1>
        <div className="text-lg font-semibold mb-6" id={dynamicIds.ridesSubtitle}>
          {pageText.recommended}
        </div>
        <div className="space-y-5" style={{ width: "100%", maxWidth: "none" }}>
          {orderedRides.map((ride, idx) =>
            dyn.v1.addWrapDecoy(
              `ride-card-${idx}`,
              <div
                key={`${ride.name}-${idx}`}
                onClick={() => {
                  setSelectedRideIdx(idx);
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
                    scheduled: pickupScheduled ? `${pickupScheduled.date} ${pickupScheduled.time}` : "now",
                    timestamp: new Date().toISOString(),
                    priceDifference: ride.oldPrice - ride.price,
                    discountPercentage: (((ride.oldPrice - ride.price) / ride.oldPrice) * 100).toFixed(2),
                    isRecommended: ride.recommended || false,
                  });
                }}
                className={
                  "flex items-center gap-8 rounded-2xl px-8 py-8 cursor-pointer transition" +
                  (selectedRideIdx === idx
                    ? " border-2 border-[#2095d2] bg-[#e6f6fc] shadow-xl"
                    : " border-2 border-gray-200 bg-white hover:bg-gray-50 shadow-md")
                }
                style={{
                  width: "100%",
                  maxWidth: "none",
                  minHeight: "240px",
                  outline: selectedRideIdx === idx ? "2px solid #2095d2" : "none",
                }}
                tabIndex={0}
                id={`${dynamicIds.rideCard}-${idx}`}
              >
                <img
                  src={ride.image}
                  alt={ride.name}
                  className="rounded-xl w-80 h-64 object-cover bg-gray-200 flex-shrink-0 shadow-xl"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-bold text-2xl">{ride.name}</span>
                    <svg width="24" height="24" fill="none" viewBox="0 0 16 16">
                      <rect x="2" y="2" width="12" height="12" rx="6" stroke="#2095d2" strokeWidth="1.5" fill="#e6f6fc" />
                      <text x="8" y="12" textAnchor="middle" fontSize="11" fill="#2095d2" fontWeight="bold">
                        {ride.seats}
                      </text>
                    </svg>
                  </div>
                  <div className="text-base text-gray-700 font-semibold mb-2">{ride.eta}</div>
                  <div className="text-base text-gray-600">{ride.desc}</div>
                </div>
                <div className="text-right pr-2 flex-shrink-0">
                  <div className="font-bold text-3xl text-[#2095d2] mb-1" id={`${dynamicIds.ridePrice}-${idx}`}>
                    ${ride.price.toFixed(2)}
                  </div>
                  <div className="line-through text-base text-gray-400">${ride.oldPrice.toFixed(2)}</div>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    )
  ) : null;

  // Map section component
  const map = dyn.v1.addWrapDecoy(
    "map-section",
    <section className="flex-1 min-w-0" id={dynamicIds.mapContainer}>
      <div className="w-full h-[calc(100vh-6rem)] rounded-2xl border border-gray-200 overflow-hidden bg-gray-100 shadow-lg relative">
        <img src="/map2.png" alt={pageText.mapLabel} className="absolute inset-0 w-full h-full object-cover" />
      </div>
    </section>
  );

  // Hero section component (removed - not needed)
  const hero = null;

  return (
    <div className="min-h-screen w-full bg-[#f5fbfc]">
      <DynamicLayout
        header={header}
        main={
          <div className="flex gap-8 mt-8 px-10 max-lg:flex-col max-lg:px-2 max-lg:gap-4 h-[calc(100vh-5rem)]">
            {showRides ? (
              <div className="flex gap-8 w-full max-lg:flex-col">
                <div className="w-[500px] max-lg:w-full">{booking}</div>
                <div
                  className="flex-1 min-w-0"
                  style={{ maxWidth: "100%", width: "100%" }}
                >
                  {ridesSection}
                </div>
              </div>
            ) : (
              <div className="flex gap-8 w-full max-lg:flex-col items-start">
                <div className="w-[500px] max-lg:w-full">{booking}</div>
                <div className="flex-1">{map}</div>
              </div>
            )}
          </div>
        }
      />
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
              <span className="text-[#2095d2] font-bold">{pageText.overlayPayment}</span>
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
                    discountPercentage: (
                      ((selectedRide.oldPrice - selectedRide.price) /
                        selectedRide.oldPrice) *
                      100
                    ).toFixed(2),
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
                      estimatedArrival: selectedRide.eta,
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
              {selectedRideIdx === null
                ? dyn.v3.getVariant("select-ride-label", TEXT_VARIANTS_MAP, "Select a ride")
                : pageText.reserve}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
