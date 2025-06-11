"use client";
import { useParams, useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  addDays,
  format,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  setHours,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useRef } from "react";

const PROPERTIES = [
  {
    image: "/images/image.png",
    title: "Cabin in the woods",
    location: "Asheville, USA",
    rating: 4.0,
    reviews: 7,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    datesFrom: "2025-07-12",
    datesTo: "2025-07-16",
    price: 127,
    host: {
      name: "Natalie",
      since: 4,
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    amenities: [
      {
        icon: "\u{1F4BB}",
        title: "Dedicated workspace",
        desc: "A common area with wifi that's well-suited for working.",
      },
      {
        icon: "\u{1F4CD}",
        title: "Great location",
        desc: "100% of recent guests gave the location a 5-star rating.",
      },
      {
        icon: "\u{1F50D}",
        title: "Great check-in experience",
        desc: "100% of recent guests gave the check-in process a 5-star rating.",
      },
    ],
  },
  {
    image: "/images/hotel1.png",
    title: "Lake House Retreat",
    location: "Kelowna, Canada",
    rating: 4.3,
    reviews: 12,
    guests: 6,
    bedrooms: 3,
    beds: 4,
    baths: 2,
    datesFrom: "2025-07-18",
    datesTo: "2025-07-24",
    price: 571,
    host: {
      name: "Alex",
      since: 2,
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    amenities: [
      {
        icon: "\u{1F3DD}",
        title: "Lake view",
        desc: "Enjoy beautiful sunrises on the water.",
      },
      {
        icon: "\u{1F32C}",
        title: "Mountain views",
        desc: "Views of the Rockies from the balcony.",
      },
      {
        icon: "\u{1F6CC}",
        title: "Family friendly",
        desc: "Cribs, highchair, and backyard play area.",
      },
    ],
  },
  {
    image: "images/hotel2.png",
    title: "Mountain Escape",
    location: "Zermatt, Switzerland",
    rating: 4.34,
    reviews: 29,
    guests: 4,
    bedrooms: 2,
    beds: 3,
    baths: 2,
    datesFrom: "2025-07-28",
    datesTo: "2025-08-10",
    price: 960,
    host: {
      name: "Sofia",
      since: 6,
      avatar: "https://randomuser.me/api/portraits/women/40.jpg",
    },
    amenities: [
      {
        icon: "\u{1F973}",
        title: "Hot tub",
        desc: "Relax after your alpine adventure.",
      },
      {
        icon: "\u{1F37D}",
        title: "Gourmet kitchen",
        desc: "Fully equipped for family meals.",
      },
      {
        icon: "\u{1F3D6}",
        title: "Resort access",
        desc: "Free shuttle to ski slopes.",
      },
    ],
  },
  {
    image: "images/hotel3.png",
    title: "Parisian Getaway",
    location: "Paris, France",
    rating: 4.33,
    reviews: 15,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    datesFrom: "2025-08-15",
    datesTo: "2025-08-22",
    price: 268,
    host: {
      name: "Juliette",
      since: 8,
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    },
    amenities: [
      {
        icon: "\u{1F4DA}",
        title: "Library",
        desc: "Curated collection of Parisian literature.",
      },
      {
        icon: "\u{1F3A0}",
        title: "Central location",
        desc: "Steps from the Metro.",
      },
    ],
  },
  {
    image: "images/hotel4.png",
    title: "Cozy Beach House",
    location: "Byron Bay, Australia",
    rating: 4.31,
    reviews: 9,
    guests: 8,
    bedrooms: 4,
    beds: 6,
    baths: 2,
    datesFrom: "2025-07-20",
    datesTo: "2025-07-30",
    price: 969,
    host: {
      name: "Ella",
      since: 3,
      avatar: "https://randomuser.me/api/portraits/women/31.jpg",
    },
    amenities: [
      {
        icon: "\u{1F3D6}",
        title: "Beach access",
        desc: "Walk to sand in 3 minutes.",
      },
      { icon: "\u{1F30A}", title: "Private pool", desc: "Heated and fenced." },
      { icon: "\u{1F6F8}", title: "Bikes included", desc: "Surf the coast!" },
    ],
  },
  {
    image: "images/hotel5.png",
    title: "Countryside Retreat",
    location: "Cotswolds, UK",
    rating: 4.43,
    reviews: 10,
    guests: 4,
    bedrooms: 2,
    beds: 3,
    baths: 2,
    datesFrom: "2025-09-01",
    datesTo: "2025-09-07",
    price: 211,
    host: {
      name: "Oliver",
      since: 5,
      avatar: "https://randomuser.me/api/portraits/men/37.jpg",
    },
    amenities: [
      {
        icon: "\u{1F343}",
        title: "Garden",
        desc: "Outdoor seating and flower beds.",
      },
      {
        icon: "\u{26F0}",
        title: "Country views",
        desc: "See sheep and rolling hills.",
      },
    ],
  },
  {
    image: "images/hotel6.png",
    title: "Garden Oasis",
    location: "Amsterdam, Netherlands",
    rating: 4.32,
    reviews: 11,
    guests: 3,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    datesFrom: "2025-07-15",
    datesTo: "2025-07-19",
    price: 537,
    host: {
      name: "Mia",
      since: 2,
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    },
    amenities: [
      {
        icon: "\u{1F33F}",
        title: "Private garden",
        desc: "Secluded space for relaxation.",
      },
      {
        icon: "\u{1F3F0}",
        title: "Historic building",
        desc: "18th-century canal house.",
      },
    ],
  },
  {
    image: "images/hotel7.png",
    title: "Modern City Apartment",
    location: "New York, USA",
    rating: 4.27,
    reviews: 25,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    datesFrom: "2025-07-25",
    datesTo: "2025-07-28",
    price: 258,
    host: {
      name: "Harper",
      since: 7,
      avatar: "https://randomuser.me/api/portraits/men/47.jpg",
    },
    amenities: [
      { image: "\u{1F4BB}", title: "Fast Wi-Fi", desc: "1Gbps optic fiber." },
      { icon: "\u{1F9F0}", title: "Washer/dryer", desc: "Laundry in unit." },
    ],
  },
  {
    image: "/images/hotel8.png",
    title: "Seaside Villa",
    location: "Mykonos, Greece",
    rating: 4.72,
    reviews: 21,
    guests: 6,
    bedrooms: 3,
    beds: 4,
    baths: 2,
    datesFrom: "2025-08-05",
    datesTo: "2025-08-12",
    price: 685,
    host: {
      name: "Niko",
      since: 5,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    amenities: [
      {
        icon: "\u{1F3D6}",
        title: "Beachfront",
        desc: "Step outside to the Aegean Sea.",
      },
      {
        icon: "\u{1F6CB}",
        title: "Infinity pool",
        desc: "Swim with an endless horizon.",
      },
      {
        icon: "\u{1F3A1}",
        title: "Nightlife nearby",
        desc: "Close to beach bars and clubs.",
      },
    ],
  },
  {
    image: "/images/hotel9.png",
    title: "Tokyo Highrise",
    location: "Tokyo, Japan",
    rating: 4.58,
    reviews: 33,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    datesFrom: "2025-09-01",
    datesTo: "2025-09-06",
    price: 312,
    host: {
      name: "Hana",
      since: 3,
      avatar: "https://randomuser.me/api/portraits/women/52.jpg",
    },
    amenities: [
      {
        icon: "\u{1F4F1}",
        title: "High-speed Wi-Fi",
        desc: "1Gbps fiber for work or play.",
      },
      {
        icon: "\u{1F4FA}",
        title: "Smart TV",
        desc: "Includes Netflix & Prime.",
      },
      {
        icon: "\u{1F5A5}",
        title: "City view",
        desc: "Panoramic skyline at night.",
      },
    ],
  },
  {
    image: "/images/hotel10.png",
    title: "Moroccan Riad",
    location: "Marrakech, Morocco",
    rating: 4.81,
    reviews: 18,
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    datesFrom: "2025-10-10",
    datesTo: "2025-10-18",
    price: 432,
    host: {
      name: "Zahra",
      since: 6,
      avatar: "https://randomuser.me/api/portraits/women/36.jpg",
    },
    amenities: [
      {
        icon: "\u{1F33F}",
        title: "Private courtyard",
        desc: "Relax in traditional decor.",
      },
      {
        icon: "\u{1F36F}",
        title: "Mint tea service",
        desc: "Daily Moroccan mint tea.",
      },
      {
        icon: "\u{1F3E8}",
        title: "Local art",
        desc: "Handcrafted tile and textiles.",
      },
    ],
  },
  {
    image: "/images/hotel11.png",
    title: "Nordic Glass Cabin",
    location: "Lapland, Finland",
    rating: 4.76,
    reviews: 16,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    datesFrom: "2025-12-20",
    datesTo: "2025-12-27",
    price: 490,
    host: {
      name: "Erik",
      since: 4,
      avatar: "https://randomuser.me/api/portraits/men/19.jpg",
    },
    amenities: [
      {
        icon: "\u{2744}",
        title: "Aurora views",
        desc: "Glass roof for watching the Northern Lights.",
      },
      {
        icon: "\u{1F9F4}",
        title: "Sauna included",
        desc: "Private Finnish sauna with wood stove.",
      },
      {
        icon: "\u{1F33F}",
        title: "Eco-heated",
        desc: "Geothermal underfloor heating system.",
      },
    ],
  }
  
  
];

function toStartOfDay(date: Date) {
  if (!date) return date;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function PropertyDetail() {
  const router = useRouter();
  const didTrack = useRef(false);
  const params = useParams<{ id: string }>();
  const { id } = params;
  const prop = PROPERTIES[Number(id)] ?? PROPERTIES[0];
  const stayFrom = new Date(prop.datesFrom);
  const stayTo = new Date(prop.datesTo);
  const availableDates = useMemo(
    () => eachDayOfInterval({ start: stayFrom, end: addDays(stayTo, -1) }),
    [stayFrom, stayTo]
  );
  // Booking calendar state
  const [selected, setSelected] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: stayFrom, to: stayTo });
  const [guests, setGuests] = useState(1);

  // Selection helpers
  const rangeIsExact =
    selected.from &&
    selected.to &&
    toStartOfDay(selected.from).getTime() ===
      toStartOfDay(stayFrom).getTime() &&
    toStartOfDay(selected.to).getTime() === toStartOfDay(stayTo).getTime();

  // Button states
  const nights =
    selected.from && selected.to
      ? (toStartOfDay(addDays(selected.to, -1)).getTime() -
          toStartOfDay(selected.from).getTime()) /
        (1000 * 60 * 60 * 24)
      : 0;

  const cleaningFee = 15;
  const priceSubtotal = prop.price * nights;
  const total = priceSubtotal + cleaningFee;

  function isWithinAvailable(date: Date) {
    return isWithinInterval(date, {
      start: stayFrom,
      end: addDays(stayTo, -1),
    });
  }
  // ✅ Trigger VIEW_HOTEL on mount
  useEffect(() => {
    if (!didTrack.current) {
      logEvent(EVENT_TYPES.VIEW_HOTEL, {
        id,
        title: prop.title,
        location: prop.location,
        rating: prop.rating,
        price: prop.price,
        dates: { from: prop.datesFrom, to: prop.datesTo },
        guests: prop.guests,
        host: prop.host,
        amenities: prop.amenities?.map((a) => a.title),
      });
      didTrack.current = true;
    }
  }, [id]);

  // For calendar: disable all outside available, highlight selection
  return (
    <div className="flex flex-row gap-10 w-full max-w-6xl mx-auto mt-7">
      <div className="flex-1 min-w-0 pr-6">
        <h1 className="text-2xl font-bold mb-2 leading-7">
          Entire Rental Unit in {prop.location}
        </h1>
        <div className="mb-3 text-neutral-700 text-[16px] flex gap-2 flex-wrap items-center">
          <span>{prop.guests} guests</span>
          <span>· {prop.bedrooms} bedroom</span>
          <span>· {prop.beds} bed</span>
          <span>· {prop.baths} bath</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-lg font-semibold flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#FF5A5F"
              width={18}
              height={18}
              viewBox="0 0 24 24"
              stroke="none"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>{" "}
            {prop.rating.toFixed(2)}
          </span>
          <span className="text-neutral-600">
            · {prop.reviews ?? 30} reviews
          </span>
        </div>
        <hr className="my-4" />
        <div className="mb-4 flex items-center gap-3">
          <Image
            src={prop.host.avatar}
            alt={prop.host.name}
            width={54}
            height={54}
            className="rounded-full border"
          />
          <div>
            <div className="font-medium text-neutral-800">
              Hosted by {prop.host.name}
            </div>
            <div className="text-neutral-500 text-sm">
              {prop.host.since} years hosting
            </div>
          </div>
        </div>
        <hr className="my-3" />
        <div className="flex flex-col gap-7 mt-4">
          {prop.amenities?.map((f, i) => (
            <div className="flex items-start gap-4" key={f.title}>
              <span className="text-2xl pt-1">{f.icon}</span>
              <div>
                <div className="font-semibold text-neutral-900 text-[17px]">
                  {f.title}
                </div>
                <div className="text-neutral-500 text-sm -mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Sidebar/summary */}
      <div className="w-[350px] min-w-[300px] bg-white shadow-md rounded-2xl border flex flex-col p-6 sticky top-8 h-fit">
        <div className="text-2xl font-bold mb-1">
          ${prop.price.toFixed(2)}{" "}
          <span className="text-base text-neutral-600 font-medium">
            USD <span className="font-normal">night</span>
          </span>
        </div>
        <div className="flex gap-3 mt-3 mb-4">
          <div className="flex-1 border rounded-md px-3 py-2">
            <div className="text-xs text-neutral-500 font-semibold">
              CHECK-IN
            </div>
            <div className="tracking-wide text-[15px]">
              {selected.from ? format(selected.from, "MM/dd/yyyy") : "–"}
            </div>
          </div>
          <div className="flex-1 border rounded-md px-3 py-2">
            <div className="text-xs text-neutral-500 font-semibold">
              CHECK-OUT
            </div>
            <div className="tracking-wide text-[15px]">
              {selected.to ? format(selected.to, "MM/dd/yyyy") : "–"}
            </div>
          </div>
        </div>
        <div className="border rounded-md px-3 py-2 mb-3">
          <div className="text-xs text-neutral-500 font-semibold">GUESTS</div>
          <input
            className="bg-transparent text-[15px] w-full p-0 border-none outline-none"
            value={guests}
            type="number"
            min={1}
            max={prop.guests}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value > guests) {
                logEvent(EVENT_TYPES.INCREASE_NUMBER_OF_GUESTS, {
                  from: guests,
                  to: value,
                });
              } else if (value < guests) {
                logEvent(EVENT_TYPES.DECREASE_NUMBER_OF_GUESTS, {
                  from: guests,
                  to: value,
                });
              }
              setGuests(value);
            }}
          />
        </div>
        {selected.from && selected.to && (
          <button
            className="rounded-lg w-full py-3 text-white font-semibold text-base bg-[#616882] hover:bg-[#8692bd] transition mb-3 shadow focus:outline-none"
            onClick={async () => {
              const checkin = format(selected.from!, "yyyy-MM-dd");
              const checkout = format(selected.to!, "yyyy-MM-dd");

              console.log("🔔 Reserve clicked", { checkin, checkout, guests });

              try {
                await logEvent(EVENT_TYPES.RESERVE_HOTEL, {
                  id,
                  checkin,
                  checkout,
                  guests,
                });
              } catch (err) {
                console.error("❌ logEvent failed", err);
              }

              router.push(
                `/stay/${params.id}/confirm?checkin=${checkin}&checkout=${checkout}&guests=${guests}`
              );
            }}
          >
            Reserve
          </button>
        )}
        {(!selected.from || !selected.to) && (
          <button
            disabled
            className="rounded-lg w-full py-3 text-neutral-400 font-semibold text-base bg-neutral-100 mb-3 shadow cursor-not-allowed"
          >
            Check Availability
          </button>
        )}
        <div className="text-center text-neutral-400 text-sm mb-4">
          You won't be charged yet
        </div>
        <div className="flex flex-col gap-2 text-[15px]">
          <div className="flex items-center justify-between">
            <span className="underline">
              ${prop.price.toFixed(2)} USD x {nights} nights
            </span>
            <span>${priceSubtotal.toFixed(2)} USD</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="underline">Cleaning fee</span>{" "}
            <span>${cleaningFee} USD</span>
          </div>
          <hr />
          <div className="flex items-center justify-between font-bold text-neutral-900">
            <span>Total</span> <span>${total.toFixed(2)} USD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
