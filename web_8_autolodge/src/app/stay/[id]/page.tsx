"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isWithinInterval,
} from "date-fns";
import Image from "next/image";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { dynamicDataProvider } from "@/dynamic/v2";
import { DASHBOARD_HOTELS } from "@/library/dataset";
import type { Hotel } from "@/types/hotel";
import { useWishlist } from "@/hooks/useWishlist";

function parseLocalDate(dateString: string | undefined) {
  if (!dateString) {
    return null;
  }

  const [year, month, day] = dateString.split("-").map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function toStartOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function toUtcIsoWithTimezone(date: Date) {
  const utc = new Date(date.getTime());
  return utc.toISOString().replace("Z", "+00:00");
}

function getFallbackHotel(): Hotel {
  const [firstDynamic] = dynamicDataProvider.getHotels();
  if (firstDynamic) {
    return firstDynamic;
  }
  return DASHBOARD_HOTELS[0] as Hotel;
}

function PropertyDetailContent() {
  const dyn = useDynamicSystem();
  const dynamicV3TextVariants: Record<string, string[]> = {
    submit_review: ["Submit review", "Send review", "Post review"],
    review_name_placeholder: ["Your name (optional)", "Name (optional)", "Add your name"],
    review_comment_placeholder: ["Share your experience...", "Tell us about your stay...", "Write your review..."],
    share_title: ["Share this property", "Share stay", "Share listing"],
    invalid_email: ["Invalid email address", "Email looks incorrect", "Please enter a valid email"],
    cancel: ["Cancel", "Close", "Dismiss"],
    share_link_sent: ["Link sent!", "Share link delivered", "Link shared"],
    send: ["Send", "Share", "Deliver"],
    reviews: ["reviews", "ratings", "guest reviews"],
    added_to_wishlist: ["Added to wishlist ❤️", "Saved to wishlist ❤️", "Wishlist updated ❤️"],
    removed_from_wishlist: ["Removed from wishlist 💔", "Wishlist item removed 💔", "Removed from list 💔"],
    share: ["Share", "Send", "Copy link"],
    select_dates: ["Select your stay", "Choose dates", "Pick dates"],
    check_in: ["CHECK-IN", "ARRIVAL", "START"],
    check_out: ["CHECK-OUT", "DEPARTURE", "END"],
    guests: ["GUESTS", "TRAVELERS", "PEOPLE"],
    reserve: ["Reserve", "Book", "Hold"],
    check_availability: ["Check Availability", "Verify availability", "See availability"],
    no_charge_yet: ["You won't be charged yet", "No charge yet", "Payment not charged yet"],
    night: ["night", "per night", "nightly"],
    nights: ["nights", "night stays", "nights total"],
    cleaning_fee: ["Cleaning fee", "Service fee", "Cleaning"],
    total: ["Total", "Total cost", "Overall"],
  };
  const router = useSeedRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const {
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    ready: wishlistReady,
  } = useWishlist();

  const [hotelNotFound, setHotelNotFound] = useState(false);
  const [isCheckingHotel, setIsCheckingHotel] = useState(true);

  // Check if hotel exists whenever params.id or data changes
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 5;
    
    const checkHotel = async () => {
      if (!mounted) return;
      
      setIsCheckingHotel(true);
      
      // Wait for data provider to be ready
      await dynamicDataProvider.whenReady();
      
      // Wait a bit more to ensure data is fully loaded and synced
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!mounted) return;
      
      const numId = Number(params.id);
      const strId = String(params.id);
      if (Number.isFinite(numId)) {
        let hotels = dynamicDataProvider.getHotels();
        
        // Retry a few times if no hotels loaded yet OR if hotel not found but we should wait
        while (mounted && retryCount < maxRetries) {
          // Check if hotels are loaded
          if (hotels.length === 0) {
            retryCount++;
            console.log(`[autolodge] No hotels loaded yet, retrying... (${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 300));
            hotels = dynamicDataProvider.getHotels();
            continue;
          }
          
          // Hotels are loaded, check if our hotel is in the list
          const allIds = hotels.map(h => ({
            id: h.id,
            idType: typeof h.id,
            idString: String(h.id),
            idNumber: typeof h.id === 'number' ? h.id : Number(h.id),
          }));
          
          const hotelExists = allIds.some(h => {
            return h.idNumber === numId || 
                   h.idString === strId || 
                   String(h.idNumber) === strId ||
                   h.id === numId ||
                   String(h.id) === strId;
          });
          
          // If hotel is found in the list, break out of retry loop
          if (hotelExists) {
            break;
          }
          
          // Hotel not in list, but might still be loading - retry a couple more times
          if (retryCount < 3) {
            retryCount++;
            console.log(`[autolodge] Hotel ${numId} not found in ${hotels.length} hotels, retrying... (${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 300));
            hotels = dynamicDataProvider.getHotels();
          } else {
            // Give up after 3 retries
            break;
          }
        }
        
        if (!mounted) return;
        
        console.log(`[autolodge] Searching for hotel ID: ${numId} (string: "${strId}") in ${hotels.length} hotels`);
        if (hotels.length > 0) {
          // Log all available IDs to debug
          const allIds = hotels.map(h => ({
            id: h.id,
            idType: typeof h.id,
            idString: String(h.id),
            idNumber: typeof h.id === 'number' ? h.id : Number(h.id),
            title: h.title
          }));
          console.log(`[autolodge] Available hotel IDs (first 10):`, allIds.slice(0, 10));
          console.log(`[autolodge] Is search ID in list?`, allIds.some(h => {
            return h.idNumber === numId || 
                   h.idString === strId || 
                   String(h.idNumber) === strId ||
                   h.id === numId ||
                   String(h.id) === strId;
          }));
        }
        
        // Try multiple search strategies
        let fromProvider = dynamicDataProvider.getHotelById(numId);
        
        // If not found, try string search
        if (!fromProvider) {
          fromProvider = dynamicDataProvider.getHotelById(strId);
        }
        
        // If still not found, try direct search in array with all possible formats
        if (!fromProvider && hotels.length > 0) {
          fromProvider = hotels.find(h => {
            const hId = typeof h.id === 'number' ? h.id : Number(h.id);
            const hIdStr = String(h.id);
            const hIdNumStr = String(hId);
            
            // Try all possible matches
            return hId === numId || 
                   hIdStr === strId || 
                   hIdNumStr === strId ||
                   String(hId) === String(numId) ||
                   h.id === numId ||
                   String(h.id) === strId ||
                   Number(hIdStr) === numId;
          });
        }
        
        if (fromProvider) {
          console.log(`[autolodge] ✅ Hotel ${numId} found:`, fromProvider.title, `(ID: ${fromProvider.id}, type: ${typeof fromProvider.id})`);
          setHotelNotFound(false);
          setIsCheckingHotel(false);
        } else {
          console.log(`[autolodge] ❌ Hotel ${numId} not found. Searched as number ${numId} and string "${strId}"`);
          console.log(`[autolodge] Available hotels (${hotels.length}):`, hotels.slice(0, 10).map(h => ({ 
            id: h.id, 
            idType: typeof h.id,
            idString: String(h.id),
            idNumber: typeof h.id === 'number' ? h.id : Number(h.id),
            title: h.title
          })));
          // Only set not found if we have hotels loaded (avoid false negative during initial load)
          if (hotels.length > 0) {
            setHotelNotFound(true);
            setIsCheckingHotel(false);
          } else {
            // If still no hotels, keep checking
            console.log(`[autolodge] Still waiting for hotels to load...`);
            setIsCheckingHotel(true);
          }
        }
      } else {
        console.log(`[autolodge] Invalid hotel ID: ${params.id}`);
        setHotelNotFound(true);
        setIsCheckingHotel(false);
      }
    };

    checkHotel();

    // Subscribe to hotel updates to re-check when data changes
    const unsubscribe = dynamicDataProvider.subscribeHotels((hotels) => {
      if (!mounted) return;
      
      console.log(`[autolodge] Hotels updated (${hotels.length} hotels), re-checking hotel ${params.id}...`);
      const numId = Number(params.id);
      const strId = String(params.id);
      
      if (Number.isFinite(numId)) {
        // Wait a bit to ensure data is fully synced
        setTimeout(() => {
          if (!mounted) return;
          
          const currentHotels = dynamicDataProvider.getHotels();
          if (currentHotels.length > 0) {
            console.log(`[autolodge] Available hotel IDs after update (first 10):`, currentHotels.slice(0, 10).map(h => ({ 
              id: h.id, 
              idType: typeof h.id,
              idString: String(h.id),
              idNumber: typeof h.id === 'number' ? h.id : Number(h.id)
            })));
            
            // Try multiple search strategies
            let hotel = dynamicDataProvider.getHotelById(numId);
            if (!hotel) {
              hotel = dynamicDataProvider.getHotelById(strId);
            }
            if (!hotel) {
              hotel = currentHotels.find(h => {
                const hId = typeof h.id === 'number' ? h.id : Number(h.id);
                const hIdStr = String(h.id);
                return hId === numId || 
                       hIdStr === strId || 
                       String(hId) === strId ||
                       h.id === numId ||
                       String(h.id) === strId;
              });
            }
            
            if (hotel) {
              console.log(`[autolodge] ✅ Hotel ${numId} found after update:`, hotel.title);
              setHotelNotFound(false);
              setIsCheckingHotel(false);
            } else {
              console.log(`[autolodge] ❌ Hotel ${numId} still not found after update (${currentHotels.length} hotels loaded)`);
              // Don't immediately mark as not found - might still be loading
              // Only mark as not found if we've waited enough
            }
          }
        }, 200);
      }
    });

    // Listen for seed changes to re-check
    const handleSeedChange = () => {
      if (!mounted) return;
      console.log('[autolodge] Seed changed, re-checking hotel...');
      retryCount = 0; // Reset retry count on seed change
      checkHotel();
    };

    window.addEventListener("autolodge:v2SeedChange", handleSeedChange);
    
    return () => {
      mounted = false;
      unsubscribe();
      window.removeEventListener("autolodge:v2SeedChange", handleSeedChange);
    };
  }, [params.id]);

  const prop = useMemo<Hotel | null>(() => {
    if (hotelNotFound || isCheckingHotel) {
      return null;
    }
    
    const numId = Number(params.id);
    if (Number.isFinite(numId)) {
      const fromProvider = dynamicDataProvider.getHotelById(numId);
      if (fromProvider) {
        console.log(`[autolodge] prop useMemo: Hotel ${numId} found:`, fromProvider.title);
        return fromProvider;
      }
    }
    return null;
  }, [params.id, hotelNotFound, isCheckingHotel]);
  const fromWishlist = searchParams.get("source") === "wishlist";

  const stayFrom = useMemo(() => {
    if (!prop) return toStartOfDay(new Date());
    const parsed = parseLocalDate(prop.datesFrom);
    return parsed ? toStartOfDay(parsed) : toStartOfDay(new Date());
  }, [prop?.datesFrom]);

  const stayTo = useMemo(() => {
    if (!prop) return addDays(stayFrom, 1);
    const parsed = parseLocalDate(prop.datesTo);
    if (parsed) {
      return toStartOfDay(parsed);
    }
    return addDays(stayFrom, 1);
  }, [prop?.datesTo, stayFrom]);

  const initialRange = useMemo<DateRange | undefined>(
    () => ({
      from: stayFrom,
      to: stayTo,
    }),
    [stayFrom, stayTo]
  );

  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    initialRange
  );
  useEffect(() => {
    setSelectedRange(initialRange);
  }, [initialRange]);

  const [guests, setGuests] = useState(() => {
    if (!prop) return 1;
    const maxGuests = prop.maxGuests ?? prop.guests ?? 1;
    return Math.min(Math.max(1, prop.guests ?? 1), maxGuests);
  });

  useEffect(() => {
    if (!prop) return;
    const maxGuests = prop.maxGuests ?? prop.guests ?? 1;
    setGuests(Math.min(Math.max(1, prop.guests ?? 1), maxGuests));
  }, [prop?.guests, prop?.maxGuests]);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [receiverEmail, setReceiverEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [userReviews, setUserReviews] = useState<
    { id: string; name: string; rating: number; comment: string; date: string }[]
  >([]);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });

  const nights =
    selectedRange?.from && selectedRange?.to
      ? Math.max(
          0,
          differenceInCalendarDays(
            selectedRange.to,
            selectedRange.from
          )
        )
      : 0;

  const cleaningFee = 15;
  const priceSubtotal = (prop?.price ?? 0) * nights;
  const total = priceSubtotal + cleaningFee;

  function isWithinAvailable(date: Date) {
    return isWithinInterval(date, {
      start: stayFrom,
      end: addDays(stayTo, -1),
    });
  }

  // Log V2 status for debugging
  useEffect(() => {
    console.log("[autolodge] V2 Status:", {
      enabled: dyn.v2.isEnabled(),
      dbMode: dyn.v2.isDbModeEnabled(),
      fallbackMode: dyn.v2.isFallbackMode(),
    });
  }, [dyn]);

  const didTrack = useRef(false);
  useEffect(() => {
    if (!prop || didTrack.current) {
      return;
    }

    logEvent(EVENT_TYPES.VIEW_HOTEL, {
      id: prop.id,
      title: prop.title,
      location: prop.location,
      rating: prop.rating,
      reviews: prop.reviews,
      price: prop.price,
      dates: { from: prop.datesFrom, to: prop.datesTo },
      guests: prop.guests,
      host: prop.host,
      amenities: prop.amenities?.map((a) => a.title),
    });
    didTrack.current = true;
  }, [
    prop?.amenities,
    prop?.datesFrom,
    prop?.datesTo,
    prop?.guests,
    prop?.host,
    prop?.id,
    prop?.location,
    prop?.price,
    prop?.rating,
    prop?.reviews,
    prop?.title,
  ]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!wishlistReady || !prop) return;
    setIsWishlisted(isInWishlist.has(prop.id));
  }, [isInWishlist, prop?.id, wishlistReady]);

  useEffect(() => {
    if (!prop) return;
    const seedReviews = [
      {
        id: `${prop.id}-rev-1`,
        name: "Amelia",
        rating: Math.min(5, prop.rating + 0.1),
        comment: "Loved the cozy vibe and quick check-in. Would return!",
        date: "2025-02-18",
      },
      {
        id: `${prop.id}-rev-2`,
        name: "Jordan",
        rating: Math.max(4.5, prop.rating - 0.1),
        comment: "Great location and spotless rooms. Breakfast could improve.",
        date: "2025-03-02",
      },
    ];
    setUserReviews(seedReviews);
  }, [prop?.id, prop?.rating]);

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (!range) {
      setSelectedRange(undefined);
      return;
    }

    const normalizedFrom = range.from ? toStartOfDay(range.from) : undefined;
    const normalizedTo = range.to ? toStartOfDay(range.to) : undefined;

    setSelectedRange({
      from: normalizedFrom,
      to: normalizedTo,
    });
  };

  const maxGuestsAllowed = prop?.maxGuests ?? prop?.guests ?? 1;
  const hasValidSelection =
    Boolean(selectedRange?.from) && Boolean(selectedRange?.to);

  const handleReserve = async () => {
    if (!prop || !selectedRange?.from || !selectedRange?.to) {
      return;
    }

    const checkinDate = selectedRange.from;
    const checkoutDate = selectedRange.to;

    try {
      await logEvent(EVENT_TYPES.RESERVE_HOTEL, {
        id: prop.id,
        guests_set: guests,
        hotel: prop,
        selected_checkin: format(checkinDate, "yyyy-MM-dd"),
        selected_checkout: format(checkoutDate, "yyyy-MM-dd"),
        selected_dates_from: format(checkinDate, "yyyy-MM-dd"),
        selected_dates_to: format(checkoutDate, "yyyy-MM-dd"),
        source: fromWishlist ? "wishlist" : "direct",
      });
      if (fromWishlist) {
        logEvent(EVENT_TYPES.BOOK_FROM_WISHLIST, {
          hotelId: prop.id,
          title: prop.title,
        });
      }
      sessionStorage.setItem("reserveEventLogged", "true");
    } catch (error) {
      console.error("❌ logEvent failed", error);
    }

    router.push(
      `/stay/${params.id}/confirm?checkin=${encodeURIComponent(
        toUtcIsoWithTimezone(checkinDate)
      )}&checkout=${encodeURIComponent(
        toUtcIsoWithTimezone(checkoutDate)
      )}&guests=${guests}${
        fromWishlist ? "&source=wishlist" : ""
      }`
    );
  };

  // Show loading state while checking
  if (isCheckingHotel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  // Show "Hotel not found" message
  if (hotelNotFound || !prop) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold mb-4 text-neutral-800">Hotel Not Found</h1>
          <p className="text-neutral-600 mb-6">
            The hotel you're looking for (ID: {params.id}) is not available with the current seed value.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to All Hotels
          </button>
        </div>
      </div>
    );
  }

  return dyn.v1.addWrapDecoy("stay-page-root", (
    <div className="relative flex flex-row gap-10 w-full max-w-6xl mx-auto mt-7">
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded text-sm shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md animate-fade-in">
            <h2 className="text-xl font-semibold mb-3 text-neutral-800">
              📤 {dyn.v3.getVariant("share_title", dynamicV3TextVariants, "Share this property")}
            </h2>

            <input
              type="email"
              placeholder={dyn.v3.getVariant(
                "share_email_placeholder",
                TEXT_VARIANTS_MAP,
                "Receiver's email"
              )}
              value={receiverEmail}
              onChange={(event) => {
                const value = event.target.value;
                setReceiverEmail(value);

                const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                setEmailError(
                  isValidEmail || value === ""
                    ? ""
                    : dyn.v3.getVariant("invalid_email", dynamicV3TextVariants, "Invalid email address")
                );
              }}
              className="w-full border px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300"
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                id={dyn.v3.getVariant("share_cancel_button", ID_VARIANTS_MAP, "share-cancel-button")}
                onClick={() => {
                  setShowShareModal(false);
                  setReceiverEmail("");
                  setEmailError("");
                }}
                className="px-4 py-1.5 rounded-full text-sm bg-neutral-200 hover:bg-neutral-300"
              >
                {dyn.v3.getVariant("cancel", dynamicV3TextVariants, "Cancel")}
              </button>
              <button
                id={dyn.v3.getVariant("share_send_button", ID_VARIANTS_MAP, "share-send-button")}
                disabled={!!emailError || !receiverEmail}
                onClick={() => {
                  setShowShareModal(false);
                  setToastMessage(
                    dyn.v3.getVariant("share_link_sent", dynamicV3TextVariants, `Link sent to ${receiverEmail}`)
                  );
                  logEvent("SHARE_HOTEL", {
                    title: prop.title,
                    location: prop.location,
                    rating: prop.rating,
                    reviews: prop.reviews,
                    price: prop.price,
                    dates: { from: prop.datesFrom, to: prop.datesTo },
                    guests: prop.guests,
                    host: prop.host,
                    amenities: prop.amenities?.map((a) => a.title),
                    email: receiverEmail,
                  });
                  setReceiverEmail("");
                  setEmailError("");
                  setTimeout(() => setToastMessage(""), 3000);
                }}
                className="px-4 py-1.5 rounded-full text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dyn.v3.getVariant("send", dynamicV3TextVariants, "Send")}
              </button>
            </div>
          </div>
        </div>
      )}
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
            · {prop.reviews ?? 30} {dyn.v3.getVariant("reviews", dynamicV3TextVariants, "reviews")}
          </span>
          <button
            onClick={() => {
              const newState = !isWishlisted;
              setIsWishlisted(newState);

              if (newState) {
                addToWishlist(prop);
                logEvent(EVENT_TYPES.ADD_TO_WISHLIST, {
                  id: prop.id,
                  title: prop.title,
                  location: prop.location,
                  rating: prop.rating,
                  reviews: prop.reviews,
                  price: prop.price,
                  dates: { from: prop.datesFrom, to: prop.datesTo },
                  guests: prop.guests,
                  host: prop.host,
                  amenities: prop.amenities?.map((a) => a.title),
                });
              } else {
                removeFromWishlist(prop.id);
                logEvent(EVENT_TYPES.REMOVE_FROM_WISHLIST, {
                  id: prop.id,
                  title: prop.title,
                  location: prop.location,
                  rating: prop.rating,
                  reviews: prop.reviews,
                  price: prop.price,
                  dates: { from: prop.datesFrom, to: prop.datesTo },
                  guests: prop.guests,
                  host: prop.host,
                  amenities: prop.amenities?.map((a) => a.title),
                });
              }

              setToastMessage(
                newState
                  ? dyn.v3.getVariant("added_to_wishlist", dynamicV3TextVariants, "Added to wishlist ❤️")
                  : dyn.v3.getVariant("removed_from_wishlist", dynamicV3TextVariants, "Removed from wishlist 💔")
              );
            }}
            className={`p-2 bg-white border border-neutral-200 rounded-full hover:shadow transition ${dyn.v3.getVariant("wishlist_button_stays", CLASS_VARIANTS_MAP, "")}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={isWishlisted ? "red" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              width={24}
              height={24}
              className={isWishlisted ? "text-red-500" : "text-neutral-600"}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3
         c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3
         C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </button>
          <button
            id={dyn.v3.getVariant("share_button", ID_VARIANTS_MAP, "share-button")}
            onClick={() => setShowShareModal(true)}
            className={`px-4 py-2 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 transition ${dyn.v3.getVariant("share_button_class", CLASS_VARIANTS_MAP, "")}`}
          >
            {dyn.v3.getVariant("share", dynamicV3TextVariants, "Share")}
          </button>
        </div>
        <hr className="my-4" />
        <div className="mb-4 flex items-center gap-3">
          <Image
            id="hostAvatar"
            src={prop.host.avatar}
            alt={prop.host.name}
            width={54}
            height={54}
            className="rounded-full border"
          />
          <div>
            <div id="hostName" className="font-medium text-neutral-800">
              Hosted by {prop.host.name}
            </div>
            <div className="text-neutral-500 text-sm">
              {prop.host.since} years hosting
            </div>
          </div>
        </div>
        <hr className="my-3" />
        <div className="flex flex-col gap-7 mt-4">
          {prop.amenities?.map((amenity, index) => (
            <div
              className="flex items-start gap-4"
              key={amenity.title}
              id={`amenity-${index}`}
            >
              <span className="text-2xl pt-1">{amenity.icon}</span>
              <div>
                <div className="font-semibold text-neutral-900 text-[17px]">
                  {amenity.title}
                </div>
                <div className="text-neutral-500 text-sm -mt-0.5">
                  {amenity.desc}
                </div>
              </div>
            </div>
            ))}
        </div>

        <div className="mt-8 border rounded-2xl p-4 bg-white shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Guest reviews</h2>
          <div className="flex flex-col gap-4 mb-5">
            {userReviews.map((review) => (
              <div
                key={review.id}
                className="border rounded-xl p-3 bg-neutral-50 flex flex-col gap-1"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-800">
                    {review.name}
                  </span>
                  <span className="text-sm text-amber-600 font-semibold">
                    {review.rating.toFixed(1)} ★
                  </span>
                  <span className="text-xs text-neutral-500 ml-auto">
                    {review.date}
                  </span>
                </div>
                <p className="text-sm text-neutral-700">{review.comment}</p>
              </div>
            ))}
            {userReviews.length === 0 && (
              <p className="text-sm text-neutral-500">
                No reviews yet. Be the first to leave your thoughts!
              </p>
            )}
          </div>
          {dyn.v1.addWrapDecoy("reviews-form", (
            <form
              className="flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (!reviewForm.comment.trim()) {
                  return;
                }
                const nextReview = {
                  id: `${prop.id}-${Date.now()}`,
                  name: reviewForm.name.trim() || "Guest",
                  rating: reviewForm.rating,
                  comment: reviewForm.comment.trim(),
                  date: new Date().toISOString().slice(0, 10),
                };
                setUserReviews((prev) => [nextReview, ...prev]);
                logEvent(EVENT_TYPES.SUBMIT_REVIEW, {
                  hotel: {
                    id: prop.id,
                    title: prop.title,
                    location: prop.location,
                    price: prop.price,
                    rating: prop.rating,
                    reviews: prop.reviews,
                    datesFrom: prop.datesFrom,
                    datesTo: prop.datesTo,
                    guests: prop.guests,
                    maxGuests: prop.maxGuests,
                    amenities: prop.amenities?.map((a) => a.title),
                    host: prop.host,
                  },
                  review: nextReview,
                  rating: reviewForm.rating,
                  commentLength: reviewForm.comment.trim().length,
                  name: nextReview.name,
                });
                setToastMessage("Thanks for sharing your review!");
                setReviewForm({ name: "", rating: 5, comment: "" });
              }}
            >
              <div className="flex gap-2">
                <input
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm ${dyn.v3.getVariant("review_input", CLASS_VARIANTS_MAP, "")}`}
                  placeholder={dyn.v3.getVariant("review_name_placeholder", dynamicV3TextVariants, "Your name (optional)")}
                  value={reviewForm.name}
                  onChange={(event) =>
                    setReviewForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
                <select
                  className={`w-[120px] border rounded-lg px-3 py-2 text-sm ${dyn.v3.getVariant("review_select", CLASS_VARIANTS_MAP, "")}`}
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      rating: Number(event.target.value),
                    }))
                  }
                >
                  {[5, 4.5, 4, 3.5, 3].map((value) => (
                    <option key={value} value={value}>
                      {value} ★
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className={`border rounded-lg px-3 py-2 text-sm resize-none ${dyn.v3.getVariant("review_textarea", CLASS_VARIANTS_MAP, "")}`}
                rows={3}
                placeholder={dyn.v3.getVariant("review_comment_placeholder", dynamicV3TextVariants, "Share your experience...")}
                value={reviewForm.comment}
                onChange={(event) =>
                  setReviewForm((prev) => ({ ...prev, comment: event.target.value }))
                }
              />
              <button
                type="submit"
                className={`self-start px-4 py-2 rounded-full bg-[#616882] text-white text-sm font-semibold hover:bg-[#7b86aa] transition disabled:opacity-50 ${dyn.v3.getVariant("review_button", CLASS_VARIANTS_MAP, "")}`}
                disabled={!reviewForm.comment.trim()}
              >
                {dyn.v3.getVariant("submit_review", dynamicV3TextVariants, "Submit review")}
              </button>
            </form>
          ))}
        </div>

        <div className="mt-8 border rounded-2xl p-4 bg-white shadow-sm">
          <h2 className="font-semibold text-lg mb-3">
            {dyn.v3.getVariant("select_dates", dynamicV3TextVariants, "Select your stay")}
          </h2>
          <Calendar
            numberOfMonths={2}
            mode="range"
            defaultMonth={selectedRange?.from ?? stayFrom}
            selected={selectedRange}
            onSelect={handleCalendarSelect}
            disabled={(date) => !isWithinAvailable(date)}
            initialFocus
          />
        </div>
      </div>

      <div className="w-[350px] min-w-[300px] bg-white shadow-md rounded-2xl border flex flex-col p-6 sticky top-8 h-fit">
        <div id="pricePerNight" className="text-2xl font-bold mb-1">
          ${prop.price.toFixed(2)}{" "}
          <span className="text-base text-neutral-600 font-medium">
            USD <span className="font-normal">{dyn.v3.getVariant("night", dynamicV3TextVariants, "night")}</span>
          </span>
        </div>
        <div className="flex gap-3 mt-3 mb-4">
          <div id="checkIn" className="flex-1 border rounded-md px-3 py-2">
            <div className="text-xs text-neutral-500 font-semibold">
              {dyn.v3.getVariant("check_in", dynamicV3TextVariants, "CHECK-IN")}
            </div>
            <div className="tracking-wide text-[15px]">
              {selectedRange?.from ? format(selectedRange.from, "MM/dd/yyyy") : "–"}
            </div>
          </div>
          <div id="checkOut" className="flex-1 border rounded-md px-3 py-2">
            <div className="text-xs text-neutral-500 font-semibold">
              {dyn.v3.getVariant("check_out", dynamicV3TextVariants, "CHECK-OUT")}
            </div>
            <div className="tracking-wide text-[15px]">
              {selectedRange?.to ? format(selectedRange.to, "MM/dd/yyyy") : "–"}
            </div>
          </div>
        </div>
        <div className="border rounded-md px-3 py-2 mb-3">
          <div className="text-xs text-neutral-500 font-semibold">
            {dyn.v3.getVariant("guests", dynamicV3TextVariants, "GUESTS")}
          </div>
          <input
            id={dyn.v3.getVariant("guests_count", ID_VARIANTS_MAP, "guests-count")}
            className={`bg-transparent text-[15px] w-full p-0 border-none outline-none ${dyn.v3.getVariant("guests_count_input", CLASS_VARIANTS_MAP, "")}`}
            value={guests}
            type="number"
            min={1}
            max={maxGuestsAllowed}
            onChange={(event) => {
              const rawValue = Number(event.target.value);
              if (!Number.isFinite(rawValue)) {
                return;
              }

              const nextValue = Math.max(1, Math.min(maxGuestsAllowed, rawValue));

              if (nextValue !== guests) {
                logEvent(EVENT_TYPES.EDIT_NUMBER_OF_GUESTS, {
                  from: guests,
                  to: nextValue,
                  hotel: prop,
                });
              }

              setGuests(nextValue);
            }}
          />
        </div>
        {hasValidSelection ? (
          <button
            id={dyn.v3.getVariant("reserve_button", ID_VARIANTS_MAP, "reserve-button")}
            className={`${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")} rounded-lg w-full py-3 text-white font-semibold text-base bg-[#616882] hover:bg-[#8692bd] transition mb-3 shadow focus:outline-none`}
            onClick={handleReserve}
          >
            {dyn.v3.getVariant("reserve", dynamicV3TextVariants, "Reserve")}
          </button>
        ) : (
          <button
            id={dyn.v3.getVariant("check_availability_button", ID_VARIANTS_MAP, "check-availability-button")}
            disabled
            className="rounded-lg w-full py-3 text-neutral-400 font-semibold text-base bg-neutral-100 mb-3 shadow cursor-not-allowed"
          >
            {dyn.v3.getVariant("check_availability", dynamicV3TextVariants, "Check Availability")}
          </button>
        )}
        <div className="text-center text-neutral-400 text-sm mb-4">
          {dyn.v3.getVariant("no_charge_yet", dynamicV3TextVariants, "You won't be charged yet")}
        </div>
        <div className="flex flex-col gap-2 text-[15px]">
          <div className="flex items-center justify-between">
            <span className="underline">
              ${prop.price.toFixed(2)} USD x {nights}{" "}
              {nights === 1 ? dyn.v3.getVariant("night", dynamicV3TextVariants, "night") : dyn.v3.getVariant("nights", dynamicV3TextVariants, "nights")}
            </span>
            <span>${priceSubtotal.toFixed(2)} USD</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="underline">
              {dyn.v3.getVariant("cleaning_fee", dynamicV3TextVariants, "Cleaning fee")}
            </span>
            <span>${cleaningFee} USD</span>
          </div>
          <hr />
          <div className="flex items-center justify-between font-bold text-neutral-900">
            <span>{dyn.v3.getVariant("total", dynamicV3TextVariants, "Total")}</span>{" "}
            <span>${total.toFixed(2)} USD</span>
          </div>
        </div>
      </div>
    </div>
  ));
}

export default function PropertyDetail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PropertyDetailContent />
    </Suspense>
  );
}
