export interface UserRecord {
  username: string;
  password: string;
  allowedBooks: string[];
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

export function createUser(username: string, password: string): UserRecord {
  // Check if user already exists
  if (findUser(username)) {
    throw new Error("Username already exists");
  }

  // Generate a random book ID for the new user
  const randomBookIndex = Math.floor(Math.random() * BOOK_POOL_SIZE) + 1;
  const newUser: UserRecord = {
    username: username.trim(),
    password: password,
    allowedBooks: [buildBookId(randomBookIndex)],
  };

  // Store in localStorage
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
