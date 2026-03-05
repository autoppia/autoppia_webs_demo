"use client";

import { AnalysisToolsMenu } from "@/components/chess/AnalysisToolsMenu";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { EvalBar } from "@/components/chess/EvalBar";
import { MoveList } from "@/components/chess/MoveList";
import { OpeningExplorer } from "@/components/chess/OpeningExplorer";
import { PgnInput } from "@/components/chess/PgnInput";
import { SeedLink } from "@/components/ui/SeedLink";
import { useSeed } from "@/context/SeedContext";
import {
  generateGames,
  generateOpeningBook,
  generatePlayers,
  generateTournaments,
} from "@/data/generators";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { useAnalysisBoard } from "@/hooks/useAnalysisBoard";
import { useEventLogger } from "@/hooks/useEventLogger";
import { EVENT_TYPES } from "@/library/events";
import { Chess } from "chess.js";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  PenTool,
  RotateCcw,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function AnalysisPage() {
  const { seed } = useSeed();
  const searchParams = useSearchParams();
  const { logInteraction } = useEventLogger();

  // Data generation
  const games = useMemo(() => {
    const t = generateTournaments(50, seed);
    const p = generatePlayers(200, seed);
    return generateGames(t, p, 100, seed);
  }, [seed]);
  const openingBook = useMemo(
    () => generateOpeningBook(games, seed),
    [games, seed],
  );

  // Page-specific state
  const [pgnError, setPgnError] = useState<string | null>(null);

  // Use the shared analysis board hook
  const board = useAnalysisBoard({
    seed,
    openingBook,
    logInteraction,
  });

  // Load custom FEN from URL param
  useEffect(() => {
    const fenParam = searchParams.get("fen");
    if (fenParam) {
      try {
        new Chess(fenParam);
        board.setStartFen(fenParam);
        board.setMoves([]);
        board.setActiveMoveIndex(-1);
      } catch {
        // Invalid FEN — ignore
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load game from URL param on mount
  useEffect(() => {
    const gameId = searchParams.get("game");
    if (gameId) {
      const idx = games.findIndex((g) => g.id === Number(gameId));
      if (idx >= 0) {
        board.setMoves(games[idx].moves);
        board.setActiveMoveIndex(-1);
        logInteraction(EVENT_TYPES.ANALYZE_GAME, {
          game_id: games[idx].id,
          white: games[idx].whitePlayer.name,
          black: games[idx].blackPlayer.name,
          result: games[idx].result,
        });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Page-specific handlers ---

  const handleLoadPgn = useCallback(
    (pgn: string) => {
      const chess = new Chess();
      try {
        chess.loadPgn(pgn);
        const history = chess.history();
        if (history.length === 0) {
          setPgnError("No moves found in PGN");
          return;
        }
        board.setMoves(history);
        board.setActiveMoveIndex(-1);
        board.setIsPlaying(false);
        setPgnError(null);
        board.setStartFen(START_FEN);
        logInteraction(EVENT_TYPES.LOAD_PGN, { move_count: history.length });
      } catch {
        setPgnError("Invalid PGN format");
      }
    },
    [logInteraction, board],
  );

  const handleLoadGame = useCallback(
    (index: number) => {
      const game = games[index];
      if (!game) return;
      board.setMoves(game.moves);
      board.setActiveMoveIndex(-1);
      board.setIsPlaying(false);
      setPgnError(null);
      board.setStartFen(START_FEN);
      logInteraction(EVENT_TYPES.ANALYZE_GAME, {
        game_id: game.id,
        white: game.whitePlayer.name,
        black: game.blackPlayer.name,
        result: game.result,
        opening: game.opening,
      });
    },
    [games, logInteraction, board],
  );

  return (
    <div className="py-4 sm:py-6">
      <DynamicWrapper>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
          <DynamicText value="Analysis Board" type="text" />
        </h1>
      </DynamicWrapper>

      {/* Main row: EvalBar | Board | Move Panel — all same height, flush */}
      <div className="flex flex-col lg:flex-row">
        {/* EvalBar + Board */}
        <div className="flex min-w-0">
          {board.showEngine && (
            <EvalBar
              eval={board.currentEval}
              boardHeight={board.boardHeight}
              flipped={board.boardOrientation === "black"}
            />
          )}
          <div
            ref={board.boardContainerRef}
            className="min-w-0 max-w-[min(100%,calc(100vh-280px))]"
          >
            <ChessBoard
              fen={board.currentFen}
              maxSize={9999}
              interactive
              allowDragging
              boardOrientation={board.boardOrientation}
              selectedSquare={board.selectedSquare}
              highlightSquares={board.legalMoveSquares}
              lastMove={board.lastMove}
              onSquareClick={board.handleSquareClick}
              onDrop={board.handleDrop}
            />
          </div>
        </div>

        {/* Right panel: engine line + moves — same height as board */}
        <div
          className="w-full lg:w-[340px] flex flex-col bg-[#1c1917] lg:border-y lg:border-r border border-stone-800/80 lg:rounded-r-lg rounded-lg lg:rounded-l-none"
          style={{ height: board.boardHeight || undefined }}
        >
          {/* Engine eval line */}
          {board.showEngine && (
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-stone-800/60 flex-shrink-0">
              <span className="text-xs text-zinc-500 font-mono">Engine:</span>
              <span
                className={`text-sm font-bold font-mono ${
                  board.currentEval.cp > 50
                    ? "text-zinc-100"
                    : board.currentEval.cp < -50
                      ? "text-zinc-400"
                      : "text-zinc-300"
                }`}
              >
                {board.currentEval.display}
              </span>
              <span className="text-[10px] text-zinc-600 font-mono ml-auto">
                depth {board.currentEval.depth}
              </span>
            </div>
          )}

          {/* Scrollable move list — fills all remaining space */}
          <MoveList
            annotatedMoves={board.annotatedMoves}
            activeMoveIndex={board.activeMoveIndex}
            onMoveClick={board.handleMoveClick}
            embedded
          />
        </div>
      </div>

      {/* Footer bar: nav controls spanning below board+panel */}
      <div className="flex items-center justify-end gap-1 mt-1 py-1.5">
        <NavButton onClick={board.flipBoard} title="Flip board (F)">
          <RotateCcw className="h-4 w-4" />
        </NavButton>
        <SeedLink
          href={`/editor?fen=${encodeURIComponent(board.currentFen)}`}
          className="p-1.5 rounded-md transition-colors text-zinc-400 hover:text-amber-300 hover:bg-white/5"
          title="Board Editor"
        >
          <PenTool className="h-4 w-4" />
        </SeedLink>
        <NavButton onClick={board.goFirst} title="First move (Home)">
          <ChevronFirst className="h-5 w-5" />
        </NavButton>
        <NavButton onClick={board.goPrev} title="Previous (Left)">
          <ChevronLeft className="h-5 w-5" />
        </NavButton>
        <NavButton onClick={board.goNext} title="Next (Right)">
          <ChevronRight className="h-5 w-5" />
        </NavButton>
        <NavButton onClick={board.goLast} title="Last move (End)">
          <ChevronLast className="h-5 w-5" />
        </NavButton>
        <AnalysisToolsMenu
          onFlipBoard={board.flipBoard}
          showEngine={board.showEngine}
          onToggleEngine={board.toggleEngine}
        />
      </div>

      {/* Below: Opening Explorer + PGN Input */}
      <div className="flex flex-col lg:flex-row gap-4 mt-3">
        <div className="flex-1 min-w-0">
          <PgnInput
            onLoadPgn={handleLoadPgn}
            onLoadGame={handleLoadGame}
            games={games}
            error={pgnError}
          />
        </div>
        <div className="w-full lg:w-[340px]">
          <OpeningExplorer
            data={board.openingData}
            onMoveClick={board.handleOpeningExplorerMoveClick}
          />
        </div>
      </div>
    </div>
  );
}

function NavButton({
  onClick,
  children,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      className="p-1.5 rounded-md transition-colors text-zinc-400 hover:text-white hover:bg-white/5"
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
