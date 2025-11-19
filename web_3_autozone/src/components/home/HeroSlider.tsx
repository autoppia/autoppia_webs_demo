"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

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
      url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1200&q=80",
      altKey: "slider_alt_2",
    },
    {
      id: 3,
      url: "/images/slider/amazon_slider_3.jpg",
      altKey: "slider_alt_3",
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1200&q=80",
      altKey: "slider_alt_4",
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
      altKey: "slider_alt_5",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === sliderImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? sliderImages.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id={getId("hero_slider")} className="relative w-full overflow-hidden">
      <div className="relative h-[300px] md:h-[400px] w-full">
        {sliderImages.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.url}
              alt={getText(slide.altKey)}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Gradient overlay at the bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[100px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
        }}
      />

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 opacity-70 hover:opacity-100 z-10 shadow"
        aria-label={getText("previous_slide")}
      >
        <ChevronLeft size={36} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 opacity-70 hover:opacity-100 z-10 shadow"
        aria-label={getText("next_slide")}
      >
        <ChevronRight size={36} />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {sliderImages.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === currentSlide ? "bg-white" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
