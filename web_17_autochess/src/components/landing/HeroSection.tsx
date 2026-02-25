"use client";

import React from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";

export function HeroSection() {
  const router = useSeedRouter();

  return (
    <DynamicWrapper>
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1f0a] via-[#0f2f0f] to-[#0a0f0a] border border-emerald-900/30 p-8 md:p-12 my-8">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className={`${(Math.floor(i / 8) + (i % 8)) % 2 === 0 ? "bg-white" : ""}`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              <DynamicText value="AutoChess" type="text" />
            </span>
          </h1>
          <p className="text-lg text-zinc-300 mb-6">
            <DynamicText
              value="Your chess tournament platform. Explore tournaments worldwide, analyze games, solve puzzles, and track player rankings."
              type="text"
            />
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-600/20"
              onClick={() => router.push("/tournaments")}
            >
              <DynamicText value="Browse Tournaments" type="text" />
            </button>
            <button
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-colors border border-emerald-900/30"
              onClick={() => router.push("/tactics")}
            >
              <DynamicText value="Solve Puzzles" type="text" />
            </button>
          </div>
        </div>

        {/* Decorative chess piece */}
        <div className="absolute right-8 bottom-8 text-emerald-900/20 text-[120px] md:text-[180px] leading-none select-none pointer-events-none">
          &#9822;
        </div>
      </section>
    </DynamicWrapper>
  );
}
