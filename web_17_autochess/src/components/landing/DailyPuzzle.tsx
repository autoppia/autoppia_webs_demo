"use client";

import React from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { MiniChessBoard } from "@/components/chess/ChessBoard";
import type { Puzzle } from "@/shared/types";

interface DailyPuzzleProps {
  puzzle: Puzzle;
}

export function DailyPuzzle({ puzzle }: DailyPuzzleProps) {
  const router = useSeedRouter();

  return (
    <DynamicWrapper>
      <section className="my-8">
        <h2 className="text-xl font-bold text-white mb-4">
          <DynamicText value="Daily Puzzle" type="text" />
        </h2>
        <div
          className="bg-[#111a11] border border-emerald-900/30 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 hover:border-emerald-700/50 transition-all cursor-pointer group"
          onClick={() => router.push("/tactics")}
        >
          <MiniChessBoard fen={puzzle.fen} size={200} />
          <div className="flex-1">
            <div className="text-sm text-zinc-400 mb-1">
              <DynamicText value={`Puzzle #${puzzle.id}`} type="text" />
            </div>
            <div className="text-white font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
              <DynamicText value={`${puzzle.toMove === "white" ? "White" : "Black"} to move`} type="text" />
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                {puzzle.theme}
              </span>
              <span className="text-zinc-400">Rating: {puzzle.rating}</span>
            </div>
            <button className="mt-4 px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded-lg hover:bg-emerald-600/30 transition-colors text-sm">
              <DynamicText value="Solve Puzzle" type="text" />
            </button>
          </div>
        </div>
      </section>
    </DynamicWrapper>
  );
}
