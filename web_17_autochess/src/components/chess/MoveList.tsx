"use client";

import React, { useRef, useEffect } from "react";

interface MoveListProps {
  moves: string[];
  activeMoveIndex: number;
  onMoveClick?: (index: number) => void;
}

export function MoveList({ moves, activeMoveIndex, onMoveClick }: MoveListProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active move into view
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeMoveIndex]);

  // Group moves into pairs (white, black)
  const movePairs: { number: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <div
      ref={containerRef}
      className="bg-[#111a11] border border-emerald-900/30 rounded-lg max-h-[400px] overflow-y-auto no-scrollbar"
    >
      <div className="sticky top-0 bg-[#111a11] border-b border-emerald-900/20 px-4 py-2.5 z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-300">Moves</h3>
          <span className="text-xs text-zinc-500">
            {activeMoveIndex >= 0 ? activeMoveIndex + 1 : 0} / {moves.length}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-1">
        {movePairs.map((pair) => {
          const whiteIdx = (pair.number - 1) * 2;
          const blackIdx = whiteIdx + 1;

          return (
            <div key={pair.number} className="flex items-center gap-2 text-sm font-mono">
              <span className="text-zinc-500 w-8 text-right flex-shrink-0">{pair.number}.</span>
              <button
                ref={activeMoveIndex === whiteIdx ? activeRef : undefined}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeMoveIndex === whiteIdx
                    ? "bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500/40"
                    : "text-zinc-300 hover:bg-white/5"
                }`}
                onClick={() => onMoveClick?.(whiteIdx)}
              >
                {pair.white}
              </button>
              {pair.black && (
                <button
                  ref={activeMoveIndex === blackIdx ? activeRef : undefined}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    activeMoveIndex === blackIdx
                      ? "bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500/40"
                      : "text-zinc-300 hover:bg-white/5"
                  }`}
                  onClick={() => onMoveClick?.(blackIdx)}
                >
                  {pair.black}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
