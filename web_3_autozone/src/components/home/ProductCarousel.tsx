"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Product } from "@/context/CartContext";
import { useCart } from "@/context/CartContext";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { BlurCard } from "@/components/ui/BlurCard";
import { cn } from "@/library/utils";

interface ProductCarouselProps {
  title: string;
  products: Product[];
  seed: number;
}

const PROGRESS_SEGMENTS = 4;

export function ProductCarousel({
  title,
  products,
  seed = 1,
}: ProductCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { getText, getId } = useV3Attributes();
  const router = useSeedRouter();
  const { addToCart } = useCart();
  const [progressStep, setProgressStep] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollAmount = container.clientWidth * 0.8;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });

    logEvent(EVENT_TYPES.SCROLL_CAROUSEL, {
      direction: direction.toUpperCase(),
      title,
    });
  };

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handleScroll = () => {
      const maxScroll = node.scrollWidth - node.clientWidth || 1;
      const ratio = node.scrollLeft / maxScroll;
      setProgressStep(
        Math.min(
          PROGRESS_SEGMENTS - 1,
          Math.round(ratio * (PROGRESS_SEGMENTS - 1))
        )
      );
    };

    node.addEventListener("scroll", handleScroll, { passive: true });
    return () => node.removeEventListener("scroll", handleScroll);
  }, [products.length]);

  const handleViewProduct = (product: Product) => {
    logEvent(EVENT_TYPES.VIEW_DETAIL, {
      section: product.description,
      title: product.title,
      price: product.price,
      category: product.category,
      rating: product.rating ?? 0,
      brand: product.brand || "generic",
    });
    router.push(`/${product.id}`);
  };

  const handleQuickAdd = (product: Product) => {
    if (!addToCart) return handleViewProduct(product);
    addToCart(product);
    logEvent(EVENT_TYPES.ADD_TO_CART, {
      productId: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      brand: product.brand,
      source: "carousel",
    });
  };

  const exploreHref = `/search?q=${encodeURIComponent(title)}`;

  // Don't render if no products
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <BlurCard
      id={getId("product_carousel")}
      className="relative flex flex-col overflow-hidden shadow-lg"
      data-seed={seed}
    >
      <div className="flex flex-col gap-3 px-6 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500 font-medium">
            Featured collection
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">{title}</h2>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="rounded-full border border-slate-300 bg-white p-2.5 text-slate-700 shadow-md hover:bg-slate-50 hover:shadow-lg transition-all duration-200"
            aria-label={getText("scroll_left")}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="rounded-full border border-slate-300 bg-white p-2.5 text-slate-700 shadow-md hover:bg-slate-50 hover:shadow-lg transition-all duration-200"
            aria-label={getText("scroll_right")}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className="mt-4 flex gap-4 overflow-x-auto px-5 pb-6 pt-2 scroll-smooth snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-none snap-start"
              style={{ width: "220px" }}
            >
              <BlurCard
                interactive
                className="flex h-full flex-col gap-3 rounded-3xl border border-slate-200/60 bg-white/95 p-4 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div
                  className="relative h-44 w-full cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100"
                  onClick={() => handleViewProduct(product)}
                >
                  <Image
                    src={product.image || "/images/placeholder-product.jpg"}
                    alt={product.title || "Product image"}
                    fill
                    className="object-contain p-2 transition-transform duration-300 hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/placeholder-product.jpg";
                    }}
                  />
                  {product.price && (
                    <span className="absolute left-3 top-3 rounded-full bg-slate-900/95 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                      {product.price}
                    </span>
                  )}
                  {product.rating && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-md backdrop-blur-sm">
                      <span className="text-yellow-500">★</span>
                      <span>{product.rating.toFixed(1)}</span>
                      {product.reviews !== undefined && (
                        <span className="text-slate-500">({product.reviews})</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <p className="line-clamp-2 text-sm font-bold text-slate-900 leading-tight">
                    {product.title}
                  </p>
                  <p className="text-xs font-medium text-slate-600">
                    {product.brand || product.category}
                  </p>
                  {product.description && (
                    <p className="line-clamp-2 text-xs text-slate-500 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleViewProduct(product)}
                    className="text-xs font-semibold text-slate-600 underline decoration-dotted underline-offset-4 hover:text-slate-900 transition-colors"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(product)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition-all duration-200 shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Quick add
                  </button>
                </div>
              </BlurCard>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white/90 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white/90 to-transparent" />
      </div>

      <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {Array.from({ length: PROGRESS_SEGMENTS }).map((_, index) => (
            <span
              key={`${title}-progress-${index}`}
              className={cn(
                "h-2 w-12 rounded-full transition-all duration-300",
                index === progressStep 
                  ? "bg-slate-900 shadow-md" 
                  : "bg-slate-200 hover:bg-slate-300"
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            router.push(exploreHref);
          }}
          className="text-sm font-bold text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline transition-colors"
        >
          View more in {title} →
        </button>
      </div>
    </BlurCard>
  );
}
