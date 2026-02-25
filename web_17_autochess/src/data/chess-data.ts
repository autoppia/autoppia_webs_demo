export const OPENINGS: { name: string; eco: string }[] = [
  { name: "Sicilian Defense", eco: "B20" },
  { name: "French Defense", eco: "C00" },
  { name: "Caro-Kann Defense", eco: "B10" },
  { name: "Italian Game", eco: "C50" },
  { name: "Ruy Lopez", eco: "C60" },
  { name: "Queen's Gambit Declined", eco: "D30" },
  { name: "Queen's Gambit Accepted", eco: "D20" },
  { name: "Slav Defense", eco: "D10" },
  { name: "King's Indian Defense", eco: "E60" },
  { name: "Nimzo-Indian Defense", eco: "E20" },
  { name: "English Opening", eco: "A10" },
  { name: "Catalan Opening", eco: "E00" },
  { name: "Dutch Defense", eco: "A80" },
  { name: "Pirc Defense", eco: "B07" },
  { name: "Scandinavian Defense", eco: "B01" },
  { name: "Alekhine's Defense", eco: "B02" },
  { name: "Grunfeld Defense", eco: "D70" },
  { name: "Benoni Defense", eco: "A60" },
  { name: "Vienna Game", eco: "C25" },
  { name: "Scotch Game", eco: "C45" },
  { name: "Petrov's Defense", eco: "C42" },
  { name: "London System", eco: "D00" },
  { name: "King's Gambit", eco: "C30" },
  { name: "Bird's Opening", eco: "A02" },
  { name: "Philidor Defense", eco: "C41" },
  { name: "Giuoco Piano", eco: "C53" },
  { name: "Four Knights Game", eco: "C46" },
  { name: "Semi-Slav Defense", eco: "D43" },
  { name: "Tarrasch Defense", eco: "D32" },
  { name: "Budapest Gambit", eco: "A51" },
];

export const FIRST_NAMES = [
  "Magnus", "Fabiano", "Ding", "Ian", "Alireza", "Hikaru", "Anish",
  "Levon", "Wesley", "Maxime", "Sergey", "Alexander", "Viswanathan",
  "Shakhriyar", "Teimour", "Boris", "Vladimir", "Peter", "Vassily",
  "Richard", "Pentala", "Wang", "Yu", "Wei", "Gukesh", "Rameshbabu",
  "Jan-Krzysztof", "Nikita", "Daniil", "Andrey", "Dmitry",
  "Vladislav", "Nodirbek", "Praggnanandhaa", "Arjun", "Vincent",
  "Liem", "Sam", "Hans", "Daniel", "Jeffery", "Dommaraju",
  "Parham", "Santosh", "Mikhail", "Garry", "Anatoly", "Viktor",
  "Emanuel", "Jose", "Tigran", "Bobby", "Vasyl", "Hou", "Ju",
  "Lei", "Kateryna", "Alexandra", "Nana", "Humpy", "Anna",
];

export const LAST_NAMES = [
  "Carlsen", "Caruana", "Liren", "Nepomniachtchi", "Firouzja",
  "Nakamura", "Giri", "Aronian", "So", "Vachier-Lagrave",
  "Karjakin", "Grischuk", "Anand", "Mamedyarov", "Radjabov",
  "Gelfand", "Kramnik", "Svidler", "Ivanchuk", "Rapport",
  "Harikrishna", "Hao", "Yangyi", "Yi", "Dommaraju",
  "Praggnanandhaa", "Duda", "Vitiugov", "Dubov", "Esipenko",
  "Andreikin", "Artemiev", "Abdusattorov", "Erigaisi", "Keymer",
  "Quang Liem", "Shankland", "Niemann", "Naroditsky", "Xiong",
  "Gukesh", "Maghsoodloo", "Vidit", "Tal", "Kasparov",
  "Karpov", "Korchnoi", "Lasker", "Capablanca", "Petrosian",
  "Fischer", "Ivanchuk", "Yifan", "Wenjun", "Tingjie",
  "Lagno", "Kosteniuk", "Dzagnidze", "Koneru", "Muzychuk",
];

export const CITIES = [
  "Moscow", "St. Petersburg", "London", "Paris", "Berlin", "Madrid",
  "Wijk aan Zee", "Stavanger", "Bucharest", "Baku", "Tbilisi",
  "New Delhi", "Chennai", "Beijing", "Hangzhou", "New York",
  "St. Louis", "Sao Paulo", "Buenos Aires", "Havana", "Reykjavik",
  "Tashkent", "Astana", "Dubai", "Doha", "Zagreb", "Belgrade",
  "Budapest", "Prague", "Warsaw", "Tel Aviv", "Tehran",
  "Amsterdam", "Rome", "Geneva", "Vienna", "Monaco",
  "Shamkir", "Dortmund", "Baden-Baden",
];

export const TOURNAMENT_NAME_PREFIXES = [
  "Grand Chess Tour", "International Open", "Masters", "Chess Classic",
  "Candidates Tournament", "Grand Prix", "Cup", "Memorial",
  "Championship", "Invitational", "Super Tournament", "Open",
  "Elite Tournament", "Festival", "Rapid Championship",
];

