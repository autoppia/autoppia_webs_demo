"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Chessboard } from "react-chessboard";

interface ChessBoardProps {
  fen: string;
  size?: number;
  maxSize?: number;
  highlightSquares?: string[];
  selectedSquare?: string | null;
  correctSquare?: string | null;
  incorrectSquare?: string | null;
  onSquareClick?: (square: string) => void;
  interactive?: boolean;
}

export function ChessBoard({
  fen,
  size,
  maxSize = 560,
  highlightSquares = [],
  selectedSquare = null,
  correctSquare = null,
  incorrectSquare = null,
  onSquareClick,
  interactive = false,
}: ChessBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
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
  for (const sq of highlightSquares) {
    if (!customSquareStyles[sq]) {
      customSquareStyles[sq] = {
        backgroundColor: "rgba(255, 255, 100, 0.4)",
      };
    }
  }

  const handleSquareClick = useCallback(
    ({ square }: { piece: unknown; square: string }) => {
      if (interactive && onSquareClick) {
        onSquareClick(square);
      }
    },
    [interactive, onSquareClick],
  );

  if (!mounted) return <div ref={containerRef} style={size ? { width: size, aspectRatio: "1/1" } : { width: "100%", maxWidth: maxSize, aspectRatio: "1/1" }} className="bg-[#1c1917] rounded-lg" />;

  return (
    <div ref={containerRef} style={size ? { width: size, aspectRatio: "1/1" } : { width: "100%", maxWidth: maxSize, aspectRatio: "1/1" }}>
      <Chessboard
        options={{
          position: fen,
          allowDragging: false,
          onSquareClick: handleSquareClick,
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

  if (!mounted) return <div style={{ width: size, height: size }} className="bg-[#1c1917] rounded-md" />;

  return (
    <div style={{ width: size, aspectRatio: "1/1" }}>
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
