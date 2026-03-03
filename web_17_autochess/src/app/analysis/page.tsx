"use client";

import { AnalysisToolsMenu } from "@/components/chess/AnalysisToolsMenu";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { EvalBar } from "@/components/chess/EvalBar";
import { MoveList } from "@/components/chess/MoveList";
import { OpeningExplorer } from "@/components/chess/OpeningExplorer";
import { PgnInput } from "@/components/chess/PgnInput";
import { useSeed } from "@/context/SeedContext";
import {
  type Game,
  generateGamePositions,
  generateGames,
  generateOpeningBook,
  generatePlayers,
  generateTournaments,
  stripMoveCounters,
} from "@/data/generators";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { useEventLogger } from "@/hooks/useEventLogger";
import { evaluateGameMoves, evaluatePosition } from "@/library/engine";
import { EVENT_TYPES } from "@/library/events";
import { Chess } from "chess.js";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

  // Core state
  const [moves, setMoves] = useState<string[]>([]);
  const [activeMoveIndex, setActiveMoveIndex] = useState(-1);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">(
    "white",
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [pgnError, setPgnError] = useState<string | null>(null);
  const [boardHeight, setBoardHeight] = useState(480);
  const [showEngine, setShowEngine] = useState(true);
  const [startFen, setStartFen] = useState(START_FEN);

  // Chess.js for interactive board moves
  const chessRef = useRef<Chess>(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoveSquares, setLegalMoveSquares] = useState<string[]>([]);

  // Board size measurement
  const boardContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = boardContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBoardHeight(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Load custom FEN from URL param
  useEffect(() => {
    const fenParam = searchParams.get("fen");
    if (fenParam) {
      try {
        new Chess(fenParam);
        setStartFen(fenParam);
        setMoves([]);
        setActiveMoveIndex(-1);
      } catch {
        // Invalid FEN — ignore
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Derived data
  const annotatedMoves = useMemo(
    () => evaluateGameMoves(moves, seed, startFen),
    [moves, seed, startFen],
  );
  const positions = useMemo(
    () => generateGamePositions(moves, startFen),
    [moves, startFen],
  );

  const currentFen =
    activeMoveIndex >= 0 && activeMoveIndex < positions.length
      ? positions[activeMoveIndex]
      : startFen;

  const currentEval = useMemo(() => {
    if (activeMoveIndex >= 0 && activeMoveIndex < annotatedMoves.length) {
      return annotatedMoves[activeMoveIndex].eval;
    }
    return evaluatePosition(startFen, seed);
  }, [activeMoveIndex, annotatedMoves, seed, startFen]);

  const openingData = useMemo(() => {
    const key = stripMoveCounters(currentFen);
    return openingBook.get(key) || null;
  }, [currentFen, openingBook]);

  // Derive lastMove from the current annotated move (replay through chess.js for from/to)
  const lastMove = useMemo(() => {
    if (activeMoveIndex < 0 || activeMoveIndex >= moves.length) return null;
    const chess = new Chess(startFen);
    for (let i = 0; i <= activeMoveIndex; i++) {
      try {
        const result = chess.move(moves[i]);
        if (i === activeMoveIndex && result) {
          return { from: result.from, to: result.to };
        }
      } catch {
        return null;
      }
    }
    return null;
  }, [activeMoveIndex, moves, startFen]);

  // Sync chess.js instance to current position
  useEffect(() => {
    try {
      chessRef.current = new Chess(currentFen);
    } catch {
      chessRef.current = new Chess();
    }
    setSelectedSquare(null);
    setLegalMoveSquares([]);
  }, [currentFen]);

  // Load game from URL param on mount
  useEffect(() => {
    const gameId = searchParams.get("game");
    if (gameId) {
      const idx = games.findIndex((g) => g.id === Number(gameId));
      if (idx >= 0) {
        setMoves(games[idx].moves);
        setActiveMoveIndex(-1);
        logInteraction(EVENT_TYPES.ANALYZE_GAME, {
          game_id: games[idx].id,
          white: games[idx].whitePlayer.name,
          black: games[idx].blackPlayer.name,
          result: games[idx].result,
        });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveMoveIndex((prev) => {
        if (prev >= moves.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, moves.length]);

  // --- Handlers ---

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
        setMoves(history);
        setActiveMoveIndex(-1);
        setIsPlaying(false);
        setPgnError(null);
        setStartFen(START_FEN);
        logInteraction(EVENT_TYPES.LOAD_PGN, { move_count: history.length });
      } catch {
        setPgnError("Invalid PGN format");
      }
    },
    [logInteraction],
  );

  const handleLoadGame = useCallback(
    (index: number) => {
      const game = games[index];
      if (!game) return;
      setMoves(game.moves);
      setActiveMoveIndex(-1);
      setIsPlaying(false);
      setPgnError(null);
      setStartFen(START_FEN);
      logInteraction(EVENT_TYPES.ANALYZE_GAME, {
        game_id: game.id,
        white: game.whitePlayer.name,
        black: game.blackPlayer.name,
        result: game.result,
        opening: game.opening,
      });
    },
    [games, logInteraction],
  );

  const handleMoveClick = useCallback(
    (index: number) => {
      setActiveMoveIndex(index);
      setIsPlaying(false);
      logInteraction(EVENT_TYPES.NAVIGATE_MOVE, { move_index: index });
    },
    [logInteraction],
  );

  const handleOpeningExplorerMoveClick = useCallback(
    (san: string) => {
      // Make the move from the current position — truncate future moves and append
      const chess = new Chess(currentFen);
      try {
        chess.move(san);
        const newMoves = moves.slice(0, activeMoveIndex + 1);
        newMoves.push(san);
        setMoves(newMoves);
        setActiveMoveIndex(newMoves.length - 1);
        setIsPlaying(false);
        logInteraction(EVENT_TYPES.EXPLORE_OPENING, { move: san });
      } catch {
        // Invalid move — ignore
      }
    },
    [currentFen, moves, activeMoveIndex, logInteraction],
  );

  const handleBoardMove = useCallback(
    (from: string, to: string): boolean => {
      setIsPlaying(false);
      const chess = new Chess(currentFen);
      const result = chess.move({ from, to, promotion: "q" });
      if (result) {
        const newMoves = moves.slice(0, activeMoveIndex + 1);
        newMoves.push(result.san);
        setMoves(newMoves);
        setActiveMoveIndex(newMoves.length - 1);
        setSelectedSquare(null);
        setLegalMoveSquares([]);
        logInteraction(EVENT_TYPES.MAKE_ANALYSIS_MOVE, {
          move: result.san,
          from,
          to,
        });
        return true;
      }
      return false;
    },
    [currentFen, moves, activeMoveIndex, logInteraction],
  );

  const handleSquareClick = useCallback(
    (square: string) => {
      setIsPlaying(false);
      const chess = chessRef.current;

      if (selectedSquare) {
        if (selectedSquare === square) {
          setSelectedSquare(null);
          setLegalMoveSquares([]);
          return;
        }

        // Re-select if clicking another own piece
        const clickedMoves = chess.moves({
          square: square as never,
          verbose: true,
        });
        if (clickedMoves.length > 0 && !legalMoveSquares.includes(square)) {
          setSelectedSquare(square);
          setLegalMoveSquares(clickedMoves.map((m) => m.to));
          return;
        }

        // Try to make the move via handleBoardMove (which truncates + appends)
        handleBoardMove(selectedSquare, square);
        setSelectedSquare(null);
        setLegalMoveSquares([]);
      } else {
        const sqMoves = chess.moves({ square: square as never, verbose: true });
        if (sqMoves.length > 0) {
          setSelectedSquare(square);
          setLegalMoveSquares(sqMoves.map((m) => m.to));
        }
      }
    },
    [selectedSquare, legalMoveSquares, handleBoardMove],
  );

  const handleDrop = useCallback(
    (from: string, to: string) => {
      return handleBoardMove(from, to);
    },
    [handleBoardMove],
  );

  // Navigation
  const goFirst = () => {
    setActiveMoveIndex(-1);
    setIsPlaying(false);
  };
  const goPrev = () => {
    setActiveMoveIndex((p) => Math.max(-1, p - 1));
    setIsPlaying(false);
  };
  const goNext = () => {
    setActiveMoveIndex((p) => Math.min(moves.length - 1, p + 1));
    setIsPlaying(false);
  };
  const goLast = () => {
    setActiveMoveIndex(moves.length - 1);
    setIsPlaying(false);
  };
  const togglePlay = () => setIsPlaying((p) => !p);

  const flipBoard = () => {
    setBoardOrientation((o) => (o === "white" ? "black" : "white"));
    logInteraction(EVENT_TYPES.FLIP_BOARD, {
      orientation: boardOrientation === "white" ? "black" : "white",
    });
  };

  const toggleEngine = () => {
    setShowEngine((v) => !v);
    logInteraction(EVENT_TYPES.TOGGLE_ENGINE, { enabled: !showEngine });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement
      )
        return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
        case "Home":
          e.preventDefault();
          goFirst();
          break;
        case "End":
          e.preventDefault();
          goLast();
          break;
        case "f":
          flipBoard();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }); // intentionally no deps — uses closures over latest state

  return (
    <div className="py-4 sm:py-6">
      <DynamicWrapper>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
          <DynamicText value="Analysis Board" type="text" />
        </h1>
      </DynamicWrapper>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left column: Board + Controls + PGN Input */}
        <div className="flex-1 min-w-0">
          {/* Engine eval display */}
          {showEngine && (
            <DynamicWrapper>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-xs text-zinc-500 font-mono">Engine:</span>
                <span
                  className={`text-sm font-bold font-mono ${
                    currentEval.cp > 50
                      ? "text-zinc-100"
                      : currentEval.cp < -50
                        ? "text-zinc-400"
                        : "text-zinc-300"
                  }`}
                >
                  {currentEval.display}
                </span>
                <span className="text-[10px] text-zinc-600 font-mono">
                  depth {currentEval.depth}
                </span>
              </div>
            </DynamicWrapper>
          )}

          {/* EvalBar + Board */}
          <div className="flex gap-1.5 mb-3">
            {showEngine && (
              <EvalBar
                eval={currentEval}
                boardHeight={boardHeight}
                flipped={boardOrientation === "black"}
              />
            )}
            <div ref={boardContainerRef} className="flex-1 min-w-0">
              <ChessBoard
                fen={currentFen}
                maxSize={9999}
                interactive
                allowDragging
                boardOrientation={boardOrientation}
                selectedSquare={selectedSquare}
                highlightSquares={legalMoveSquares}
                lastMove={lastMove}
                onSquareClick={handleSquareClick}
                onDrop={handleDrop}
              />
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-1.5">
            <NavButton onClick={flipBoard} title="Flip board (F)">
              <RotateCcw className="h-4 w-4" />
            </NavButton>
            <NavButton onClick={goFirst} title="First move (Home)">
              <ChevronFirst className="h-5 w-5" />
            </NavButton>
            <NavButton onClick={goPrev} title="Previous (Left)">
              <ChevronLeft className="h-5 w-5" />
            </NavButton>
            <NavButton onClick={togglePlay} highlight title="Auto-play">
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </NavButton>
            <NavButton onClick={goNext} title="Next (Right)">
              <ChevronRight className="h-5 w-5" />
            </NavButton>
            <NavButton onClick={goLast} title="Last move (End)">
              <ChevronLast className="h-5 w-5" />
            </NavButton>
            <AnalysisToolsMenu
              onFlipBoard={flipBoard}
              showEngine={showEngine}
              onToggleEngine={toggleEngine}
            />
          </div>

          <div className="text-center text-xs text-zinc-500 mt-1.5 mb-4">
            {moves.length > 0
              ? activeMoveIndex >= 0
                ? `Move ${activeMoveIndex + 1} of ${moves.length}`
                : `Start position \u2014 ${moves.length} moves`
              : "Play a move or load a game to begin"}
          </div>

          {/* PGN Input / Game Library */}
          <PgnInput
            onLoadPgn={handleLoadPgn}
            onLoadGame={handleLoadGame}
            games={games}
            error={pgnError}
          />
        </div>

        {/* Right column: Move List + Opening Explorer */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <MoveList
            annotatedMoves={annotatedMoves}
            activeMoveIndex={activeMoveIndex}
            onMoveClick={handleMoveClick}
          />
          <OpeningExplorer
            data={openingData}
            onMoveClick={handleOpeningExplorerMoveClick}
          />
        </div>
      </div>
    </div>
  );
}

function NavButton({
  onClick,
  children,
  highlight,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  highlight?: boolean;
  title?: string;
}) {
  return (
    <button
      className={`p-2 rounded-lg transition-colors ${
        highlight
          ? "bg-amber-600 hover:bg-amber-700 text-white"
          : "bg-[#1c1917] border border-stone-800/80 text-zinc-400 hover:text-white hover:bg-white/5"
      }`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
