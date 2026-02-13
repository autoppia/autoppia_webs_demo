import * as React from "react";
import Image from "next/image";
import { SeedLink } from "./ui/SeedLink";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP } from "@/dynamic/v3";
import type { Hotel } from "@/types/hotel";
import { cn } from "@/library/utils";

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

function formatDateRange(datesFrom: string, datesTo: string) {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  const fromDate = parseLocalDate(datesFrom);
  const toDate = parseLocalDate(datesTo);

  if (!fromDate && !toDate) {
    return "";
  }

  if (fromDate && !toDate) {
    return fromDate.toLocaleDateString("en-US", options);
  }

  if (!fromDate && toDate) {
    return toDate.toLocaleDateString("en-US", options);
  }

  if (!fromDate || !toDate) {
    return "";
  }

  const fromFormatted = fromDate.toLocaleDateString("en-US", options);
  const toFormatted = toDate.toLocaleDateString("en-US", options);

  if (fromFormatted === toFormatted) {
    return fromFormatted;
  }

  return `${fromFormatted} - ${toFormatted}`;
}

export function PropertyCard({
  image,
  title,
  location,
  rating,
  price,
  id,
  datesFrom,
  datesTo,
  href,
  onToggleWishlist,
  wishlisted = false,
}: {
  image: string;
  title: string;
  location: string;
  rating: number;
  price: number;
  id: number;
  datesFrom: string;
  datesTo: string;
  href?: string;
  onToggleWishlist?: (hotelId: number) => void;
  wishlisted?: boolean;
} & Partial<Hotel>) {
  const dyn = useDynamicSystem();
  const dynamicV3TextVariants: Record<string, string[]> = {
    price_night: ["night", "per night", "each night"],
  };

  // Ensure ID is properly formatted for the URL - use the ID as-is from the hotel object
  // This ensures the ID in the URL matches exactly the ID in the data
  const hotelId = id; // Use the ID directly without any transformation
  const hotelHref = href ?? `/stay/${hotelId}`;

  // Log when a hotel card is rendered to track ID consistency
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log(`[PropertyCard] Rendering hotel card - ID: ${hotelId} (type: ${typeof hotelId}), href: ${hotelHref}, title: ${title}`);
  }

  return (
    <SeedLink
      href={hotelHref}
      id={dyn.v3.getVariant("property_card_link", ID_VARIANTS_MAP, `property-card-${hotelId}`)}
      className="group relative block overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
      aria-label={`View details for ${title}`}
    >
      {dyn.v1.addWrapDecoy("property-card", (
      <div
        className={cn(
          "bg-white max-w-[275px] rounded-3xl shadow-md border border-neutral-200 flex flex-col overflow-hidden group relative transition hover:-translate-y-0.5 hover:shadow-xl cursor-pointer",
          dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "")
        )}
      >
        <div className="relative aspect-[1.25/1] overflow-hidden">
          <Image
            src={image}
            alt={title}
            width={100}
            height={100}
            quality={30}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
          {onToggleWishlist && (
            <button
              id={dyn.v3.getVariant("wishlist_button", ID_VARIANTS_MAP, `wishlist-${id}`)}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute top-3 right-3 p-2 bg-white/80 rounded-full z-10 border border-neutral-200 hover:bg-white"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleWishlist(id);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={wishlisted ? "#ef4444" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                width={22}
                height={22}
                className={wishlisted ? "text-red-500" : "text-neutral-600"}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="p-4 flex flex-col gap-1 pb-2">
          <div className="flex items-center gap-1 text-neutral-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#FF5A5F"
              viewBox="0 0 24 24"
              stroke="none"
              width={16}
              height={16}
              className="inline"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="font-semibold text-[15px] leading-none mr-1">
              {rating.toFixed(2)}
            </span>
          </div>
          <div className="font-medium text-[17px] text-neutral-800 truncate -mb-0.5">
            {title}
          </div>
          <div className="text-xs text-neutral-500">{location}</div>
          <div className="text-xs text-neutral-500 -mt-1">
            {formatDateRange(datesFrom, datesTo)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="font-semibold text-neutral-800">${price}</span>
            <span className="text-xs text-neutral-500">
              {dyn.v3.getVariant("price_night", dynamicV3TextVariants, "night")}
            </span>
          </div>
        </div>
      </div>
      ), `property-card-${id}`)}
    </SeedLink>
  );
}
