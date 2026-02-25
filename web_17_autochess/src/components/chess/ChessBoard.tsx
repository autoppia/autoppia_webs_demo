"use client";

import React from "react";

const PIECE_UNICODE: Record<string, string> = {
  K: "\u2654", Q: "\u2655", R: "\u2656", B: "\u2657", N: "\u2658", P: "\u2659",
  k: "\u265A", q: "\u265B", r: "\u265C", b: "\u265D", n: "\u265E", p: "\u265F",
};

function parseFEN(fen: string): (string | null)[][] {
  const board: (string | null)[][] = [];
  const rows = fen.split(" ")[0].split("/");
  for (const row of rows) {
    const boardRow: (string | null)[] = [];
    for (const ch of row) {
      if (ch >= "1" && ch <= "8") {
        for (let i = 0; i < Number.parseInt(ch); i++) boardRow.push(null);
      } else {
        boardRow.push(ch);
      }
    }
    board.push(boardRow);
  }
  return board;
}

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
  const board = parseFEN(fen);

  const getSquareName = (row: number, col: number): string => {
    return `${String.fromCharCode(97 + col)}${8 - row}`;
  };

  const getSquareClass = (row: number, col: number): string => {
    const square = getSquareName(row, col);
    const isLight = (row + col) % 2 === 0;
    let cls = isLight ? "chess-light" : "chess-dark";

    if (correctSquare === square) cls += " chess-correct";
    else if (incorrectSquare === square) cls += " chess-incorrect";
    else if (selectedSquare === square) cls += " chess-selected";
    else if (highlightSquares.includes(square)) cls += " chess-highlight";

    return cls;
  };

  // Responsive: use size if provided, otherwise fill container
  const sizeStyle = size
    ? { width: size, height: size }
    : { width: "100%", maxWidth: maxSize, aspectRatio: "1 / 1" };

  return (
    <div
      className="inline-grid grid-cols-8 border-2 border-emerald-900/50 rounded-lg overflow-hidden"
      style={sizeStyle}
    >
      {board.map((row, rowIdx) =>
        row.map((piece, colIdx) => {
          const square = getSquareName(rowIdx, colIdx);
          return (
            <div
              key={square}
              className={`flex items-center justify-center ${getSquareClass(rowIdx, colIdx)} ${
                interactive ? "cursor-pointer hover:brightness-110 active:brightness-125" : ""
              }`}
              style={{ aspectRatio: "1 / 1" }}
              onClick={() => interactive && onSquareClick?.(square)}
            >
              {piece && (
                <span
                  className="select-none chess-piece"
                  role="img"
                  aria-label={`${piece === piece.toUpperCase() ? "White" : "Black"} ${getPieceName(piece)}`}
                >
                  {PIECE_UNICODE[piece] || ""}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function getPieceName(piece: string): string {
  switch (piece.toLowerCase()) {
    case "k": return "King";
    case "q": return "Queen";
    case "r": return "Rook";
    case "b": return "Bishop";
    case "n": return "Knight";
    case "p": return "Pawn";
    default: return "";
  }
}

// Smaller board for previews/thumbnails
export function MiniChessBoard({ fen, size = 160 }: { fen: string; size?: number }) {
  return <ChessBoard fen={fen} size={size} />;
}
