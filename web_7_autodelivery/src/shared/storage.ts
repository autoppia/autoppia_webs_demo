/**
 * LocalStorage utilities for data caching
 */

export function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Failed to read JSON from localStorage for key "${key}":`, error);
    return null;
  }
}

export function writeJson<T>(key: string, data: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to write JSON to localStorage for key "${key}":`, error);
  }
}

export function removeItem(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove item from localStorage for key "${key}":`, error);
  }
}

