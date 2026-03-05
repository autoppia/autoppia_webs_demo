"use client";

import React from "react";
import type { PositionEval } from "@/shared/types";

interface EvalBarProps {
  eval: PositionEval;
  boardHeight: number;
  flipped?: boolean;
}

/**
 * Vertical evaluation bar (Lichess-style).
 * White section at bottom (or top if flipped), black at top.
 * Uses sigmoid mapping so ±2.5 pawns fills most of the bar.
 */
export function EvalBar({ eval: posEval, boardHeight, flipped = false }: EvalBarProps) {
  const cp = posEval.cp;

  // Sigmoid mapping: 50% at cp=0, approaches 0/100 at extremes
  // ±250cp (~2.5 pawns) maps to roughly 25%-75%
  const whitePercent = 50 + 50 * (2 / (1 + Math.exp(-cp / 250)) - 1);

  // Clamp between 3% and 97% so the bar is always visible
  const clampedWhite = Math.max(3, Math.min(97, whitePercent));

  const isWhiteWinning = cp > 0;
  const isMate = Math.abs(cp) >= 30000;
  const displayText = isMate ? "#" : posEval.display;

  return (
    <div
      className="relative flex-shrink-0 rounded-sm overflow-hidden select-none"
      style={{ width: 28, height: boardHeight }}
    >
      {/* Black section (top or bottom if flipped) */}
      <div
        className="absolute left-0 right-0 bg-zinc-800 transition-all duration-300 ease-out"
        style={flipped
          ? { bottom: 0, height: `${100 - clampedWhite}%` }
          : { top: 0, height: `${100 - clampedWhite}%` }
        }
      />
      {/* White section */}
      <div
        className="absolute left-0 right-0 bg-zinc-100 transition-all duration-300 ease-out"
        style={flipped
          ? { top: 0, height: `${clampedWhite}%` }
          : { bottom: 0, height: `${clampedWhite}%` }
        }
      />
      {/* Eval text on the winning side */}
      <div
        className={`absolute left-0 right-0 flex items-center justify-center transition-all duration-300 ${
          isWhiteWinning ? "text-zinc-800" : "text-zinc-200"
        }`}
        style={{
          fontSize: 9,
          fontWeight: 700,
          fontFamily: "monospace",
          ...(flipped
            ? (isWhiteWinning ? { top: 4 } : { bottom: 4 })
            : (isWhiteWinning ? { bottom: 4 } : { top: 4 })
          ),
        }}
      >
        {displayText}
      </div>
    </div>
  );
}
