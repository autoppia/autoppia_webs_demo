"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { findUser, createUser, type UserRecord } from "@/data/users";
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

type StoredAuthUser = AuthUser & { allowedMovies?: string[] };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

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
        setCurrentUser(parsed);
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const record = findUser(username);
    if (!record || record.password !== password) {
      // logEvent(EVENT_TYPES.LOGIN_FAILURE, { username });
      throw new Error("Invalid credentials");
    }
    const authUser: AuthUser = {
      username: record.username,
      allowedBooks: record.allowedBooks,
      readingList: [],
    };
    setCurrentUser(authUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    logEvent(EVENT_TYPES.LOGIN_BOOK, { username: authUser.username });
  }, []);

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

    try {
      const newUser = createUser(username, password);
      const authUser: AuthUser = {
        username: newUser.username,
        allowedBooks: newUser.allowedBooks,
        readingList: [],
      };
      setCurrentUser(authUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      logEvent(EVENT_TYPES.REGISTRATION_BOOK, { username: authUser.username });
    } catch (err) {
      // logEvent(EVENT_TYPES.SIGNUP_FAILURE, { username, reason: (err as Error).message });
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    if (currentUser) {
      logEvent(EVENT_TYPES.LOGOUT_BOOK, { username: currentUser.username });
    }
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, [currentUser]);

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
