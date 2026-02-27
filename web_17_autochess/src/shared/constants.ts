export const APP_NAME = "AutoChess";
export const APP_DESCRIPTION = "Chess Tournament Platform & Tactics Trainer";

export const GAME_TYPES = ["Classical", "Rapid", "Blitz"] as const;
export const TOURNAMENT_STATUSES = ["upcoming", "active", "completed"] as const;
export const PLAYER_TITLES = ["", "GM", "IM", "FM", "CM", "WGM", "WIM", "WFM"] as const;

export const PUZZLE_THEMES = [
  "Fork",
  "Pin",
  "Skewer",
  "Discovery",
  "Mate in 1",
  "Mate in 2",
  "Mate in 3",
  "Deflection",
  "Decoy",
  "Sacrifice",
  "Trapped Piece",
  "Zugzwang",
  "Back Rank",
  "Overloaded Piece",
  "Clearance",
] as const;

export const PUZZLE_THEME_CATEGORIES = [
  {
    name: "Phases",
    description: "Puzzles organized by game phase",
    themes: [
      { key: "Opening", name: "Opening", description: "Tactical opportunities in the opening phase" },
      { key: "Middlegame", name: "Middlegame", description: "Complex middlegame combinations" },
      { key: "Endgame", name: "Endgame", description: "Precise endgame technique" },
      { key: "Pawn Endgame", name: "Pawn Endgame", description: "King and pawn endgame puzzles" },
      { key: "Rook Endgame", name: "Rook Endgame", description: "Rook endgame positions" },
    ],
  },
  {
    name: "Motifs",
    description: "Common tactical patterns",
    themes: [
      { key: "Fork", name: "Fork", description: "Attack two or more pieces simultaneously" },
      { key: "Pin", name: "Pin", description: "Restrict a piece from moving by pinning it to a more valuable piece" },
      { key: "Skewer", name: "Skewer", description: "Attack a valuable piece that must move, exposing another behind it" },
      { key: "Discovery", name: "Discovery", description: "Move a piece to reveal an attack from another piece" },
      { key: "Sacrifice", name: "Sacrifice", description: "Give up material for a stronger position or attack" },
      { key: "Deflection", name: "Deflection", description: "Force a defending piece away from its protective duty" },
      { key: "Decoy", name: "Decoy", description: "Lure an opponent's piece to a disadvantageous square" },
    ],
  },
  {
    name: "Mates",
    description: "Checkmate patterns",
    themes: [
      { key: "Mate in 1", name: "Mate in 1", description: "Find the checkmate in one move" },
      { key: "Mate in 2", name: "Mate in 2", description: "Find the checkmate in two moves" },
      { key: "Mate in 3", name: "Mate in 3", description: "Find the checkmate in three moves" },
      { key: "Back Rank", name: "Back Rank", description: "Exploit a back rank weakness for checkmate" },
      { key: "Smothered Mate", name: "Smothered Mate", description: "Checkmate with a knight while the king is trapped by own pieces" },
    ],
  },
  {
    name: "Advanced",
    description: "Advanced tactical concepts",
    themes: [
      { key: "Zugzwang", name: "Zugzwang", description: "Put the opponent in a position where any move worsens their position" },
      { key: "Trapped Piece", name: "Trapped Piece", description: "Trap an opponent's piece with no escape" },
      { key: "Overloaded Piece", name: "Overloaded Piece", description: "Exploit a piece that has too many defensive duties" },
      { key: "Clearance", name: "Clearance", description: "Move a piece to clear a square or line for another piece" },
      { key: "Interference", name: "Interference", description: "Block a defensive line or communication between pieces" },
    ],
  },
] as const;

export const COUNTRIES: { name: string; code: string }[] = [
  { name: "Russia", code: "RU" },
  { name: "United States", code: "US" },
  { name: "China", code: "CN" },
  { name: "India", code: "IN" },
  { name: "Norway", code: "NO" },
  { name: "France", code: "FR" },
  { name: "Germany", code: "DE" },
  { name: "England", code: "GB" },
  { name: "Spain", code: "ES" },
  { name: "Netherlands", code: "NL" },
  { name: "Poland", code: "PL" },
  { name: "Ukraine", code: "UA" },
  { name: "Armenia", code: "AM" },
  { name: "Azerbaijan", code: "AZ" },
  { name: "Hungary", code: "HU" },
  { name: "Czech Republic", code: "CZ" },
  { name: "Israel", code: "IL" },
  { name: "Iran", code: "IR" },
  { name: "Cuba", code: "CU" },
  { name: "Philippines", code: "PH" },
  { name: "Vietnam", code: "VN" },
  { name: "Indonesia", code: "ID" },
  { name: "Argentina", code: "AR" },
  { name: "Brazil", code: "BR" },
  { name: "Peru", code: "PE" },
  { name: "Romania", code: "RO" },
  { name: "Serbia", code: "RS" },
  { name: "Croatia", code: "HR" },
  { name: "Georgia", code: "GE" },
  { name: "Uzbekistan", code: "UZ" },
  { name: "Turkey", code: "TR" },
  { name: "Italy", code: "IT" },
  { name: "Sweden", code: "SE" },
  { name: "Australia", code: "AU" },
  { name: "Canada", code: "CA" },
  { name: "Egypt", code: "EG" },
  { name: "South Africa", code: "ZA" },
  { name: "Japan", code: "JP" },
  { name: "South Korea", code: "KR" },
  { name: "Greece", code: "GR" },
];
