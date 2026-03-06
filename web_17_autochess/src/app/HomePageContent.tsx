"use client";

import type React from "react";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedTournaments } from "@/components/landing/FeaturedTournaments";
import { TopPlayersTable } from "@/components/landing/TopPlayersTable";
import { DailyPuzzle } from "@/components/landing/DailyPuzzle";
import { formatNumber } from "@/library/formatters";
import { Trophy, Users, Swords, Puzzle } from "lucide-react";
import type { Player, Tournament, Game, Puzzle as PuzzleType } from "@/shared/types";

interface HomePageContentProps {
  data: {
    players: Player[];
    tournaments: Tournament[];
    games: Game[];
    puzzles: PuzzleType[];
  };
  seed: number;
}

export default function HomePageContent({ data, seed }: HomePageContentProps) {
  return (
    <div className="py-4 sm:py-6 space-y-2">
      <HeroSection />

      {/* Quick Stats Bar */}
      <DynamicWrapper>
        <section className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 my-4 sm:my-8">
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
    <div className="group bg-[#1c1917] border border-stone-800/80 rounded-xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3.5 hover:border-stone-700 transition-colors">
      <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/15 transition-colors flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-lg sm:text-xl font-bold text-white">{value}</div>
        <div className="text-xs text-stone-500">
          <DynamicText value={label} type="text" />
        </div>
      </div>
    </div>
  );
}
