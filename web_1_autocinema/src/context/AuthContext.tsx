"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { findUser, type UserRecord } from "@/data/users";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { readJson, writeJson } from "@/shared/storage";

interface AuthUser {
  username: string;
  allowedMovies: string[];
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (options: RegisterOptions) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "autocinemaUser";
const CUSTOM_USERS_KEY = "autocinemaRegisteredUsers";
const DEFAULT_ALLOWED_MOVIE = "movie-v2-001";

interface RegisterOptions {
  username: string;
  password: string;
  allowedMovies?: string[];
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeUsername = (value: string) => value.trim();

const getStoredCustomUsers = (): UserRecord[] => readJson<UserRecord[]>(CUSTOM_USERS_KEY, []) ?? [];

const persistCustomUsers = (users: UserRecord[]) => {
  writeJson(CUSTOM_USERS_KEY, users);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [customUsers, setCustomUsers] = useState<UserRecord[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        setCurrentUser(parsed);
      }
    } catch {
      // ignore corrupted storage
    }
    setCustomUsers(getStoredCustomUsers());
  }, []);

  const resolveUserRecord = useCallback(
    (username: string): UserRecord | undefined => {
      const normalized = normalizeUsername(username);
      if (!normalized) return undefined;
      const existing = findUser(normalized);
      if (existing) return existing;
      const lower = normalized.toLowerCase();
      const localMatch = customUsers.find((user) => user.username.toLowerCase() === lower);
      if (localMatch) {
        return localMatch;
      }
      if (typeof window !== "undefined") {
        const storedMatch = getStoredCustomUsers().find((user) => user.username.toLowerCase() === lower);
        if (storedMatch && !localMatch) {
          setCustomUsers((prev) => {
            if (prev.some((user) => user.username.toLowerCase() === lower)) {
              return prev;
            }
            return [...prev, storedMatch];
          });
          return storedMatch;
        }
      }
      return undefined;
    },
    [customUsers]
  );

  const login = useCallback(async (username: string, password: string) => {
    const record = resolveUserRecord(username);
    if (!record || record.password !== password) {
      logEvent(EVENT_TYPES.LOGIN_FAILURE, { username });
      throw new Error("Invalid credentials");
    }
    const authUser: AuthUser = {
      username: record.username,
      allowedMovies: record.allowedMovies,
    };
    setCurrentUser(authUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    logEvent(EVENT_TYPES.LOGIN, { username: authUser.username });
  }, [resolveUserRecord]);

  const register = useCallback(
    async ({ username, password, allowedMovies }: RegisterOptions) => {
      const normalizedUsername = normalizeUsername(username);
      const normalizedPassword = password.trim();
      if (!normalizedUsername) {
        throw new Error("Username is required");
      }
      if (normalizedPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      if (resolveUserRecord(normalizedUsername)) {
        logEvent(EVENT_TYPES.REGISTER_FAILURE, { username: normalizedUsername, reason: "duplicate" });
        throw new Error("This username is already taken");
      }

      const assignedMovies = allowedMovies && allowedMovies.length > 0 ? allowedMovies : [DEFAULT_ALLOWED_MOVIE];
      const newRecord: UserRecord = {
        username: normalizedUsername,
        password: normalizedPassword,
        allowedMovies: assignedMovies,
      };

      const updatedCustomUsers = [...customUsers, newRecord];
      setCustomUsers(updatedCustomUsers);
      persistCustomUsers(updatedCustomUsers);

      const authUser: AuthUser = {
        username: normalizedUsername,
        allowedMovies: assignedMovies,
      };

      setCurrentUser(authUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      logEvent(EVENT_TYPES.REGISTER_SUCCESS, { username: normalizedUsername, movies: assignedMovies });
    },
    [customUsers, resolveUserRecord]
  );

  const logout = useCallback(() => {
    if (currentUser) {
      logEvent(EVENT_TYPES.LOGOUT, { username: currentUser.username });
    }
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, [currentUser]);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      register,
      logout,
    }),
    [currentUser, login, logout, register]
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
