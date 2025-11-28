"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import QuickOrderModal from "./QuickOrderModal";
import { EVENT_TYPES, logEvent } from "@/components/library/events";
import { useSeedLayout } from "@/hooks/use-seed-layout";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

export default function HeroSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const layout = useSeedLayout();
  const { getText, getId } = useV3Attributes();

  const handleOrderNowClick = () => {
    setModalOpen(true);
  };

  const getButtonPosition = () => {
    switch (layout.hero.buttonPosition) {
      case 'left':
        return 'self-start';
      case 'center':
        return 'self-center';
      case 'right':
        return 'self-end';
      default:
        return 'self-center';
    }
  };

  return (
    <>
      <section className={`py-5 md:py-5 bg-white rounded-xl shadow-md mb-12 flex flex-col items-center text-center ${layout.hero.containerClass}`}>
        <h1 className="text-2xl md:text-4xl font-extrabold mb-4 tracking-tight text-zinc-900" id={getId("hero_title_id", "hero-title")}>
          {getText("hero_title_line1", "Delicious food,")}
          <br /> {getText("hero_title_line2", "delivered to your door")}
        </h1>
        <p className="text-lg mb-8 max-w-xl text-zinc-600">
          {getText("hero_subtitle", "Discover the best restaurants and cuisines. Order fresh, fast, and easy — anytime, anywhere.")}
        </p>
        <Button
          size="lg"
          className={`text-lg px-8 py-2 rounded-full shadow-lg ${layout.hero.buttonClass} ${getButtonPosition()}`}
          onClick={handleOrderNowClick}
        >
          {getText("hero_cta", "Order Now")}
        </Button>
      </section>

      <QuickOrderModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </>
  );
}
