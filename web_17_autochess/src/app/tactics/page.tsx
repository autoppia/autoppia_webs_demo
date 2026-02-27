"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSeed } from "@/context/SeedContext";
import { useAuth } from "@/context/AuthContext";
import { useEventLogger } from "@/hooks/useEventLogger";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { generatePuzzles } from "@/data/generators";
import { calculateEloChange } from "@/library/elo";
import { EVENT_TYPES } from "@/library/events";
import { PuzzleBoard } from "@/components/chess/PuzzleBoard";
import { MoveHistoryPanel } from "@/components/chess/MoveHistoryPanel";
import type { MoveHistoryEntry } from "@/shared/types";

export default function TacticsPage() {
  const { seed } = useSeed();
  const { currentUser, isAuthenticated, updatePuzzleRating } = useAuth();
  const { logInteraction } = useEventLogger();
  const router = useSeedRouter();
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || undefined;

  const puzzles = useMemo(() => generatePuzzles(100, seed, theme), [seed, theme]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [puzzlesAttempted, setPuzzlesAttempted] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [ratingChange, setRatingChange] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveHistoryEntry[]>([]);

  const puzzle = puzzles[currentIndex % puzzles.length];

  const handleMoveAttempt = useCallback((entry: MoveHistoryEntry) => {
    setMoveHistory((prev) => [...prev, entry]);
  }, []);

  const handleSolve = useCallback((correct: boolean, attempts: number) => {
    const newSolved = solvedCount + (correct ? 1 : 0);
    const newAttempted = puzzlesAttempted + 1;
    setPuzzlesAttempted(newAttempted);
    setTotalAttempts((t) => t + attempts);

    if (correct) {
      setSolvedCount(newSolved);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    // ELO calculation
    if (isAuthenticated && currentUser) {
      const result = correct ? (attempts <= 1 ? "solved" : "solved") : "failed";
      const change = calculateEloChange(currentUser.puzzleRating, puzzle.rating, result);
      setRatingChange(change);
      updatePuzzleRating(
        currentUser.puzzleRating + change,
        newSolved,
        newAttempted,
      );

      // Add solved entry with rating change
      setMoveHistory((prev) => [
        ...prev,
        {
          type: "solved" as const,
          message: `Puzzle solved! Rating: ${currentUser.puzzleRating + change} (${change >= 0 ? "+" : ""}${change})`,
        },
      ]);
    } else if (correct) {
      setMoveHistory((prev) => [
        ...prev,
        { type: "solved" as const, message: "Puzzle solved!" },
      ]);
    }

    logInteraction(EVENT_TYPES.SOLVE_PUZZLE, {
      puzzle_id: puzzle.id,
      difficulty: puzzle.rating,
      theme: puzzle.theme,
      correct,
      attempts,
    });
  }, [puzzle, logInteraction, isAuthenticated, currentUser, updatePuzzleRating, solvedCount, puzzlesAttempted]);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => i + 1);
    setRatingChange(null);
    setMoveHistory([{ type: "info", message: `${puzzles[(currentIndex + 1) % puzzles.length].toMove === "white" ? "White" : "Black"} to move \u2014 Find the best continuation` }]);
  }, [currentIndex, puzzles]);

  // Initialize move history for first puzzle
  React.useEffect(() => {
    setMoveHistory([{ type: "info", message: `${puzzle.toMove === "white" ? "White" : "Black"} to move \u2014 Find the best continuation` }]);
  }, [puzzle.toMove]);

  return (
    <div className="py-6">
      <DynamicWrapper>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">
              <DynamicText value={theme ? `Tactics: ${theme}` : "Tactics Training"} type="text" />
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <a
                href="/tactics/themes"
                onClick={(e) => { e.preventDefault(); router.push("/tactics/themes"); }}
                className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
              >
                Browse Themes
              </a>
              {theme && (
                <a
                  href="/tactics"
                  onClick={(e) => { e.preventDefault(); router.push("/tactics"); }}
                  className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
                >
                  All Puzzles
                </a>
              )}
            </div>
          </div>
          {isAuthenticated && currentUser && (
            <div className="flex items-center gap-3">
              <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl px-4 py-2 text-center">
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Rating</div>
                <div className="text-xl font-bold text-amber-400">{currentUser.puzzleRating}</div>
              </div>
              {ratingChange !== null && (
                <span className={`text-lg font-bold ${ratingChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {ratingChange >= 0 ? "+" : ""}{ratingChange}
                </span>
              )}
            </div>
          )}
        </div>
      </DynamicWrapper>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Stats Sidebar */}
        <div className="w-full xl:w-52 space-y-4 order-2 xl:order-1">
          {!isAuthenticated && (
            <DynamicWrapper>
              <div className="bg-amber-600/10 border border-amber-600/30 rounded-xl p-4">
                <p className="text-amber-400 text-sm mb-3">Login to track your puzzle rating</p>
                <a
                  href="/login"
                  onClick={(e) => { e.preventDefault(); router.push("/login"); }}
                  className="block text-center text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg transition-colors"
                >
                  Login
                </a>
              </div>
            </DynamicWrapper>
          )}

          <DynamicWrapper>
            <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4">
                <DynamicText value="Your Stats" type="text" />
              </h3>
              <div className="space-y-3">
                <StatRow label="Solved" value={String(solvedCount)} />
                <StatRow
                  label="Accuracy"
                  value={puzzlesAttempted > 0 ? `${((solvedCount / puzzlesAttempted) * 100).toFixed(0)}%` : "-"}
                />
                <StatRow label="Streak" value={String(streak)} />
                <StatRow label="Attempts" value={String(totalAttempts)} />
              </div>
            </div>
          </DynamicWrapper>

          <DynamicWrapper>
            <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-4">
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

        {/* Center: Puzzle Board */}
        <div className="flex-1 order-1 xl:order-2">
          <DynamicWrapper>
            <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-6">
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm"
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
                  onMoveAttempt={handleMoveAttempt}
                />
              </div>
            </div>
          </DynamicWrapper>
        </div>

        {/* Right: Move History Panel */}
        <div className="w-full xl:w-72 order-3">
          <MoveHistoryPanel entries={moveHistory} />
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400 text-sm">{label}</span>
      <span className="text-amber-400 font-bold">{value}</span>
    </div>
  );
}
