const K_FACTOR = 32;

export function calculateEloChange(
  playerRating: number,
  puzzleRating: number,
  result: "solved" | "hint" | "failed",
): number {
  const expected = 1 / (1 + 10 ** ((puzzleRating - playerRating) / 400));
  const actual = result === "solved" ? 1 : result === "hint" ? 0.5 : 0;
  return Math.round(K_FACTOR * (actual - expected));
}
