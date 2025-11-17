"use client";
import Image from "next/image";
import { useRestaurants } from "@/contexts/RestaurantContext";
import { Loader2 } from "lucide-react";

export default function TestimonialsSection() {
  const { testimonials, isLoading } = useRestaurants();

  if (isLoading && testimonials.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <section className="mt-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">What our customers say</h2>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-xl shadow p-6 flex flex-col items-center gap-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="rounded-full overflow-hidden w-16 h-16 border-2 border-zinc-200">
              <Image src={t.avatar} alt={t.name} width={64} height={64} className="object-cover" />
            </div>
            <p className="text-zinc-700 mb-2">"{t.feedback}"</p>
            <div className="font-bold text-zinc-900">{t.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
