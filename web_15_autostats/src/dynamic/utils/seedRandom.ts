// Deterministic random number generator based on seed
// Uses a simple LCG (Linear Congruential Generator) algorithm

export function seedRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  let state = Math.abs(hash);
  
  return function() {
    // LCG parameters (from Numerical Recipes)
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    state = (a * state + c) % m;
    return state / m;
  };
}
