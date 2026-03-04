"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import type { Puzzle } from "@/shared/types";
import type { MoveHistoryEntry } from "@/shared/types";

interface PuzzleBoardProps {
  puzzle: Puzzle;
  onSolve?: (correct: boolean, attempts: number) => void;
  onMoveAttempt?: (entry: MoveHistoryEntry) => void;
  onMoveProgress?: (moveIndex: number) => void;
  showControls?: boolean;
}

// Extract the intended promotion piece from a solution move.
// SAN: "e8=N" → "n", UCI: "e7e8n" → "n", else → "q"
function getPromotionFromSolution(move: string): "q" | "r" | "b" | "n" {
  const sanMatch = move.match(/=([QRBN])/i);
  if (sanMatch) return sanMatch[1].toLowerCase() as "q" | "r" | "b" | "n";
  if (move.length === 5 && "qrbn".includes(move[4])) return move[4] as "q" | "r" | "b" | "n";
  return "q";
}

export function PuzzleBoard({ puzzle, onSolve, onMoveAttempt, onMoveProgress, showControls = false }: PuzzleBoardProps) {
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
        onMoveProgress?.(nextMoveIdx + 1);
        onMoveAttempt?.({ type: "opponent", message: `Opponent plays ${opponentMove}`, move: opponentMove });
      } catch {
        // If opponent move fails, puzzle is done
      }
    }, 400);
  }, [puzzle.solution, onMoveAttempt, onMoveProgress]);

  // Core move validation logic shared by click-to-move and drag-and-drop
  const tryMove = useCallback((from: string, to: string): boolean => {
    if (solved) return false;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const expectedMove = getExpectedMove();
    if (!expectedMove) return false;

    try {
      const promotion = getPromotionFromSolution(expectedMove);
      const moveResult = chessRef.current.move({ from, to, promotion });
      if (!moveResult) {
        setIncorrectSquare(to);
        setTimeout(() => setIncorrectSquare(null), 800);
        onMoveAttempt?.({ type: "incorrect", message: "Incorrect. Try again.", move: `${from}${to}` });
        return false;
      }

      // Check if this matches the expected solution
      const playedSan = moveResult.san.replace(/[+#]/g, "");
      const expectedSan = expectedMove.replace(/[+#]/g, "");
      const playedUci = `${moveResult.from}${moveResult.to}`;

      const expectedUci = expectedMove.length >= 4 && expectedMove[0] >= "a" && expectedMove[0] <= "h"
        ? expectedMove.slice(0, 4)
        : "";

      const isCorrectMove = playedSan === expectedSan || (expectedUci && playedUci === expectedUci);

      if (isCorrectMove) {
        setCorrectSquare(to);
        setCurrentFen(chessRef.current.fen());

        const nextMoveIdx = moveIndex + 1;

        if (nextMoveIdx >= puzzle.solution.length) {
          setSolved(true);
          onMoveProgress?.(nextMoveIdx);
          onSolve?.(true, newAttempts);
          onMoveAttempt?.({ type: "correct", message: `Correct! ${moveResult.san}`, move: moveResult.san });
        } else {
          onMoveAttempt?.({ type: "correct", message: `Correct! ${moveResult.san}`, move: moveResult.san });
          setMoveIndex(nextMoveIdx);
          onMoveProgress?.(nextMoveIdx);
          playOpponentResponse(nextMoveIdx);
        }
        return true;
      } else {
        // Wrong move — undo it
        chessRef.current.undo();
        setIncorrectSquare(to);
        setTimeout(() => setIncorrectSquare(null), 800);
        onMoveAttempt?.({ type: "incorrect", message: `Incorrect: ${moveResult.san}. Try again.`, move: moveResult.san });
        return false;
      }
    } catch {
      setIncorrectSquare(to);
      setTimeout(() => setIncorrectSquare(null), 800);
      onMoveAttempt?.({ type: "incorrect", message: "Invalid move. Try again." });
      return false;
    }
  }, [solved, attempts, getExpectedMove, moveIndex, puzzle.solution.length, onSolve, playOpponentResponse, onMoveAttempt, onMoveProgress]);

  // Click on a square (empty or with piece) — handles click-to-move
  const handleClick = useCallback((square: string) => {
    if (solved) return;

    if (selectedSquare) {
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null);
        setLegalMoveSquares([]);
        return;
      }

      // If clicking on own piece, re-select it instead
      const clickedMoves = chessRef.current.moves({ square: square as never, verbose: true });
      if (clickedMoves.length > 0 && !legalMoveSquares.includes(square)) {
        setSelectedSquare(square);
        setLegalMoveSquares(clickedMoves.map((m) => m.to));
        setCorrectSquare(null);
        return;
      }

      // Attempt the move
      tryMove(selectedSquare, square);
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
  }, [selectedSquare, solved, legalMoveSquares, tryMove]);

  // Handle drag-and-drop
  const handlePieceDrop = useCallback(({ sourceSquare, targetSquare }: { piece: unknown; sourceSquare: string; targetSquare: string | null }) => {
    if (solved || !targetSquare) return false;
    setSelectedSquare(null);
    setLegalMoveSquares([]);
    return tryMove(sourceSquare, targetSquare);
  }, [solved, tryMove]);

  // onSquareClick fires for ALL squares (with or without pieces).
  // We intentionally do NOT use onPieceClick because in react-chessboard v5,
  // clicking a piece fires BOTH onPieceClick and onSquareClick (event bubbles),
  // which would cause handleClick to run twice (select then deselect).
  const handleSquareClick = useCallback(({ square }: { piece: unknown; square: string }) => {
    handleClick(square);
  }, [handleClick]);

  const handleShowSolution = useCallback(() => {
    const next = !showSolution;
    setShowSolution(next);
    if (next) {
      onMoveAttempt?.({ type: "hint", message: `Solution revealed: ${puzzle.solution.join(", ")}` });
    }
  }, [showSolution, onMoveAttempt, puzzle.solution]);

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
      <div style={{ width: "100%", maxWidth: 560, aspectRatio: "1/1" }} className="mx-auto">
        {mounted ? (
          <Chessboard
            options={{
              position: currentFen,
              boardOrientation: puzzle.toMove === "black" ? "black" : "white",
              allowDragging: true,
              onSquareClick: handleSquareClick,
              onPieceDrop: handlePieceDrop,
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

      {showControls && (
        <>
          <div className="text-sm text-zinc-400 mb-2">
            {puzzle.toMove === "white" ? "White" : "Black"} to move
            {moveIndex > 0 && !solved && (
              <span className="ml-2 text-amber-400">
                (Move {Math.floor(moveIndex / 2) + 1} of {Math.ceil(puzzle.solution.length / 2)})
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2 text-center">
            {solved && (
              <div className="text-green-400 font-semibold text-sm sm:text-lg">
                Correct! Solved in {attempts} attempt{attempts !== 1 ? "s" : ""}
              </div>
            )}
            {!solved && attempts > 0 && (
              <div className="text-red-400 text-xs sm:text-sm">
                Incorrect. Try again! (Attempts: {attempts})
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!solved && (
              <button
                className="px-4 py-2 text-sm bg-amber-600/20 text-amber-400 border border-amber-600/30 rounded-lg hover:bg-amber-600/30 transition-colors"
                onClick={handleShowSolution}
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
        </>
      )}
    </div>
  );
}
