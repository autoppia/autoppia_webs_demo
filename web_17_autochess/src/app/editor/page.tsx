"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Chess } from "chess.js";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useEventLogger } from "@/hooks/useEventLogger";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { EVENT_TYPES } from "@/library/events";
import { RotateCcw, Trash2, Copy, Play } from "lucide-react";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

type PieceCode = "wK" | "wQ" | "wR" | "wB" | "wN" | "wP" | "bK" | "bQ" | "bR" | "bB" | "bN" | "bP";
type Tool = PieceCode | "trash";

const PIECE_SYMBOLS: Record<PieceCode, string> = {
  wK: "\u2654", wQ: "\u2655", wR: "\u2656", wB: "\u2657", wN: "\u2658", wP: "\u2659",
  bK: "\u265A", bQ: "\u265B", bR: "\u265C", bB: "\u265D", bN: "\u265E", bP: "\u265F",
};

const WHITE_PIECES: PieceCode[] = ["wK", "wQ", "wR", "wB", "wN", "wP"];
const BLACK_PIECES: PieceCode[] = ["bK", "bQ", "bR", "bB", "bN", "bP"];

const VALID_PIECES = new Set(["K", "Q", "R", "B", "N", "P"]);

/** Convert a FEN string to a square->piece map (e.g. { e1: "wK", e8: "bK" }) */
function fenToPositionMap(fen: string): Record<string, PieceCode> {
  const map: Record<string, PieceCode> = {};
  const placement = fen.split(" ")[0];
  const rows = placement.split("/");
  for (let r = 0; r < 8; r++) {
    let file = 0;
    for (const ch of rows[r]) {
      if (ch >= "1" && ch <= "8") {
        file += parseInt(ch);
      } else {
        const color = ch === ch.toUpperCase() ? "w" : "b";
        const piece = ch.toUpperCase();
        if (VALID_PIECES.has(piece)) {
          const square = FILES[file] + RANKS[r];
          map[square] = (color + piece) as PieceCode;
        }
        file++;
      }
    }
  }
  return map;
}

/** Convert a position map back to a FEN string */
function positionMapToFen(
  position: Record<string, PieceCode>,
  sideToMove: "w" | "b",
  castling: { K: boolean; Q: boolean; k: boolean; q: boolean },
  enPassant: string = "-",
): string {
  let placement = "";
  for (let r = 0; r < 8; r++) {
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const square = FILES[f] + RANKS[r];
      const piece = position[square];
      if (piece) {
        if (empty > 0) { placement += empty; empty = 0; }
        const ch = piece[1];
        placement += piece[0] === "w" ? ch.toUpperCase() : ch.toLowerCase();
      } else {
        empty++;
      }
    }
    if (empty > 0) placement += empty;
    if (r < 7) placement += "/";
  }

  // Only include castling rights where king + rook are on starting squares
  let castlingStr = "";
  const wKingOnE1 = position["e1"] === "wK";
  const bKingOnE8 = position["e8"] === "bK";
  if (castling.K && wKingOnE1 && position["h1"] === "wR") castlingStr += "K";
  if (castling.Q && wKingOnE1 && position["a1"] === "wR") castlingStr += "Q";
  if (castling.k && bKingOnE8 && position["h8"] === "bR") castlingStr += "k";
  if (castling.q && bKingOnE8 && position["a8"] === "bR") castlingStr += "q";
  if (!castlingStr) castlingStr = "-";

  return `${placement} ${sideToMove} ${castlingStr} ${enPassant} 0 1`;
}

