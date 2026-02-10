import { generateValidators } from './generators';

// Generate 256 mock validators
export const mockValidators = generateValidators(256);

export function getValidatorByHotkey(hotkey: string) {
  return mockValidators.find(validator => validator.hotkey === hotkey);
}

export function getTopValidators(count: number = 50) {
  return mockValidators.slice(0, count);
}

export function searchValidators(query: string) {
  const lowerQuery = query.toLowerCase();
  return mockValidators.filter(
    validator => 
      validator.hotkey.toLowerCase().includes(lowerQuery) ||
      validator.coldkey.toLowerCase().includes(lowerQuery)
  );
}
