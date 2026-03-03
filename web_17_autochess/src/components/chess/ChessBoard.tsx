"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Chessboard } from "react-chessboard";

interface ChessBoardProps {
  fen: string;
  size?: number;
  maxSize?: number;
  highlightSquares?: string[];
  selectedSquare?: string | null;
  correctSquare?: string | null;
  incorrectSquare?: string | null;
  lastMove?: { from: string; to: string } | null;
  onSquareClick?: (square: string) => void;
  onDrop?: (from: string, to: string) => boolean;
  interactive?: boolean;
  allowDragging?: boolean;
  boardOrientation?: "white" | "black";
}

export function ChessBoard({
  fen,
  size,
  maxSize = 560,
  highlightSquares = [],
  selectedSquare = null,
  correctSquare = null,
  incorrectSquare = null,
  lastMove = null,
  onSquareClick,
  onDrop,
  interactive = false,
  allowDragging = false,
  boardOrientation = "white",
}: ChessBoardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const customSquareStyles: Record<string, React.CSSProperties> = {};

  if (correctSquare) {
    customSquareStyles[correctSquare] = {
      backgroundColor: "rgba(34, 197, 94, 0.5)",
      boxShadow: "inset 0 0 0 2px rgba(34, 197, 94, 0.7)",
    };
  }
  if (incorrectSquare) {
    customSquareStyles[incorrectSquare] = {
      backgroundColor: "rgba(239, 68, 68, 0.5)",
      boxShadow: "inset 0 0 0 2px rgba(239, 68, 68, 0.7)",
    };
  }
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: "rgba(32, 178, 170, 0.6)",
      boxShadow: "inset 0 0 0 2px rgba(32, 178, 170, 0.8)",
    };
  }
  // Last move highlight (yellow tint on from/to squares)
  if (lastMove) {
    for (const sq of [lastMove.from, lastMove.to]) {
      if (!customSquareStyles[sq]) {
        customSquareStyles[sq] = {
          backgroundColor: "rgba(255, 255, 0, 0.25)",
        };
      }
    }
  }
  for (const sq of highlightSquares) {
    if (!customSquareStyles[sq]) {
      customSquareStyles[sq] = {
        backgroundColor: "rgba(255, 255, 100, 0.4)",
      };
    }
  }

  // Only use onSquareClick (no onPieceClick) to avoid double-fire bug
  const handleSquareClick = useCallback(
    ({ square }: { piece: unknown; square: string }) => {
      if (interactive && onSquareClick) {
        onSquareClick(square);
      }
    },
    [interactive, onSquareClick],
  );

  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: { piece: unknown; sourceSquare: string; targetSquare: string | null }) => {
      if (!interactive || !onDrop || !targetSquare) return false;
      return onDrop(sourceSquare, targetSquare);
    },
    [interactive, onDrop],
  );

  if (!mounted) return <div style={size ? { width: size, maxWidth: "100%", aspectRatio: "1/1" } : { width: "100%", maxWidth: maxSize, aspectRatio: "1/1" }} className="bg-[#1c1917] rounded-lg" />;

  return (
    <div style={size ? { width: size, maxWidth: "100%", aspectRatio: "1/1" } : { width: "100%", maxWidth: maxSize, aspectRatio: "1/1" }}>
      <Chessboard
        options={{
          position: fen,
          allowDragging: allowDragging && interactive,
          boardOrientation,
          onSquareClick: handleSquareClick,
          onPieceDrop: handlePieceDrop,
          darkSquareStyle: { backgroundColor: "#486632" },
          lightSquareStyle: { backgroundColor: "#779952" },
          squareStyles: customSquareStyles,
          boardStyle: {
            borderRadius: "0.5rem",
            overflow: "hidden",
            border: "2px solid rgba(168, 162, 158, 0.35)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          },
        }}
      />
    </div>
  );
}

// Smaller board for previews/thumbnails
export function MiniChessBoard({ fen, size = 160 }: { fen: string; size?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div style={{ width: size, maxWidth: "100%", height: size }} className="bg-[#1c1917] rounded-md" />;

  return (
    <div style={{ width: size, maxWidth: "100%", aspectRatio: "1/1" }}>
      <Chessboard
        options={{
          position: fen,
          allowDragging: false,
          showNotation: false,
          darkSquareStyle: { backgroundColor: "#486632" },
          lightSquareStyle: { backgroundColor: "#779952" },
          boardStyle: {
            borderRadius: "0.375rem",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          },
        }}
      />
    </div>
  );
}
