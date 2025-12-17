"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { SafeImage } from "@/components/ui/SafeImage";

const AUTO_DELAY = 5000;

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const dyn = useDynamicSystem();

  // Local text variants for this component
  const dynamicV3TextVariants: Record<string, string[]> = {
    slider_alt_1: ["Shop Autozone", "Browse Products", "Discover Deals"],
    slider_alt_2: ["Shop Autozone", "Browse Products", "Discover Deals"],
    slider_alt_3: ["Shop Autozone", "Browse Products", "Discover Deals"],
    slider_alt_4: ["Shop Autozone", "Browse Products", "Discover Deals"],
    slider_alt_5: ["Shop Autozone", "Browse Products", "Discover Deals"],
    previous_slide: ["Previous slide", "Go back", "Previous"],
    next_slide: ["Next slide", "Go forward", "Next"],
    fresh_arrivals: ["Fresh arrivals daily", "New products daily", "Daily arrivals"],
    hero_text: [
      "Shop trusted brands, local favorites, and fast-shipping essentials in one place.",
      "Find everything you need from trusted brands with fast shipping.",
      "Discover quality products from trusted brands delivered fast."
    ]
  };

  const sliderImages = [
    {
      id: 1,
      url: "/images/slider/amazon_slider_1.jpg",
      altKey: "slider_alt_1",
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1600&q=80",
      altKey: "slider_alt_2",
    },
    {
      id: 3,
      url: "/images/slider/amazon_slider_3.jpg",
      altKey: "slider_alt_3",
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
      altKey: "slider_alt_4",
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80",
      altKey: "slider_alt_5",
    },
  ];
  const slideCount = sliderImages.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slideCount - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === slideCount - 1 ? 0 : prev + 1
      );
    }, AUTO_DELAY);
    return () => clearInterval(interval);
  }, [slideCount]);

  // Dynamic ordering for slider images - but keep original order for display logic
  const orderedSliderImages = useMemo(() => {
    const order = dyn.v1.changeOrderElements("hero-slider-images", sliderImages.length);
    return order.map((idx) => ({ ...sliderImages[idx], originalIndex: idx }));
  }, [dyn.seed]);

  return (
    dyn.v1.addWrapDecoy("hero-slider-container", (
      <div
        id={dyn.v3.getVariant("hero_slider", ID_VARIANTS_MAP, "hero-slider")}
        className={dyn.v3.getVariant("hero-banner", CLASS_VARIANTS_MAP, "relative h-[400px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-amazon-lightBlue to-amazon-blue")}
      >
        {dyn.v1.addWrapDecoy("hero-slider-images", (
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            {orderedSliderImages.map((slide) => {
              const isCurrent = slide.originalIndex === currentSlide;
              return (
                dyn.v1.addWrapDecoy(`hero-slide-${slide.id}`, (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      isCurrent ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <SafeImage
                      src={slide.url}
                      alt={dyn.v3.getVariant(slide.altKey, dynamicV3TextVariants, "Shop Autozone")}
                      fill
                      className="object-cover"
                      priority={slide.originalIndex === 0}
                      fallbackSrc="/images/slider/amazon_slider_1.jpg"
                    />
                  </div>
                ), slide.id.toString())
              );
            })}
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

        {dyn.v1.addWrapDecoy("hero-slider-text", (
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">
              {dyn.v3.getVariant("fresh_arrivals", dynamicV3TextVariants, "Fresh arrivals daily")}
            </p>
            <p className="text-2xl font-semibold leading-snug lg:text-3xl">
              {dyn.v3.getVariant("hero_text", dynamicV3TextVariants, "Shop trusted brands, local favorites, and fast-shipping essentials in one place.")}
            </p>
          </div>
        ))}

        {dyn.v1.addWrapDecoy("hero-slider-prev-btn", (
          <button
            onClick={prevSlide}
            id={dyn.v3.getVariant("carousel-left-btn", ID_VARIANTS_MAP)}
            className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-slate-900 shadow-lg transition hover:bg-white")}
            aria-label={dyn.v3.getVariant("previous_slide", dynamicV3TextVariants, "Previous slide")}
          >
            <ChevronLeft size={24} />
          </button>
        ))}
        {dyn.v1.addWrapDecoy("hero-slider-next-btn", (
          <button
            onClick={nextSlide}
            id={dyn.v3.getVariant("carousel-right-btn", ID_VARIANTS_MAP)}
            className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-slate-900 shadow-lg transition hover:bg-white")}
            aria-label={dyn.v3.getVariant("next_slide", dynamicV3TextVariants, "Next slide")}
          >
            <ChevronRight size={24} />
          </button>
        ))}

        {dyn.v1.addWrapDecoy("hero-slider-indicators", (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {sliderImages.map((slide, index) => (
              dyn.v1.addWrapDecoy(`hero-slider-indicator-${slide.id}`, (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 w-8 rounded-full transition ${
                    index === currentSlide ? "bg-white" : "bg-white/40"
                  }`}
                />
              ), slide.id.toString())
            ))}
          </div>
        ))}
      </div>
    ))
  );
}
