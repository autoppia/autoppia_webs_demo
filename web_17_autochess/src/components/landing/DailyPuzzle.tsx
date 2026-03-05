"use client";

import React from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { MiniChessBoard } from "@/components/chess/ChessBoard";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Puzzle } from "@/shared/types";

interface DailyPuzzleProps {
  puzzle: Puzzle;
}

export function DailyPuzzle({ puzzle }: DailyPuzzleProps) {
  const router = useSeedRouter();

  return (
    <DynamicWrapper>
      <section className="my-4 sm:my-8">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              <DynamicText value="Daily Puzzle" type="text" />
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">Test your tactical skills</p>
          </div>
          <button
            onClick={() => router.push("/tactics")}
            className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors group flex-shrink-0"
          >
            More puzzles
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div
          className="bg-[#1c1917] border border-stone-800/80 rounded-xl overflow-hidden hover:border-amber-700/50 transition-all cursor-pointer group"
          onClick={() => router.push("/tactics")}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Board */}
            <div className="flex-shrink-0 p-3 sm:p-4 md:p-5 flex items-center justify-center bg-stone-900/30">
              <MiniChessBoard fen={puzzle.fen} size={180} />
            </div>

            {/* Info */}
            <div className="flex-1 p-3 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-stone-400">
                    <DynamicText value={`Puzzle #${puzzle.id}`} type="text" />
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">
                  <DynamicText value={`${puzzle.toMove === "white" ? "White" : "Black"} to move`} type="text" />
                </h3>
                <p className="text-sm text-stone-400 mb-4">
                  Find the best continuation in this {puzzle.theme.toLowerCase()} puzzle.
                </p>

                <div className="flex items-center gap-3 text-sm">
                  <span className="text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md font-medium">
                    {puzzle.theme}
                  </span>
                  <span className="text-stone-400 bg-stone-800/60 px-2.5 py-1 rounded-md">
                    Rating: {puzzle.rating}
                  </span>
                </div>
              </div>

              <button className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-amber-600/20 text-sm w-fit">
                <DynamicText value="Solve Puzzle" type="text" />
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </DynamicWrapper>
  );
}
