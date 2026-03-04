/** Hash password for storage (CodeQL: avoid clear-text sensitive storage). */
export async function hashPassword(plain: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(plain);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isStoredPasswordHash(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value);
}
