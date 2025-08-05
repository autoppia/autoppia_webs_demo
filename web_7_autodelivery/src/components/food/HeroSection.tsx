"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import QuickOrderModal from "./QuickOrderModal";
import { EVENT_TYPES, logEvent } from "@/components/library/events";

export default function HeroSection() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOrderNowClick = () => {
    logEvent(EVENT_TYPES.QUICK_ORDER_MODAL_OPEN, {
      source: "hero_section"
    });
    setModalOpen(true);
  };

  return (
    <>
      <section className="py-5 md:py-5 bg-white rounded-xl shadow-md mb-12 flex flex-col items-center text-center">
        <h1 className="text-2xl md:text-4xl font-extrabold mb-4 tracking-tight text-zinc-900">
          Delicious food,
          <br /> delivered to your door
        </h1>
        <p className="text-lg mb-8 max-w-xl text-zinc-600">
          Discover the best restaurants and cuisines. Order fresh, fast, and easy
          — anytime, anywhere.
        </p>
        <Button
          size="lg"
          className="text-lg px-8 py-2 rounded-full shadow-lg"
          onClick={handleOrderNowClick}
        >
          Order Now
        </Button>
      </section>

      <QuickOrderModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </>
  );
}
