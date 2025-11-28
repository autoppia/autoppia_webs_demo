"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

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
      className="relative h-[400px] w-full overflow-hidden bg-gradient-to-br from-amazon-lightBlue to-amazon-blue"
    >
      <div className="absolute inset-0">
        {sliderImages.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.url}
              alt={getText(slide.altKey, "Shop Autozone")}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow-lg transition hover:bg-white z-10"
        aria-label={getText("previous_slide", "Previous")}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow-lg transition hover:bg-white z-10"
        aria-label={getText("next_slide", "Next")}
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-10">
        {sliderImages.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 w-8 rounded-full transition ${
              index === currentSlide ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
