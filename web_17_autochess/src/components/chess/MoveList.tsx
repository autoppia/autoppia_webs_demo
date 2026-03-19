"use client";

import React, { useRef, useEffect } from "react";
import type { AnnotatedMove, MoveClassification } from "@/shared/types";

interface MoveListProps {
  annotatedMoves: AnnotatedMove[];
  activeMoveIndex: number;
  onMoveClick?: (index: number) => void;
  embedded?: boolean;
}

const CLASSIFICATION_COLORS: Record<MoveClassification, string> = {
  brilliant: "text-cyan-400 bg-cyan-400/15",
  great: "text-green-400 bg-green-400/15",
  best: "text-green-500 bg-green-500/15",
  good: "text-zinc-400 bg-transparent",
  inaccuracy: "text-yellow-400 bg-yellow-400/15",
  mistake: "text-orange-400 bg-orange-400/15",
  blunder: "text-red-400 bg-red-400/15",
  book: "text-purple-400 bg-purple-400/15",
};

const CLASSIFICATION_DOT: Record<MoveClassification, string> = {
  brilliant: "bg-cyan-400",
  great: "bg-green-400",
  best: "bg-green-500",
  good: "",
  inaccuracy: "bg-yellow-400",
  mistake: "bg-orange-400",
  blunder: "bg-red-400",
  book: "bg-purple-400",
};

export function MoveList({ annotatedMoves, activeMoveIndex, onMoveClick, embedded }: MoveListProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when active move changes (refs are not deps)
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeMoveIndex]);

  // Group moves into pairs
  const movePairs: { number: number; white: AnnotatedMove; black?: AnnotatedMove }[] = [];
  for (let i = 0; i < annotatedMoves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: annotatedMoves[i],
      black: annotatedMoves[i + 1],
    });
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto no-scrollbar flex-1 min-h-0 ${embedded ? "" : "bg-[#1c1917] border border-stone-800/80 rounded-lg"}`}
    >
      <div className={`sticky top-0 ${embedded ? "bg-[#1c1917]" : "bg-[#1c1917] border-b border-stone-800/60"} px-4 py-2.5 z-10`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-300">Moves</h3>
          <span className="text-xs text-zinc-500">
            {activeMoveIndex >= 0 ? activeMoveIndex + 1 : 0} / {annotatedMoves.length}
          </span>
        </div>
      </div>
      <div className="p-2 space-y-px">
        {movePairs.map((pair) => {
          const whiteIdx = (pair.number - 1) * 2;
          const blackIdx = whiteIdx + 1;

          return (
            <div key={pair.number} className="flex items-center gap-1 text-sm font-mono">
              <span className="text-zinc-600 w-7 text-right flex-shrink-0 text-xs">{pair.number}.</span>
              <MoveButton
                move={pair.white}
                isActive={activeMoveIndex === whiteIdx}
                ref={activeMoveIndex === whiteIdx ? activeRef : undefined}
                onClick={() => onMoveClick?.(whiteIdx)}
              />
              {pair.black && (
                <MoveButton
                  move={pair.black}
                  isActive={activeMoveIndex === blackIdx}
                  ref={activeMoveIndex === blackIdx ? activeRef : undefined}
                  onClick={() => onMoveClick?.(blackIdx)}
                />
              )}
            </div>
          );
        })}
        {annotatedMoves.length === 0 && (
          <div className="px-2 py-4 text-center text-xs text-zinc-600">
            No moves yet. Play on the board or load a PGN.
          </div>
        )}
      </div>
    </div>
  );
}

const MoveButton = React.forwardRef<HTMLButtonElement, {
  move: AnnotatedMove;
  isActive: boolean;
  onClick: () => void;
}>(({ move, isActive, onClick }, ref) => {
  const classification = move.classification || "good";
  const colorClass = CLASSIFICATION_COLORS[classification];
  const dotClass = CLASSIFICATION_DOT[classification];

  return (
    <button
      ref={ref}
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors min-w-[60px] ${
        isActive
          ? "bg-amber-600/30 text-amber-300 ring-1 ring-amber-500/40"
          : `text-zinc-300 hover:bg-white/5 ${colorClass}`
      }`}
      onClick={onClick}
    >
      {dotClass && !isActive && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
      )}
      <span className="font-medium">{move.san}</span>
      <span className={`text-[9px] ml-auto ${isActive ? "text-amber-400/70" : "text-zinc-600"}`}>
        {move.eval.display}
      </span>
    </button>
  );
});
MoveButton.displayName = "MoveButton";
