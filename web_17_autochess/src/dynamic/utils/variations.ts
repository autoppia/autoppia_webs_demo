// Utility functions for generating variations based on seed

export function generateRandomString(rng: () => number, length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(rng() * chars.length));
  }
  return result;
}

export function selectRandom<T>(rng: () => number, array: T[]): T {
  return array[Math.floor(rng() * array.length)];
}

export function generateDataAttributes(rng: () => number): Record<string, string> {
  const attrs: Record<string, string> = {};
  
  if (rng() > 0.5) {
    attrs['data-id'] = generateRandomString(rng, 8);
  }
  
  if (rng() > 0.5) {
    attrs['data-type'] = selectRandom(rng, ['primary', 'secondary', 'tertiary']);
  }
  
  if (rng() > 0.7) {
    attrs['data-index'] = Math.floor(rng() * 100).toString();
  }
  
  if (rng() > 0.6) {
    attrs['data-variant'] = selectRandom(rng, ['a', 'b', 'c', 'd']);
  }
  
  return attrs;
}
