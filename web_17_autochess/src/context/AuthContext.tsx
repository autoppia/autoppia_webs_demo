"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { readJson, writeJson, isBrowser } from "@/shared/storage";
import { findUser } from "@/data/users";
import { logEvent, EVENT_TYPES } from "@/library/events";

const USER_KEY = "autochessUser";
const CUSTOM_USERS_KEY = "autochessCustomUsers";

export interface AuthUser {
  username: string;
  puzzleRating: number;
  puzzlesSolved: number;
  puzzlesAttempted: number;
}

interface CustomUserRecord {
  username: string;
  password: string;
  puzzleRating: number;
  puzzlesSolved: number;
  puzzlesAttempted: number;
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => void;
  register: (username: string, password: string) => void;
  logout: () => void;
  updatePuzzleRating: (newRating: number, solved: number, attempted: number) => void;
}

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  isAuthenticated: false,
  login: () => {},
  register: () => {},
  logout: () => {},
  updatePuzzleRating: () => {},
});

function loadCustomUsers(): CustomUserRecord[] {
  return readJson<CustomUserRecord[]>(CUSTOM_USERS_KEY, []) ?? [];
}

function saveCustomUsers(users: CustomUserRecord[]): void {
  writeJson(CUSTOM_USERS_KEY, users);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = readJson<AuthUser>(USER_KEY, null);
    if (stored) setCurrentUser(stored);
  }, []);

  const persistUser = useCallback((user: AuthUser) => {
    setCurrentUser(user);
    writeJson(USER_KEY, user);
  }, []);

  const login = useCallback((username: string, password: string) => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    // Check pre-seeded users
    const preseeded = findUser(trimmedUsername);
    if (preseeded) {
      if (preseeded.password !== trimmedPassword) {
        throw new Error("Invalid credentials");
      }
      // Check if custom user has updated stats
      const customs = loadCustomUsers();
      const custom = customs.find((u) => u.username.toLowerCase() === trimmedUsername.toLowerCase());
      const user: AuthUser = {
        username: preseeded.username,
        puzzleRating: custom?.puzzleRating ?? preseeded.puzzleRating,
        puzzlesSolved: custom?.puzzlesSolved ?? 0,
        puzzlesAttempted: custom?.puzzlesAttempted ?? 0,
      };
      persistUser(user);
      logEvent(EVENT_TYPES.LOGIN, { username: preseeded.username, source: "login" });
      return;
    }

    // Check custom users
    const customs = loadCustomUsers();
    const custom = customs.find((u) => u.username.toLowerCase() === trimmedUsername.toLowerCase());
    if (custom && custom.password === trimmedPassword) {
      const user: AuthUser = {
        username: custom.username,
        puzzleRating: custom.puzzleRating,
        puzzlesSolved: custom.puzzlesSolved,
        puzzlesAttempted: custom.puzzlesAttempted,
      };
      persistUser(user);
      logEvent(EVENT_TYPES.LOGIN, { username: custom.username, source: "login" });
      return;
    }

    throw new Error("Invalid credentials");
  }, [persistUser]);

  const register = useCallback((username: string, password: string) => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    // Check if username is taken in pre-seeded users
    const preseeded = findUser(trimmedUsername);
    if (preseeded) {
      throw new Error("Username already taken");
    }

    // Check custom users
    const customs = loadCustomUsers();
    const existing = customs.find((u) => u.username.toLowerCase() === trimmedUsername.toLowerCase());
    if (existing) {
      throw new Error("Username already taken");
    }

    const newCustom: CustomUserRecord = {
      username: trimmedUsername,
      password: trimmedPassword,
      puzzleRating: 1500,
      puzzlesSolved: 0,
      puzzlesAttempted: 0,
    };
    customs.push(newCustom);
    saveCustomUsers(customs);

    const user: AuthUser = {
      username: trimmedUsername,
      puzzleRating: 1500,
      puzzlesSolved: 0,
      puzzlesAttempted: 0,
    };
    persistUser(user);
    logEvent(EVENT_TYPES.REGISTRATION, { username: trimmedUsername, source: "register" });
  }, [persistUser]);

  const logout = useCallback(() => {
    const username = currentUser?.username;
    setCurrentUser(null);
    if (isBrowser()) {
      window.localStorage.removeItem(USER_KEY);
    }
    if (username) {
      logEvent(EVENT_TYPES.LOGOUT, { username });
    }
  }, [currentUser?.username]);

  const updatePuzzleRating = useCallback((newRating: number, solved: number, attempted: number) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated: AuthUser = {
        ...prev,
        puzzleRating: newRating,
        puzzlesSolved: solved,
        puzzlesAttempted: attempted,
      };
      writeJson(USER_KEY, updated);

      // Sync to custom users storage if applicable
      const customs = loadCustomUsers();
      const idx = customs.findIndex((u) => u.username.toLowerCase() === updated.username.toLowerCase());
      if (idx >= 0) {
        customs[idx].puzzleRating = newRating;
        customs[idx].puzzlesSolved = solved;
        customs[idx].puzzlesAttempted = attempted;
        saveCustomUsers(customs);
      } else {
        // Create a custom record to persist rating for pre-seeded users
        customs.push({
          username: updated.username,
          password: "",
          puzzleRating: newRating,
          puzzlesSolved: solved,
          puzzlesAttempted: attempted,
        });
        saveCustomUsers(customs);
      }

      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, login, register, logout, updatePuzzleRating }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
