"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, parseISO, isValid } from "date-fns";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React from "react";
import { EVENT_TYPES, logEvent } from "@/components/library/events";
import Cookies from "js-cookie";

// Demo restaurant data (with Unsplash/same-assets URLs or replaced with stock for now)
const namePool = [
  "The Royal Dine",
  "Vintage Bites",
  "Evening Delight",
  "River View Café",
  "Fancy Lights Bistro",
  "Urban Palate",
  "Tandoori House",
  "Zen Sushi",
  "El Toro",
  "Bella Vita",
  "Coastal Catch",
  "Harvest Table",
  "Crimson Spoon",
  "Golden Lotus",
  "The Hungry Fork",
  "Ocean's Plate",
  "Fire & Spice",
  "Olive & Vine",
  "La Bella Cucina",
  "Sunset Grill",
  "Noir Brasserie",
  "Blue Orchid",
  "Saffron Garden",
  "Rustic Roots",
  "Amber Lounge",
  "Bistro Lumière",
  "Maple Hearth",
  "Oak & Ember",
  "Peppercorn Place",
  "The Local Dish",
  "Cedar Grove Café",
  "Soleil Bistro",
  "Brickhouse Eats",
  "Wanderlust Grill",
  "The Nest",
  "Cafe Verona",
  "Midtown Meals",
  "Ginger & Thyme",
  "Lavender & Sage",
  "Hearthstone Inn",
  "Juniper Table",
  "The Garden Fork",
  "Twilight Tapas",
  "Meadow & Moor",
  "The Vine",
  "Ember Flame",
  "Miso Modern",
  "The Borough",
  "Copper Kitchen",
  "Pine & Poppy",
];

const cuisines = [
  "French",
  "Italian",
  "American",
  "Japanese",
  "Mexican",
  "Indian",
  "Thai",
  "Café",
  "Mediterranean",
];
const areas = [
  "Mission District",
  "SOMA",
  "North Beach",
  "Downtown",
  "Hayes Valley",
  "Nob Hill",
  "Japantown",
  "Embarcadero",
  "Marina",
];

const staticReviews = [
  18, 22, 35, 47, 53, 62, 71, 28, 39, 44, 55, 66, 72, 80, 91, 24, 31, 42, 48,
  60, 70, 15, 33, 45, 59, 63, 76, 81, 95, 38, 49, 51, 58, 64, 77, 82, 87, 90,
  96, 99, 19, 26, 29, 36, 46, 54, 61, 73, 85, 88,
];
const staticBookings = [
  6, 12, 17, 23, 27, 32, 37, 40, 43, 50, 57, 65, 67, 69, 74, 79, 84, 86, 89, 92,
  94, 97, 98, 100, 13, 14, 16, 20, 21, 25, 30, 34, 41, 52, 56, 68, 75, 78, 83,
  93, 7, 8, 9, 10, 11, 35, 38, 60, 70, 90,
];
const staticStars = [
  3, 4, 5, 4, 5, 3, 4, 5, 3, 4, 3, 5, 4, 5, 3, 4, 5, 3, 4, 5, 4, 5, 3, 4, 5, 3,
  4, 5, 3, 4, 5, 4, 5, 3, 4, 5, 3, 4, 5, 4, 3, 4, 5, 3, 4, 5, 3, 4, 5, 4,
];
const staticPrices = [
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
  "$$$$",
  "$$",
  "$$$",
];

const restaurants = Array.from({ length: 50 }, (_, i) => {
  return {
    id: `restaurant-${i + 1}`,
    name: namePool[i],
    image: `/images/restaurant${(i % 19) + 1}.jpg`,
    stars: staticStars[i],
    reviews: staticReviews[i],
    cuisine: cuisines[i % cuisines.length],
    price: staticPrices[i],
    bookings: staticBookings[i],
    area: areas[i % areas.length],
    times: ["1:00 PM"],
  };
});

// Split restaurants into unique sets per section
const lunchRestaurants = restaurants.slice(0, 15);
const iconRestaurants = restaurants.slice(15, 30);
const awardRestaurants = restaurants.slice(30, 50);