// Famous tactical puzzle positions (FEN format)
export const PUZZLE_FENS: { fen: string; solution: string[]; theme: string; toMove: "white" | "black" }[] = [
  { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4", solution: ["Qxf7#"], theme: "Mate in 1", toMove: "white" },
  { fen: "r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 2 2", solution: ["d5", "exd5", "Qxd5"], theme: "Fork", toMove: "black" },
  { fen: "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", solution: ["Ng5", "d5", "exd5"], theme: "Pin", toMove: "white" },
  { fen: "r2qkbnr/ppp2ppp/2np4/4p3/2B1P1b1/5N2/PPPP1PPP/RNBQ1RK1 w kq - 2 5", solution: ["Bxf7+", "Ke7", "d4"], theme: "Sacrifice", toMove: "white" },
  { fen: "r1b1k2r/ppppqppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 4 5", solution: ["Bg5", "h6", "Bxf6"], theme: "Pin", toMove: "white" },
  { fen: "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 3", solution: ["Qh4#"], theme: "Mate in 1", toMove: "black" },
  { fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4", solution: ["Qf7#"], theme: "Mate in 1", toMove: "white" },
  { fen: "rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2", solution: ["d5", "exd5", "e4"], theme: "Discovery", toMove: "black" },
  { fen: "r1bqkb1r/pppp1ppp/2n5/4p2n/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", solution: ["Nxe5", "Nxe5", "d4"], theme: "Fork", toMove: "white" },
  { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5", solution: ["Bg5", "Be7", "Nc3"], theme: "Skewer", toMove: "white" },
  { fen: "r1bqkbnr/pppppppp/2n5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2", solution: ["d5", "e5", "Bf5"], theme: "Deflection", toMove: "black" },
  { fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4", solution: ["e3", "O-O", "Bd3"], theme: "Trapped Piece", toMove: "white" },
  { fen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 6 6", solution: ["Na4", "Bb6", "Nxb6"], theme: "Decoy", toMove: "white" },
  { fen: "rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4", solution: ["Nf3", "Bg4", "Ne5"], theme: "Overloaded Piece", toMove: "white" },
  { fen: "r1bqk2r/ppp2ppp/2nb1n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 6", solution: ["exd5", "Nxd5", "Nxd5"], theme: "Clearance", toMove: "white" },
  { fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2", solution: ["exd5", "Qxd5", "Nc3"], theme: "Fork", toMove: "white" },
  { fen: "rnb1kbnr/ppppqppp/8/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 3", solution: ["Nc3", "Nf6", "d4"], theme: "Discovery", toMove: "white" },
  { fen: "r1bqkbnr/1ppp1ppp/p1n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4", solution: ["Ba2", "Nf6", "d4"], theme: "Sacrifice", toMove: "white" },
  { fen: "r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5", solution: ["d3", "d6", "Be3"], theme: "Zugzwang", toMove: "white" },
  { fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 6", solution: ["Be3", "e5", "d5"], theme: "Back Rank", toMove: "white" },
  { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", solution: ["Ng5", "d5", "exd5"], theme: "Pin", toMove: "white" },
  { fen: "rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5", solution: ["Bg5", "O-O", "e3"], theme: "Fork", toMove: "white" },
  { fen: "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQ - 4 4", solution: ["e4", "d6", "Nf3"], theme: "Skewer", toMove: "white" },
  { fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3", solution: ["a6", "Ba4", "Nf6"], theme: "Deflection", toMove: "black" },
  { fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3", solution: ["d3", "Bc5", "Nf3"], theme: "Decoy", toMove: "white" },
  { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 2 5", solution: ["Be2", "d6", "O-O"], theme: "Trapped Piece", toMove: "white" },
  { fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", solution: ["e5", "Nf3", "Nc6"], theme: "Clearance", toMove: "black" },
  { fen: "r1bqk2r/pppp1ppp/2n2n2/4p1B1/1b2P3/2N2N2/PPPP1PPP/R2QKB1R w KQkq - 6 5", solution: ["Nd5", "Nxd5", "exd5"], theme: "Back Rank", toMove: "white" },
  { fen: "rnbqk2r/ppp2ppp/3bpn2/3p4/2PP4/5NP1/PP2PPBP/RNBQK2R w KQkq - 2 5", solution: ["O-O", "O-O", "Nc3"], theme: "Overloaded Piece", toMove: "white" },
  { fen: "r1bqk2r/2ppbppp/p1n2n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQR1K1 w kq - 2 7", solution: ["d4", "d6", "c3"], theme: "Sacrifice", toMove: "white" },
  { fen: "rnbqkb1r/pp1ppppp/2p2n2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3", solution: ["Nc3", "d5", "Nf3"], theme: "Fork", toMove: "white" },
  { fen: "rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 2 6", solution: ["Bd3", "dxc4", "Bxc4"], theme: "Pin", toMove: "white" },
  { fen: "r1bqk2r/pppp1ppp/2n5/2b1p3/2BnP3/5N2/PPPP1PPP/RNBQK2R w KQkq - 6 5", solution: ["Nxd4", "Bxd4", "c3"], theme: "Discovery", toMove: "white" },
  { fen: "rnbq1rk1/pp2ppbp/2pp1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 0 7", solution: ["O-O", "e5", "dxe5"], theme: "Mate in 2", toMove: "white" },
  { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 b kq - 5 5", solution: ["d6", "Bg5", "h6"], theme: "Mate in 3", toMove: "black" },
  { fen: "rnbq1rk1/pppnppbp/3p2p1/8/2PPP3/2N5/PP2BPPP/R1BQK1NR w KQ - 4 5", solution: ["Nf3", "e5", "d5"], theme: "Zugzwang", toMove: "white" },
  { fen: "r1bqkbnr/pppp1p1p/2n3p1/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4", solution: ["d4", "exd4", "Nxd4"], theme: "Skewer", toMove: "white" },
  { fen: "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 4 5", solution: ["cxd5", "Nxd5", "e4"], theme: "Fork", toMove: "white" },
  { fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3", solution: ["Nc3", "Bb4", "Qc2"], theme: "Pin", toMove: "white" },
  { fen: "r1bq1rk1/pppnppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 4 6", solution: ["Be2", "e5", "O-O"], theme: "Deflection", toMove: "white" },
  { fen: "r1bqkbnr/pppppppp/2n5/8/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 2 2", solution: ["e5", "Qh5", "Qe7"], theme: "Mate in 2", toMove: "black" },
  { fen: "rnbq1rk1/pp2ppbp/2pp1np1/8/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 6", solution: ["Be2", "O-O", "O-O"], theme: "Discovery", toMove: "white" },
  { fen: "r1bqk2r/ppppnppp/2n5/2b1p3/4P3/2N2NP1/PPPP1PBP/R1BQK2R w KQkq - 4 5", solution: ["d3", "d6", "O-O"], theme: "Sacrifice", toMove: "white" },
  { fen: "rnbq1rk1/pp1pppbp/5np1/2p5/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 5", solution: ["O-O", "cxd4", "Nxd4"], theme: "Clearance", toMove: "white" },
  { fen: "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 2 5", solution: ["d4", "exd4", "cxd4"], theme: "Trapped Piece", toMove: "white" },
  { fen: "rnbq1rk1/pppp1ppp/4pn2/8/1bPP4/P1N5/1P2PPPP/R1BQKBNR w KQ - 2 5", solution: ["e3", "b6", "Bd3"], theme: "Back Rank", toMove: "white" },
  { fen: "r1bqk2r/pp1nppbp/2pp1np1/8/2PPP3/2N2NP1/PP3PBP/R1BQK2R w KQkq - 0 7", solution: ["O-O", "O-O", "Re1"], theme: "Overloaded Piece", toMove: "white" },
  { fen: "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", solution: ["d4", "d5", "Nc3"], theme: "Mate in 3", toMove: "white" },
  { fen: "r1bq1rk1/ppppnppp/4bn2/4p3/2P5/1PN2NP1/PB1PPPBP/R2QK2R w KQ - 6 7", solution: ["d3", "d5", "cxd5"], theme: "Decoy", toMove: "white" },
  { fen: "r1bqk2r/pppp1ppp/2nb1n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 6 5", solution: ["Bb5", "O-O", "O-O"], theme: "Zugzwang", toMove: "white" },
];

// Algebraic move pools for generating plausible-looking games
export const PAWN_MOVES = [
  "a3", "a4", "b3", "b4", "c3", "c4", "d3", "d4", "e3", "e4", "f3", "f4", "g3", "g4", "h3", "h4",
  "a5", "a6", "b5", "b6", "c5", "c6", "d5", "d6", "e5", "e6", "f5", "f6", "g5", "g6", "h5", "h6",
];

export const KNIGHT_MOVES = [
  "Na3", "Nc3", "Nf3", "Nh3", "Na4", "Nb5", "Nc6", "Nd2", "Nd4", "Nd7",
  "Ne2", "Ne5", "Nf6", "Ng5", "Nge2", "Nbd2", "Nbd7", "Nce4", "Nxe5", "Nxd4",
];

export const BISHOP_MOVES = [
  "Ba3", "Bb2", "Bb5", "Bc4", "Bd3", "Be2", "Be3", "Bf4", "Bg2", "Bg5",
  "Bh3", "Bh6", "Bb7", "Bc5", "Bd6", "Be7", "Bf1", "Bxe7", "Bxf6", "Bxc6",
];

export const ROOK_MOVES = [
  "Ra1", "Rb1", "Rc1", "Rd1", "Re1", "Rf1", "Rg1", "Rh1",
  "Rad1", "Rae1", "Rfe1", "Rfd1", "Rfc1", "Rab1",
];

export const QUEEN_MOVES = [
  "Qa4", "Qb3", "Qc2", "Qd1", "Qd2", "Qd3", "Qe2", "Qe7", "Qf3", "Qg4", "Qh5",
];

export const KING_MOVES = ["Kf1", "Kg2", "Kh1", "Kf8", "Kg8", "Kh8"];

export const CASTLING_MOVES = ["O-O", "O-O-O"];
