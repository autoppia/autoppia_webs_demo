import { generateAllData } from "@/data/generators";
import HomePageContent from "./HomePageContent";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ seed?: string }> }) {
  const params = await searchParams;
  const seed = Number(params.seed) || 1;
  const data = generateAllData(seed);

  return <HomePageContent data={data} seed={seed} />;
}
