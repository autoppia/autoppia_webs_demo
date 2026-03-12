export interface UserRecord {
  username: string;
  password: string;
  allowedBooks: string[];
}

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
const BOOK_POOL_SIZE = 256;

const buildBookId = (value: number): string => `book-${value}`;

export const USERS: UserRecord[] = Array.from({ length: TOTAL_USERS }, (_, index) => {
  const bookIndex = (index % BOOK_POOL_SIZE) + 1;
  return {
    username: `user${index + 1}`,
    password: "Passw0rd!",
    allowedBooks: [buildBookId(bookIndex)],
  };
});

export function findUser(username: string): UserRecord | undefined {
  // First check static users
  const staticUser = USERS.find((user) => user.username.toLowerCase() === username.toLowerCase());
  if (staticUser) return staticUser;

  // Then check localStorage for dynamically created users
  if (typeof window !== "undefined") {
    try {
      const storedUsers = localStorage.getItem("autobooks_custom_users");
      if (storedUsers) {
        const customUsers: UserRecord[] = JSON.parse(storedUsers);
        return customUsers.find((user) => user.username.toLowerCase() === username.toLowerCase());
      }
    } catch {
      // ignore corrupted storage
    }
  }

  return undefined;
}

export async function createUser(username: string, password: string): Promise<UserRecord> {
  if (findUser(username)) {
    throw new Error("Username already exists");
  }

  const randomBookIndex =
    typeof crypto !== "undefined" && crypto.getRandomValues
      ? ((crypto.getRandomValues(new Uint32Array(1))[0] ?? 0) % BOOK_POOL_SIZE) + 1
      : ((username.length + (username.charCodeAt(0) ?? 0)) % BOOK_POOL_SIZE) + 1;
  const passwordHash = await hashPassword(password);
  const newUser: UserRecord = {
    username: username.trim(),
    password: passwordHash,
    allowedBooks: [buildBookId(randomBookIndex)],
  };

  if (typeof window !== "undefined") {
    try {
      const storedUsers = localStorage.getItem("autobooks_custom_users");
      const customUsers: UserRecord[] = storedUsers ? JSON.parse(storedUsers) : [];
      customUsers.push(newUser);
      localStorage.setItem("autobooks_custom_users", JSON.stringify(customUsers));
    } catch {
      // ignore storage errors
    }
  }

  return newUser;
}
