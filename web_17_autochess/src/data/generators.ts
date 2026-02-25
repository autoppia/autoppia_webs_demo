import type { Tournament, TournamentStanding, Player, Game, Puzzle } from "@/shared/types";
import { COUNTRIES, PUZZLE_THEMES, GAME_TYPES, TOURNAMENT_STATUSES, PLAYER_TITLES } from "@/shared/constants";
import {
  OPENINGS, FIRST_NAMES, LAST_NAMES, CITIES, TOURNAMENT_NAME_PREFIXES,
  PUZZLE_FENS, PAWN_MOVES, KNIGHT_MOVES, BISHOP_MOVES, ROOK_MOVES,
  QUEEN_MOVES, CASTLING_MOVES,
} from "./chess-data";

// Linear Congruential Generator for deterministic random numbers
export function seedRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function pick<T>(arr: readonly T[] | T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickIndex(count: number, rng: () => number): number {
  return Math.floor(rng() * count);
}

function randInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, rng: () => number): number {
  return rng() * (max - min) + min;
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ============================================================================
// Player Generator
// ============================================================================

export function generatePlayers(count: number, seed: number): Player[] {
  const rng = seedRandom(seed + 1000);
  const players: Player[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = pick(FIRST_NAMES, rng);
    const lastName = pick(LAST_NAMES, rng);
    const country = pick(COUNTRIES, rng);
    const titleRoll = rng();
    let title: Player["title"] = "";
    if (titleRoll < 0.08) title = "GM";
    else if (titleRoll < 0.16) title = "IM";
    else if (titleRoll < 0.25) title = "FM";
    else if (titleRoll < 0.30) title = "CM";
    else if (titleRoll < 0.33) title = "WGM";
    else if (titleRoll < 0.36) title = "WIM";

    const rating = randInt(1200, 2800, rng);
    const rapidRating = rating + randInt(-100, 50, rng);
    const blitzRating = rating + randInt(-150, 80, rng);
    const gamesPlayed = randInt(50, 800, rng);
    const winRate = randFloat(0.3, 0.65, rng);
    const drawRate = randFloat(0.15, 0.35, rng);
    const wins = Math.floor(gamesPlayed * winRate);
    const draws = Math.floor(gamesPlayed * drawRate);
    const losses = gamesPlayed - wins - draws;
    const bestRating = rating + randInt(0, 150, rng);

    const joinYear = randInt(2010, 2024, rng);
    const joinMonth = randInt(1, 12, rng);
    const joinDay = randInt(1, 28, rng);

    // Generate rating history (12-24 points)
    const historyLen = randInt(12, 24, rng);
    const ratingHistory: { date: string; rating: number }[] = [];
    let histRating = rating - randInt(50, 200, rng);
    for (let h = 0; h < historyLen; h++) {
      const year = 2022 + Math.floor(h / 12);
      const month = (h % 12) + 1;
      histRating = Math.max(1000, Math.min(2850, histRating + randInt(-30, 40, rng)));
      ratingHistory.push({
        date: formatDate(year, month, 15),
        rating: histRating,
      });
    }

    players.push({
      id: i + 1,
      name: `${firstName} ${lastName}`,
      country: country.name,
      countryCode: country.code,
      title,
      rating,
      rapidRating: Math.max(1000, rapidRating),
      blitzRating: Math.max(1000, blitzRating),
      gamesPlayed,
      wins,
      draws,
      losses: Math.max(0, losses),
      joinDate: formatDate(joinYear, joinMonth, joinDay),
      bestRating,
      ratingHistory,
    });
  }

  // Sort by rating descending
  players.sort((a, b) => b.rating - a.rating);
  // Reassign IDs after sort
  for (let i = 0; i < players.length; i++) {
    players[i].id = i + 1;
  }

  return players;
}

// ============================================================================
// Tournament Generator
// ============================================================================

export function generateTournaments(count: number, seed: number): Tournament[] {
  const rng = seedRandom(seed + 2000);
  const tournaments: Tournament[] = [];

  for (let i = 0; i < count; i++) {
    const city = pick(CITIES, rng);
    const country = pick(COUNTRIES, rng);
    const prefix = pick(TOURNAMENT_NAME_PREFIXES, rng);
    const gameType = pick(GAME_TYPES, rng);
    const status = pick(TOURNAMENT_STATUSES, rng);
    const rounds = gameType === "Blitz" ? randInt(7, 11, rng) : randInt(5, 13, rng);
    const playerCount = randInt(8, 128, rng);
    const eloMin = randInt(1200, 2200, rng);
    const eloMax = eloMin + randInt(200, 600, rng);

    const startYear = status === "upcoming" ? 2026 : randInt(2024, 2025, rng);
    const startMonth = randInt(1, 12, rng);
    const startDay = randInt(1, 25, rng);
    const durationDays = gameType === "Classical" ? randInt(7, 14, rng) : randInt(2, 5, rng);
    const endDay = Math.min(28, startDay + durationDays);

    tournaments.push({
      id: i + 1,
      name: `${city} ${prefix} ${2024 + (i % 3)}`,
      location: city,
      country: country.name,
      countryCode: country.code,
      startDate: formatDate(startYear, startMonth, startDay),
      endDate: formatDate(startYear, startMonth, endDay),
      gameType,
      rounds,
      playerCount,
      eloMin,
      eloMax,
      status,
      description: `The ${city} ${prefix} brings together ${playerCount} top players for ${rounds} rounds of ${gameType.toLowerCase()} chess.`,
    });
  }

  return tournaments;
}

// ============================================================================
// Tournament Standings Generator
// ============================================================================

export function generateStandings(tournament: Tournament, players: Player[], seed: number): TournamentStanding[] {
  const rng = seedRandom(seed + 3000 + tournament.id);
  const standingCount = Math.min(tournament.playerCount, players.length, 32);
  const standings: TournamentStanding[] = [];

  // Pick random players for this tournament
  const usedIds = new Set<number>();
  const tournamentPlayers: Player[] = [];
  while (tournamentPlayers.length < standingCount) {
    const idx = pickIndex(players.length, rng);
    if (!usedIds.has(players[idx].id)) {
      usedIds.add(players[idx].id);
      tournamentPlayers.push(players[idx]);
    }
  }

  for (let i = 0; i < standingCount; i++) {
    const p = tournamentPlayers[i];
    const maxPoints = tournament.rounds;
    const winCount = randInt(0, Math.min(maxPoints, Math.floor(maxPoints * 0.7)), rng);
    const drawCount = randInt(0, Math.min(maxPoints - winCount, Math.floor(maxPoints * 0.4)), rng);
    const lossCount = maxPoints - winCount - drawCount;
    const points = winCount + drawCount * 0.5;

    standings.push({
      rank: 0,
      playerId: p.id,
      playerName: p.name,
      playerCountry: p.countryCode,
      rating: p.rating,
      points,
      wins: winCount,
      draws: drawCount,
      losses: Math.max(0, lossCount),
      tiebreak: Math.round(randFloat(5, 30, rng) * 10) / 10,
    });
  }

  // Sort by points descending, then tiebreak
  standings.sort((a, b) => b.points - a.points || b.tiebreak - a.tiebreak);
  for (let i = 0; i < standings.length; i++) {
    standings[i].rank = i + 1;
  }

  return standings;
}

// ============================================================================
// Game Generator
// ============================================================================

function generateMoveSequence(moveCount: number, rng: () => number): string[] {
  const moves: string[] = [];
  const allOpeningMoves = [...PAWN_MOVES, ...KNIGHT_MOVES, ...BISHOP_MOVES];
  const allMiddleMoves = [...PAWN_MOVES, ...KNIGHT_MOVES, ...BISHOP_MOVES, ...ROOK_MOVES, ...QUEEN_MOVES];

  for (let m = 0; m < moveCount * 2; m++) {
    if (m < 8) {
      // Opening phase
      moves.push(pick(allOpeningMoves, rng));
    } else if (m < moveCount) {
      // Middle game
      if (rng() < 0.05) {
        moves.push(pick(CASTLING_MOVES, rng));
      } else {
        moves.push(pick(allMiddleMoves, rng));
      }
    } else {
      // Endgame
      moves.push(pick([...ROOK_MOVES, ...QUEEN_MOVES, ...PAWN_MOVES], rng));
    }
  }

  return moves.slice(0, moveCount * 2);
}

export function generateGames(tournaments: Tournament[], players: Player[], count: number, seed: number): Game[] {
  const rng = seedRandom(seed + 4000);
  const games: Game[] = [];

  for (let i = 0; i < count; i++) {
    const tournament = pick(tournaments, rng);
    const round = randInt(1, tournament.rounds, rng);
    const opening = pick(OPENINGS, rng);
    const resultRoll = rng();
    const result: Game["result"] = resultRoll < 0.4 ? "1-0" : resultRoll < 0.8 ? "0-1" : "1/2-1/2";
    const moveCount = randInt(20, 65, rng);

    const whiteIdx = pickIndex(players.length, rng);
    let blackIdx = pickIndex(players.length, rng);
    while (blackIdx === whiteIdx) {
      blackIdx = pickIndex(players.length, rng);
    }

    const wp = players[whiteIdx];
    const bp = players[blackIdx];

    const year = randInt(2024, 2025, rng);
    const month = randInt(1, 12, rng);
    const day = randInt(1, 28, rng);

    games.push({
      id: i + 1,
      tournamentId: tournament.id,
      round,
      whitePlayer: { id: wp.id, name: wp.name, rating: wp.rating },
      blackPlayer: { id: bp.id, name: bp.name, rating: bp.rating },
      result,
      opening: opening.name,
      eco: opening.eco,
      moves: generateMoveSequence(moveCount, rng),
      date: formatDate(year, month, day),
      moveCount,
    });
  }

  return games;
}

// ============================================================================
// Puzzle Generator
// ============================================================================

export function generatePuzzles(count: number, seed: number): Puzzle[] {
  const rng = seedRandom(seed + 5000);
  const puzzles: Puzzle[] = [];

  for (let i = 0; i < count; i++) {
    const fenData = PUZZLE_FENS[i % PUZZLE_FENS.length];
    const rating = randInt(800, 2800, rng);

    puzzles.push({
      id: i + 1,
      fen: fenData.fen,
      solution: fenData.solution,
      rating,
      theme: fenData.theme,
      toMove: fenData.toMove,
    });
  }

  return puzzles;
}

// ============================================================================
// Game Position Generator (for analysis board)
// ============================================================================

function boardToFEN(board: (string | null)[][], moveIndex: number): string {
  const rows: string[] = [];
  for (const row of board) {
    let fenRow = "";
    let empty = 0;
    for (const sq of row) {
      if (sq === null) {
        empty++;
      } else {
        if (empty > 0) { fenRow += empty; empty = 0; }
        fenRow += sq;
      }
    }
    if (empty > 0) fenRow += empty;
    rows.push(fenRow);
  }
  const color = moveIndex % 2 === 0 ? "b" : "w";
  return `${rows.join("/")} ${color} KQkq - 0 ${Math.floor(moveIndex / 2) + 1}`;
}

/**
 * Generate a sequence of board positions for visual display in the analysis page.
 * Since moves are pseudo-random algebraic notation (not real valid moves),
 * we generate plausible-looking board states by making pseudo-random piece
 * movements on the actual board array.
 */
export function generateGamePositions(gameId: number, totalMoves: number): string[] {
  const rng = seedRandom(gameId * 7919);
  const positions: string[] = [];

  const board: (string | null)[][] = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"],
  ];

  const isWhitePiece = (p: string) => p === p.toUpperCase();

  for (let m = 0; m < totalMoves; m++) {
    const isWhiteTurn = m % 2 === 0;

    // Collect moveable pieces (current side, excluding king)
    const candidates: [number, number][] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.toLowerCase() !== "k" && isWhitePiece(p) === isWhiteTurn) {
          candidates.push([r, c]);
        }
      }
    }

    if (candidates.length === 0) {
      positions.push(boardToFEN(board, m));
      continue;
    }

    // Pick a random piece
    const [fr, fc] = candidates[Math.floor(rng() * candidates.length)];
    const piece = board[fr][fc]!;

    // Pick a valid destination (not same square, not own piece, not king)
    let tr = -1;
    let tc = -1;
    for (let attempt = 0; attempt < 30; attempt++) {
      const r = Math.floor(rng() * 8);
      const c = Math.floor(rng() * 8);
      if (r === fr && c === fc) continue;
      const target = board[r][c];
      if (target?.toLowerCase() === "k") continue;
      if (target && isWhitePiece(target) === isWhiteTurn) continue;
      tr = r;
      tc = c;
      break;
    }

    if (tr >= 0) {
      board[fr][fc] = null;
      board[tr][tc] = piece;
    }

    positions.push(boardToFEN(board, m));
  }

  return positions;
}

// ============================================================================
// Convenience: Generate all data for a seed
// ============================================================================

export function generateAllData(seed: number) {
  const players = generatePlayers(200, seed);
  const tournaments = generateTournaments(50, seed);
  const games = generateGames(tournaments, players, 500, seed);
  const puzzles = generatePuzzles(100, seed);

  return { players, tournaments, games, puzzles };
}
