"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Product } from "@/context/CartContext";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { logEvent, EVENT_TYPES } from "@/library/events";

interface ProductCarouselProps {
  title: string;
  products: Product[];
  seed: number;
}

const getCardShiftClasses = (seed: number = 1) => {
  const marginLeftRightOptions = ["ml-0", "ml-2", "ml-4", "mr-2", "mr-4"];
  const marginTopOptions = ["mt-2", "mt-32", "mt-4", "mt-16", "mt-32"];
  const index = seed % marginLeftRightOptions.length;

  return {
    horizontal: marginLeftRightOptions[index],
    vertical: marginTopOptions[index],
  };
};

export function ProductCarousel({
  title,
  products,
  seed = 1,
}: ProductCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { getText, getId } = useDynamicStructure();
  // const [showLeftButton, setShowLeftButton] = useState(false);
  // const [showRightButton, setShowRightButton] = useState(true);

  const { horizontal, vertical } = getCardShiftClasses(seed);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollAmount = container.clientWidth * 0.8;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });

    // ✅ Log the event
    logEvent(EVENT_TYPES.SCROLL_CAROUSEL, {
      direction: direction.toUpperCase(),
      title,
    });

    // Update button visibility after scrolling
    // setTimeout(() => {
    //   if (!containerRef.current) return;
    //
    //   setShowLeftButton(container.scrollLeft > 0);
    //   setShowRightButton(
    //     container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    //   );
    // }, 300);
  };

  return (
    <Card id={getId("product_carousel")} className={`category-card relative ${horizontal} ${vertical}`}>
      <h2 className="category-title px-4 pt-4">{title}</h2>

      <div className="relative">
        {/*{showLeftButton && (*/}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 z-10"
          aria-label={getText("scroll_left")}
        >
          <ChevronLeft size={24} />
        </button>
        {/*// )}*/}
        <div
          ref={containerRef}
          className="flex overflow-x-auto py-4 px-4 scrollbar-hide scroll-smooth gap-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/${product.id}`}
              onClick={() =>
                logEvent(EVENT_TYPES.VIEW_DETAIL, {
                  section: product.description,
                  title: product.title,
                  price: product.price,
                  category: product.category,
                  rating: product.rating ?? 12,
                  brand: product.brand || "generic",
                })
              }
              className="flex-none w-[160px] md:w-[200px] group"
            >
              <div className="relative h-48 w-full bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.title || "Product image"}
                  fill
                  className="object-contain"
                />
              </div>
              {product.title && (
                <div className="mt-2 text-sm truncate group-hover:text-blue-600">
                  {product.title}
                </div>
              )}
              {product.price && (
                <div className="text-sm font-bold">{product.price}</div>
              )}
            </Link>
          ))}
        </div>

        {/*{showRightButton && (*/}
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 z-10"
          aria-label={getText("scroll_right")}
        >
          <ChevronRight size={24} />
        </button>
        {/*)}*/}
      </div>
    </Card>
  );
}