function StarRating({ count }: { count: number }) {
  return (
    <span className="text-[#46a758] text-xl align-middle mr-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < count ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

function StarNumber({ rating }: { rating: number }) {
  return (
    <span className="text-[#46a758] font-bold inline-flex items-center ml-1 mr-1">
      <span className="text-lg">★</span> {rating.toFixed(2)}
    </span>
  );
}

function RestaurantCard({
  r,
  date,
  people,
  time,
}: {
  r: (typeof restaurants)[0];
  date: Date | undefined;
  people: number;
  time: string;
}) {
  const formattedDate = date ? format(date, "yyyy-MM-dd") : "2025-05-20";
  return (
    <div className="rounded-xl border shadow-sm bg-white w-[255px] flex-shrink-0 overflow-hidden flex flex-col justify-between">
      <Link
        href={`/restaurant/${r.id}`}
        passHref
        onClick={() =>
          logEvent(EVENT_TYPES.VIEW_RESTAURANT, {
            restaurantId: r.id,
            restaurantName: r.name,
            cuisine: r.cuisine,
            area: r.area,
            reviews: r.reviews,
          })
        }
      >
        <img
          src={r.image}
          alt={r.name}
          className="w-full h-[140px] object-cover rounded-t-xl border-b cursor-pointer hover:opacity-90 transition"
        />
      </Link>
      <div className="p-3 flex flex-col gap-1 h-full">
        <div className="font-bold text-lg mb-1">{r.name}</div>
        <div className="flex items-center mb-1">
          <StarRating count={r.stars} />
          <span className="ml-1 text-gray-600 text-sm">
            {r.reviews} reviews
          </span>
        </div>
        <div className="text-[15px] text-gray-500 mb-1">
          {r.cuisine} . {r.price} . {r.area}
        </div>
        <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
          <svg
            height="16"
            width="16"
            viewBox="0 0 16 16"
            fill="none"
            className="inline text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.666 13.333v-2a2.667 2.667 0 00-2.666-2.666H6a2.667 2.667 0 00-2.667 2.666v2"
              stroke="#222"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="8"
              cy="5.333"
              r="2.667"
              stroke="#222"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Booked {r.bookings} times today
        </div>
        <div className="flex gap-1 mt-2">
          {r.times.map((t) => (
            <Link
              key={t}
              href={`/booking/${r.id}/${encodeURIComponent(
                time
              )}?date=${formattedDate}&people=${people}&time=${encodeURIComponent(
                time
              )}`}
              onClick={() =>
                logEvent(EVENT_TYPES.BOOK_RESTAURANT, {
                  restaurantId: r.id,
                  restaurantName: r.name,
                  date: formattedDate,
                  time: time,
                  people,
                })
              }
              passHref
            >
              <Button
                className="bg-[#46a758] hover:bg-[#357040] text-white font-semibold px-3 py-1 rounded-md text-sm"
                asChild
              >
                <span>Book Restaurant</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardScroller({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    function check() {
      const el = ref.current;
      if (!el) return;
      setShowLeft(el.scrollLeft > 4);
      setShowRight(el.scrollLeft + el.offsetWidth < el.scrollWidth - 4);
    }
    check();
    ref.current?.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    return () => {
      ref.current?.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  const scrollByAmount = 260 * 2; // scroll by two cards at a time
  const scroll = (dir: number) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * scrollByAmount, behavior: "smooth" });

    logEvent("SCROLL_VIEW", {
      direction: dir > 0 ? "right" : "left",
      visibleCount: ref.current.children.length,
      sectionTitle: title,
    });
  };

  return (
    <div className="relative w-full" suppressHydrationWarning>
      <button
        onClick={() => scroll(-1)}
        className="absolute z-10 left-0 top-1/2 -translate-y-1/2 bg-white border shadow rounded-full p-2 flex items-center justify-center"
        style={{ marginLeft: -24 }}
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-6 w-6 text-[#444]" />
      </button>
      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide pl-1 pr-10"
      >
        {children}
      </div>
      <button
        onClick={() => scroll(1)}
        className="absolute z-10 right-0 top-1/2 -translate-y-1/2 bg-white border shadow rounded-full p-2 flex items-center justify-center"
        style={{ marginRight: -24 }}
        aria-label="Scroll right"
      >
        <ChevronRight className="h-6 w-6 text-[#444]" />
      </button>
    </div>
  );
}

export default function HomePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("1:00 PM");
  const [people, setPeople] = useState(2);
  const [search, setSearch] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);

  // useEffect(() => {
  //   const savedDate = Cookies.get("reservation_date");
  //   console.log("Cookie reservation_date:", savedDate); // Debug cookie value

  //   if (savedDate) {
  //     const parsedDate = parseISO(savedDate);
  //     if (isValid(parsedDate)) {
  //       setDate(parsedDate);
  //     } else {
  //       console.warn("Invalid cookie date, using current date:", savedDate);
  //       setDate(new Date());
  //     }
  //   }
  // }, []);

  function toLocalISO(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    const tzOffset = -date.getTimezoneOffset();
    const sign = tzOffset >= 0 ? "+" : "-";
    const offsetHours = pad(Math.floor(Math.abs(tzOffset) / 60));
    const offsetMinutes = pad(Math.abs(tzOffset) % 60);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
  }

  const handleDateSelect = (d: Date | undefined) => {
    setDate(d);
    if (d) {
      const isoDate = toLocalISO(d);
      Cookies.set("reservation_date", isoDate);
      logEvent(EVENT_TYPES.DATE_DROPDOWN_OPENED, { date: isoDate });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    logEvent(EVENT_TYPES.SEARCH_RESTAURANT, { query: value });
  };

  const handleTimeSelect = (t: string) => {
    setTime(t);
    Cookies.set("reservation_time", t);
    logEvent(EVENT_TYPES.TIME_DROPDOWN_OPENED, { time: t });
  };

  const handlePeopleSelect = (n: number) => {
    setPeople(n);
    Cookies.set("reservation_people", String(n));
    logEvent(EVENT_TYPES.PEOPLE_DROPDOWN_OPENED, { people: n });
  };

  function matches(r: (typeof restaurants)[0]): boolean {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.area.toLowerCase().includes(q)
    );
  }

  const filtered = restaurants.filter(matches);
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
    <main suppressHydrationWarning>
      {/* Navigation/Header */}
      <nav className="w-full border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-20 px-4 gap-2">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="bg-[#46a758] px-3 py-1 rounded flex items-center h-9">
                <span className="font-bold text-white text-lg">AutoDining</span>
              </div>
            </Link>
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
              href="#"
            >
              FAQs
            </Link>
          </div>
        </div>
      </nav>

      {/* Controls Bar */}
      <section className="flex flex-wrap items-center gap-4 mt-8 mb-4 px-4">
        {/* Date Picker */}
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 min-w-[120px] justify-start"
            >
              <CalendarIcon className="h-5 w-5 text-gray-700" />
              {date ? format(date, "MMM d") : "Pick date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                handleDateSelect(d);
                setDateOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {/* Time Dropdown */}
        <Popover open={timeOpen} onOpenChange={setTimeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 min-w-[120px] justify-start"
            >
              <ClockIcon className="h-5 w-5 text-gray-700" />
              {time ? time : "Pick Time"}
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-36 p-1">
            {timeOptions.map((t) => (
              <Button
                key={t}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  handleTimeSelect(t);
                  setTimeOpen(false);
                }}
              >
                {t}
              </Button>
            ))}
          </PopoverContent>
        </Popover>
        {/* People Dropdown */}
        <Popover open={peopleOpen} onOpenChange={setPeopleOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 min-w-[120px] justify-start"
            >
              <UserIcon className="h-5 w-5 text-gray-700" />
              {people ? people : "Pick People"}{" "}
              {people === 1 ? "person" : "people"}{" "}
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-36 p-1">
            {peopleOptions.map((n) => (
              <Button
                key={n}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  handlePeopleSelect(n);
                  setPeopleOpen(false);
                }}
              >
                {n} {n === 1 ? "person" : "people"}
              </Button>
            ))}
          </PopoverContent>
        </Popover>
        {/* Search box & button */}
        <input
          type="text"
          placeholder="Location, Restaurant, or Cuisine"
          className="rounded p-2 min-w-[250px] border border-gray-300 flex-1"
          value={search}
          onChange={handleSearchChange}
        />
        <button className="ml-2 px-5 py-2 rounded text-lg bg-[#46a758] text-white">
          Let's go
        </button>
      </section>

      {/* Main Content - Cards, Sections, etc. */}
      <section className="px-4">
        <h2 className="text-2xl font-bold mb-4 mt-8">
          Available for lunch now
        </h2>
        <CardScroller title="Available for lunch now">
          {filtered.map((r) => (
            <RestaurantCard
              key={r.id + "-lunch"}
              r={r}
              date={date}
              people={people}
              time={time}
            />
          ))}
        </CardScroller>
      </section>

      {/* Introducing OpenDinning Icons Section */}
      <section className="mt-8 rounded-xl bg-[#f7f7f6] border px-4">
        <div className="flex flex-row justify-between items-center mb-1">
          <div>
            <h2 className="text-2xl md:text-2xl font-bold">
              Introducing OpenDinning Icons
            </h2>
            <div className="text-base text-gray-600 mt-1 mb-3">
              Book the city's award-winners, hot newcomers, and hard-to-get
              tables.
            </div>
          </div>
          <button className="border px-5 py-2 rounded-md text-base font-semibold hover:bg-gray-100 whitespace-nowrap h-12">
            Explore Icon restaurants
          </button>
        </div>
        <CardScroller title="Introducing OpenDinning Icons">
          {iconRestaurants.map((r) => (
            <RestaurantCard
              key={r.id + "-icon"}
              r={r}
              date={date}
              people={people}
              time={time}
            />
          ))}
        </CardScroller>
      </section>

      {/* Award-winning Section */}
      <section className="mt-8 px-4">
        <h2 className="text-2xl font-bold mb-4">Award-winning</h2>
        <CardScroller title="Award-winning">
          {awardRestaurants.map((r) => (
            <RestaurantCard
              key={r.id + "-award"}
              r={r}
              date={date}
              time={time}
              people={people}
            />
          ))}
        </CardScroller>
      </section>

      {/* Diners' Favorite Section */}
      <section className="mt-10 mb-6 px-4">
        <h2 className="text-2xl font-bold mb-1">
          Check out diners' favorite restaurants in San Francisco Bay Area
        </h2>
        <div className="text-base text-gray-600 mb-6">
          Diners' Choice Awards are based on where your fellow diners book,
          dine, and review. Only verified diners get to review restaurants on
          OpenDinning, so our data doesn't lie.
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Top pick */}
          <Link
            href={`/restaurant/${restaurants[0].id}`}
            passHref
            className="flex-[2] min-w-[270px] cursor-pointer group"
            onClick={() =>
              logEvent(EVENT_TYPES.VIEW_RESTAURANT, {
                restaurantId: restaurants[0].id,
                restaurantName: restaurants[0].name,
                cuisine: restaurants[0].cuisine,
                area: restaurants[0].area,
                reviews: restaurants[0].reviews,
              })
            }
          >
            <div>
              <img
                className="rounded-lg w-full max-h-60 object-cover mb-2 group-hover:opacity-90 transition"
                src={restaurants[0].image}
                alt={restaurants[0].name}
              />
              <div className="font-bold text-lg">{restaurants[0].name}</div>
              <div className="text-gray-500 text-sm mb-1">
                Diners top pick · {restaurants[0].cuisine}{" "}
                <StarNumber rating={restaurants[0].stars} />{" "}
                <span className="text-gray-600">
                  ({restaurants[0].reviews})
                </span>
              </div>
              <div className="text-gray-700 text-[15px]">
                Located in {restaurants[0].area}, {restaurants[0].name} is a
                favorite for {restaurants[0].cuisine} cuisine lovers.
              </div>
            </div>
          </Link>

          {/* Next two favorites */}
          <div className="flex flex-1 flex-col gap-3 min-w-56">
            {restaurants.slice(1, 3).map((r) => (
              <Link
                key={r.id}
                href={`/restaurant/${r.id}`}
                passHref
                className="flex flex-row gap-3 items-start border-b pb-3 last:border-b-0 cursor-pointer group"
                onClick={() =>
                  logEvent(EVENT_TYPES.VIEW_RESTAURANT, {
                    restaurantId: r.id,
                    restaurantName: r.name,
                    cuisine: r.cuisine,
                    area: r.area,
                    reviews: r.reviews,
                  })
                }
              >
                <img
                  className="w-24 h-20 rounded-lg object-cover group-hover:opacity-90 transition"
                  src={r.image}
                  alt={r.name}
                />
                <div className="flex-1 flex flex-col">
                  <div className="font-semibold text-lg">{r.name}</div>
                  <div className="text-gray-500 text-sm mb-1">
                    {r.price} • {r.cuisine} <StarNumber rating={r.stars} />{" "}
                    <span className="text-gray-700">({r.reviews})</span>
                  </div>
                  <div className="text-gray-700 text-[15px] line-clamp-2">
                    Located in {r.area}, well-rated by {r.reviews} diners.
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
