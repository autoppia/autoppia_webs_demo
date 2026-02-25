"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useSeed } from "@/context/SeedContext";
import { useEventLogger } from "@/hooks/useEventLogger";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { generatePuzzles } from "@/data/generators";
import { EVENT_TYPES } from "@/library/events";
import { PuzzleBoard } from "@/components/chess/PuzzleBoard";

export default function TacticsPage() {
  const { seed } = useSeed();
  const { logInteraction } = useEventLogger();
  const puzzles = useMemo(() => generatePuzzles(100, seed), [seed]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [streak, setStreak] = useState(0);

  const puzzle = puzzles[currentIndex % puzzles.length];

  const handleSolve = useCallback((correct: boolean, attempts: number) => {
    if (correct) {
      setSolvedCount((c) => c + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
    setTotalAttempts((t) => t + attempts);

    logInteraction(EVENT_TYPES.SOLVE_PUZZLE, {
      puzzle_id: puzzle.id,
      difficulty: puzzle.rating,
      theme: puzzle.theme,
      correct,
      attempts,
    });
  }, [puzzle, logInteraction]);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => i + 1);
  }, []);

  return (
    <div className="py-6">
      <DynamicWrapper>
        <h1 className="text-3xl font-bold text-white mb-6">
          <DynamicText value="Tactics Training" type="text" />
        </h1>
      </DynamicWrapper>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Puzzle Board */}
        <div className="flex-1">
          <DynamicWrapper>
            <div className="bg-[#111a11] border border-emerald-900/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-zinc-400">
                    <DynamicText value={`Puzzle #${puzzle.id}`} type="text" />
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-sm font-medium">
                      {puzzle.theme}
                    </span>
                    <span className="text-zinc-400 text-sm">Rating: {puzzle.rating}</span>
                  </div>
                </div>
                <button
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm"
                  onClick={handleNext}
                >
                  <DynamicText value="Next Puzzle" type="text" />
                </button>
              </div>

              <div className="flex justify-center">
                <PuzzleBoard
                  key={currentIndex}
                  puzzle={puzzle}
                  onSolve={handleSolve}
                />
              </div>
            </div>
          </DynamicWrapper>
        </div>

        {/* Stats Sidebar */}
        <div className="w-full lg:w-64 space-y-4">
          <DynamicWrapper>
            <div className="bg-[#111a11] border border-emerald-900/30 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4">
                <DynamicText value="Your Stats" type="text" />
              </h3>
              <div className="space-y-3">
                <StatRow label="Puzzles Solved" value={String(solvedCount)} />
                <StatRow
                  label="Accuracy"
                  value={totalAttempts > 0 ? `${((solvedCount / (totalAttempts || 1)) * 100).toFixed(0)}%` : "-"}
                />
                <StatRow label="Current Streak" value={String(streak)} />
                <StatRow label="Total Attempts" value={String(totalAttempts)} />
              </div>
            </div>
          </DynamicWrapper>

          <DynamicWrapper>
            <div className="bg-[#111a11] border border-emerald-900/30 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3">
                <DynamicText value="How to Solve" type="text" />
              </h3>
              <ol className="text-sm text-zinc-400 space-y-2 list-decimal list-inside">
                <li>Look at the board position</li>
                <li>Click the piece you want to move</li>
                <li>Click the destination square</li>
                <li>Green flash = correct!</li>
              </ol>
            </div>
          </DynamicWrapper>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400 text-sm">{label}</span>
      <span className="text-emerald-400 font-bold">{value}</span>
    </div>
  );
}
