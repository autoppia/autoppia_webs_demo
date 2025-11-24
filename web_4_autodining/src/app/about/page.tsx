"use client";

import { useSeed } from "@/context/SeedContext";
import { useSeedVariation } from "@/dynamic/v1-layouts";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import Navbar from "@/components/Navbar";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Utensils, Heart, Users, Award, TrendingUp } from "lucide-react";

export default function AboutPage() {
  const { seed, resolvedSeeds } = useSeed();
  const { getText } = useV3Attributes();
  const searchParams = useSearchParams();
  const hasSeedParam = Boolean(searchParams?.get("seed"));
  const layoutSeed = hasSeedParam ? (resolvedSeeds.v1 ?? seed) : 8;

  // Use seed-based layout variations
  const pageLayoutVariation = useSeedVariation("pageLayout", undefined, layoutSeed);
  const sectionLayoutVariation = useSeedVariation("sectionLayout", undefined, layoutSeed);

  // Calculate layout variation for styling
  const layoutMode = useMemo(() => (layoutSeed % 3 + 3) % 3, [layoutSeed]);
  const layoutVariation = useMemo(() => {
    return {
      textAlign: ["text-left md:text-left", "text-center", "text-left md:text-right"][layoutMode],
      gridCols: ["grid-cols-1 md:grid-cols-2", "grid-cols-1 md:grid-cols-3", "grid-cols-1"][layoutMode],
      spacing: ["space-y-10", "space-y-14", "space-y-20"][layoutMode],
    };
  }, [layoutMode]);

  const orderedSections = useMemo(() => {
    const sequences: Record<number, ("mission" | "features" | "stats" | "values")[]> = {
      0: ["mission", "features", "stats", "values"],
      1: ["features", "mission", "values", "stats"],
      2: ["stats", "mission", "features", "values"],
    };
    return sequences[layoutMode];
  }, [layoutMode]);

  const features = [
    {
      icon: <Utensils className="w-8 h-8" />,
      title: "Curated Restaurants",
      description: "Discover handpicked dining experiences from top-rated restaurants across the city.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Easy Reservations",
      description: "Book your table in seconds with our streamlined reservation system.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Driven",
      description: "Join thousands of food lovers sharing their favorite dining experiences.",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Verified Reviews",
      description: "Read authentic reviews from verified diners who have visited these restaurants.",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Trending Spots",
      description: "Stay updated with the most popular and trending restaurants in your area.",
    },
  ];

  return (
    <main>
      <Navbar />
      <div className={`${pageLayoutVariation.className || "max-w-6xl mx-auto px-4 py-8"}`} 
           data-testid={pageLayoutVariation.dataTestId}>
        {/* Hero Section */}
        <div className={`mb-12 ${hasSeedParam ? layoutVariation.textAlign : "text-center"}`}>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            About AutoDining
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted companion for discovering and booking the finest dining experiences.
            We connect food lovers with exceptional restaurants, making every meal memorable.
          </p>
        </div>

        <div className={layoutVariation.spacing}>
          {orderedSections.map((sectionKey) => {
            if (sectionKey === "mission") {
              return (
                <section
                  key="mission"
                  className={`${sectionLayoutVariation.className || "mb-12"}`}
                  data-testid={sectionLayoutVariation.dataTestId}
                >
                  <div
                    className={`bg-gradient-to-r ${
                      layoutMode === 2 ? "from-[#3d8f4e] to-[#46a758]" : "from-[#46a758] to-[#3d8f4e]"
                    } rounded-2xl p-8 md:p-12 text-white`}
                  >
                    <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                    <p className="text-lg leading-relaxed max-w-3xl">
                      At AutoDining, we believe that great food deserves great experiences.
                      Our mission is to simplify restaurant discovery and reservation booking,
                      ensuring that every dining experience is seamless, enjoyable, and unforgettable.
                      We're committed to connecting diners with the perfect restaurant for every occasion.
                    </p>
                  </div>
                </section>
              );
            }

            if (sectionKey === "features") {
              return (
                <section key="features" className={`${sectionLayoutVariation.className || "mb-12"}`}>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose AutoDining?</h2>
                  <div className={`grid ${layoutVariation.gridCols} gap-6 md:gap-8`}>
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="text-[#46a758] mb-4">{feature.icon}</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (sectionKey === "stats") {
              return (
                <section key="stats" className={`${sectionLayoutVariation.className || "mb-12"}`}>
                  <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
                    <div
                      className={`grid ${
                        layoutMode === 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2 md:grid-cols-4"
                      } gap-6 text-center`}
                    >
                      <div>
                        <div className="text-4xl font-bold text-[#46a758] mb-2">500+</div>
                        <div className="text-gray-600">Restaurants</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-[#46a758] mb-2">50K+</div>
                        <div className="text-gray-600">Happy Customers</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-[#46a758] mb-2">100K+</div>
                        <div className="text-gray-600">Reservations</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-[#46a758] mb-2">4.8★</div>
                        <div className="text-gray-600">Average Rating</div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            return (
              <section key="values" className={`${sectionLayoutVariation.className || "mb-12"}`}>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
                <div
                  className={`${
                    layoutMode === 2 ? "space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6" : "space-y-6"
                  }`}
                >
                  {["Excellence", "Integrity", "Innovation"].map((value, idx) => (
                    <div
                      key={value}
                      className={`border-l-4 border-[#46a758] pl-6 py-2 ${
                        layoutMode === 2 ? "md:border-l-0 md:border-t-4 md:pt-6" : ""
                      }`}
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{value}</h3>
                      <p className="text-gray-600">
                        {idx === 0 &&
                          "We strive for excellence in everything we do, from restaurant curation to customer service."}
                        {idx === 1 &&
                          "We maintain the highest standards of integrity and transparency in all our operations."}
                        {idx === 2 &&
                          "We continuously innovate to provide the best possible experience for our users."}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}