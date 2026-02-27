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
import { Trophy, Users, Swords, Puzzle } from "lucide-react";

export default function HomePage() {
  const { seed } = useSeed();
  const data = useMemo(() => generateAllData(seed), [seed]);

  return (
    <div className="py-6 space-y-2">
      <HeroSection />

      {/* Quick Stats Bar */}
      <DynamicWrapper>
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 my-8">
          <StatCard label="Tournaments" value={formatNumber(data.tournaments.length)} icon={<Trophy className="h-5 w-5" />} />
          <StatCard label="Players" value={formatNumber(data.players.length)} icon={<Users className="h-5 w-5" />} />
          <StatCard label="Games" value={formatNumber(data.games.length)} icon={<Swords className="h-5 w-5" />} />
          <StatCard label="Puzzles" value={formatNumber(data.puzzles.length)} icon={<Puzzle className="h-5 w-5" />} />
        </section>
      </DynamicWrapper>

      <FeaturedTournaments tournaments={data.tournaments} />
      <TopPlayersTable players={data.players} />
      <DailyPuzzle puzzle={data.puzzles[seed % data.puzzles.length]} />
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="group bg-[#1c1917] border border-stone-800/80 rounded-xl p-4 flex items-center gap-3.5 hover:border-stone-700 transition-colors">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/15 transition-colors flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold text-white">{value}</div>
        <div className="text-xs text-stone-500">
          <DynamicText value={label} type="text" />
        </div>
      </div>
    </div>
  );
}
