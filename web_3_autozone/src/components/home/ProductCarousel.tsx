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

  return (
    <BlurCard
      id={getId("product_carousel")}
      className="relative flex flex-col overflow-hidden"
      data-seed={seed}
    >
      <div className="flex flex-col gap-2 px-5 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">
            Featured collection
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 shadow-sm"
            aria-label={getText("scroll_left")}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 shadow-sm"
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
                className="flex h-full flex-col gap-3 rounded-3xl border-white/50 bg-white/85 p-4"
              >
                <div
                  className="relative h-40 w-full cursor-pointer overflow-hidden rounded-2xl bg-slate-50"
                  onClick={() => handleViewProduct(product)}
                >
                  <Image
                    src={product.image}
                    alt={product.title || "Product image"}
                    fill
                    className="object-contain transition-transform duration-300 hover:scale-105"
                  />
                  {product.price && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow">
                      {product.price}
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                    {product.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {product.brand || product.category}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <button
                    type="button"
                    onClick={() => handleViewProduct(product)}
                    className="text-slate-500 underline decoration-dotted underline-offset-4"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(product)}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-white"
                  >
                    <Plus className="h-3 w-3" />
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

      <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {Array.from({ length: PROGRESS_SEGMENTS }).map((_, index) => (
            <span
              key={`${title}-progress-${index}`}
              className={cn(
                "h-1.5 w-10 rounded-full transition",
                index === progressStep ? "bg-slate-900" : "bg-slate-200"
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            router.push(exploreHref);
          }}
          className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
        >
          View more in {title}
        </button>
      </div>
    </BlurCard>
  );
}
