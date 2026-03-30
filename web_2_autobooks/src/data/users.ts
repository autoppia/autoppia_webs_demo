export interface UserRecord {
  username: string;
  password: string;
  email?: string;
  /** Not used for assignment; primary book comes from the live catalog (see `user-book-assignment`). */
  allowedBooks: string[];
}

const CUSTOM_USERS_KEY = "autobooks_custom_users";

/** Hash password for storage (CodeQL: avoid clear-text sensitive storage). */
export async function hashPassword(plain: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(plain);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const TOTAL_USERS = 256;

export const USERS: UserRecord[] = Array.from(
  { length: TOTAL_USERS },
  (_, index) => ({
    username: `user${index + 1}`,
    password: "Passw0rd!",
    allowedBooks: [],
  }),
);

export function findUser(username: string): UserRecord | undefined {
  const staticUser = USERS.find(
    (user) => user.username.toLowerCase() === username.toLowerCase(),
  );
  if (staticUser) return staticUser;

  if (typeof window !== "undefined") {
    try {
      const storedUsers = localStorage.getItem(CUSTOM_USERS_KEY);
      if (storedUsers) {
        const customUsers: UserRecord[] = JSON.parse(storedUsers);
        return customUsers.find(
          (user) => user.username.toLowerCase() === username.toLowerCase(),
        );
      }
    } catch {
      // ignore corrupted storage
    }
  }

  return undefined;
}

/** Update `allowedBooks` for a custom user after catalog-based resolution. */
export function syncCustomUserAllowedBooks(
  username: string,
  allowedBooks: string[],
): void {
  if (typeof window === "undefined") return;
  try {
    const storedUsers = localStorage.getItem(CUSTOM_USERS_KEY);
    if (!storedUsers) return;
    const customUsers: UserRecord[] = JSON.parse(storedUsers);
    const lower = username.toLowerCase();
    const idx = customUsers.findIndex(
      (u) => u.username.toLowerCase() === lower,
    );
    if (idx === -1) return;
    customUsers[idx] = { ...customUsers[idx], allowedBooks };
    localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(customUsers));
  } catch {
    // ignore storage errors
  }
}

export async function createUser(
  username: string,
  password: string,
  email?: string,
): Promise<UserRecord> {
  if (findUser(username)) {
    throw new Error("Username already exists");
  }

  const passwordHash = await hashPassword(password);
  const trimmedEmail = email?.trim();
  const newUser: UserRecord = {
    username: username.trim(),
    password: passwordHash,
    allowedBooks: [],
    ...(trimmedEmail ? { email: trimmedEmail } : {}),
  };

  if (typeof window !== "undefined") {
    try {
      const storedUsers = localStorage.getItem(CUSTOM_USERS_KEY);
      const customUsers: UserRecord[] = storedUsers
        ? JSON.parse(storedUsers)
        : [];
      customUsers.push(newUser);
      localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(customUsers));
    } catch {
      // ignore storage errors
    }
  }

  return newUser;
}
