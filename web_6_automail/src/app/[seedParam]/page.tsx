import { redirect } from "next/navigation";

const SEED_MIN = 1;
const SEED_MAX = 999;

function clampSeed(n: number): number {
  if (!Number.isFinite(n)) return SEED_MIN;
  if (n < SEED_MIN) return SEED_MIN;
  if (n > SEED_MAX) return SEED_MAX;
  return n;
}

/**
 * Handles path-style seed URLs like /seed=4 (common mistake for ?seed=4).
 * Redirects to the home page with the correct query param: /?seed=4
 */
export default async function SeedParamPage({
  params,
}: {
  params: Promise<{ seedParam: string }>;
}) {
  const { seedParam } = await params;
  const match = /^seed=(\d+)$/i.exec(seedParam ?? "");
  const seed = match ? clampSeed(Number.parseInt(match[1], 10)) : SEED_MIN;
  redirect(`/?seed=${seed}`);
}
