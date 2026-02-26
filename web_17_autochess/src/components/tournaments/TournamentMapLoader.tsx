"use client";

import dynamic from "next/dynamic";
import type { Tournament } from "@/shared/types";

const TournamentMap = dynamic(() => import("./TournamentMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-stone-800/80 bg-[#1c1917] flex items-center justify-center" style={{ height: 450 }}>
      <div className="text-zinc-500 text-sm animate-pulse">Loading map...</div>
    </div>
  ),
});

interface TournamentMapLoaderProps {
  tournaments: Tournament[];
  height?: number;
  onTournamentClick?: (id: number) => void;
}

export function TournamentMapLoader({ tournaments, height, onTournamentClick }: TournamentMapLoaderProps) {
  return <TournamentMap tournaments={tournaments} height={height} onTournamentClick={onTournamentClick} />;
}
