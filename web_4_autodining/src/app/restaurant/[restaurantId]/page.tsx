"use client";
import { useParams } from "next/navigation";
import { CalendarIcon, UserIcon, ChevronDownIcon, ClockIcon, Star, MessageSquare, Trash2, Edit2, Send } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import type React from "react";
import { useMemo, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useSeed } from "@/context/SeedContext";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { getRestaurantById, dynamicDataProvider } from "@/dynamic/v2";
import { SeedLink } from "@/components/ui/SeedLink";
import { buildBookingHref } from "@/utils/bookingPaths";
import { cn } from "@/library/utils";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useReviews } from "@/hooks/useReviews";

const photos = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=150&h=150",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=150&h=150",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=150&h=150",
];

type RestaurantView = {
  id: string; name: string; image: string; rating: number; stars: number;
  reviews: number; bookings: number; price: string; cuisine: string;
  tags: string[]; desc: string; photos: string[];
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
  const personLabel = "Guest";
  const peopleLabel = "Guests";
  const pickLabel = "Pick";
  const selectDateLabel = "Select date";
  const selectTimeLabel = "Select time";
  const bookNowLabel = dyn.v3.getVariant("reserve_now", TEXT_VARIANTS_MAP, "Book Now");
  const { seed } = useSeed();
  const v2Seed = seed;
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[restaurant/[restaurantId]/page] V2 status:", { v2Enabled: dyn.v2.isEnabled() });
    }
  }, [dyn.v2]);
  const peopleOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  const timeOptions = ["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM"];
  const orderedPeopleOptions = useMemo(() => {
    const order = dyn.v1.changeOrderElements("people-options", peopleOptions.length);
    return order.map(i => peopleOptions[i]);
  }, [dyn.v1]);
  const orderedTimeOptions = useMemo(() => {
    const order = dyn.v1.changeOrderElements("time-options", timeOptions.length);
    return order.map(i => timeOptions[i]);
  }, [dyn.v1]);
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setIsLoading(true);
      try {
        await dynamicDataProvider.whenReady();
        await dynamicDataProvider.reload(seed ?? undefined);
        await dynamicDataProvider.whenReady();
        if (!mounted) return;
        const found = getRestaurantById(id);
        if (found) {
          const rating = found.rating ?? found.stars ?? 4.5;
          const stars = found.stars ?? Math.round(rating);
          setR({
            id: found.id, name: found.name, image: found.image,
            rating: Number(rating), stars: Number(stars),
            reviews: Number(found.reviews ?? 0), bookings: Number(found.bookings ?? 0),
            price: String(found.price ?? "$$"), cuisine: String(found.cuisine ?? "International"),
            tags: found.tags ?? ["cozy", "modern", "casual"],
            desc: `Enjoy a delightful experience at ${found.name}, offering a fusion of flavors in the heart of ${found.area ?? "Downtown"}.`,
            photos,
          });
        } else {
          const allRestaurants = dynamicDataProvider.getRestaurants();
          console.log(`[restaurant] ${id} not found. Available (${allRestaurants.length}):`, allRestaurants.map(r => ({ id: r.id, name: r.name })).slice(0, 5));
          setR(null);
        }
      } catch (error) {
        console.error("[restaurant] Failed to load", error);
        if (!mounted) return;
        setR(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [id, seed]);
  useEffect(() => {
    if (!r) return;
    logEvent(EVENT_TYPES.VIEW_RESTAURANT, {
      restaurantId: id, restaurantName: r?.name ?? "", cuisine: r?.cuisine ?? "",
      desc: r?.desc ?? "", area: "test", reviews: r?.reviews ?? 0,
      bookings: r?.bookings ?? 0, rating: r?.rating ?? 4.5, stars: r?.stars ?? 5,
    });
  }, [id, r]);
  const formattedDate = date ? format(date, "yyyy-MM-dd") : "2025-05-20";
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/40 text-sm">Loading restaurant...</p>
        </div>
      </div>
    );
  }
  if (!r) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Restaurant not found</h1>
          <p className="text-white/40 text-sm mb-6">Try selecting a different seed or explore the full restaurant list.</p>
          <SeedLink href="/" className="inline-flex rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.06] transition-colors">Back to home</SeedLink>
        </div>
      </div>
    );
  }
  const handleToggleMenu = () => {
    const newState = !showFullMenu;
    setShowFullMenu(newState);
    const menuData = [{ category: "Mains", items: [{ name: "Coq au Vin", price: "$26.00" }, { name: "Ratatouille", price: "$20.00" }] }];
    logEvent(newState ? EVENT_TYPES.VIEW_FULL_MENU : EVENT_TYPES.COLLAPSE_MENU, {
      restaurantId: id, restaurantName: r?.name ?? "", cuisine: r?.cuisine ?? "", desc: r?.desc ?? "",
      area: "test", reviews: r?.reviews ?? 0, bookings: r?.bookings ?? 0, rating: r?.rating ?? 0,
      action: newState ? "view_full_menu" : "collapse_menu", time, date: formattedDate, people, menu: menuData,
    });
  };
  const handlePeopleSelect = (n: number) => { setPeople(n); logEvent(EVENT_TYPES.PEOPLE_SELECTED, { people: n }); };
  const handleTimeSelect = (t: string) => { setTime(t); logEvent(EVENT_TYPES.TIME_SELECTED, { time: t }); };
  function toLocalISO(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    const tzOffset = -d.getTimezoneOffset();
    const sign = tzOffset >= 0 ? "+" : "-";
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${pad(Math.floor(Math.abs(tzOffset)/60))}:${pad(Math.abs(tzOffset)%60)}`;
  }
  const handleDateSelect = (d: Date | undefined) => { setDate(d); if (d) logEvent(EVENT_TYPES.DATE_SELECTED, { date: toLocalISO(d) }); };

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

  const handleEdit = (review: { id: string; rating: number; comment: string }) => {
    setEditingId(review.id);
    setRating(review.rating);
    setComment(review.comment);
    const formElement = document.getElementById("review-form");
    if (formElement) formElement.scrollIntoView({ behavior: "smooth" });
  };
  return (
    dyn.v1.addWrapDecoy("restaurant-detail-page", (
      <main className="min-h-screen bg-background" id={dyn.v3.getVariant("restaurant-detail-page", ID_VARIANTS_MAP, "restaurant-detail-page")}>
      <Navbar showBack />
      {/* Banner */}
      {dyn.v1.addWrapDecoy("restaurant-banner", (
        <div className="w-full h-[380px] relative overflow-hidden" id={dyn.v3.getVariant("restaurant-banner", ID_VARIANTS_MAP, "restaurant-banner")}>
          <div className="relative w-full h-full">
            {r && <Image src={r.image} alt={r.name} fill className="object-cover" id={dyn.v3.getVariant("restaurant-banner-image", ID_VARIANTS_MAP, "restaurant-banner-image")} />}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
        </div>
      ), "restaurant-banner-wrap")}
      <div className="flex flex-col md:flex-row justify-between gap-10 px-6 md:px-10 w-full max-w-[1300px] mx-auto" id={dyn.v3.getVariant("restaurant-info-section", ID_VARIANTS_MAP, "restaurant-info-section")}>
        {/* Info */}
        <div className="pt-8 pb-10 flex-1 min-w-0 -mt-20 relative z-10" id={dyn.v3.getVariant("restaurant-details", ID_VARIANTS_MAP, "restaurant-details")}>
          <h1 className="text-4xl font-black mb-3 text-white tracking-tight animate-fade-in-up" style={{ animationFillMode: "forwards" }} id={dyn.v3.getVariant("restaurant-name", ID_VARIANTS_MAP, "restaurant-name")}>
            {r?.name ?? "Loading..."}
          </h1>
          {dyn.v1.addWrapDecoy("restaurant-meta", (
            <div className="flex flex-wrap items-center gap-3 text-sm mb-5" id={dyn.v3.getVariant("restaurant-meta", ID_VARIANTS_MAP, "restaurant-meta")}>
              <span className="flex items-center gap-0.5" id={dyn.v3.getVariant("rating-stars", ID_VARIANTS_MAP, "rating-stars")}>
                {/* biome-ignore lint/suspicious/noArrayIndexKey: static star icons never reorder */}
                {Array.from({ length: r?.stars ?? 5 }, (_, i) => (<Star key={`star-filled-${i}`} className="w-4 h-4 text-amber-400 fill-amber-400" />))}
                {/* biome-ignore lint/suspicious/noArrayIndexKey: static star icons never reorder */}
                {Array.from({ length: 5 - (r?.stars ?? 5) }, (_, i) => (<Star key={`star-empty-${i}`} className="w-4 h-4 text-white/15" />))}
              </span>
              <span className="flex items-center gap-1.5" id={dyn.v3.getVariant("rating-value", ID_VARIANTS_MAP, "rating-value")}>
                <span className="font-bold text-white">{r?.rating?.toFixed(1) ?? "4.5"}</span>
                <span className="text-white/35">({r?.reviews ?? 0} reviews)</span>
              </span>
              <span className="text-white/15">|</span>
              <span className="text-amber-500 font-semibold" id={dyn.v3.getVariant("price-range", ID_VARIANTS_MAP, "price-range")}>{r?.price ?? "$$"}</span>
              <span className="text-white/15">|</span>
              <span className="text-white/50" id={dyn.v3.getVariant("cuisine-type", ID_VARIANTS_MAP, "cuisine-type")}>{r?.cuisine ?? "International"}</span>
            </div>
          ), "restaurant-meta-wrap")}
          {/* Tags */}
          {(r?.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5" id={dyn.v3.getVariant("restaurant-tags", ID_VARIANTS_MAP, "restaurant-tags")}>
              {(r?.tags || []).map((tag: string, index: number) => (
                <span key={tag} className="inline-flex items-center py-1 px-3 bg-white/[0.05] rounded-full text-white/50 font-medium text-xs border border-white/[0.06]"
                  id={dyn.v3.getVariant(`restaurant-tag-${index}`, ID_VARIANTS_MAP, `restaurant-tag-${index}`)}>{tag}</span>
              ))}
            </div>
          )}
          {/* Description */}
          {r?.desc && dyn.v1.addWrapDecoy("restaurant-description", (
            <div className="mb-8 text-base text-white/40 leading-relaxed" id={dyn.v3.getVariant("restaurant-description", ID_VARIANTS_MAP, "restaurant-description")}>{r.desc}</div>
          ), "restaurant-description-wrap")}
          {/* Photos */}
          {r?.photos && r.photos.length > 0 && (
            <>
              <h2 className="text-xl font-bold mb-4 mt-10 text-white tracking-tight" id={dyn.v3.getVariant("photos-title", ID_VARIANTS_MAP, "photos-title")}>Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full mb-12" id={dyn.v3.getVariant("restaurant-photos-grid", ID_VARIANTS_MAP, "restaurant-photos-grid")}>
                {r.photos.map((url: string, i: number) => (
                  <img key={url} src={url} alt={`${r?.name} photo ${i + 1}`}
                    className="rounded-2xl object-cover aspect-square w-full h-[160px] md:h-[180px] hover:opacity-80 transition-opacity cursor-pointer border border-white/[0.06]"
                    id={dyn.v3.getVariant(`restaurant-photo-${i}`, ID_VARIANTS_MAP, `restaurant-photo-${i}`)} />
                ))}
              </div>
            </>
          )}
          {/* Menu */}
          {dyn.v1.addWrapDecoy("menu-section", (
            <section className="w-full mb-10" id={dyn.v3.getVariant("menu-section", ID_VARIANTS_MAP, "menu-section")}>
              <h2 className="text-xl font-bold mb-4 mt-8 text-white tracking-tight" id={dyn.v3.getVariant("menu-title", ID_VARIANTS_MAP, "menu-title")}>Menu</h2>
              <div className="glass rounded-2xl p-6" id={dyn.v3.getVariant("menu-container", ID_VARIANTS_MAP, "menu-container")}>
                <div className="flex gap-6 border-b border-white/[0.06] mb-6 pb-2" id={dyn.v3.getVariant("menu-tabs", ID_VARIANTS_MAP, "menu-tabs")}>
                  <button className="border-b-2 border-amber-500 text-white font-medium text-sm px-4 py-2 -mb-px" id={dyn.v3.getVariant("menu-tab", ID_VARIANTS_MAP, "menu-tab")}>Main Menu</button>
                </div>
                <div className="space-y-8">
                  <div>
                    <div className="font-semibold text-xs mb-4 text-amber-500/70 uppercase tracking-[0.2em]">Starters</div>
                    <div className="space-y-4">
                      {[{ name: "Cheese Board", desc: "Assorted artisan cheeses with honey and nuts", price: "$14.00" },
                        { name: "Smoked Salmon Tartine", desc: "Capers, creme fraiche, dill, and red onion", price: "$12.00" },
                        { name: "Escargot", desc: "Traditional French preparation with garlic butter", price: "$16.00" },
                      ].map((item) => (
                        <div key={item.name} className="flex justify-between items-start border-b border-white/[0.04] pb-3">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-white">{item.name}</div>
                            <div className="text-xs text-white/30 mt-0.5">{item.desc}</div>
                          </div>
                          <div className="text-right font-semibold text-sm text-amber-500 ml-4">{item.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {showFullMenu && (
                    <div>
                      <div className="font-semibold text-xs mb-4 text-amber-500/70 uppercase tracking-[0.2em]">Main Courses</div>
                      <div className="space-y-4">
                        {[{ name: "Coq au Vin", desc: "Classic French braised chicken in wine sauce", price: "$26.00" },
                          { name: "Ratatouille", desc: "Provencal vegetable stew with herbs", price: "$20.00" },
                        ].map((item) => (
                          <div key={item.name} className="flex justify-between items-start border-b border-white/[0.04] pb-3">
                            <div className="flex-1">
                              <div className="font-medium text-sm text-white">{item.name}</div>
                              <div className="text-xs text-white/30 mt-0.5">{item.desc}</div>
                            </div>
                            <div className="text-right font-semibold text-sm text-amber-500 ml-4">{item.price}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-center pt-4">
                    {dyn.v1.addWrapDecoy("menu-toggle-button", (
                      <Button
                        className={cn(dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "button-secondary"), "border border-white/[0.1] px-6 py-2 rounded-full font-medium bg-transparent hover:bg-white/[0.06] text-white/70 transition-all text-sm")}
                        onClick={handleToggleMenu}
                        id={dyn.v3.getVariant("menu-toggle-button", ID_VARIANTS_MAP, "menu-toggle-button")}>
                        {showFullMenu ? dyn.v3.getVariant("collapse_menu", TEXT_VARIANTS_MAP, "Collapse Menu") : dyn.v3.getVariant("view_full_menu", TEXT_VARIANTS_MAP, "View Full Menu")}
                      </Button>
                    ), "menu-toggle-button-wrap")}
                  </div>
                </div>
              </div>
            </section>
          ), "menu-section-wrap")}
          {/* About This Place */}
          {dyn.v1.addWrapDecoy("restaurant-info-cards", (
            <section className="w-full mb-10 mt-10" id={dyn.v3.getVariant("restaurant-info-section", ID_VARIANTS_MAP, "restaurant-info-section")}>
              <h2 className="text-xl font-bold mb-5 text-white tracking-tight" id={dyn.v3.getVariant("about-place-title", ID_VARIANTS_MAP, "about-place-title")}>About This Place</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3" id={dyn.v3.getVariant("info-cards-grid", ID_VARIANTS_MAP, "info-cards-grid")}>
                {[
                  { label: "Cuisine", value: r?.cuisine ?? "International", key: "cuisine" },
                  { label: "Price Range", value: r?.price ?? "$$", key: "price" },
                  { label: "Location", value: r?.desc?.includes("heart of") ? r.desc.split("heart of")[1]?.replace(".", "")?.trim() : "Downtown", key: "location" },
                  { label: "Popular Times", value: "7:00 PM - 9:00 PM", key: "times" },
                ].map((card) => (
                  dyn.v1.addWrapDecoy(`info-card-${card.key}`, (
                    <div className="glass rounded-2xl p-5" id={dyn.v3.getVariant(`info-card-${card.key}`, ID_VARIANTS_MAP, `info-card-${card.key}`)} key={card.key}>
                      <h3 className="font-medium text-[10px] mb-1.5 text-white/35 uppercase tracking-[0.15em]">{card.label}</h3>
                      <p className="text-white font-semibold text-sm">{card.value}</p>
                    </div>
                  ), `info-card-${card.key}-wrap`)
                ))}
              </div>
            </section>
          ), "restaurant-info-cards-wrap")}
          {/* Reviews */}
          {dyn.v1.addWrapDecoy("reviews-section", (
            <section className="w-full mb-10" id={dyn.v3.getVariant("reviews-section", ID_VARIANTS_MAP, "reviews-section")}>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-amber-500/70" />
                  <h2 className="text-xl font-bold text-white tracking-tight" id={dyn.v3.getVariant("reviews-title", ID_VARIANTS_MAP, "reviews-title")}>Customer Reviews</h2>
                </div>
                <div className="text-[11px] text-white/30">{reviews.length} local {reviews.length === 1 ? "review" : "reviews"}</div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-7" id={dyn.v3.getVariant("reviews-container", ID_VARIANTS_MAP, "reviews-container")}>
                  {reviews.length === 0 ? (
                    <p className="text-white/40 text-sm leading-relaxed">No reviews yet. Be the first to share your experience.</p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => {
                        const isMine = Boolean(currentUser && review.username === currentUser.username);
                        return (
                          <div key={review.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-white">{review.username}</span>
                                  <span className="text-[11px] text-white/25">
                                    {formatDistanceToNow(new Date(review.date), { addSuffix: true })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 mt-2">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={`user-review-star-${review.id}-${i}`}
                                      className={cn("w-4 h-4", i < review.rating ? "text-amber-400 fill-amber-400" : "text-white/15")}
                                    />
                                  ))}
                                </div>
                              </div>
                              {isMine && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    className="p-2 rounded-full hover:bg-white/[0.06] text-white/50 hover:text-white transition-colors"
                                    onClick={() => handleEdit({ id: review.id, rating: review.rating, comment: review.comment })}
                                    aria-label="Edit review"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    className="p-2 rounded-full hover:bg-white/[0.06] text-white/50 hover:text-white transition-colors"
                                    onClick={() => deleteReview(review.id)}
                                    aria-label="Delete review"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-white/45 text-sm leading-relaxed mt-3 whitespace-pre-wrap">{review.comment}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="glass rounded-2xl p-7">
                  <h3 className="text-sm font-semibold text-white mb-4">
                    {editingId ? "Edit your review" : "Leave a review"}
                  </h3>
                  {!isAuthenticated || !currentUser ? (
                    <p className="text-white/40 text-sm leading-relaxed">Sign in from the navbar to write a review.</p>
                  ) : (
                    <form id="review-form" onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-medium text-white/35 mb-1.5 uppercase tracking-[0.15em]">Rating</label>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
                            <button
                              key={`rating-${value}`}
                              type="button"
                              className="p-1.5 rounded-full hover:bg-white/[0.06] transition-colors"
                              onClick={() => setRating(value)}
                              aria-label={`Set rating to ${value}`}
                            >
                              <Star className={cn("w-5 h-5", value <= rating ? "text-amber-400 fill-amber-400" : "text-white/15")} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-white/35 mb-1.5 uppercase tracking-[0.15em]">Comment</label>
                        <textarea
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all text-sm resize-none"
                          rows={4}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share what you liked (or didn’t) about your experience..."
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="submit"
                          className="bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-semibold text-sm px-5 py-2.5"
                          disabled={!comment.trim()}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {editingId ? "Update review" : "Post review"}
                        </Button>
                        {editingId && (
                          <button
                            type="button"
                            className="text-sm text-white/50 hover:text-white transition-colors px-2 py-2"
                            onClick={() => { setEditingId(null); setRating(5); setComment(""); }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </section>
          ), "reviews-section-wrap")}
        </div>
        {/* Reservation Box */}
        {dyn.v1.addWrapDecoy("booking-widget", (
          <div className="glass rounded-3xl p-6 w-full max-w-sm md:sticky md:top-24 self-start mt-10 glow-amber-sm"
            id={dyn.v3.getVariant("reservation-box", ID_VARIANTS_MAP, "reservation-box")}>
            <h2 className="font-bold text-lg mb-5 text-center text-white tracking-tight" id={dyn.v3.getVariant("reservation-title", ID_VARIANTS_MAP, "reservation-title")}>Make a Reservation</h2>
            <div className="flex flex-col gap-4">
              {/* People */}
              <div id={dyn.v3.getVariant("people-select-container", ID_VARIANTS_MAP, "people-select-container")}>
                <label className="block text-[10px] font-medium text-white/35 mb-1.5 uppercase tracking-[0.15em]" htmlFor={dyn.v3.getVariant("people_picker", ID_VARIANTS_MAP, "people_picker")}>Guests</label>
                <Popover open={peopleOpen} onOpenChange={setPeopleOpen} modal={false}>
                  <PopoverTrigger asChild>
                    <Button id={dyn.v3.getVariant("people_picker", ID_VARIANTS_MAP, "people_picker")} variant="outline"
                      className="w-full flex items-center justify-between border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-amber-500/30 rounded-xl text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-amber-500/60" />
                        <span>{people ? `${people} ${people === 1 ? personLabel : peopleLabel}` : `${pickLabel} ${peopleLabel}`}</span>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-white/30" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-1" align="start" id={dyn.v3.getVariant("people-picker-content", ID_VARIANTS_MAP, "people-picker-content")}>
                    {orderedPeopleOptions.map((n) => (
                      dyn.v1.addWrapDecoy(`people-option-${n}`, (
                        <Button key={n} variant="ghost" className="w-full justify-start text-sm"
                          onClick={() => { handlePeopleSelect(n); setPeopleOpen(false); }}
                          id={dyn.v3.getVariant(`people-option-${n}`, ID_VARIANTS_MAP, `people-option-${n}`)}>
                          {n} {n === 1 ? personLabel : peopleLabel}
                        </Button>
                      ), `people-option-wrap-${n}`)
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
              {/* Date/Time */}
              <div className="grid grid-cols-2 gap-3" id={dyn.v3.getVariant("date-time-row", ID_VARIANTS_MAP, "date-time-row")}>
                <div id={dyn.v3.getVariant("date-picker-container", ID_VARIANTS_MAP, "date-picker-container")}>
                  <label className="block text-[10px] font-medium text-white/35 mb-1.5 uppercase tracking-[0.15em]" htmlFor={dyn.v3.getVariant("date_picker", ID_VARIANTS_MAP, "date_picker")}>Date</label>
                  <Popover open={dateOpen} onOpenChange={setDateOpen} modal={false}>
                    <PopoverTrigger asChild>
                      <Button id={dyn.v3.getVariant("date_picker", ID_VARIANTS_MAP, "date_picker")} variant="outline"
                        className="w-full flex items-center justify-between border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-amber-500/30 rounded-xl text-sm text-white/70">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-amber-500/60" />
                          <span>{date ? format(date, "MMM d") : selectDateLabel}</span>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start" id={dyn.v3.getVariant("date-picker-content", ID_VARIANTS_MAP, "date-picker-content")}>
                      <Calendar mode="single" selected={date} onSelect={(d) => { handleDateSelect(d); setDateOpen(false); }} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div id={dyn.v3.getVariant("time-picker-container", ID_VARIANTS_MAP, "time-picker-container")}>
                  <label className="block text-[10px] font-medium text-white/35 mb-1.5 uppercase tracking-[0.15em]" htmlFor={dyn.v3.getVariant("time_picker", ID_VARIANTS_MAP, "time_picker")}>Time</label>
                  <Popover open={timeOpen} onOpenChange={setTimeOpen} modal={false}>
                    <PopoverTrigger asChild>
                      <Button id={dyn.v3.getVariant("time_picker", ID_VARIANTS_MAP, "time_picker")} variant="outline"
                        className="w-full flex items-center justify-between border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-amber-500/30 rounded-xl text-sm text-white/70">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-amber-500/60" />
                          <span>{time ? time : selectTimeLabel}</span>
                        </div>
                        <ChevronDownIcon className="h-4 w-4 text-white/30" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-1" align="start" id={dyn.v3.getVariant("time-picker-content", ID_VARIANTS_MAP, "time-picker-content")}>
                      {orderedTimeOptions.map((t) => (
                        dyn.v1.addWrapDecoy(`time-option-${t}`, (
                          <Button key={t} variant="ghost" className="w-full justify-start text-sm"
                            onClick={() => { handleTimeSelect(t); setTimeOpen(false); }}
                            id={dyn.v3.getVariant(`time-option-${t}`, ID_VARIANTS_MAP, `time-option-${t}`)}>
                            {t}
                          </Button>
                        ), `time-option-wrap-${t}`)
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {/* Book button */}
              <SeedLink
                href={buildBookingHref(id, time || "1:00 PM", { date: formattedDate, people: people || 2 })}
                onClick={() => logEvent(EVENT_TYPES.BOOK_RESTAURANT, {
                  restaurantId: id, restaurantName: r?.name ?? "", cuisine: r?.cuisine ?? "", desc: r?.desc ?? "",
                  area: "test", reviews: r?.reviews ?? 0, bookings: r?.bookings ?? 0, rating: r?.rating ?? 0,
                  date: formattedDate, time: time || "1:00 PM", people: people || 2,
                })}>
                <Button
                  id={dyn.v3.getVariant("book_button", ID_VARIANTS_MAP, "book_button")}
                  className={cn(dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "button-primary"), "w-full bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-amber-500/20 pulse-glow")}>
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
