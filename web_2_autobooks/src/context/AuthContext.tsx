"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { findUser, createUser, type UserRecord } from "@/data/users";
import { EVENT_TYPES, logEvent } from "@/library/events";

interface AuthUser {
  username: string;
  allowedBooks: string[];
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
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

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      signup,
      logout,
    }),
    [currentUser, login, signup, logout]
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
