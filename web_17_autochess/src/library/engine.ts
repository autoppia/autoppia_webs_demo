import { Chess } from "chess.js";
import { seedRandom } from "@/data/generators";
import type { PositionEval, AnnotatedMove, MoveClassification } from "@/shared/types";

// Piece values (centipawns)
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

// Piece-square tables (from white's perspective, index 0 = a8, index 63 = h1)
// Mirrored for black. Values in centipawns.
const PST_PAWN = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];

const PST_KNIGHT = [
 -50,-40,-30,-30,-30,-30,-40,-50,
 -40,-20,  0,  0,  0,  0,-20,-40,
 -30,  0, 10, 15, 15, 10,  0,-30,
 -30,  5, 15, 20, 20, 15,  5,-30,
 -30,  0, 15, 20, 20, 15,  0,-30,
 -30,  5, 10, 15, 15, 10,  5,-30,
 -40,-20,  0,  5,  5,  0,-20,-40,
 -50,-40,-30,-30,-30,-30,-40,-50,
];

const PST_BISHOP = [
 -20,-10,-10,-10,-10,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0, 10, 10, 10, 10,  0,-10,
 -10,  5,  5, 10, 10,  5,  5,-10,
 -10,  0, 10, 10, 10, 10,  0,-10,
 -10, 10, 10, 10, 10, 10, 10,-10,
 -10,  5,  0,  0,  0,  0,  5,-10,
 -20,-10,-10,-10,-10,-10,-10,-20,
];

const PST_ROOK = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0,
];

const PST_QUEEN = [
 -20,-10,-10, -5, -5,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
   0,  0,  5,  5,  5,  5,  0, -5,
 -10,  5,  5,  5,  5,  5,  0,-10,
 -10,  0,  5,  0,  0,  0,  0,-10,
 -20,-10,-10, -5, -5,-10,-10,-20,
];

const PST_KING_MID = [
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -20,-30,-30,-40,-40,-30,-30,-20,
 -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20,
];

const PST: Record<string, number[]> = {
  p: PST_PAWN,
  n: PST_KNIGHT,
  b: PST_BISHOP,
  r: PST_ROOK,
  q: PST_QUEEN,
  k: PST_KING_MID,
};

/** Mirror index vertically for black pieces */
function mirrorIndex(idx: number): number {
  const rank = Math.floor(idx / 8);
  const file = idx % 8;
  return (7 - rank) * 8 + file;
}

/**
 * Evaluate a chess position. Returns centipawns from white's perspective.
 * Uses material counting + piece-square tables + seed-based noise for realism.
 */
export function evaluatePosition(fen: string, seed = 1): PositionEval {
  const chess = new Chess(fen);
  const board = chess.board();
  let score = 0;

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (!piece) continue;

      const type = piece.type;
      const isWhite = piece.color === "w";
      const idx = rank * 8 + file;

      // Material value
      const material = PIECE_VALUES[type] || 0;
      // Positional value from piece-square table
      const pst = PST[type];
      const positional = pst ? pst[isWhite ? idx : mirrorIndex(idx)] : 0;

      const pieceScore = material + positional;
      score += isWhite ? pieceScore : -pieceScore;
    }
  }

  // Add seed-based noise for realism (±15cp)
  const rng = seedRandom(seed + hashFen(fen));
  const noise = (rng() - 0.5) * 30;
  score = Math.round(score + noise);

  // Check/checkmate/stalemate adjustments
  if (chess.isCheckmate()) {
    score = chess.turn() === "w" ? -30000 : 30000;
  } else if (chess.isStalemate() || chess.isDraw()) {
    score = 0;
  }

  const display = formatEval(score);
  const depth = 20 + Math.floor((rng() * 6));

  return { cp: score, display, depth };
}

/** Simple FEN hash for deterministic noise */
function hashFen(fen: string): number {
  let hash = 0;
  for (let i = 0; i < fen.length; i++) {
    hash = ((hash << 5) - hash + fen.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Format centipawn score as display string */
function formatEval(cp: number): string {
  if (cp >= 30000) return "#";
  if (cp <= -30000) return "-#";
  const pawns = cp / 100;
  if (pawns >= 0) return `+${pawns.toFixed(1)}`;
  return pawns.toFixed(1);
}

/**
 * Classify a move based on centipawn loss.
 * cpBefore and cpAfter are from white's perspective.
 * isWhiteMove indicates whose move it was.
 */
export function classifyMove(cpBefore: number, cpAfter: number, isWhiteMove: boolean): MoveClassification {
  // Calculate cp loss from the moving player's perspective
  const lossBefore = isWhiteMove ? cpBefore : -cpBefore;
  const lossAfter = isWhiteMove ? cpAfter : -cpAfter;
  const cpLoss = lossBefore - lossAfter;

  if (cpLoss < -50) return "brilliant"; // improved position significantly beyond expectation
  if (cpLoss < -10) return "great";
  if (cpLoss <= 0) return "best";
  if (cpLoss <= 30) return "good";
  if (cpLoss <= 60) return "inaccuracy";
  if (cpLoss <= 150) return "mistake";
  return "blunder";
}

/**
 * Evaluate all moves in a game sequence.
 * Returns annotated moves with eval and classification for each.
 */
const DEFAULT_START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function evaluateGameMoves(moves: string[], seed = 1, startFen?: string): AnnotatedMove[] {
  if (moves.length === 0) return [];

  const isStandardStart = !startFen || startFen === DEFAULT_START_FEN;
  const chess = startFen ? new Chess(startFen) : new Chess();
  const annotated: AnnotatedMove[] = [];
  let prevEval = evaluatePosition(chess.fen(), seed);

  for (let i = 0; i < moves.length; i++) {
    try {
      const isWhiteMove = chess.turn() === "w";
      chess.move(moves[i]);
      const fen = chess.fen();
      const posEval = evaluatePosition(fen, seed);

      // First few moves of a well-known opening are "book" moves
      // Only applies when starting from the standard position
      const classification: MoveClassification = (isStandardStart && i < 6)
        ? "book"
        : classifyMove(prevEval.cp, posEval.cp, isWhiteMove);

      annotated.push({
        san: moves[i],
        fen,
        eval: posEval,
        classification,
      });

      prevEval = posEval;
    } catch {
      break;
    }
  }

  return annotated;
}
