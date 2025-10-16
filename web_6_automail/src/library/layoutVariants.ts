// src/library/layoutVariants.ts

export function generateHash(str: string, seed: number): number {
  let hash = 0;
  const seedStr = seed.toString();
  const input = str + seedStr;

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash);
}

export function generateButtonLayout(eventType: string, seed?: number): string {
  const layouts = [
    "flex items-center gap-2",
    "inline-flex items-center gap-3",
    "flex items-center gap-2.5",
    "inline-flex items-center space-x-2",
  ];

  const seedValue = seed || getUrlSeed();
  const hash = generateHash(eventType, seedValue);
  const layoutIndex = hash % layouts.length;

  return layouts[layoutIndex];
}

export function generateElementAttributes(eventType: string, seed?: number): Record<string, string> {
  const seedValue = seed || getUrlSeed();
  const hash = generateHash(eventType, seedValue);

  const attributes: Record<string, string> = {
    "data-element-type": eventType.toLowerCase().replace(/_/g, "-"),
    "data-variant": (hash % 4).toString(),
    "data-layout": (hash % 3).toString(),
  };

  // Add dynamic test IDs and xPaths
  const testId = `${eventType.toLowerCase()}-${hash % 1000}`;
  attributes["data-testid"] = testId;
  attributes["data-xpath"] = `//*[@data-testid='${testId}']`;

  return attributes;
}

export function getUrlSeed(): number {
  if (typeof window === "undefined") return 1;
  const searchParams = new URLSearchParams(window.location.search);
  return parseInt(searchParams.get("seed") || "1");
}

export function useLayoutVariants() {
  return {
    getButtonAttributes: generateElementAttributes,
    getButtonLayout: generateButtonLayout,
    getUrlSeed,
  };
}
