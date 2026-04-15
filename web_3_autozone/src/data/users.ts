import { hashPassword } from "@/shared/hash";

/** New registrations (same pattern as web_2_autobooks `autobooks_custom_users`). */
const CUSTOM_USERS_KEY = "autozone_custom_users";

/** Legacy key from earlier autozone builds; still read for login compatibility. */
export const LEGACY_USERS_KEY = "autozone_auth_users_v1";

export interface UserRecord {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

const TOTAL_USERS = 256;

const BUILTIN_USERS: UserRecord[] = Array.from(
  { length: TOTAL_USERS },
  (_, index) => ({
    id: `builtin-${index + 1}`,
    username: `user${index + 1}`,
    password: "Passw0rd!",
    createdAt: "1970-01-01T00:00:00.000Z",
  }),
);

function isUserRecord(value: unknown): value is UserRecord {
  if (!value || typeof value !== "object") return false;
  const u = value as Partial<UserRecord>;
  return (
    typeof u.id === "string" &&
    u.id.length > 0 &&
    typeof u.username === "string" &&
    u.username.length > 0 &&
    typeof u.password === "string" &&
    typeof u.createdAt === "string"
  );
}

function readCustomUsers(): UserRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isUserRecord);
  } catch {
    return [];
  }
}

function readLegacyUsers(): UserRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isUserRecord);
  } catch {
    return [];
  }
}

export function findUser(username: string): UserRecord | undefined {
  const trimmed = username.trim();
  if (!trimmed) return undefined;
  const lower = trimmed.toLowerCase();

  const fromBuiltin = BUILTIN_USERS.find(
    (u) => u.username.toLowerCase() === lower,
  );
  if (fromBuiltin) return fromBuiltin;

  if (typeof window === "undefined") return undefined;

  const fromCustom = readCustomUsers().find(
    (u) => u.username.toLowerCase() === lower,
  );
  if (fromCustom) return fromCustom;

  return readLegacyUsers().find((u) => u.username.toLowerCase() === lower);
}

export function isBuiltinUserId(id: string): boolean {
  return id.startsWith("builtin-");
}

export async function createUser(
  username: string,
  password: string,
): Promise<UserRecord> {
  const trimmed = username.trim();
  if (findUser(trimmed)) {
    throw new Error("Username already exists.");
  }

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  const newUser: UserRecord = {
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    username: trimmed,
    password: passwordHash,
    createdAt: now,
  };

  if (typeof window !== "undefined") {
    try {
      const list = readCustomUsers();
      list.push(newUser);
      window.localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(list));
    } catch {
      // ignore storage errors
    }
  }

  return newUser;
}

/** Persist SHA-256 upgrade when a stored password was still plain text (custom/legacy rows only). */
export function upgradePasswordHashForUser(
  userId: string,
  newPasswordHash: string,
): void {
  if (typeof window === "undefined" || isBuiltinUserId(userId)) return;

  try {
    const custom = readCustomUsers();
    const ci = custom.findIndex((u) => u.id === userId);
    if (ci !== -1) {
      custom[ci] = { ...custom[ci], password: newPasswordHash };
      window.localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(custom));
      return;
    }

    const legacy = readLegacyUsers();
    const li = legacy.findIndex((u) => u.id === userId);
    if (li !== -1) {
      legacy[li] = { ...legacy[li], password: newPasswordHash };
      window.localStorage.setItem(LEGACY_USERS_KEY, JSON.stringify(legacy));
    }
  } catch {
    // ignore storage errors
  }
}
