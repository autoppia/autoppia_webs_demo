"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Product } from "@/context/CartContext";
import { useCart } from "@/context/CartContext";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { logEvent, EVENT_TYPES } from "@/events";
import { BlurCard } from "@/components/ui/BlurCard";
import { SafeImage } from "@/components/ui/SafeImage";
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
  const dyn = useDynamicSystem();
  const router = useSeedRouter();
  const { addToCart } = useCart();
  const [progressStep, setProgressStep] = useState(0);
  const progressMarkers = useMemo(
    () => Array.from({ length: PROGRESS_SEGMENTS }, (_, idx) => `step-${idx + 1}`),
    []
  );

  // Local text variants for this component
  const dynamicV3TextVariants: Record<string, string[]> = {
    scroll_left: ["Scroll left", "Previous", "Back", "Left"],
    scroll_right: ["Scroll right", "Next", "Forward", "Right"],
    view_details: ["Details", "View Details", "See More", "More Info"],
    quick_add: ["Quick add", "Add to Cart", "Add", "Quick Add"],
  };

  const scroll = (direction: "left" | "right", event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
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
    const totalItems = products.length;

    const handleScroll = (e: Event) => {
      e.stopPropagation();
      if (!totalItems) return;
      const maxScroll = node.scrollWidth - node.clientWidth || 1;
      const ratio = node.scrollLeft / maxScroll;
      setProgressStep(
        Math.min(
          PROGRESS_SEGMENTS - 1,
          Math.round(ratio * (PROGRESS_SEGMENTS - 1))
        )
      );
    };

    // Prevent any navigation or reload on scroll
    const handleWheel = (e: WheelEvent) => {
      // Only prevent default if scrolling horizontally
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.stopPropagation();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.stopPropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
    };

    node.addEventListener("scroll", handleScroll, { passive: true });
    node.addEventListener("wheel", handleWheel, { passive: true });
    node.addEventListener("touchstart", handleTouchStart, { passive: true });
    node.addEventListener("touchmove", handleTouchMove, { passive: true });
    
    return () => {
      node.removeEventListener("scroll", handleScroll);
      node.removeEventListener("wheel", handleWheel);
      node.removeEventListener("touchstart", handleTouchStart);
      node.removeEventListener("touchmove", handleTouchMove);
    };
  }, [products]);

  const handleViewProduct = (product: Product, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    logEvent(EVENT_TYPES.VIEW_DETAIL, {
      section: product.description,
      title: product.title,
      price: product.price,
      category: product.category,
      rating: product.rating ?? 0,
      brand: product.brand || "generic",
    });
    // Ensure seed is preserved in navigation
    const productUrl = `/${product.id}`;
    router.push(productUrl);
  };

  const handleQuickAdd = (product: Product, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!addToCart) return handleViewProduct(product, event);
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

  // Apply dynamic ordering to products
  const orderedProducts = useMemo(() => {
    const order = dyn.v1.changeOrderElements(`product-carousel-${title}`, products.length);
    return order.map((idx) => products[idx]);
  }, [dyn.seed, products, title]);

  return (
    <BlurCard
      id={dyn.v3.getVariant("product_carousel", ID_VARIANTS_MAP, "product-carousel")}
      className={dyn.v3.getVariant("product_carousel", CLASS_VARIANTS_MAP, "relative flex flex-col overflow-hidden")}
      data-seed={seed}
    >
      {dyn.v1.addWrapDecoy("product-carousel-header", (
        <div className="flex flex-col gap-2 px-5 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">
              {dyn.v3.getVariant("featured_collection", undefined, "Featured collection")}
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            {dyn.v1.addWrapDecoy("product-carousel-left-btn", (
              <button
                type="button"
                onClick={(e) => scroll("left", e)}
                id={dyn.v3.getVariant("carousel-left-btn", ID_VARIANTS_MAP)}
                className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 shadow-sm")}
                aria-label={dyn.v3.getVariant("scroll_left", dynamicV3TextVariants, "Scroll left")}
              >
                <ChevronLeft size={20} />
              </button>
            ))}
            {dyn.v1.addWrapDecoy("product-carousel-right-btn", (
              <button
                type="button"
                onClick={(e) => scroll("right", e)}
                id={dyn.v3.getVariant("carousel-right-btn", ID_VARIANTS_MAP)}
                className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 shadow-sm")}
                aria-label={dyn.v3.getVariant("scroll_right", dynamicV3TextVariants, "Scroll right")}
              >
                <ChevronRight size={20} />
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="relative">
        <div
          ref={containerRef}
          className="mt-4 flex gap-4 overflow-x-auto px-5 pb-6 pt-2 scroll-smooth snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          role="region"
          aria-label={`${title} carousel`}
          onMouseDown={(e) => {
            // Prevent any accidental navigation when starting to scroll
            const target = e.target as HTMLElement;
            // Only prevent if clicking on the container itself, not on interactive elements
            if (target === containerRef.current || 
                (containerRef.current?.contains(target) && 
                 !target.closest('button') && 
                 !target.closest('[role="button"]') &&
                 !target.closest('a'))) {
              e.stopPropagation();
            }
          }}
          onTouchStart={(e) => {
            // Prevent any accidental navigation when starting to scroll on touch devices
            const target = e.target as HTMLElement;
            if (target === containerRef.current || 
                (containerRef.current?.contains(target) && 
                 !target.closest('button') && 
                 !target.closest('[role="button"]') &&
                 !target.closest('a'))) {
              e.stopPropagation();
            }
          }}
          onClick={(e) => {
            // Prevent any accidental navigation from clicks during scroll
            const target = e.target as HTMLElement;
            // If clicking on the container itself (not a button or link), prevent navigation
            if (target === containerRef.current || 
                (containerRef.current?.contains(target) && 
                 !target.closest('button') && 
                 !target.closest('[role="button"]') &&
                 !target.closest('a') &&
                 !target.closest('[onClick]'))) {
              e.stopPropagation();
            }
          }}
        >
          {orderedProducts.map((product, index) => (
            dyn.v1.addWrapDecoy(`product-card-${product.id}`, (
              <div
                key={product.id}
                className="flex-none snap-start"
                style={{ width: "220px" }}
              >
                <BlurCard
                  interactive
                  id={dyn.v3.getVariant("product-card", ID_VARIANTS_MAP, `product-card-${index}`)}
                  className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "flex h-full flex-col gap-3 rounded-3xl border-white/50 bg-white/85 p-4")}
                >
                  {dyn.v1.addWrapDecoy(`product-image-${product.id}`, (
                    <div
                      className="relative h-40 w-full cursor-pointer overflow-hidden rounded-2xl bg-slate-50"
                      onClick={(e) => handleViewProduct(product, e)}
                      onMouseDown={(e) => {
                        // Prevent drag from triggering navigation
                        if (e.button === 0) {
                          e.stopPropagation();
                        }
                      }}
                    >
                      <SafeImage
                        src={product.image}
                        alt={product.title || "Product image"}
                        fill
                        className="object-contain transition-transform duration-300 hover:scale-105"
                        fallbackSrc="/images/homepage_categories/coffee_machine.jpg"
                      />
                      {product.price && (
                        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow">
                          {product.price}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="flex-1 space-y-1">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {product.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {product.brand || product.category}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    {dyn.v1.addWrapDecoy(`product-details-btn-${product.id}`, (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleViewProduct(product, e);
                        }}
                        id={dyn.v3.getVariant("view-details-btn", ID_VARIANTS_MAP)}
                        className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "text-slate-500 underline decoration-dotted underline-offset-4")}
                      >
                        {dyn.v3.getVariant("view_details", dynamicV3TextVariants, "Details")}
                      </button>
                    ))}
                    {dyn.v1.addWrapDecoy(`product-quick-add-btn-${product.id}`, (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuickAdd(product, e);
                        }}
                        id={dyn.v3.getVariant("add-to-cart", ID_VARIANTS_MAP)}
                        className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-white")}
                      >
                        <Plus className="h-3 w-3" />
                        {dyn.v3.getVariant("quick_add", dynamicV3TextVariants, "Quick add")}
                      </button>
                    ))}
                  </div>
                </BlurCard>
              </div>
            ), product.id)
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white/90 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white/90 to-transparent" />
      </div>

      <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {progressMarkers.map((marker, index) => (
            <span
              key={`${title}-progress-${marker}`}
              className={cn(
                "h-1.5 w-10 rounded-full transition",
                index === progressStep ? "bg-slate-900" : "bg-slate-200"
              )}
            />
          ))}
        </div>
        {dyn.v1.addWrapDecoy("product-carousel-view-more-btn", (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Ensure seed is preserved in navigation
              router.push(exploreHref);
            }}
            id={dyn.v3.getVariant("view-more-btn", ID_VARIANTS_MAP)}
            className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "text-sm font-semibold text-slate-700 underline-offset-4 hover:underline")}
          >
            {dyn.v3.getVariant("see_more", TEXT_VARIANTS_MAP, `View more in ${title}`)}
          </button>
        ))}
      </div>
    </BlurCard>
  );
}
