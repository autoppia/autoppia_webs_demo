"use client";

import { useSeed } from "@/context/SeedContext";
import { useDynamicSystem } from "@/dynamic/shared";
import Navbar from "@/components/Navbar";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Utensils, Heart, Users, Award, TrendingUp } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";

export default function AboutPage() {
  const { seed } = useSeed();
  const dyn = useDynamicSystem();
  const searchParams = useSearchParams();
  const hasSeedParam = Boolean(searchParams?.get("seed"));

  const features = [
    { icon: <Utensils className="w-5 h-5" />, title: "Curated Restaurants", description: "Discover handpicked dining experiences from top-rated restaurants across the city." },
    { icon: <Heart className="w-5 h-5" />, title: "Easy Reservations", description: "Book your table in seconds with our streamlined reservation system." },
    { icon: <Users className="w-5 h-5" />, title: "Community Driven", description: "Join thousands of food lovers sharing their favorite dining experiences." },
    { icon: <Award className="w-5 h-5" />, title: "Verified Reviews", description: "Read authentic reviews from verified diners who have visited these restaurants." },
    { icon: <TrendingUp className="w-5 h-5" />, title: "Trending Spots", description: "Stay updated with the most popular and trending restaurants in your area." },
  ];

  useEffect(() => {
    logEvent(EVENT_TYPES.ABOUT_PAGE_VIEW, { seed, fromSeedParam: hasSeedParam });
  }, [seed, hasSeedParam]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden py-24 px-6">
        <div className="absolute top-10 left-1/3 w-72 h-72 bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="uppercase tracking-[0.5em] text-[11px] font-semibold text-amber-500 mb-4">Our story</p>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">About AutoDining</h1>
          <p className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">Your trusted companion for discovering and booking the finest dining experiences. We connect food lovers with exceptional restaurants, making every meal memorable.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20 space-y-16">
        {/* Mission Section */}
        <section className="animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          <div className="glass rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
            <div className="relative">
              <p className="uppercase tracking-[0.3em] text-[10px] font-semibold text-amber-500 mb-3">Mission</p>
              <h2 className="text-3xl font-bold text-white mb-5 tracking-tight">Our Mission</h2>
              <p className="text-white/40 text-base leading-relaxed">At AutoDining, we believe that great food deserves great experiences. Our mission is to simplify restaurant discovery and reservation booking, ensuring that every dining experience is seamless, enjoyable, and unforgettable. We're committed to connecting diners with the perfect restaurant for every occasion.</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section>
          <div className="text-center mb-10">
            <p className="uppercase tracking-[0.3em] text-[10px] font-semibold text-amber-500 mb-3">Features</p>
            <h2 className="text-3xl font-bold text-white tracking-tight">Why Choose AutoDining?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <div key={feature.title} className="glass rounded-2xl p-6 card-lift cursor-default opacity-0 animate-fade-in-up" style={{ animationDelay: `${i * 100 + 100}ms`, animationFillMode: "forwards" }} onClick={() => logEvent(EVENT_TYPES.ABOUT_FEATURE_CLICK, { feature: feature.title, seed })}>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">{feature.icon}</div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section>
          <div className="glass rounded-3xl p-10 md:p-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "500+", label: "Restaurants" },
                { value: "50K+", label: "Happy Customers" },
                { value: "100K+", label: "Reservations" },
                { value: "4.8", label: "Average Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-black text-amber-500 mb-1">{stat.value}</div>
                  <div className="text-white/40 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section>
          <div className="text-center mb-10">
            <p className="uppercase tracking-[0.3em] text-[10px] font-semibold text-amber-500 mb-3">Principles</p>
            <h2 className="text-3xl font-bold text-white tracking-tight">Our Values</h2>
          </div>
          <div className="space-y-4">
            {["Excellence", "Integrity", "Innovation"].map((value, idx) => (
              <div key={value} className="glass rounded-2xl p-6 flex gap-5 items-start">
                <div className="w-1 h-12 rounded-full bg-gradient-to-b from-amber-500 to-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{value}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {idx === 0 && "We strive for excellence in everything we do, from restaurant curation to customer service."}
                    {idx === 1 && "We maintain the highest standards of integrity and transparency in all our operations."}
                    {idx === 2 && "We continuously innovate to provide the best possible experience for our users."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
