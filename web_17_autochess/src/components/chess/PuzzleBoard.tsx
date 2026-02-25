"use client";

import React, { useState, useCallback } from "react";
import { ChessBoard } from "./ChessBoard";
import type { Puzzle } from "@/shared/types";

interface PuzzleBoardProps {
  puzzle: Puzzle;
  onSolve?: (correct: boolean, attempts: number) => void;
}

export function PuzzleBoard({ puzzle, onSolve }: PuzzleBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [correctSquare, setCorrectSquare] = useState<string | null>(null);
  const [incorrectSquare, setIncorrectSquare] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const handleSquareClick = useCallback((square: string) => {
    if (solved) return;

    if (selectedSquare) {
      // Second click - attempt a move
      const moveNotation = `${selectedSquare}${square}`;
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      // Extract destination square from solution move
      // Strip check (+) and checkmate (#) symbols, then take last 2 chars
      const solutionMove = puzzle.solution[0];
      const cleanMove = solutionMove?.replace(/[+#]/g, "") || "";
      const solutionDest = cleanMove.slice(-2);

      if (square === solutionDest) {
        setCorrectSquare(square);
        setSolved(true);
        onSolve?.(true, newAttempts);
      } else {
        setIncorrectSquare(square);
        setTimeout(() => setIncorrectSquare(null), 800);
      }
      setSelectedSquare(null);
    } else {
      // First click - select piece
      setSelectedSquare(square);
      setCorrectSquare(null);
    }
  }, [selectedSquare, solved, attempts, puzzle.solution, onSolve]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-zinc-400 mb-2">
        {puzzle.toMove === "white" ? "White" : "Black"} to move
      </div>

      <ChessBoard
        fen={puzzle.fen}
        maxSize={480}
        selectedSquare={selectedSquare}
        correctSquare={correctSquare}
        incorrectSquare={incorrectSquare}
        onSquareClick={handleSquareClick}
        interactive={!solved}
      />

      <div className="flex items-center gap-4 mt-2">
        {solved && (
          <div className="text-green-400 font-semibold text-lg">
            Correct! Solved in {attempts} attempt{attempts !== 1 ? "s" : ""}
          </div>
        )}
        {!solved && attempts > 0 && (
          <div className="text-red-400 text-sm">
            Incorrect. Try again! (Attempts: {attempts})
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!solved && (
          <button
            className="px-4 py-2 text-sm bg-amber-600/20 text-amber-400 border border-amber-600/30 rounded-lg hover:bg-amber-600/30 transition-colors"
            onClick={() => setShowSolution(!showSolution)}
          >
            {showSolution ? "Hide Solution" : "Show Solution"}
          </button>
        )}
      </div>

      {showSolution && !solved && (
        <div className="text-sm text-zinc-400 bg-[#111a11] border border-emerald-900/30 rounded-lg px-4 py-2">
          Solution: {puzzle.solution.join(", ")}
        </div>
      )}
    </div>
  );
}
