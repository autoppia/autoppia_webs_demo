export interface Tournament {
  id: number;
  name: string;
  location: string;
  country: string;
  countryCode: string;
  startDate: string;
  endDate: string;
  gameType: "Classical" | "Rapid" | "Blitz";
  rounds: number;
  playerCount: number;
  eloMin: number;
  eloMax: number;
  status: "upcoming" | "active" | "completed";
  description: string;
  lat: number;
  lng: number;
}

export interface TournamentStanding {
  rank: number;
  playerId: number;
  playerName: string;
  playerTitle: string;
  playerCountry: string;
  rating: number;
  performanceRating: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  tiebreak: number;
}

export interface Player {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  title: "" | "GM" | "IM" | "FM" | "CM" | "WGM" | "WIM" | "WFM";
  rating: number;
  rapidRating: number;
  blitzRating: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  joinDate: string;
  bestRating: number;
  ratingHistory: { date: string; rating: number }[];
}

export interface Game {
  id: number;
  tournamentId: number;
  round: number;
  whitePlayer: { id: number; name: string; rating: number };
  blackPlayer: { id: number; name: string; rating: number };
  result: "1-0" | "0-1" | "1/2-1/2";
  opening: string;
  eco: string;
  moves: string[];
  date: string;
  moveCount: number;
}

export interface Puzzle {
  id: number;
  fen: string;
  solution: string[];
  rating: number;
  theme: string;
  toMove: "white" | "black";
}

export interface SeedContextType {
  seed: number;
  setSeed: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
}

export interface PuzzleThemeInfo {
  key: string;
  name: string;
  description: string;
  count: number;
}

export interface PuzzleThemeCategory {
  name: string;
  description: string;
  themes: PuzzleThemeInfo[];
}

export interface MoveHistoryEntry {
  type: "info" | "correct" | "incorrect" | "opponent" | "solved" | "hint";
  message: string;
  move?: string;
}

// ============================================================================
// Analysis Board Types
// ============================================================================

export interface PositionEval {
  cp: number;
  display: string;
  bestMove?: string;
  depth: number;
}

export type MoveClassification = "brilliant" | "great" | "best" | "good" | "inaccuracy" | "mistake" | "blunder" | "book";

export interface AnnotatedMove {
  san: string;
  fen: string;
  eval: PositionEval;
  classification?: MoveClassification;
}

export interface OpeningExplorerMove {
  san: string;
  games: number;
  whiteWins: number;
  draws: number;
  blackWins: number;
  percentPlayed: number;
}

export interface OpeningExplorerData {
  openingName?: string;
  eco?: string;
  totalGames: number;
  moves: OpeningExplorerMove[];
}
