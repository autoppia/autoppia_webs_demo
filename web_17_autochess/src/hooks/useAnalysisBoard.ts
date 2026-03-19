"use client";

import { generateGamePositions, stripMoveCounters } from "@/data/generators";
import { evaluateGameMoves, evaluatePosition } from "@/library/engine";
import { EVENT_TYPES, type EventType } from "@/library/events";
import type {
  AnnotatedMove,
  OpeningExplorerData,
  PositionEval,
} from "@/shared/types";
import { Chess } from "chess.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export interface UseAnalysisBoardParams {
  seed: number;
  openingBook: Map<string, OpeningExplorerData>;
  initialFen?: string;
  logInteraction: (eventType: EventType, data?: Record<string, unknown>) => void;
}

export interface UseAnalysisBoardReturn {
  // State
  moves: string[];
  activeMoveIndex: number;
  boardOrientation: "white" | "black";
  isPlaying: boolean;
  showEngine: boolean;
  startFen: string;
  selectedSquare: string | null;
  legalMoveSquares: string[];

  // Derived
  currentFen: string;
  currentEval: PositionEval;
  lastMove: { from: string; to: string } | null;
  annotatedMoves: AnnotatedMove[];
  positions: string[];
  openingData: OpeningExplorerData | null;

  // Board measurement
  boardContainerRef: React.RefObject<HTMLDivElement>;
  boardHeight: number;

  // Handlers
  handleBoardMove: (from: string, to: string) => boolean;
  handleSquareClick: (square: string) => void;
  handleDrop: (from: string, to: string) => boolean;
  handleMoveClick: (index: number) => void;
  handleOpeningExplorerMoveClick: (san: string) => void;
  goFirst: () => void;
  goPrev: () => void;
  goNext: () => void;
  goLast: () => void;
  togglePlay: () => void;
  flipBoard: () => void;
  toggleEngine: () => void;

  // Setters (for page-specific logic)
  setMoves: React.Dispatch<React.SetStateAction<string[]>>;
  setActiveMoveIndex: React.Dispatch<React.SetStateAction<number>>;
  setStartFen: React.Dispatch<React.SetStateAction<string>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useAnalysisBoard({
  seed,
  openingBook,
  initialFen,
  logInteraction,
}: UseAnalysisBoardParams): UseAnalysisBoardReturn {
  // Core state
  const [moves, setMoves] = useState<string[]>([]);
  const [activeMoveIndex, setActiveMoveIndex] = useState(-1);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">(
    "white",
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEngine, setShowEngine] = useState(true);
  const [startFen, setStartFen] = useState(initialFen || START_FEN);
  const [boardHeight, setBoardHeight] = useState(480);

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

        const clickedMoves = chess.moves({
          square: square as never,
          verbose: true,
        });
        if (clickedMoves.length > 0 && !legalMoveSquares.includes(square)) {
          setSelectedSquare(square);
          setLegalMoveSquares(clickedMoves.map((m) => m.to));
          return;
        }

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

  // Navigation
  const goFirst = useCallback(() => {
    setActiveMoveIndex(-1);
    setIsPlaying(false);
  }, []);

  const goPrev = useCallback(() => {
    setActiveMoveIndex((p) => Math.max(-1, p - 1));
    setIsPlaying(false);
  }, []);

  const goNext = useCallback(() => {
    setActiveMoveIndex((p) => Math.min(moves.length - 1, p + 1));
    setIsPlaying(false);
  }, [moves.length]);

  const goLast = useCallback(() => {
    setActiveMoveIndex(moves.length - 1);
    setIsPlaying(false);
  }, [moves.length]);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const flipBoard = useCallback(() => {
    setBoardOrientation((o) => (o === "white" ? "black" : "white"));
    logInteraction(EVENT_TYPES.FLIP_BOARD, {
      orientation: boardOrientation === "white" ? "black" : "white",
    });
  }, [boardOrientation, logInteraction]);

  const toggleEngine = useCallback(() => {
    setShowEngine((v) => !v);
    logInteraction(EVENT_TYPES.TOGGLE_ENGINE, { enabled: !showEngine });
  }, [showEngine, logInteraction]);

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

  return {
    moves,
    activeMoveIndex,
    boardOrientation,
    isPlaying,
    showEngine,
    startFen,
    selectedSquare,
    legalMoveSquares,
    currentFen,
    currentEval,
    lastMove,
    annotatedMoves,
    positions,
    openingData,
    boardContainerRef,
    boardHeight,
    handleBoardMove,
    handleSquareClick,
    handleDrop,
    handleMoveClick,
    handleOpeningExplorerMoveClick,
    goFirst,
    goPrev,
    goNext,
    goLast,
    togglePlay,
    flipBoard,
    toggleEngine,
    setMoves,
    setActiveMoveIndex,
    setStartFen,
    setIsPlaying,
  };
}
