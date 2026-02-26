"use client";

import dynamic from "next/dynamic";
import type { Tournament } from "@/shared/types";

const TournamentMap = dynamic(() => import("./TournamentMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-stone-800/80 bg-[#1c1917] flex items-center justify-center" style={{ height: 500 }}>
      <div className="text-zinc-500 text-sm">Loading map...</div>
    </div>
  ),
});

export function TournamentMapLoader({ tournaments }: { tournaments: Tournament[] }) {
  return <TournamentMap tournaments={tournaments} />;
}