export default function EditorPage() {
  const router = useSeedRouter();
  const { logInteraction } = useEventLogger();

  const [position, setPosition] = useState<Record<string, PieceCode>>(() => fenToPositionMap(START_FEN));
  const [sideToMove, setSideToMove] = useState<"w" | "b">("w");
  const [castling, setCastling] = useState({ K: true, Q: true, k: true, q: true });
  const [enPassant, setEnPassant] = useState("-");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [fenInput, setFenInput] = useState("");
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [fenError, setFenError] = useState<string | null>(null);

  // Castling possibility flags — king + rook must be on starting squares
  const canCastleK = position["e1"] === "wK" && position["h1"] === "wR";
  const canCastleQ = position["e1"] === "wK" && position["a1"] === "wR";
  const canCastlek = position["e8"] === "bK" && position["h8"] === "bR";
  const canCastleq = position["e8"] === "bK" && position["a8"] === "bR";

  // Auto-disable castling rights when pieces are moved off starting squares
  useEffect(() => {
    setCastling((prev) => {
      const next = {
        K: prev.K && canCastleK,
        Q: prev.Q && canCastleQ,
        k: prev.k && canCastlek,
        q: prev.q && canCastleq,
      };
      if (next.K === prev.K && next.Q === prev.Q && next.k === prev.k && next.q === prev.q) return prev;
      return next;
    });
  }, [canCastleK, canCastleQ, canCastlek, canCastleq]);

  const currentFen = useMemo(
    () => positionMapToFen(position, sideToMove, castling, enPassant),
    [position, sideToMove, castling, enPassant],
  );

  const handleSquareClick = useCallback((square: string) => {
    if (!selectedTool) return;

    setPosition((prev) => {
      const next = { ...prev };
      if (selectedTool === "trash") {
        delete next[square];
      } else {
        if (next[square] === selectedTool) {
          delete next[square];
        } else {
          next[square] = selectedTool;
        }
      }
      return next;
    });
    // Any board edit invalidates en passant (no "last move" context)
    setEnPassant("-");
  }, [selectedTool]);

  const handleLoadFen = useCallback(() => {
    const trimmed = fenInput.trim();
    if (!trimmed) return;
    try {
      new Chess(trimmed);
      const parts = trimmed.split(" ");
      setPosition(fenToPositionMap(trimmed));
      setSideToMove((parts[1] || "w") as "w" | "b");
      const c = parts[2] || "-";
      setCastling({
        K: c.includes("K"),
        Q: c.includes("Q"),
        k: c.includes("k"),
        q: c.includes("q"),
      });
      setEnPassant(parts[3] || "-");
      setFenError(null);
      logInteraction(EVENT_TYPES.LOAD_EDITOR_FEN, { fen: trimmed });
    } catch {
      setFenError("Invalid FEN");
    }
  }, [fenInput, logInteraction]);

  const handleStartingPosition = useCallback(() => {
    setPosition(fenToPositionMap(START_FEN));
    setSideToMove("w");
    setCastling({ K: true, Q: true, k: true, q: true });
    setEnPassant("-");
    setFenError(null);
  }, []);

  const handleClearBoard = useCallback(() => {
    setPosition({});
    setSideToMove("w");
    setCastling({ K: false, Q: false, k: false, q: false });
    setEnPassant("-");
    setFenError(null);
  }, []);

  const handleCopyFen = useCallback(() => {
    navigator.clipboard.writeText(currentFen);
  }, [currentFen]);

  const handleAnalyze = useCallback(() => {
    try {
      new Chess(currentFen);
    } catch {
      setFenError("Invalid position — both kings are required");
      return;
    }
    logInteraction(EVENT_TYPES.ANALYZE_FROM_EDITOR, { fen: currentFen });
    router.push(`/analysis?fen=${encodeURIComponent(currentFen)}`);
  }, [currentFen, logInteraction, router]);

  const handleFlip = useCallback(() => {
    setBoardOrientation((o) => o === "white" ? "black" : "white");
  }, []);

  return (
    <div className="py-4 sm:py-6">
      <DynamicWrapper>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
          <DynamicText value="Board Editor" type="text" />
        </h1>
      </DynamicWrapper>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column: Board + Piece Palette */}
        <div className="flex-1 min-w-0">
          <ChessBoard
            fen={currentFen}
            maxSize={9999}
            interactive
            boardOrientation={boardOrientation}
            onSquareClick={handleSquareClick}
          />

          {/* Piece Palette */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-1 flex-wrap">
              {WHITE_PIECES.map((pc) => (
                <PaletteButton
                  key={pc}
                  active={selectedTool === pc}
                  onClick={() => setSelectedTool(selectedTool === pc ? null : pc)}
                  title={pc}
                >
                  {PIECE_SYMBOLS[pc]}
                </PaletteButton>
              ))}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {BLACK_PIECES.map((pc) => (
                <PaletteButton
                  key={pc}
                  active={selectedTool === pc}
                  onClick={() => setSelectedTool(selectedTool === pc ? null : pc)}
                  title={pc}
                >
                  {PIECE_SYMBOLS[pc]}
                </PaletteButton>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <PaletteButton
                active={selectedTool === "trash"}
                onClick={() => setSelectedTool(selectedTool === "trash" ? null : "trash")}
                title="Remove piece"
              >
                <Trash2 className="h-4 w-4" />
              </PaletteButton>
              <button
                className="p-2 rounded-lg bg-[#1c1917] border border-stone-800/80 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                onClick={handleFlip}
                title="Flip board"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right column: FEN + Settings + Actions */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* FEN Input */}
          <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">FEN</h3>
            <textarea
              className="w-full bg-zinc-900 border border-stone-700/80 rounded-lg p-2 text-xs text-zinc-300 font-mono resize-none focus:outline-none focus:border-amber-600/50"
              rows={2}
              value={fenInput}
              onChange={(e) => { setFenInput(e.target.value); setFenError(null); }}
              placeholder="Paste FEN here..."
            />
            {fenError && <p className="text-xs text-red-400 mt-1">{fenError}</p>}
            <button
              className="mt-2 w-full py-1.5 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
              onClick={handleLoadFen}
            >
              Load FEN
            </button>
          </div>

          {/* Current FEN display */}
          <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">Current Position</h3>
            <p className="text-[11px] text-zinc-500 font-mono break-all leading-relaxed">{currentFen}</p>
          </div>

          {/* Side to Move */}
          <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">Side to Move</h3>
            <div className="flex gap-2">
              <button
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  sideToMove === "w"
                    ? "bg-white text-zinc-900"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
                onClick={() => setSideToMove("w")}
              >
                White
              </button>
              <button
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  sideToMove === "b"
                    ? "bg-zinc-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
                onClick={() => setSideToMove("b")}
              >
                Black
              </button>
            </div>
          </div>

          {/* Castling Rights */}
          <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">Castling Rights</h3>
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: "K" as const, label: "White O-O", possible: canCastleK },
                { key: "Q" as const, label: "White O-O-O", possible: canCastleQ },
                { key: "k" as const, label: "Black O-O", possible: canCastlek },
                { key: "q" as const, label: "Black O-O-O", possible: canCastleq },
              ]).map(({ key, label, possible }) => (
                <label key={key} className={`flex items-center gap-2 text-xs cursor-pointer ${possible ? "text-zinc-400" : "text-zinc-600"}`}>
                  <input
                    type="checkbox"
                    checked={castling[key]}
                    disabled={!possible}
                    onChange={() => setCastling((c) => ({ ...c, [key]: !c[key] }))}
                    className="rounded border-stone-700 bg-zinc-900 text-amber-600 focus:ring-amber-600/30 disabled:opacity-40"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              className="w-full py-2 text-sm font-medium rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
              onClick={handleStartingPosition}
            >
              Starting Position
            </button>
            <button
              className="w-full py-2 text-sm font-medium rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
              onClick={handleClearBoard}
            >
              Clear Board
            </button>
            <button
              className="w-full py-2 text-sm font-medium rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
              onClick={handleCopyFen}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy FEN
            </button>
            <button
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
              onClick={handleAnalyze}
            >
              <Play className="h-4 w-4" />
              Analyze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaletteButton({ active, onClick, children, title }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl transition-colors ${
        active
          ? "bg-amber-600/30 border-2 border-amber-500 text-white"
          : "bg-[#1c1917] border border-stone-800/80 text-zinc-300 hover:bg-white/5 hover:text-white"
      }`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
