"use client";

import React, { useState } from "react";
import type { Game } from "@/shared/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PgnInputProps {
  onLoadPgn: (pgn: string) => void;
  onLoadGame: (index: number) => void;
  games: Game[];
  error?: string | null;
}

export function PgnInput({ onLoadPgn, onLoadGame, games, error }: PgnInputProps) {
  const [activeTab, setActiveTab] = useState<"pgn" | "library">("pgn");
  const [pgnText, setPgnText] = useState("");

  const handleLoadPgn = () => {
    if (pgnText.trim()) {
      onLoadPgn(pgnText.trim());
    }
  };

  return (
    <div className="bg-[#1c1917] border border-stone-800/80 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-stone-800/60">
        <button
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "pgn"
              ? "text-amber-400 border-b-2 border-amber-400 bg-amber-400/5"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          onClick={() => setActiveTab("pgn")}
        >
          Input PGN
        </button>
        <button
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "library"
              ? "text-amber-400 border-b-2 border-amber-400 bg-amber-400/5"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          onClick={() => setActiveTab("library")}
        >
          Game Library
        </button>
      </div>

      <div className="p-3">
        {activeTab === "pgn" ? (
          <div className="space-y-2">
            <textarea
              value={pgnText}
              onChange={(e) => setPgnText(e.target.value)}
              placeholder={"Paste PGN here...\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6..."}
              className="w-full h-24 bg-black/30 border border-stone-800/60 rounded-md px-3 py-2 text-xs font-mono text-zinc-300 placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            />
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
            <button
              onClick={handleLoadPgn}
              disabled={!pgnText.trim()}
              className="w-full px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Load PGN
            </button>
          </div>
        ) : (
          <Select onValueChange={(v) => onLoadGame(Number(v))}>
            <SelectTrigger className="bg-black/30 border-stone-800/60 text-zinc-300 text-xs">
              <SelectValue placeholder="Select a game..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1c1917] border-stone-800/80 max-h-[300px]">
              {games.slice(0, 50).map((g, idx) => (
                <SelectItem key={g.id} value={String(idx)} className="text-xs">
                  {g.whitePlayer.name} vs {g.blackPlayer.name} ({g.result}) — {g.eco}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
