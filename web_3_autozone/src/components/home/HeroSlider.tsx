"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { SafeImage } from "@/components/ui/SafeImage";

const AUTO_DELAY = 5000;

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { getText, getId } = useV3Attributes();

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

  return (
    <div
      id={getId("hero_slider")}
      className="relative h-[320px] w-full overflow-hidden rounded-[32px] bg-slate-900 text-white shadow-elevated lg:h-[420px]"
    >
      <div className="absolute inset-0">
        {sliderImages.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <SafeImage
              src={slide.url}
              alt={getText(slide.altKey)}
              fill
              className="object-cover"
              priority={index === 0}
              fallbackSrc="/images/slider/amazon_slider_1.jpg"
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

      <div className="absolute bottom-6 left-6 right-6 space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-white/70">
          Fresh arrivals daily
        </p>
        <p className="text-2xl font-semibold leading-snug lg:text-3xl">
          Shop trusted brands, local favorites, and fast-shipping essentials in one place.
        </p>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-slate-900 shadow-lg transition hover:bg-white"
        aria-label={getText("previous_slide")}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-slate-900 shadow-lg transition hover:bg-white"
        aria-label={getText("next_slide")}
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {sliderImages.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 w-8 rounded-full transition ${
              index === currentSlide ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
