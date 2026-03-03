"use client";

import { MoveHistoryPanel } from "@/components/chess/MoveHistoryPanel";
import { PuzzleBoard } from "@/components/chess/PuzzleBoard";
import { useAuth } from "@/context/AuthContext";
import { useSeed } from "@/context/SeedContext";
import { generatePuzzles } from "@/data/generators";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { useEventLogger } from "@/hooks/useEventLogger";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { calculateEloChange } from "@/library/elo";
import { EVENT_TYPES } from "@/library/events";
import type { MoveHistoryEntry } from "@/shared/types";
import { CheckCircle, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useMemo, useState, useCallback, useEffect } from "react";

export default function TacticsPage() {
  const { seed } = useSeed();
  const { currentUser, isAuthenticated, updatePuzzleRating } = useAuth();
  const { logInteraction } = useEventLogger();
  const router = useSeedRouter();
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || undefined;

  const puzzles = useMemo(
    () => generatePuzzles(100, seed, theme),
    [seed, theme],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [puzzlesAttempted, setPuzzlesAttempted] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [ratingChange, setRatingChange] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveHistoryEntry[]>([]);
  const [puzzleStatus, setPuzzleStatus] = useState<
    "playing" | "solved" | "failed" | "completed"
  >("playing");
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [hadIncorrectMove, setHadIncorrectMove] = useState(false);
  const [lastPuzzleAttempts, setLastPuzzleAttempts] = useState(0);

  const puzzle =
    puzzles.length > 0 ? puzzles[currentIndex % puzzles.length] : null;
  const totalSolutionMoves = puzzle ? Math.ceil(puzzle.solution.length / 2) : 0;

  const handleMoveAttempt = useCallback((entry: MoveHistoryEntry) => {
    setMoveHistory((prev) => [...prev, entry]);
    if (entry.type === "incorrect") {
      setHadIncorrectMove(true);
    }
  }, []);

  const handleMoveProgress = useCallback((moveIndex: number) => {
    setCurrentMoveIndex(moveIndex);
  }, []);

  const handleSolve = useCallback(
    (_correct: boolean, attempts: number) => {
      if (!puzzle) return;
      // Lichess-style: first incorrect move = "failed" for rating, even though
      // the player completes the puzzle. Clean solve = no mistakes.
      const cleanSolve = !hadIncorrectMove;
      const newSolved = solvedCount + (cleanSolve ? 1 : 0);
      const newAttempted = puzzlesAttempted + 1;
      setPuzzlesAttempted(newAttempted);
      setTotalAttempts((t) => t + attempts);
      setLastPuzzleAttempts(attempts);
      setPuzzleStatus(cleanSolve ? "solved" : "completed");

      if (cleanSolve) {
        setSolvedCount(newSolved);
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }

      // ELO calculation — penalize on mistakes
      if (isAuthenticated && currentUser) {
        const result = cleanSolve ? "solved" : "failed";
        const change = calculateEloChange(
          currentUser.puzzleRating,
          puzzle.rating,
          result,
        );
        setRatingChange(change);
        updatePuzzleRating(
          currentUser.puzzleRating + change,
          newSolved,
          newAttempted,
        );

        setMoveHistory((prev) => [
          ...prev,
          {
            type: "solved" as const,
            message: cleanSolve
              ? `Puzzle solved! Rating: ${currentUser.puzzleRating + change} (${change >= 0 ? "+" : ""}${change})`
              : `Puzzle failed. Rating: ${currentUser.puzzleRating + change} (${change >= 0 ? "+" : ""}${change})`,
          },
        ]);
      } else if (cleanSolve) {
        setMoveHistory((prev) => [
          ...prev,
          { type: "solved" as const, message: "Puzzle solved!" },
        ]);
      }

      logInteraction(EVENT_TYPES.SOLVE_PUZZLE, {
        puzzle_id: puzzle.id,
        difficulty: puzzle.rating,
        theme: puzzle.theme,
        correct: cleanSolve,
        attempts,
      });
    },
    [
      puzzle,
      logInteraction,
      isAuthenticated,
      currentUser,
      updatePuzzleRating,
      solvedCount,
      puzzlesAttempted,
      hadIncorrectMove,
    ],
  );

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => i + 1);
    setRatingChange(null);
    setPuzzleStatus("playing");
    setCurrentMoveIndex(0);
    setShowSolution(false);
    setHadIncorrectMove(false);
    setLastPuzzleAttempts(0);
    if (puzzles.length > 0) {
      const nextPuzzle = puzzles[(currentIndex + 1) % puzzles.length];
      setMoveHistory([
        {
          type: "info",
          message: `${nextPuzzle.toMove === "white" ? "White" : "Black"} to move \u2014 Find the best continuation`,
        },
      ]);
    }
  }, [currentIndex, puzzles]);

  const handleShowSolution = useCallback(() => {
    if (!puzzle) return;
    setShowSolution(true);
    setMoveHistory((prev) => [
      ...prev,
      {
        type: "hint",
        message: `Solution revealed: ${puzzle.solution.join(", ")}`,
      },
    ]);
  }, [puzzle]);

  // Initialize move history for first puzzle
  const puzzleToMove = puzzle?.toMove;
  React.useEffect(() => {
    if (puzzleToMove) {
      setMoveHistory([
        {
          type: "info",
          message: `${puzzleToMove === "white" ? "White" : "Black"} to move \u2014 Find the best continuation`,
        },
      ]);
    }
  }, [puzzleToMove]);

  if (!puzzle) {
    return (
      <div className="py-4 sm:py-6">
        <DynamicWrapper>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
            <DynamicText
              value={theme ? `Tactics: ${theme}` : "Puzzle Training"}
              type="text"
            />
          </h1>
        </DynamicWrapper>
        <div className="text-center text-zinc-500 py-12">
          No puzzles found for this theme.
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6">
      <DynamicWrapper>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            <DynamicText
              value={theme ? `Tactics: ${theme}` : "Puzzle Training"}
              type="text"
            />
          </h1>
          <div className="flex items-center gap-3">
            <a
              href="/tactics/themes"
              onClick={(e) => {
                e.preventDefault();
                router.push("/tactics/themes");
              }}
              className="text-amber-400 hover:text-amber-300 text-sm transition-colors flex items-center gap-1"
            >
              Browse Themes <ChevronRight className="h-3.5 w-3.5" />
            </a>
            {theme && (
              <a
                href="/tactics"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/tactics");
                }}
                className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
              >
                All Puzzles
              </a>
            )}
          </div>
        </div>
      </DynamicWrapper>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
        {/* Left: Board (no card wrap) */}
        <div className="flex-1 min-w-0 flex justify-center w-full">
          <PuzzleBoard
            key={currentIndex}
            puzzle={puzzle}
            onSolve={handleSolve}
            onMoveAttempt={handleMoveAttempt}
            onMoveProgress={handleMoveProgress}
          />
        </div>

        {/* Right: Info panel */}
        <div className="w-full lg:w-80 xl:w-96 space-y-3">
          {/* 1. Puzzle info */}
          <DynamicWrapper>
            <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 text-sm">
                    <DynamicText value={`Puzzle #${puzzle.id}`} type="text" />
                  </span>
                  <span className="text-zinc-600 mx-2">|</span>
                  <span className="text-zinc-400 text-sm">
                    Rating: {puzzle.rating}
                  </span>
                </div>
                <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-xs font-medium">
                  {puzzle.theme}
                </span>
              </div>
            </div>
          </DynamicWrapper>

          {/* 2. Turn indicator + 3. Feedback area */}
          <DynamicWrapper>
            <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl px-4 py-4">
              {/* Turn indicator */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${puzzle.toMove === "white" ? "bg-white border-zinc-300" : "bg-zinc-900 border-zinc-500"}`}
                />
                <span className="text-zinc-300 text-sm font-medium">
                  {puzzle.toMove === "white" ? "White" : "Black"} to play
                </span>
              </div>

              {/* Feedback */}
              {puzzleStatus === "solved" && (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2.5">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <div>
                    <div className="text-green-400 font-semibold text-sm">
                      Puzzle Solved!
                    </div>
                    <div className="text-green-400/70 text-xs">
                      Completed in {lastPuzzleAttempts} attempt
                      {lastPuzzleAttempts !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              )}

              {puzzleStatus === "completed" && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                  <CheckCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <div className="text-amber-400 font-semibold text-sm">
                      Puzzle Complete
                    </div>
                    <div className="text-amber-400/70 text-xs">
                      Solved with {lastPuzzleAttempts - totalSolutionMoves}{" "}
                      mistake
                      {lastPuzzleAttempts - totalSolutionMoves !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              )}

              {puzzleStatus === "playing" && currentMoveIndex > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                  <div className="text-amber-400 font-semibold text-sm">
                    Correct! Keep going...
                  </div>
                  <div className="text-amber-400/70 text-xs mt-0.5">
                    Move {Math.floor(currentMoveIndex / 2) + 1} of{" "}
                    {totalSolutionMoves}
                  </div>
                </div>
              )}

              {puzzleStatus === "playing" && currentMoveIndex === 0 && (
                <div className="text-zinc-400 text-sm">Find the best move</div>
              )}
            </div>
          </DynamicWrapper>

          {/* 4. Action buttons */}
          <div className="flex gap-2">
            {puzzleStatus === "playing" && (
              <>
                <button
                  className="flex-1 px-4 py-2.5 text-sm bg-amber-600/20 text-amber-400 border border-amber-600/30 rounded-xl hover:bg-amber-600/30 transition-colors"
                  onClick={handleShowSolution}
                  disabled={showSolution}
                >
                  {showSolution ? "Solution Shown" : "View Solution"}
                </button>
                <button
                  className="flex-1 px-4 py-2.5 text-sm bg-stone-800/50 text-zinc-400 border border-stone-700/50 rounded-xl hover:bg-stone-800 hover:text-zinc-300 transition-colors"
                  onClick={handleNext}
                >
                  Skip
                </button>
              </>
            )}
            {puzzleStatus !== "playing" && (
              <button
                className="w-full px-4 py-2.5 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors font-medium"
                onClick={handleNext}
              >
                Continue
              </button>
            )}
          </div>

          {/* 5. Solution text */}
          {showSolution && puzzleStatus === "playing" && (
            <div className="text-sm text-zinc-400 bg-[#1c1917] border border-stone-800/80 rounded-xl px-4 py-3">
              <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">
                Solution
              </span>
              {puzzle.solution.join(", ")}
            </div>
          )}

          {/* 6. Rating display */}
          {isAuthenticated && currentUser && (
            <DynamicWrapper>
              <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">
                      Your Rating
                    </div>
                    <div className="text-xl font-bold text-amber-400">
                      {currentUser.puzzleRating}
                    </div>
                  </div>
                  {ratingChange !== null && (
                    <span
                      className={`text-lg font-bold ${ratingChange >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {ratingChange >= 0 ? "+" : ""}
                      {ratingChange}
                    </span>
                  )}
                </div>
              </div>
            </DynamicWrapper>
          )}

          {/* 7. Session stats */}
          <DynamicWrapper>
            <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl px-4 py-3">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-zinc-500">Solved</div>
                  <div className="text-lg font-bold text-amber-400">
                    {solvedCount}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Streak</div>
                  <div className="text-lg font-bold text-amber-400">
                    {streak}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Accuracy</div>
                  <div className="text-lg font-bold text-amber-400">
                    {puzzlesAttempted > 0
                      ? `${((solvedCount / puzzlesAttempted) * 100).toFixed(0)}%`
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
          </DynamicWrapper>

          {/* 8. Theme badge + browse link */}
          <div className="flex items-center justify-between px-1">
            <span className="text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded text-xs font-medium">
              {puzzle.theme}
            </span>
            <a
              href="/tactics/themes"
              onClick={(e) => {
                e.preventDefault();
                router.push("/tactics/themes");
              }}
              className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors flex items-center gap-1"
            >
              Browse themes <ChevronRight className="h-3 w-3" />
            </a>
          </div>

          {/* 9. Move history */}
          <MoveHistoryPanel entries={moveHistory} />

          {/* 10. Login prompt */}
          {!isAuthenticated && (
            <DynamicWrapper>
              <div className="bg-amber-600/10 border border-amber-600/30 rounded-xl px-4 py-3 flex items-center justify-between">
                <p className="text-amber-400 text-sm">
                  Login to track your rating
                </p>
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/login");
                  }}
                  className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg transition-colors flex-shrink-0"
                >
                  Login
                </a>
              </div>
            </DynamicWrapper>
          )}
        </div>
      </div>
    </div>
  );
}
