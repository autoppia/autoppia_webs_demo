"use client";

import React from "react";
import type { OpeningExplorerData } from "@/shared/types";

interface OpeningExplorerProps {
  data: OpeningExplorerData | null;
  onMoveClick: (san: string) => void;
}

function formatGameCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function OpeningExplorer({ data, onMoveClick }: OpeningExplorerProps) {
  return (
    <div className="bg-[#1c1917] border border-stone-800/80 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-stone-800/60">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-300">Opening Explorer</h3>
          {data?.eco && (
            <span className="text-[10px] font-mono text-zinc-500">{data.eco}</span>
          )}
        </div>
        {data?.openingName && (
          <p className="text-xs text-zinc-500 mt-0.5 truncate">{data.openingName}</p>
        )}
      </div>

      {!data || data.moves.length === 0 ? (
        <div className="px-4 py-6 text-center text-xs text-zinc-600">
          No games found for this position
        </div>
      ) : (
        <div className="divide-y divide-stone-800/40">
          {/* Header row */}
          <div className="grid grid-cols-[48px_1fr_56px] gap-2 px-4 py-1.5 text-[10px] text-zinc-600 uppercase tracking-wider">
            <span>Move</span>
            <span>Result</span>
            <span className="text-right">Games</span>
          </div>

          {data.moves.map((move) => {
            const total = move.whiteWins + move.draws + move.blackWins;
            const whitePct = total > 0 ? (move.whiteWins / total) * 100 : 0;
            const drawPct = total > 0 ? (move.draws / total) * 100 : 0;
            const blackPct = total > 0 ? (move.blackWins / total) * 100 : 0;

            return (
              <button
                key={move.san}
                className="grid grid-cols-[48px_1fr_56px] gap-2 px-4 py-1.5 hover:bg-white/5 transition-colors w-full text-left items-center"
                onClick={() => onMoveClick(move.san)}
              >
                <span className="text-sm font-mono font-semibold text-amber-400">
                  {move.san}
                </span>
                <div className="flex h-3.5 rounded-sm overflow-hidden">
                  {whitePct > 0 && (
                    <div
                      className="bg-zinc-100 flex items-center justify-center"
                      style={{ width: `${whitePct}%` }}
                    >
                      {whitePct >= 15 && (
                        <span className="text-[9px] font-bold text-zinc-800">{Math.round(whitePct)}%</span>
                      )}
                    </div>
                  )}
                  {drawPct > 0 && (
                    <div
                      className="bg-zinc-500 flex items-center justify-center"
                      style={{ width: `${drawPct}%` }}
                    >
                      {drawPct >= 15 && (
                        <span className="text-[9px] font-bold text-zinc-200">{Math.round(drawPct)}%</span>
                      )}
                    </div>
                  )}
                  {blackPct > 0 && (
                    <div
                      className="bg-zinc-800 flex items-center justify-center"
                      style={{ width: `${blackPct}%` }}
                    >
                      {blackPct >= 15 && (
                        <span className="text-[9px] font-bold text-zinc-300">{Math.round(blackPct)}%</span>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-xs text-zinc-500 text-right font-mono">
                  {formatGameCount(move.games)}
                </span>
              </button>
            );
          })}

          {/* Total games footer */}
          <div className="px-4 py-1.5 text-[10px] text-zinc-600 text-right">
            {formatGameCount(data.totalGames)} total games
          </div>
        </div>
      )}
    </div>
  );
}
