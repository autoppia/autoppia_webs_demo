"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { findUser, createUser, hashPassword, type UserRecord } from "@/data/users";
import { getBooks } from "@/dynamic/v2";
import { EVENT_TYPES, logEvent } from "@/library/events";

interface AuthUser {
  username: string;
  allowedBooks: string[];
  readingList?: string[];
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, confirmPassword: string) => Promise<void>;
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

function getDeterministicUserIndex(username: string): number {
  const match = /^user(\d+)$/i.exec(username.trim());
  if (match) {
    const parsed = Number.parseInt(match[1], 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed - 1;
    }
  }

  // Fallback for non "userN" usernames: deterministic index from chars
  return Array.from(username).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function resolveAllowedBooksForSeed(username: string, fallbackAllowedBooks: string[] = []): string[] {
  const books = getBooks();
  if (!Array.isArray(books) || books.length === 0) {
    return fallbackAllowedBooks;
  }

  const userIndex = getDeterministicUserIndex(username);
  const bookIndex = ((userIndex % books.length) + books.length) % books.length;
  const selectedBook = books[bookIndex];
  return selectedBook ? [selectedBook.id] : fallbackAllowedBooks;
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
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredAuthUser;
        if (!parsed.allowedBooks && Array.isArray(parsed.allowedMovies)) {
          parsed.allowedBooks = parsed.allowedMovies;
          parsed.allowedMovies = undefined;
        }
        // Ensure readingList exists
        if (!parsed.readingList) {
          parsed.readingList = [];
        }
        const resolvedAllowedBooks = resolveAllowedBooksForSeed(parsed.username, parsed.allowedBooks || []);
        const resolvedUser: AuthUser = {
          ...parsed,
          allowedBooks: resolvedAllowedBooks,
        };
        persistAuthUser(resolvedUser);
      }
    } catch {
      // ignore corrupted storage
    }
  }, [persistAuthUser]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSeedDataReady = () => {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const resolvedAllowedBooks = resolveAllowedBooksForSeed(prev.username, prev.allowedBooks || []);
        const same =
          resolvedAllowedBooks.length === prev.allowedBooks.length &&
          resolvedAllowedBooks.every((bookId, index) => bookId === prev.allowedBooks[index]);
        if (same) return prev;

        const updated: AuthUser = {
          ...prev,
          allowedBooks: resolvedAllowedBooks,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener(SEED_DATA_READY_EVENT, handleSeedDataReady as EventListener);
    return () => {
      window.removeEventListener(SEED_DATA_READY_EVENT, handleSeedDataReady as EventListener);
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const record = findUser(username);
    if (!record) throw new Error("Invalid credentials");
    const isStoredHash = /^[a-f0-9]{64}$/i.test(record.password);
    const passwordOk = isStoredHash
      ? (await hashPassword(password)) === record.password
      : password === record.password;
    if (!passwordOk) throw new Error("Invalid credentials");
    const resolvedAllowedBooks = resolveAllowedBooksForSeed(record.username, record.allowedBooks);
    const authUser: AuthUser = {
      username: record.username,
      allowedBooks: resolvedAllowedBooks,
      readingList: [],
    };
    persistAuthUser(authUser);
    logEvent(EVENT_TYPES.LOGIN_BOOK, { username: authUser.username });
  }, [persistAuthUser]);

  const signup = useCallback(async (username: string, password: string, confirmPassword: string) => {
    if (!username.trim()) {
      // logEvent(EVENT_TYPES.SIGNUP_FAILURE, { username, reason: "empty_username" });
      throw new Error("Username is required");
    }
    if (!password || password.length < 3) {
      // logEvent(EVENT_TYPES.SIGNUP_FAILURE, { username, reason: "weak_password" });
      throw new Error("Password must be at least 3 characters");
    }
    if (password !== confirmPassword) {
      // logEvent(EVENT_TYPES.SIGNUP_FAILURE, { username, reason: "password_mismatch" });
      throw new Error("Passwords do not match");
    }
    if (findUser(username)) {
      // logEvent(EVENT_TYPES.SIGNUP_FAILURE, { username, reason: "username_exists" });
      throw new Error("Username already exists");
    }

    const newUser = await createUser(username, password);
    const resolvedAllowedBooks = resolveAllowedBooksForSeed(newUser.username, newUser.allowedBooks);
    const authUser: AuthUser = {
      username: newUser.username,
      allowedBooks: resolvedAllowedBooks,
      readingList: [],
    };
    persistAuthUser(authUser);
    logEvent(EVENT_TYPES.REGISTRATION_BOOK, { username: authUser.username });
  }, [persistAuthUser]);

  const logout = useCallback(() => {
    if (currentUser) {
      logEvent(EVENT_TYPES.LOGOUT_BOOK, { username: currentUser.username });
    }
    persistAuthUser(null);
  }, [currentUser, persistAuthUser]);

  const addAllowedBook = useCallback(
    (bookId: string) => {
      if (!currentUser) return;

      // Check if book is already in the list
      if (currentUser.allowedBooks.includes(bookId)) {
        return;
      }

      // Update current user
      const updatedUser: AuthUser = {
        ...currentUser,
        allowedBooks: [...currentUser.allowedBooks, bookId],
      };

      // Update state and localStorage
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      // Update custom users if this is a custom user
      if (typeof window !== "undefined") {
        try {
          const storedUsers = localStorage.getItem("autobooks_custom_users");
          if (storedUsers) {
            const customUsers: UserRecord[] = JSON.parse(storedUsers);
            const userIndex = customUsers.findIndex(
              (user) => user.username.toLowerCase() === currentUser.username.toLowerCase()
            );

            if (userIndex !== -1) {
              const updatedCustomUsers = [...customUsers];
              updatedCustomUsers[userIndex] = {
                ...updatedCustomUsers[userIndex],
                allowedBooks: updatedUser.allowedBooks,
              };
              localStorage.setItem("autobooks_custom_users", JSON.stringify(updatedCustomUsers));
            }
          }
        } catch {
          // ignore storage errors
        }
      }
    },
    [currentUser]
  );

  const removeAllowedBook = useCallback(
    (bookId: string) => {
      if (!currentUser) return;

      // Check if book is in the list
      if (!currentUser.allowedBooks.includes(bookId)) {
        return;
      }

      // Update current user
      const updatedUser: AuthUser = {
        ...currentUser,
        allowedBooks: currentUser.allowedBooks.filter((id) => id !== bookId),
      };

      // Update state and localStorage
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      // Update custom users if this is a custom user
      if (typeof window !== "undefined") {
        try {
          const storedUsers = localStorage.getItem("autobooks_custom_users");
          if (storedUsers) {
            const customUsers: UserRecord[] = JSON.parse(storedUsers);
            const userIndex = customUsers.findIndex(
              (user) => user.username.toLowerCase() === currentUser.username.toLowerCase()
            );

            if (userIndex !== -1) {
              const updatedCustomUsers = [...customUsers];
              updatedCustomUsers[userIndex] = {
                ...updatedCustomUsers[userIndex],
                allowedBooks: updatedUser.allowedBooks,
              };
              localStorage.setItem("autobooks_custom_users", JSON.stringify(updatedCustomUsers));
            }
          }
        } catch {
          // ignore storage errors
        }
      }
    },
    [currentUser]
  );

  const addToReadingList = useCallback(
    (bookId: string) => {
      if (!currentUser) return;

      const readingList = currentUser.readingList || [];

      // Check if book is already in the list
      if (readingList.includes(bookId)) {
        return;
      }

      // Update current user
      const updatedUser: AuthUser = {
        ...currentUser,
        readingList: [...readingList, bookId],
      };

      // Update state and localStorage
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    },
    [currentUser]
  );

  const removeFromReadingList = useCallback(
    (bookId: string) => {
      if (!currentUser) return;

      const readingList = currentUser.readingList || [];

      // Check if book is in the list
      if (!readingList.includes(bookId)) {
        return;
      }

      // Update current user
      const updatedUser: AuthUser = {
        ...currentUser,
        readingList: readingList.filter((id) => id !== bookId),
      };

      // Update state and localStorage
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    },
    [currentUser]
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
    [currentUser, login, signup, logout, addAllowedBook, removeAllowedBook, addToReadingList, removeFromReadingList]
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
