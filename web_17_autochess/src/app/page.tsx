import { generatePlayers, generateTournaments, generatePuzzles } from "@/data/generators";
import HomePageContent from "./HomePageContent";

const TOTAL_PLAYERS = 50;
const TOTAL_TOURNAMENTS = 50;
const TOTAL_PUZZLES = 100;
const TOTAL_GAMES = 500;

export default async function HomePage({ searchParams }: { searchParams: Promise<{ seed?: string }> }) {
  const params = await searchParams;
  const seed = Number(params.seed) || 1;
  const featuredPlayers = generatePlayers(TOTAL_PLAYERS, seed).slice(0, 10);
  const featuredTournaments = generateTournaments(6, seed);
  const dailyPuzzleIndex = seed % TOTAL_PUZZLES;
  const dailyPuzzle = generatePuzzles(dailyPuzzleIndex + 1, seed)[dailyPuzzleIndex];

  return (
    <HomePageContent
      featuredPlayers={featuredPlayers}
      featuredTournaments={featuredTournaments}
      dailyPuzzle={dailyPuzzle}
      stats={{
        players: TOTAL_PLAYERS,
        tournaments: TOTAL_TOURNAMENTS,
        puzzles: TOTAL_PUZZLES,
        games: TOTAL_GAMES,
      }}
    />
  );
}
