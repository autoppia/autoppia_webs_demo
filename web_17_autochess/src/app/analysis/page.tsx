"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSeed } from "@/context/SeedContext";
import { useEventLogger } from "@/hooks/useEventLogger";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { generateGames, generateTournaments, generatePlayers, generateGamePositions } from "@/data/generators";
import { EVENT_TYPES } from "@/library/events";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { MoveList } from "@/components/chess/MoveList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/library/formatters";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import type { Game } from "@/shared/types";

// Starting position FEN
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function AnalysisPage() {
  const { seed } = useSeed();
  const searchParams = useSearchParams();
  const { logInteraction } = useEventLogger();

  const tournaments = useMemo(() => generateTournaments(50, seed), [seed]);
  const players = useMemo(() => generatePlayers(200, seed), [seed]);
  const games = useMemo(() => generateGames(tournaments, players, 500, seed), [tournaments, players, seed]);

  const preselectedGameId = searchParams.get("game");
  const initialGameIndex = preselectedGameId
    ? Math.max(0, games.findIndex((g) => g.id === Number(preselectedGameId)))
    : 0;

  const [selectedGameIndex, setSelectedGameIndex] = useState(initialGameIndex);
  const [activeMoveIndex, setActiveMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const game = games[selectedGameIndex];

  // Generate board positions for current game
  const positions = useMemo(() => {
    if (!game) return [];
    return generateGamePositions(game.id, game.moves.length);
  }, [game]);

  const currentFEN = activeMoveIndex >= 0 && activeMoveIndex < positions.length
    ? positions[activeMoveIndex]
    : START_FEN;

  const handleGameSelect = useCallback((value: string) => {
    const idx = Number(value);
    setSelectedGameIndex(idx);
    setActiveMoveIndex(-1);
    setIsPlaying(false);

    const g = games[idx];
    logInteraction(EVENT_TYPES.ANALYZE_GAME, {
      game_id: g.id,
      white: g.whitePlayer.name,
      black: g.blackPlayer.name,
      result: g.result,
      opening: g.opening,
    });
  }, [games, logInteraction]);

  // Log initial game
  useEffect(() => {
    if (game) {
      logInteraction(EVENT_TYPES.ANALYZE_GAME, {
        game_id: game.id,
        white: game.whitePlayer.name,
        black: game.blackPlayer.name,
        result: game.result,
        opening: game.opening,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-play
  useEffect(() => {
    if (!isPlaying || !game) return;
    const timer = setInterval(() => {
      setActiveMoveIndex((prev) => {
        if (prev >= game.moves.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, game]);

  const goFirst = () => { setActiveMoveIndex(-1); setIsPlaying(false); };
  const goPrev = () => { setActiveMoveIndex((p) => Math.max(-1, p - 1)); setIsPlaying(false); };
  const goNext = () => { setActiveMoveIndex((p) => Math.min((game?.moves.length || 1) - 1, p + 1)); setIsPlaying(false); };
  const goLast = () => { setActiveMoveIndex((game?.moves.length || 1) - 1); setIsPlaying(false); };
  const togglePlay = () => setIsPlaying((p) => !p);

  if (!game) return null;

  return (
    <div className="py-6">
      <DynamicWrapper>
        <h1 className="text-3xl font-bold text-white mb-6">
          <DynamicText value="Game Analysis" type="text" />
        </h1>
      </DynamicWrapper>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Board + Controls */}
        <div className="flex-1">
          <DynamicWrapper>
            {/* Game selector */}
            <div className="mb-4">
              <Select value={String(selectedGameIndex)} onValueChange={handleGameSelect}>
                <SelectTrigger className="bg-[#111a11] border-emerald-900/30 text-zinc-300">
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent className="bg-[#111a11] border-emerald-900/30 max-h-[300px]">
                  {games.slice(0, 50).map((g, idx) => (
                    <SelectItem key={g.id} value={String(idx)}>
                      {g.whitePlayer.name} vs {g.blackPlayer.name} ({g.result})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Game metadata */}
            <div className="bg-[#111a11] border border-emerald-900/30 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-white font-semibold">{game.whitePlayer.name}</span>
                  <span className="text-zinc-400 ml-1">({game.whitePlayer.rating})</span>
                </div>
                <span className="text-emerald-400 font-bold text-lg">{game.result}</span>
                <div className="text-right">
                  <span className="text-white font-semibold">{game.blackPlayer.name}</span>
                  <span className="text-zinc-400 ml-1">({game.blackPlayer.rating})</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 mt-2">
                <span>{game.opening} ({game.eco})</span>
                <span>{formatDate(game.date)}</span>
                <span>{game.moveCount} moves</span>
              </div>
            </div>

            {/* Board */}
            <div className="flex justify-center mb-4">
              <ChessBoard fen={currentFEN} maxSize={520} />
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-2">
              <NavButton onClick={goFirst}><ChevronFirst className="h-5 w-5" /></NavButton>
              <NavButton onClick={goPrev}><ChevronLeft className="h-5 w-5" /></NavButton>
              <NavButton onClick={togglePlay} highlight>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </NavButton>
              <NavButton onClick={goNext}><ChevronRight className="h-5 w-5" /></NavButton>
              <NavButton onClick={goLast}><ChevronLast className="h-5 w-5" /></NavButton>
            </div>

            <div className="text-center text-xs text-zinc-500 mt-2">
              Move {activeMoveIndex + 1} of {game.moves.length}
            </div>
          </DynamicWrapper>
        </div>

        {/* Move List Sidebar */}
        <div className="w-full lg:w-72">
          <MoveList
            moves={game.moves}
            activeMoveIndex={activeMoveIndex}
            onMoveClick={setActiveMoveIndex}
          />
        </div>
      </div>
    </div>
  );
}

function NavButton({ onClick, children, highlight }: { onClick: () => void; children: React.ReactNode; highlight?: boolean }) {
  return (
    <button
      className={`p-2 rounded-lg transition-colors ${
        highlight
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : "bg-[#111a11] border border-emerald-900/30 text-zinc-400 hover:text-white hover:bg-emerald-900/20"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
