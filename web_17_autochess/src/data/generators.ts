import { Chess } from "chess.js";
import type { Tournament, TournamentStanding, Player, Game, Puzzle, OpeningExplorerData, OpeningExplorerMove } from "@/shared/types";
import { COUNTRIES, PUZZLE_THEMES, GAME_TYPES, TOURNAMENT_STATUSES, PLAYER_TITLES } from "@/shared/constants";
import {
  OPENINGS, FIRST_NAMES, LAST_NAMES, CITIES, TOURNAMENT_NAME_PREFIXES,
  PUZZLE_FENS,
} from "./chess-data";
import { CITY_COORDINATES } from "./city-coordinates";

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
    const rating = randInt(1200, 2800, rng);

    // Assign title based on rating (realistic thresholds)
    let title: Player["title"] = "";
    const titleRoll = rng();
    if (rating >= 2500 && titleRoll < 0.85) title = "GM";
    else if (rating >= 2400 && titleRoll < 0.75) title = "IM";
    else if (rating >= 2300 && titleRoll < 0.65) title = "FM";
    else if (rating >= 2200 && titleRoll < 0.50) title = "CM";
    else if (rating >= 2300 && titleRoll < 0.30) title = "WGM";
    else if (rating >= 2200 && titleRoll < 0.25) title = "WIM";
    const rapidRating = rating + randInt(-80, 30, rng);
    const blitzRating = rating + randInt(-120, 20, rng);
    const gamesPlayed = randInt(50, 800, rng);
    // Ensure win + draw rates don't exceed 1.0
    const winRate = randFloat(0.25, 0.55, rng);
    const maxDrawRate = Math.min(0.40, 1.0 - winRate - 0.05);
    const drawRate = randFloat(0.10, maxDrawRate, rng);
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
    const startDay = randInt(1, 22, rng);
    const durationDays = gameType === "Classical" ? randInt(7, 14, rng) : randInt(2, 5, rng);
    // Calculate proper end date using Date arithmetic
    const startDateObj = new Date(startYear, startMonth - 1, startDay);
    const endDateObj = new Date(startDateObj.getTime() + durationDays * 86400000);
    const endYear = endDateObj.getFullYear();
    const endMonth = endDateObj.getMonth() + 1;
    const endDay = endDateObj.getDate();

    // Assign coordinates with small seeded jitter
    const baseCoords = CITY_COORDINATES[city] || [48.86, 2.35]; // fallback to Paris
    const lat = baseCoords[0] + (rng() - 0.5) * 0.5;
    const lng = baseCoords[1] + (rng() - 0.5) * 0.5;

    tournaments.push({
      id: i + 1,
      name: `${city} ${prefix} ${2024 + (i % 3)}`,
      location: city,
      country: country.name,
      countryCode: country.code,
      startDate: formatDate(startYear, startMonth, startDay),
      endDate: formatDate(endYear, endMonth, endDay),
      gameType,
      rounds,
      playerCount,
      eloMin,
      eloMax,
      status,
      description: `The ${city} ${prefix} brings together ${playerCount} top players for ${rounds} rounds of ${gameType.toLowerCase()} chess.`,
      lat,
      lng,
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
    // Performance rating: base rating + bonus based on score percentage
    const scorePercent = points / maxPoints;
    const performanceRating = Math.round(p.rating + (scorePercent - 0.5) * 400);

    standings.push({
      rank: 0,
      playerId: p.id,
      playerName: p.name,
      playerTitle: p.title,
      playerCountry: p.countryCode,
      rating: p.rating,
      performanceRating,
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

/**
 * Score a move for weighted random selection.
 * Higher scores = more likely to be chosen.
 * Heuristics approximate human-like play: central pawns in the opening,
 * piece development, castling, active middlegame play, pawn pushes in endgames.
 */
function scoreMove(san: string, halfMoveIndex: number): number {
  const phase = halfMoveIndex < 20 ? "opening" : halfMoveIndex < 60 ? "middlegame" : "endgame";

  const isCapture = san.includes("x");
  const isCheck = san.includes("+");
  if (san.includes("#")) return 1000; // always play checkmate

  const isCastling = san.startsWith("O-");
  const ch = san[0];
  const isPawn = ch >= "a" && ch <= "h";
  const isKnight = ch === "N";
  const isBishop = ch === "B";
  const isRook = ch === "R";
  const isQueen = ch === "Q";
  const isKing = ch === "K";

  // Extract destination square
  const clean = san.replace(/[+#=QRBN]/g, "");
  const m = clean.match(/([a-h])([1-8])$/);
  const file = m ? m[1] : "";
  const rank = m ? Number.parseInt(m[2]) : 0;
  const isCenter = (file === "d" || file === "e") && (rank === 4 || rank === 5);
  const isExtCenter = file >= "c" && file <= "f" && rank >= 3 && rank <= 6;
  const isEdge = file === "a" || file === "h";

  let score = 1;

  if (phase === "opening") {
    if (isCastling) score = 25;
    else if (isPawn && isCenter) score = 15;
    else if (isPawn && isExtCenter) score = 8;
    else if (isKnight && isExtCenter) score = 12;
    else if (isKnight && isEdge) score = 1;
    else if (isKnight) score = 6;
    else if (isBishop && isExtCenter) score = 10;
    else if (isBishop) score = 7;
    else if (isPawn) score = 3;
    else if (isRook) score = 2;
    else if (isQueen) score = 1;
    else if (isKing) score = 0.5;
    if (isCapture) score *= 2;
    if (isCheck) score *= 2;
    if (isEdge && !isCastling) score *= 0.3;
  } else if (phase === "middlegame") {
    if (isCastling) score = 15;
    else if (isCapture && isCheck) score = 12;
    else if (isCheck) score = 10;
    else if (isCapture) score = 8;
    else if (isKnight && isExtCenter) score = 7;
    else if (isRook) score = 5;
    else if (isBishop) score = 5;
    else if (isQueen && isExtCenter) score = 5;
    else if (isPawn && isExtCenter) score = 5;
    else if (isKnight) score = 4;
    else if (isQueen) score = 3;
    else if (isPawn) score = 3;
    else if (isKing) score = 1;
    if (isEdge) score *= 0.6;
  } else {
    // Endgame: push pawns, centralize king, activate rooks
    if (isCheck) score = 10;
    else if (isCapture) score = 9;
    else if (isPawn) score = 8;
    else if (isKing && isExtCenter) score = 7;
    else if (isRook) score = 6;
    else if (isQueen) score = 5;
    else if (isKing) score = 4;
    else if (isBishop) score = 4;
    else if (isKnight) score = 4;
  }

  return Math.max(0.1, score);
}

interface MoveSequenceResult {
  moves: string[];
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  turn: "w" | "b";
}

function generateMoveSequence(moveCount: number, rng: () => number): MoveSequenceResult {
  const chess = new Chess();
  const moves: string[] = [];
  const targetHalfMoves = moveCount * 2;

  for (let m = 0; m < targetHalfMoves; m++) {
    const legalMoves = chess.moves();
    if (legalMoves.length === 0) break;

    // Weighted random selection based on strategic heuristics
    const weights = legalMoves.map((mv) => scoreMove(mv, m));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = rng() * totalWeight;
    let chosen = legalMoves[legalMoves.length - 1];
    for (let i = 0; i < legalMoves.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        chosen = legalMoves[i];
        break;
      }
    }

    chess.move(chosen);
    moves.push(chosen);
    if (chess.isGameOver()) break;
  }

  return {
    moves,
    isCheckmate: chess.isCheckmate(),
    isStalemate: chess.isStalemate(),
    isDraw: chess.isDraw(),
    turn: chess.turn(),
  };
}

export function generateGames(tournaments: Tournament[], players: Player[], count: number, seed: number): Game[] {
  const rng = seedRandom(seed + 4000);
  const games: Game[] = [];

  for (let i = 0; i < count; i++) {
    const tournament = pick(tournaments, rng);
    const round = randInt(1, tournament.rounds, rng);
    const opening = pick(OPENINGS, rng);
    // Realistic result distribution: white wins ~37%, black wins ~28%, draws ~35%
    const resultRoll = rng();
    const result: Game["result"] = resultRoll < 0.37 ? "1-0" : resultRoll < 0.65 ? "0-1" : "1/2-1/2";
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

    const seq = generateMoveSequence(moveCount, rng);
    const actualMoveCount = Math.ceil(seq.moves.length / 2);

    // Derive result from actual play when game ended decisively
    let finalResult = result;
    if (seq.isCheckmate) {
      finalResult = seq.turn === "w" ? "0-1" : "1-0";
    } else if (seq.isStalemate || seq.isDraw) {
      finalResult = "1/2-1/2";
    }

    games.push({
      id: i + 1,
      tournamentId: tournament.id,
      round,
      whitePlayer: { id: wp.id, name: wp.name, rating: wp.rating },
      blackPlayer: { id: bp.id, name: bp.name, rating: bp.rating },
      result: finalResult,
      opening: opening.name,
      eco: opening.eco,
      moves: seq.moves,
      date: formatDate(year, month, day),
      moveCount: actualMoveCount,
    });
  }

  return games;
}

// ============================================================================
// Puzzle Generator
// ============================================================================

export function generatePuzzles(count: number, seed: number, theme?: string): Puzzle[] {
  const rng = seedRandom(seed + 5000);
  const filteredFens = theme
    ? PUZZLE_FENS.filter((f) => f.theme === theme)
    : PUZZLE_FENS;
  const fenPool = filteredFens.length > 0 ? filteredFens : PUZZLE_FENS;
  const puzzles: Puzzle[] = [];

  for (let i = 0; i < count; i++) {
    const fenData = fenPool[i % fenPool.length];
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

export function generatePuzzleThemeCounts(seed: number): Record<string, number> {
  const rng = seedRandom(seed + 6000);
  const counts: Record<string, number> = {};
  const allThemes = new Set(PUZZLE_FENS.map((f) => f.theme));
  for (const theme of allThemes) {
    const base = PUZZLE_FENS.filter((f) => f.theme === theme).length;
    counts[theme] = base * randInt(8, 25, rng);
  }
  return counts;
}

// ============================================================================
// Game Position Generator (for analysis board)
// ============================================================================

/**
 * Generate a sequence of board positions for a game's moves.
 * Replays the game's SAN moves through chess.js to produce valid FENs.
 */
export function generateGamePositions(moves: string[], startFen?: string): string[] {
  const chess = startFen ? new Chess(startFen) : new Chess();
  const positions: string[] = [];

  for (const move of moves) {
    try {
      chess.move(move);
      positions.push(chess.fen());
    } catch {
      // If a move is invalid, stop — remaining positions won't exist
      break;
    }
  }

  return positions;
}

// ============================================================================
// Opening Book Generator (for analysis board)
// ============================================================================

/** Strip halfmove and fullmove counters from FEN for position-only keying */
export function stripMoveCounters(fen: string): string {
  const parts = fen.split(" ");
  return parts.slice(0, 4).join(" ");
}

/**
 * Build an opening book from a set of games.
 * Replays the first `maxPly` half-moves of each game through chess.js,
 * tracking which moves were played from each position and what the game result was.
 * Returns a Map keyed by position-only FEN.
 */
export function generateOpeningBook(
  games: Game[],
  seed: number,
  maxPly = 30,
): Map<string, OpeningExplorerData> {
  const book = new Map<string, {
    moves: Map<string, { games: number; whiteWins: number; draws: number; blackWins: number }>;
    openingName?: string;
    eco?: string;
  }>();

  for (const game of games) {
    const chess = new Chess();
    const movesToReplay = Math.min(game.moves.length, maxPly);

    for (let i = 0; i < movesToReplay; i++) {
      const fenKey = stripMoveCounters(chess.fen());

      // Ensure entry exists
      let entry = book.get(fenKey);
      if (!entry) {
        entry = { moves: new Map() };
        book.set(fenKey, entry);
      }

      // Store opening name/eco on starting positions
      if (i <= 4 && game.opening) {
        entry.openingName = game.opening;
        entry.eco = game.eco;
      }

      const san = game.moves[i];
      let moveStats = entry.moves.get(san);
      if (!moveStats) {
        moveStats = { games: 0, whiteWins: 0, draws: 0, blackWins: 0 };
        entry.moves.set(san, moveStats);
      }
      moveStats.games++;
      if (game.result === "1-0") moveStats.whiteWins++;
      else if (game.result === "0-1") moveStats.blackWins++;
      else moveStats.draws++;

      try {
        chess.move(san);
      } catch {
        break;
      }
    }
  }

  // Convert to OpeningExplorerData
  const result = new Map<string, OpeningExplorerData>();
  for (const [fen, entry] of book) {
    const totalGames = Array.from(entry.moves.values()).reduce((sum, m) => sum + m.games, 0);
    const moves: OpeningExplorerMove[] = Array.from(entry.moves.entries())
      .map(([san, stats]) => ({
        san,
        games: stats.games,
        whiteWins: stats.whiteWins,
        draws: stats.draws,
        blackWins: stats.blackWins,
        percentPlayed: totalGames > 0 ? Math.round((stats.games / totalGames) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 8);

    result.set(fen, {
      openingName: entry.openingName,
      eco: entry.eco,
      totalGames,
      moves,
    });
  }

  return result;
}

// ============================================================================
// Convenience: Generate all data for a seed
// ============================================================================

export function generateAllData(seed: number) {
  const players = generatePlayers(50, seed);
  const tournaments = generateTournaments(50, seed);
  const games = generateGames(tournaments, players, 50, seed);
  const puzzles = generatePuzzles(100, seed);

  return { players, tournaments, games, puzzles };
}
