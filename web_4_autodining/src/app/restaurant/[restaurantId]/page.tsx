"use client";
import { useParams } from "next/navigation";
import {
  CalendarIcon,
  UserIcon,
  ChevronDownIcon,
  ClockIcon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import React, { useMemo, useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Image from "next/image";
import { useSeed } from "@/context/SeedContext";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";
import { getRestaurantById, dynamicDataProvider } from "@/dynamic/v2";
import { SeedLink } from "@/components/ui/SeedLink";
import { buildBookingHref } from "@/utils/bookingPaths";
import Navbar from "@/components/Navbar";
import { Star, MessageSquare, Trash2, Edit2, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useReviews } from "@/hooks/useReviews";
import { formatDistanceToNow } from "date-fns";

const photos = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=150&h=150",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=150&h=150",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=150&h=150",
];

type RestaurantView = {
  id: string;
  name: string;
  image: string;
  rating: number; // rating con decimales
  stars: number; // stars entero 1-5
  reviews: number;
  bookings: number;
  price: string;
  cuisine: string;
  tags: string[];
  desc: string;
  photos: string[];
};
export default function RestaurantPage() {
  const params = useParams();
  const id = params.restaurantId as string;
  const [r, setR] = useState<RestaurantView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [people, setPeople] = useState<number | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [showFullMenu, setShowFullMenu] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const dyn = useDynamicSystem();
  
  const { currentUser, isAuthenticated } = useAuth();
  const { reviews, addReview, updateReview, deleteReview } = useReviews(id);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !comment.trim()) return;

    if (editingId) {
      updateReview(editingId, rating, comment);
      setEditingId(null);
    } else {
      addReview(currentUser.username, rating, comment);
    }
    setRating(5);
    setComment("");
  };

  const handleEdit = (review: any) => {
    setEditingId(review.id);
    setRating(review.rating);
    setComment(review.comment);
    const formElement = document.getElementById("review-form");
    if (formElement) formElement.scrollIntoView({ behavior: "smooth" });
  };

  // Define labels
  const personLabel = "Guest";
  const peopleLabel = "Guests";
  const pickLabel = "Pick";
  const selectDateLabel = "Select date";
  const selectTimeLabel = "Select time";
  const bookNowLabel = dyn.v3.getVariant("reserve_now", TEXT_VARIANTS_MAP, "Book Now");

  const { seed } = useSeed();
  const v2Seed = seed;

  // Debug: Verify V2 status
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[restaurant/[restaurantId]/page] V2 status:", {
        v2Enabled: dyn.v2.isEnabled(),
      });
    }
  }, [dyn.v2]);

  const peopleOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  const timeOptions = [
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
  ];

  // Calculate ordered dropdown options at top level (hooks must be called unconditionally)
  const orderedPeopleOptions = useMemo(() => {
    const order = dyn.v1.changeOrderElements("people-options", peopleOptions.length);
    return order.map(i => peopleOptions[i]);
  }, [dyn.v1]);

  const orderedTimeOptions = useMemo(() => {
    const order = dyn.v1.changeOrderElements("time-options", timeOptions.length);
    return order.map(i => timeOptions[i]);
  }, [dyn.v1]);

  // Load restaurant data using V2 system
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setIsLoading(true);
      try {
        console.log(`[restaurant/[restaurantId]/page] Loading restaurant ${id} with seed=${seed}, v2Seed=${v2Seed}`);

        // Wait for data to be ready (DataReadyGate handles initial load, but we need to wait here too)
        await dynamicDataProvider.whenReady();

        // Reload to ensure we have the correct data for the current seed
        // This will use the seed from the URL automatically
        await dynamicDataProvider.reload(seed ?? undefined);

        // Wait again to ensure reload is complete
        await dynamicDataProvider.whenReady();

        if (!mounted) return;

        // Get restaurant directly using getRestaurantById
        const found = getRestaurantById(id);
        console.log(`[restaurant/[restaurantId]/page] Restaurant ${id} found:`, found ? found.name : "NOT FOUND");

        if (found) {
          const foundWithRating = found as { rating?: number; stars?: number };
          const rating = foundWithRating.rating ?? found.stars ?? 4.5;
          const stars = foundWithRating.stars ?? Math.round(rating);

          const mapped: RestaurantView = {
            id: found.id,
            name: found.name,
            image: found.image,
            rating: Number(rating),
            stars: Number(stars),
            reviews: Number(found.reviews ?? 0),
            bookings: Number(found.bookings ?? 0),
            price: String(found.price ?? "$$"),
            cuisine: String(found.cuisine ?? "International"),
            tags: (found as any).tags || ["cozy", "modern", "casual"],
            desc: `Enjoy a delightful experience at ${
              found.name
            }, offering a fusion of flavors in the heart of ${
              found.area ?? "Downtown"
            }.`,
            photos,
          };
          setR(mapped);
        } else {
          // Restaurant not found - log available restaurants for debugging
          const allRestaurants = dynamicDataProvider.getRestaurants();
          console.log(`[restaurant/[restaurantId]/page] Restaurant ${id} not found. Available restaurants (${allRestaurants.length}):`,
            allRestaurants.map(r => ({ id: r.id, name: r.name })).slice(0, 5)
          );
          setR(null);
        }
      } catch (error) {
        console.error("[restaurant/[restaurantId]/page] Failed to load restaurant", error);
        if (!mounted) return;
        setR(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [id, seed, v2Seed]);

  // Log view event when restaurant is loaded - MUST be before any conditional returns
  useEffect(() => {
    if (!r) return; // evita enviar si aún no hay datos
    logEvent(EVENT_TYPES.VIEW_RESTAURANT, {
      restaurantId: id,
      restaurantName: r?.name ?? "",
      cuisine: r?.cuisine ?? "",
      desc: r?.desc ?? "",
      area: "test",
      reviews: r?.reviews ?? 0,
      bookings: r?.bookings ?? 0,
      rating: r?.rating ?? 4.5,
      stars: r?.stars ?? 5,
    });
  }, [id, r]);

  const formattedDate = date ? format(date, "yyyy-MM-dd") : "2025-05-20";

  // Show loading or not found state - AFTER all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (!r) {
    return (
      <div className="min-h-screen bg-zinc-800 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-3xl font-semibold text-white mb-3">Restaurant not found</h1>
          <p className="text-gray-400 mb-6">
            Try selecting a different seed or explore the full restaurant list.
          </p>
          <SeedLink
            href="/"
            className="inline-flex rounded-full border border-zinc-700 px-6 py-3 text-sm font-medium text-gray-300 hover:bg-zinc-900 transition-colors"
          >
            Back to home
          </SeedLink>
        </div>
      </div>
    );
  }

  const handleToggleMenu = () => {
    const newState = !showFullMenu;
    setShowFullMenu(newState);

    // Define menu data that should be included in both events
    const menuData = [
      {
        category: "Mains",
        items: [
          { name: "Coq au Vin", price: "$26.00" },
          { name: "Ratatouille", price: "$20.00" },
        ],
      },
    ];

    logEvent(
      newState ? EVENT_TYPES.VIEW_FULL_MENU : EVENT_TYPES.COLLAPSE_MENU,
      {
        restaurantId: id,
        restaurantName: r?.name ?? "",
        cuisine: r?.cuisine ?? "",
        desc: r?.desc ?? "",
        area: "test",
        reviews: r?.reviews ?? 0,
        bookings: r?.bookings ?? 0,
        rating: r?.rating ?? 0,
        action: newState ? "view_full_menu" : "collapse_menu",
        time,
        date: formattedDate,
        people,
        menu: menuData,
      }
    );
  };
  const handlePeopleSelect = (n: number) => {
    setPeople(n);
    logEvent(EVENT_TYPES.PEOPLE_SELECTED, { people: n });
  };
  const handleTimeSelect = (t: string) => {
    setTime(t);
    logEvent(EVENT_TYPES.TIME_SELECTED, { time: t });
  };
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
      logEvent(EVENT_TYPES.DATE_SELECTED, { date: toLocalISO(d) });
    }
  };

  return (
    dyn.v1.addWrapDecoy("restaurant-detail-page", (
      <main
        id={dyn.v3.getVariant("restaurant-detail-page", ID_VARIANTS_MAP, "restaurant-detail-page")}
      >
      <Navbar showBack />
      {/* Banner Image */}
      {dyn.v1.addWrapDecoy("restaurant-banner", (
        <div
          className="w-full h-[340px] bg-gray-200"
          id={dyn.v3.getVariant("restaurant-banner", ID_VARIANTS_MAP, "restaurant-banner")}
        >
          <div className="relative w-full h-full">
            {r && (
              <Image
                src={r.image}
                alt={r.name}
                fill
                className="object-cover"
                id={dyn.v3.getVariant("restaurant-banner-image", ID_VARIANTS_MAP, "restaurant-banner-image")}
              />
            )}
          </div>
        </div>
      ), "restaurant-banner-wrap")}
      {/* Info and reservation */}
      <div
        className="flex flex-col md:flex-row justify-between gap-10 px-4 md:px-8 w-full max-w-[1400px] mx-auto"
        id={dyn.v3.getVariant("restaurant-info-section", ID_VARIANTS_MAP, "restaurant-info-section")}
      >
        {/* Info (details section, tags, desc, photos) */}
        <div
          className="pt-8 md:pt-12 pb-10 flex-1 min-w-0"
          id={dyn.v3.getVariant("restaurant-details", ID_VARIANTS_MAP, "restaurant-details")}
        >
          {/* Title & details row */}
          <h1
            className="text-4xl font-bold mb-2"
            id={dyn.v3.getVariant("restaurant-name", ID_VARIANTS_MAP, "restaurant-name")}
          >
            {r?.name ?? "Loading..."}
          </h1>
          {dyn.v1.addWrapDecoy("restaurant-meta", (
                <div
                  className="flex items-center gap-4 text-lg mb-4"
                  id={dyn.v3.getVariant("restaurant-meta", ID_VARIANTS_MAP, "restaurant-meta")}
                >
                  <span
                    className="flex items-center text-[#dc2626] text-xl font-semibold"
                    id={dyn.v3.getVariant("rating-stars", ID_VARIANTS_MAP, "rating-stars")}
                  >
                    {Array.from({ length: r?.stars ?? 5 }, (_, i) => i).map((i) => (
                      <span key={`star-${i}`}>★</span>
                    ))}
                    {Array.from({ length: 5 - (r?.stars ?? 5) }, (_, i) => i).map((i) => (
                      <span key={`empty-${i}`} className="text-gray-300">
                        ★
                      </span>
                    ))}
                  </span>
                  <span
                    className="text-base flex items-center gap-2"
                    id={dyn.v3.getVariant("rating-value", ID_VARIANTS_MAP, "rating-value")}
                  >
                    <span className="font-bold">
                      {r?.rating?.toFixed(1) ?? "4.5"}
                    </span>
                    <span className="text-gray-300">
                      {`${r?.reviews ?? 0} Reviews`}
                    </span>
                  </span>
                  <span
                    className="text-base flex items-center gap-2"
                    id={dyn.v3.getVariant("price-range", ID_VARIANTS_MAP, "price-range")}
                  >
                    💵 {r?.price ?? "$$"}
                  </span>
                  <span
                    className="text-base flex items-center gap-2"
                    id={dyn.v3.getVariant("cuisine-type", ID_VARIANTS_MAP, "cuisine-type")}
                  >
                    {r?.cuisine ?? "International"}
                  </span>
                </div>
          ), "restaurant-meta-wrap")}
          {/* Tags/Pills */}
          {(r?.tags || []).length > 0 && (
            <div
              className="flex flex-wrap gap-2 mb-4"
              id={dyn.v3.getVariant("restaurant-tags", ID_VARIANTS_MAP, "restaurant-tags")}
            >
              {(r?.tags || []).map((tag: string, index: number) => (
                <span
                  key={tag}
                  className="inline-flex items-center py-1.5 px-4 bg-zinc-800 rounded-full text-gray-800 font-semibold text-sm border border-zinc-800 whitespace-nowrap"
                  id={dyn.v3.getVariant(`restaurant-tag-${index}`, ID_VARIANTS_MAP, `restaurant-tag-${index}`)}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {/* Description */}
          {r?.desc && dyn.v1.addWrapDecoy("restaurant-description", (
                <div
                  className="mb-8 text-lg text-gray-300 leading-relaxed"
                  id={dyn.v3.getVariant("restaurant-description", ID_VARIANTS_MAP, "restaurant-description")}
                >
                  {r.desc}
                </div>
          ), "restaurant-description-wrap")}
          {/* Photos Grid */}
          {r?.photos && r.photos.length > 0 && (
            <>
              <h2
                className="text-2xl font-bold mb-5 mt-10"
                id={dyn.v3.getVariant("photos-title", ID_VARIANTS_MAP, "photos-title")}
              >
                Photos
              </h2>
              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12"
                id={dyn.v3.getVariant("restaurant-photos-grid", ID_VARIANTS_MAP, "restaurant-photos-grid")}
              >
                {r.photos.map((url: string, i: number) => (
                  <img
                    key={url}
                    src={url}
                    alt={`${r?.name} photo ${i + 1}`}
                    className="rounded-lg object-cover aspect-square w-full h-[160px] md:h-[200px] hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                    id={dyn.v3.getVariant(`restaurant-photo-${i}`, ID_VARIANTS_MAP, `restaurant-photo-${i}`)}
                  />
                ))}
              </div>
            </>
          )}
          {/* Menu Section */}
          {dyn.v1.addWrapDecoy("menu-section", (
                <section
                  className="w-full mb-10"
                  id={dyn.v3.getVariant("menu-section", ID_VARIANTS_MAP, "menu-section")}
                >
                  <h2
                    className="text-2xl font-bold mb-4 mt-8"
                    id={dyn.v3.getVariant("menu-title", ID_VARIANTS_MAP, "menu-title")}
                  >
                    Menu
                  </h2>
                  <div
                    className="bg-zinc-950 border rounded-lg p-6"
                    id={dyn.v3.getVariant("menu-container", ID_VARIANTS_MAP, "menu-container")}
                  >
                    <div
                      className="flex gap-6 border-b mb-6 pb-2"
                      id={dyn.v3.getVariant("menu-tabs", ID_VARIANTS_MAP, "menu-tabs")}
                    >
                      <button
                        className="border-b-2 border-[#dc2626] text-[#dc2626] font-semibold px-4 py-2 -mb-px bg-zinc-950"
                        id={dyn.v3.getVariant("menu-tab", ID_VARIANTS_MAP, "menu-tab")}
                      >
                        Main Menu
                      </button>
                    </div>
              <div className="space-y-8">
                <div>
                  <div className="font-bold text-lg mb-4 text-white">
                    Starters
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b pb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-white">
                          Cheese Board
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          Assorted artisan cheeses with honey and nuts
                        </div>
                      </div>
                      <div className="text-right font-bold text-white ml-4">
                        $14.00
                      </div>
                    </div>
                    <div className="flex justify-between items-start border-b pb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-white">
                          Smoked Salmon Tartine
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          Capers, crème fraîche, dill, and red onion
                        </div>
                      </div>
                      <div className="text-right font-bold text-white ml-4">
                        $12.00
                      </div>
                    </div>
                    <div className="flex justify-between items-start border-b pb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-white">
                          Escargot
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          Traditional French preparation with garlic butter
                        </div>
                      </div>
                      <div className="text-right font-bold text-white ml-4">
                        $16.00
                      </div>
                    </div>
                  </div>
                </div>
                {showFullMenu && (
                  <div>
                    <div className="font-bold text-lg mb-4 text-white">
                      Main Courses
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start border-b pb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-white">
                            Coq au Vin
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            Classic French braised chicken in wine sauce
                          </div>
                        </div>
                        <div className="text-right font-bold text-white ml-4">
                          $26.00
                        </div>
                      </div>
                      <div className="flex justify-between items-start border-b pb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-white">
                            Ratatouille
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            Provençal vegetable stew with herbs
                          </div>
                        </div>
                        <div className="text-right font-bold text-white ml-4">
                          $20.00
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-center pt-4">
                  {dyn.v1.addWrapDecoy("menu-toggle-button", (
                    <Button
                      className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "border-2 border-zinc-700 px-8 py-2.5 rounded-lg font-semibold bg-zinc-950 hover:bg-zinc-900 text-gray-300 transition-colors")}
                      onClick={handleToggleMenu}
                      id={dyn.v3.getVariant("menu-toggle-button", ID_VARIANTS_MAP, "menu-toggle-button")}
                    >
                      {showFullMenu
                        ? dyn.v3.getVariant("collapse_menu", TEXT_VARIANTS_MAP, "Collapse Menu")
                        : dyn.v3.getVariant("view_full_menu", TEXT_VARIANTS_MAP, "View Full Menu")
                      }
                    </Button>
                  ), "menu-toggle-button-wrap")}
                </div>
              </div>
            </div>
          </section>
          ), "menu-section-wrap")}
          {/* Additional Info Section */}
          {dyn.v1.addWrapDecoy("restaurant-info-cards", (
                <section
                  className="w-full mb-10 mt-10"
                  id={dyn.v3.getVariant("restaurant-info-section", ID_VARIANTS_MAP, "restaurant-info-section")}
                >
                  <h2
                    className="text-2xl font-bold mb-6"
                    id={dyn.v3.getVariant("about-place-title", ID_VARIANTS_MAP, "about-place-title")}
                  >
                    About This Place
                  </h2>
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                    id={dyn.v3.getVariant("info-cards-grid", ID_VARIANTS_MAP, "info-cards-grid")}
                  >
                    {dyn.v1.addWrapDecoy("info-card-cuisine", (
                      <div
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-zinc-800"
                        id={dyn.v3.getVariant("info-card-cuisine", ID_VARIANTS_MAP, "info-card-cuisine")}
                      >
                        <h3 className="font-semibold text-base mb-2 text-white flex items-center gap-2">
                          <span>🍽️</span> Cuisine
                        </h3>
                        <p className="text-gray-300 font-medium">
                          {r?.cuisine ?? "International"}
                        </p>
                      </div>
                    ), "info-card-cuisine-wrap")}
                    {dyn.v1.addWrapDecoy("info-card-price", (
                      <div
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-zinc-800"
                        id={dyn.v3.getVariant("info-card-price", ID_VARIANTS_MAP, "info-card-price")}
                      >
                        <h3 className="font-semibold text-base mb-2 text-white flex items-center gap-2">
                          <span>💰</span> Price Range
                        </h3>
                        <p className="text-gray-300 font-medium">{r?.price ?? "$$"}</p>
                      </div>
                    ), "info-card-price-wrap")}
                    {dyn.v1.addWrapDecoy("info-card-location", (
                      <div
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-zinc-800"
                        id={dyn.v3.getVariant("info-card-location", ID_VARIANTS_MAP, "info-card-location")}
                      >
                        <h3 className="font-semibold text-base mb-2 text-white flex items-center gap-2">
                          <span>📍</span> Location
                        </h3>
                        <p className="text-gray-300 font-medium">
                          {r?.desc?.includes("heart of")
                            ? r.desc.split("heart of")[1]?.replace(".", "")?.trim()
                            : "Downtown"}
                        </p>
                      </div>
                    ), "info-card-location-wrap")}
                    {dyn.v1.addWrapDecoy("info-card-times", (
                      <div
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-zinc-800"
                        id={dyn.v3.getVariant("info-card-times", ID_VARIANTS_MAP, "info-card-times")}
                      >
                        <h3 className="font-semibold text-base mb-2 text-white flex items-center gap-2">
                          <span>⏰</span> Popular Times
                        </h3>
                        <p className="text-gray-300 font-medium">7:00 PM - 9:00 PM</p>
                      </div>
                    ), "info-card-times-wrap")}
                  </div>
                </section>
          ), "restaurant-info-cards-wrap")}

          {/* Reviews Section */}
          <section className="w-full mb-10" id="reviews-section">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-red-600" />
              Customer Reviews
            </h2>

            {/* General Rating Summary - RESTORED */}
            <div
              className="bg-zinc-950 border-2 border-zinc-800 rounded-xl p-8 mb-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8"
              id="reviews-summary-box"
            >
              <div className="flex flex-col items-center">
                <div className="text-6xl font-black text-white leading-tight">
                  {r?.rating?.toFixed(1) ?? "4.6"}
                </div>
                <div className="flex items-center text-red-500 text-2xl mt-1">
                  {Array.from({ length: r?.stars ?? 5 }, (_, i) => i).map((i) => (
                    <span key={`summary-star-${i}`}>★</span>
                  ))}
                </div>
                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-3 whitespace-nowrap">
                  {`Verified on other platforms`}
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <p className="text-gray-300 text-lg leading-relaxed italic">
                  {`"Autodining users consistently praise the exceptional atmosphere and outstanding food quality at ${r?.name ?? "this restaurant"}. Recent reviews highlighted the excellent service, authentic flavors, and memorable dining experience."`}
                </p>
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="px-3 py-1 bg-zinc-800 rounded text-xs font-bold text-gray-500 uppercase tracking-tighter">
                    {`${r?.reviews ?? 305} Total reviews`}
                  </div>
                  <div className="px-3 py-1 bg-red-950 rounded text-xs font-bold text-red-600 uppercase tracking-tighter">
                    {`Top 10% in ${r?.cuisine ?? "Area"}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Write a Review - Only for authenticated users */}
            {isAuthenticated ? (
              <div className="bg-zinc-950 border-2 border-red-900 rounded-xl p-6 shadow-sm mb-8" id="review-form">
                <h3 className="font-bold text-lg mb-4 text-white">
                  {editingId ? "Edit your review" : "Write a review"}
                </h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-300">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="focus:outline-none transition-transform active:scale-125"
                        >
                          <Star
                            className={cn(
                              "w-6 h-6",
                              s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="w-full p-4 border rounded-xl bg-zinc-900 focus:ring-2 focus:ring-red-500 outline-none text-white min-h-[100px] transition-all"
                    required
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white px-6 font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      {editingId ? "Update Review" : "Submit Review"}
                      <Send className="ml-2 w-4 h-4" />
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setRating(5);
                          setComment("");
                        }}
                        className="bg-zinc-800 text-gray-400 hover:bg-gray-200"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center mb-8">
                <p className="text-gray-400">Please sign in to leave a review.</p>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="bg-zinc-950 border-2 border-gray-100 rounded-xl p-8 text-center shadow-sm">
                  <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">No reviews yet. Be the first to write one!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-200">
                          {review.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{review.username}</p>
                          <p className="text-xs text-gray-500 uppercase font-medium">
                            {formatDistanceToNow(new Date(review.date), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center bg-zinc-900 px-2 py-1 rounded-lg border">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-bold text-white">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                    
                    {/* Actions for owner */}
                    {isAuthenticated && currentUser?.username === review.username && (
                      <div className="absolute top-4 right-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(review)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-950 rounded-lg transition-colors"
                          title="Edit review"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-950 rounded-lg transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Original static summary (optional, kept for layout) */}
              {reviews.length > 0 && (
                <div className="bg-zinc-900 rounded-xl p-4 border border-dashed border-zinc-700">
                  <p className="text-xs text-center text-gray-500 uppercase tracking-widest font-bold">
                    User reviews are verified for dining experiences
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
        {/* Reservation Box - sticky and always visible */}
        {dyn.v1.addWrapDecoy("booking-widget", (
          <div
            className="rounded-xl border-2 border-zinc-800 bg-zinc-950 shadow-lg p-6 w-full max-w-sm md:sticky md:top-8 self-start"
            id={dyn.v3.getVariant("reservation-box", ID_VARIANTS_MAP, "reservation-box")}
          >
              <h2
                className="font-bold text-xl mb-4 text-center text-white"
                id={dyn.v3.getVariant("reservation-title", ID_VARIANTS_MAP, "reservation-title")}
              >
                Make a Reservation
              </h2>
          <div className="flex flex-col gap-4">
            {/* People select */}
            <div
              id={dyn.v3.getVariant("people-select-container", ID_VARIANTS_MAP, "people-select-container")}
            >
              <label
                className="block text-sm font-medium text-gray-300 mb-1.5"
                htmlFor={dyn.v3.getVariant("people_picker", ID_VARIANTS_MAP, "people_picker")}
              >
                Number of Guests
              </label>
              <Popover
                open={peopleOpen}
                onOpenChange={setPeopleOpen}
                modal={false}
              >
                <PopoverTrigger asChild>
                  <Button
                    id={dyn.v3.getVariant("people_picker", ID_VARIANTS_MAP, "people_picker")}
                    variant="outline"
                    className="w-full flex items-center justify-between border-zinc-700 hover:border-[#dc2626]"
                  >
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-300">
                        {people
                          ? `${people} ${
                              people === 1 ? personLabel : peopleLabel
                            }`
                          : `${pickLabel} ${peopleLabel}`}
                      </span>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-1"
                  align="start"
                  id={dyn.v3.getVariant("people-picker-content", ID_VARIANTS_MAP, "people-picker-content")}
                >
                  {orderedPeopleOptions.map((n) => (
                    dyn.v1.addWrapDecoy(`people-option-${n}`, (
                      <Button
                        key={n}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          handlePeopleSelect(n);
                          setPeopleOpen(false);
                        }}
                        id={dyn.v3.getVariant(`people-option-${n}`, ID_VARIANTS_MAP, `people-option-${n}`)}
                      >
                        {n} {n === 1 ? personLabel : peopleLabel}
                      </Button>
                    ), `people-option-wrap-${n}`)
                  ))}
                </PopoverContent>
              </Popover>
            </div>
            {/* Date/time row */}
            <div
              className="grid grid-cols-2 gap-3"
              id={dyn.v3.getVariant("date-time-row", ID_VARIANTS_MAP, "date-time-row")}
            >
              <div
                id={dyn.v3.getVariant("date-picker-container", ID_VARIANTS_MAP, "date-picker-container")}
              >
                <label
                  className="block text-sm font-medium text-gray-300 mb-1.5"
                  htmlFor={dyn.v3.getVariant("date_picker", ID_VARIANTS_MAP, "date_picker")}
                >
                  Date
                </label>
                <Popover
                  open={dateOpen}
                  onOpenChange={setDateOpen}
                  modal={false}
                >
                  <PopoverTrigger asChild>
                    <Button
                      id={dyn.v3.getVariant("date_picker", ID_VARIANTS_MAP, "date_picker")}
                      variant="outline"
                      className="w-full flex items-center justify-between border-zinc-700 hover:border-[#dc2626]"
                    >
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-300">
                          {date ? format(date, "MMM d") : selectDateLabel}
                        </span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    id={dyn.v3.getVariant("date-picker-content", ID_VARIANTS_MAP, "date-picker-content")}
                  >
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
              </div>
              <div
                id={dyn.v3.getVariant("time-picker-container", ID_VARIANTS_MAP, "time-picker-container")}
              >
                <label
                  className="block text-sm font-medium text-gray-300 mb-1.5"
                  htmlFor={dyn.v3.getVariant("time_picker", ID_VARIANTS_MAP, "time_picker")}
                >
                  Time
                </label>
                <Popover
                  open={timeOpen}
                  onOpenChange={setTimeOpen}
                  modal={false}
                >
                  <PopoverTrigger asChild>
                    <Button
                      id={dyn.v3.getVariant("time_picker", ID_VARIANTS_MAP, "time_picker")}
                      variant="outline"
                      className="w-full flex items-center justify-between border-zinc-700 hover:border-[#dc2626]"
                    >
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-300">
                          {time ? time : selectTimeLabel}
                        </span>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-36 p-1"
                    align="start"
                    id={dyn.v3.getVariant("time-picker-content", ID_VARIANTS_MAP, "time-picker-content")}
                  >
                    {orderedTimeOptions.map((t) => (
                      dyn.v1.addWrapDecoy(`time-option-${t}`, (
                        <Button
                          key={t}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            handleTimeSelect(t);
                            setTimeOpen(false);
                          }}
                          id={dyn.v3.getVariant(`time-option-${t}`, ID_VARIANTS_MAP, `time-option-${t}`)}
                        >
                          {t}
                        </Button>
                      ), `time-option-wrap-${t}`)
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {/* Booking button - always visible */}
            <SeedLink
              href={buildBookingHref(id, time || "1:00 PM", {
                date: formattedDate,
                people: people || 2,
              })}
              onClick={() =>
                logEvent(EVENT_TYPES.BOOK_RESTAURANT, {
                  restaurantId: id,
                  restaurantName: r?.name ?? "",
                  cuisine: r?.cuisine ?? "",
                  desc: r?.desc ?? "",
                  area: "test",
                  reviews: r?.reviews ?? 0,
                  bookings: r?.bookings ?? 0,
                  rating: r?.rating ?? 0,
                  date: formattedDate,
                  time: time || "1:00 PM",
                  people: people || 2,
                })
              }
            >
              <Button
                id={dyn.v3.getVariant("book_button", ID_VARIANTS_MAP, "book_button")}
                className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "w-full bg-[#dc2626] hover:bg-[#3d8f4a] text-white px-6 py-3 rounded-lg font-semibold text-base shadow-sm transition-colors")}
              >
                {bookNowLabel}
              </Button>
            </SeedLink>
          </div>
          </div>
        ))}
      </div>
      </main>
    ), "restaurant-detail-page-wrap")
  );
}
