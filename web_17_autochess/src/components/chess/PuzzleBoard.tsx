"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import type { Puzzle } from "@/shared/types";

interface PuzzleBoardProps {
  puzzle: Puzzle;
  onSolve?: (correct: boolean, attempts: number) => void;
}

export function PuzzleBoard({ puzzle, onSolve }: PuzzleBoardProps) {
  const chessRef = useRef(new Chess(puzzle.fen));
  const [currentFen, setCurrentFen] = useState(puzzle.fen);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoveSquares, setLegalMoveSquares] = useState<string[]>([]);
  const [correctSquare, setCorrectSquare] = useState<string | null>(null);
  const [incorrectSquare, setIncorrectSquare] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [moveIndex, setMoveIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Reset when puzzle changes
  useEffect(() => {
    chessRef.current = new Chess(puzzle.fen);
    setCurrentFen(puzzle.fen);
    setSelectedSquare(null);
    setLegalMoveSquares([]);
    setCorrectSquare(null);
    setIncorrectSquare(null);
    setSolved(false);
    setAttempts(0);
    setMoveIndex(0);
    setShowSolution(false);
  }, [puzzle]);

  const getExpectedMove = useCallback(() => {
    return puzzle.solution[moveIndex] || null;
  }, [puzzle.solution, moveIndex]);

  const playOpponentResponse = useCallback((nextMoveIdx: number) => {
    const opponentMove = puzzle.solution[nextMoveIdx];
    if (!opponentMove) return;

    setTimeout(() => {
      try {
        chessRef.current.move(opponentMove);
        setCurrentFen(chessRef.current.fen());
        setMoveIndex(nextMoveIdx + 1);
      } catch {
        // If opponent move fails, puzzle is done
      }
    }, 400);
  }, [puzzle.solution]);

  const handleSquareClick = useCallback(({ square }: { piece: unknown; square: string }) => {
    if (solved) return;

    if (selectedSquare) {
      // Second click — attempt move
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      const expectedMove = getExpectedMove();
      if (!expectedMove) return;

      try {
        const moveResult = chessRef.current.move({ from: selectedSquare, to: square, promotion: "q" });
        if (!moveResult) {
          setIncorrectSquare(square);
          setTimeout(() => setIncorrectSquare(null), 800);
          setSelectedSquare(null);
          setLegalMoveSquares([]);
          return;
        }

        // Check if this matches the expected solution
        // Compare SAN (strip check/mate symbols) and from-to UCI notation
        const playedSan = moveResult.san.replace(/[+#]/g, "");
        const expectedSan = expectedMove.replace(/[+#]/g, "");
        const playedUci = `${moveResult.from}${moveResult.to}`;

        // UCI format (e.g. "e2e4") or SAN format (e.g. "Nf3")
        const expectedUci = expectedMove.length >= 4 && expectedMove[0] >= "a" && expectedMove[0] <= "h"
          ? expectedMove.slice(0, 4)
          : "";

        const isCorrectMove = playedSan === expectedSan || (expectedUci && playedUci === expectedUci);

        if (isCorrectMove) {
          setCorrectSquare(square);
          setCurrentFen(chessRef.current.fen());

          const nextMoveIdx = moveIndex + 1;

          // Check if puzzle is fully solved
          if (nextMoveIdx >= puzzle.solution.length) {
            setSolved(true);
            onSolve?.(true, newAttempts);
          } else {
            // Play opponent's response and advance
            setMoveIndex(nextMoveIdx);
            playOpponentResponse(nextMoveIdx);
          }
        } else {
          // Wrong move — undo it
          chessRef.current.undo();
          setIncorrectSquare(square);
          setTimeout(() => setIncorrectSquare(null), 800);
        }
      } catch {
        setIncorrectSquare(square);
        setTimeout(() => setIncorrectSquare(null), 800);
      }

      setSelectedSquare(null);
      setLegalMoveSquares([]);
    } else {
      // First click — select piece and show legal moves
      const moves = chessRef.current.moves({ square: square as never, verbose: true });
      if (moves.length > 0) {
        setSelectedSquare(square);
        setLegalMoveSquares(moves.map((m) => m.to));
        setCorrectSquare(null);
      }
    }
  }, [selectedSquare, solved, attempts, getExpectedMove, moveIndex, puzzle.solution.length, onSolve, playOpponentResponse]);

  const customSquareStyles: Record<string, React.CSSProperties> = {};

  if (correctSquare) {
    customSquareStyles[correctSquare] = {
      backgroundColor: "rgba(34, 197, 94, 0.5)",
      boxShadow: "inset 0 0 0 2px rgba(34, 197, 94, 0.7)",
    };
  }
  if (incorrectSquare) {
    customSquareStyles[incorrectSquare] = {
      backgroundColor: "rgba(239, 68, 68, 0.5)",
      boxShadow: "inset 0 0 0 2px rgba(239, 68, 68, 0.7)",
    };
  }
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: "rgba(32, 178, 170, 0.6)",
      boxShadow: "inset 0 0 0 2px rgba(32, 178, 170, 0.8)",
    };
  }
  for (const sq of legalMoveSquares) {
    if (!customSquareStyles[sq]) {
      customSquareStyles[sq] = {
        backgroundColor: "rgba(255, 255, 100, 0.4)",
      };
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-zinc-400 mb-2">
        {puzzle.toMove === "white" ? "White" : "Black"} to move
        {moveIndex > 0 && !solved && (
          <span className="ml-2 text-amber-400">
            (Move {Math.floor(moveIndex / 2) + 1} of {Math.ceil(puzzle.solution.length / 2)})
          </span>
        )}
      </div>

      <div style={{ width: "100%", maxWidth: 480, aspectRatio: "1/1" }}>
        {mounted ? (
          <Chessboard
            options={{
              position: currentFen,
              allowDragging: false,
              onSquareClick: handleSquareClick,
              darkSquareStyle: { backgroundColor: "#486632" },
              lightSquareStyle: { backgroundColor: "#779952" },
              squareStyles: customSquareStyles,
              boardStyle: {
                borderRadius: "0.5rem",
                overflow: "hidden",
                border: "2px solid rgba(168, 162, 158, 0.35)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
              },
            }}
          />
        ) : (
          <div style={{ width: "100%", aspectRatio: "1/1" }} className="bg-[#1c1917] rounded-lg" />
        )}
      </div>

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
        <div className="text-sm text-zinc-400 bg-[#1c1917] border border-stone-800/80 rounded-lg px-4 py-2">
          Solution: {puzzle.solution.join(", ")}
        </div>
      )}
    </div>
  );
}
