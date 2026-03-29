"use client";

import {
  type UserRecord,
  createUser,
  findUser,
  hashPassword,
  syncCustomUserAllowedBooks,
} from "@/data/users";
import { getBooks } from "@/dynamic/v2";
import { EVENT_TYPES, logEvent } from "@/library/events";
import {
  BOOK_LIBRARY_UNAVAILABLE,
  resolvePrimaryAllowedBooks,
} from "@/shared/user-book-assignment";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AuthUser {
  username: string;
  allowedBooks: string[];
  readingList?: string[];
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (
    username: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  logout: () => void;
  addAllowedBook: (bookId: string) => void;
  removeAllowedBook: (bookId: string) => void;
  addToReadingList: (bookId: string) => void;
  removeFromReadingList: (bookId: string) => void;
}

const STORAGE_KEY = "autobooksUser";
const SEED_DATA_READY_EVENT = "autobooks:seedDataReady";

type StoredAuthUser = AuthUser & { allowedMovies?: string[] };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function ensureResolvedAllowedBooks(username: string): string[] {
  const books = getBooks();
  const resolved = resolvePrimaryAllowedBooks(books, username);
  if (resolved.length === 0) {
    throw new Error(BOOK_LIBRARY_UNAVAILABLE);
  }
  return resolved;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const persistAuthUser = useCallback((user: AuthUser | null) => {
    setCurrentUser(user);
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSeedDataReady = () => {
      const books = getBooks();

      setCurrentUser((prev) => {
        if (!books.length) {
          if (prev) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
          }
          if (localStorage.getItem(STORAGE_KEY)) {
            localStorage.removeItem(STORAGE_KEY);
          }
          return null;
        }

        const resolveFor = (username: string) =>
          resolvePrimaryAllowedBooks(books, username);

        if (prev) {
          const resolvedAllowedBooks = resolveFor(prev.username);
          if (resolvedAllowedBooks.length === 0) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
          }
          const same =
            resolvedAllowedBooks.length === prev.allowedBooks.length &&
            resolvedAllowedBooks.every(
              (bookId, index) => bookId === prev.allowedBooks[index],
            );
          if (same) return prev;

          const updated: AuthUser = {
            ...prev,
            allowedBooks: resolvedAllowedBooks,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        }

        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (!raw) return null;
          const parsed = JSON.parse(raw) as StoredAuthUser;
          if (!parsed.allowedBooks && Array.isArray(parsed.allowedMovies)) {
            parsed.allowedBooks = parsed.allowedMovies;
            parsed.allowedMovies = undefined;
          }
          if (!parsed.readingList) {
            parsed.readingList = [];
          }
          const resolvedAllowedBooks = resolveFor(parsed.username);
          if (resolvedAllowedBooks.length === 0) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
          }
          const hydrated: AuthUser = {
            ...parsed,
            allowedBooks: resolvedAllowedBooks,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(hydrated));
          return hydrated;
        } catch {
          return null;
        }
      });
    };

    window.addEventListener(
      SEED_DATA_READY_EVENT,
      handleSeedDataReady as EventListener,
    );
    return () => {
      window.removeEventListener(
        SEED_DATA_READY_EVENT,
        handleSeedDataReady as EventListener,
      );
    };
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const record = findUser(username);
      if (!record) throw new Error("Invalid credentials");
      const isStoredHash = /^[a-f0-9]{64}$/i.test(record.password);
      const passwordOk = isStoredHash
        ? (await hashPassword(password)) === record.password
        : password === record.password;
      if (!passwordOk) throw new Error("Invalid credentials");
      const resolvedAllowedBooks = ensureResolvedAllowedBooks(record.username);
      const authUser: AuthUser = {
        username: record.username,
        allowedBooks: resolvedAllowedBooks,
        readingList: [],
      };
      persistAuthUser(authUser);
      syncCustomUserAllowedBooks(record.username, resolvedAllowedBooks);
      logEvent(EVENT_TYPES.LOGIN_BOOK, { username: authUser.username });
    },
    [persistAuthUser],
  );

  const signup = useCallback(
    async (username: string, password: string, confirmPassword: string) => {
      const safeUsername = username.trim();
      if (!safeUsername) {
        throw new Error("Username is required");
      }
      if (!password || password.length < 3) {
        throw new Error("Password must be at least 3 characters");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      if (findUser(safeUsername)) {
        throw new Error("Username already exists");
      }
      if (getBooks().length === 0) {
        throw new Error(BOOK_LIBRARY_UNAVAILABLE);
      }

      const newUser = await createUser(safeUsername, password);
      const resolvedAllowedBooks = ensureResolvedAllowedBooks(newUser.username);
      syncCustomUserAllowedBooks(newUser.username, resolvedAllowedBooks);
      const authUser: AuthUser = {
        username: newUser.username,
        allowedBooks: resolvedAllowedBooks,
        readingList: [],
      };
      persistAuthUser(authUser);
      logEvent(EVENT_TYPES.REGISTRATION_BOOK, { username: authUser.username });
    },
    [persistAuthUser],
  );

  const logout = useCallback(() => {
    if (currentUser) {
      logEvent(EVENT_TYPES.LOGOUT_BOOK, { username: currentUser.username });
    }
    persistAuthUser(null);
  }, [currentUser, persistAuthUser]);

  // Extra allowed books beyond the catalog-derived primary slot; login / seed reload still re-resolve to one primary id.
  const addAllowedBook = useCallback(
    (bookId: string) => {
      if (!currentUser) return;

      if (currentUser.allowedBooks.includes(bookId)) {
        return;
      }

      const updatedUser: AuthUser = {
        ...currentUser,
        allowedBooks: [...currentUser.allowedBooks, bookId],
      };

      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      if (typeof window !== "undefined") {
        try {
          const storedUsers = localStorage.getItem("autobooks_custom_users");
          if (storedUsers) {
            const customUsers: UserRecord[] = JSON.parse(storedUsers);
            const userIndex = customUsers.findIndex(
              (user) =>
                user.username.toLowerCase() ===
                currentUser.username.toLowerCase(),
            );

            if (userIndex !== -1) {
              const updatedCustomUsers = [...customUsers];
              updatedCustomUsers[userIndex] = {
                ...updatedCustomUsers[userIndex],
                allowedBooks: updatedUser.allowedBooks,
              };
              localStorage.setItem(
                "autobooks_custom_users",
                JSON.stringify(updatedCustomUsers),
              );
            }
          }
        } catch {
          // ignore storage errors
        }
      }
    },
    [currentUser],
  );

  const removeAllowedBook = useCallback(
    (bookId: string) => {
      if (!currentUser) return;

      if (!currentUser.allowedBooks.includes(bookId)) {
        return;
      }

      const updatedUser: AuthUser = {
        ...currentUser,
        allowedBooks: currentUser.allowedBooks.filter((id) => id !== bookId),
      };

      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      if (typeof window !== "undefined") {
        try {
          const storedUsers = localStorage.getItem("autobooks_custom_users");
          if (storedUsers) {
            const customUsers: UserRecord[] = JSON.parse(storedUsers);
            const userIndex = customUsers.findIndex(
              (user) =>
                user.username.toLowerCase() ===
                currentUser.username.toLowerCase(),
            );

            if (userIndex !== -1) {
              const updatedCustomUsers = [...customUsers];
              updatedCustomUsers[userIndex] = {
                ...updatedCustomUsers[userIndex],
                allowedBooks: updatedUser.allowedBooks,
              };
              localStorage.setItem(
                "autobooks_custom_users",
                JSON.stringify(updatedCustomUsers),
              );
            }
          }
        } catch {
          // ignore storage errors
        }
      }
    },
    [currentUser],
  );

  const addToReadingList = useCallback(
    (bookId: string) => {
      if (!currentUser) return;

      const readingList = currentUser.readingList || [];

      if (readingList.includes(bookId)) {
        return;
      }

      const updatedUser: AuthUser = {
        ...currentUser,
        readingList: [...readingList, bookId],
      };

      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    },
    [currentUser],
  );

  const removeFromReadingList = useCallback(
    (bookId: string) => {
      if (!currentUser) return;

      const readingList = currentUser.readingList || [];

      if (!readingList.includes(bookId)) {
        return;
      }

      const updatedUser: AuthUser = {
        ...currentUser,
        readingList: readingList.filter((id) => id !== bookId),
      };

      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    },
    [currentUser],
  );

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      signup,
      logout,
      addAllowedBook,
      removeAllowedBook,
      addToReadingList,
      removeFromReadingList,
    }),
    [
      currentUser,
      login,
      signup,
      logout,
      addAllowedBook,
      removeAllowedBook,
      addToReadingList,
      removeFromReadingList,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
