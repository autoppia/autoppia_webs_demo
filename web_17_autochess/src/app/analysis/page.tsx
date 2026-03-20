"use client";

import type React from "react";
import dynamic from "next/dynamic";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSeed } from "@/context/SeedContext";
import { useEventLogger } from "@/hooks/useEventLogger";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { generateGames, generateTournaments, generatePlayers, generateGamePositions } from "@/data/generators";
import { EVENT_TYPES } from "@/library/events";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/library/formatters";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import type { Game } from "@/shared/types";

const ChessBoard = dynamic(
  () => import("@/components/chess/ChessBoard").then((mod) => mod.ChessBoard),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ width: "100%", maxWidth: 520, aspectRatio: "1/1" }}
        className="bg-[#1c1917] rounded-lg"
      />
    ),
  },
);

// Starting position FEN
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function AnalysisPage() {
  const { seed } = useSeed();
  const searchParams = useSearchParams();
  const { logInteraction } = useEventLogger();

  const tournaments = useMemo(() => generateTournaments(50, seed), [seed]);
  const players = useMemo(() => generatePlayers(50, seed), [seed]);
  const games = useMemo(() => generateGames(tournaments, players, 50, seed), [tournaments, players, seed]);

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
    return generateGamePositions(game.moves);
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
                <SelectTrigger className="bg-[#1c1917] border-stone-800/80 text-zinc-300">
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c1917] border-stone-800/80 max-h-[300px]">
                  {games.slice(0, 50).map((g, idx) => (
                    <SelectItem key={g.id} value={String(idx)}>
                      {g.whitePlayer.name} vs {g.blackPlayer.name} ({g.result})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Game metadata */}
            <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-white font-semibold">{game.whitePlayer.name}</span>
                  <span className="text-zinc-400 ml-1">({game.whitePlayer.rating})</span>
                </div>
                <span className="text-amber-400 font-bold text-lg">{game.result}</span>
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
          <SimpleMoveList
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
          ? "bg-amber-600 hover:bg-amber-700 text-white"
          : "bg-[#1c1917] border border-stone-800/80 text-zinc-400 hover:text-white hover:bg-white/5"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SimpleMoveList({ moves, activeMoveIndex, onMoveClick }: { moves: string[]; activeMoveIndex: number; onMoveClick?: (index: number) => void }) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeMoveIndex]);

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
      className="bg-[#1c1917] border border-stone-800/80 rounded-lg max-h-[400px] overflow-y-auto no-scrollbar"
    >
      <div className="sticky top-0 bg-[#1c1917] border-b border-stone-800/60 px-4 py-2.5 z-10">
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
                    ? "bg-amber-600/30 text-amber-300 ring-1 ring-amber-500/40"
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
                      ? "bg-amber-600/30 text-amber-300 ring-1 ring-amber-500/40"
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
