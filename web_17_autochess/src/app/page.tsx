"use client";

import React, { useMemo } from "react";
import { useSeed } from "@/context/SeedContext";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { generateAllData } from "@/data/generators";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedTournaments } from "@/components/landing/FeaturedTournaments";
import { TopPlayersTable } from "@/components/landing/TopPlayersTable";
import { DailyPuzzle } from "@/components/landing/DailyPuzzle";
import { formatNumber } from "@/library/formatters";

export default function HomePage() {
  const { seed } = useSeed();
  const data = useMemo(() => generateAllData(seed), [seed]);

  return (
    <div className="py-6">
      <HeroSection />
      <FeaturedTournaments tournaments={data.tournaments} />

      {/* Quick Stats */}
      <DynamicWrapper>
        <section className="my-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Tournaments" value={formatNumber(data.tournaments.length)} />
          <StatCard label="Players" value={formatNumber(data.players.length)} />
          <StatCard label="Games" value={formatNumber(data.games.length)} />
          <StatCard label="Puzzles" value={formatNumber(data.puzzles.length)} />
        </section>
      </DynamicWrapper>

      <TopPlayersTable players={data.players} />
      <DailyPuzzle puzzle={data.puzzles[seed % data.puzzles.length]} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#111a11] border border-emerald-900/30 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-emerald-400">{value}</div>
      <div className="text-sm text-zinc-400 mt-1">
        <DynamicText value={label} type="text" />
      </div>
    </div>
  );
}
