"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser, RegisterInput, UserRecord } from "@/models";
import { findUser } from "@/models/users";
import { EVENT_TYPES, logEvent } from "@/events";
import { readJson, writeJson } from "@/utils/storage";

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  watchlist: string[];
  isInWatchlist: (movieId: string) => boolean;
  addToWatchlist: (movieId: string) => void;
  removeFromWatchlist: (movieId: string) => void;
  addAssignedMovie: (movieId: string) => void;
  removeAssignedMovie: (movieId: string) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "autocinemaUser";
const CUSTOM_USERS_KEY = "autocinemaCustomUsers";
const WATCHLIST_KEY_PREFIX = "autocinemaWatchlist:";
const buildWatchlistKey = (username: string) => `${WATCHLIST_KEY_PREFIX}${username.toLowerCase()}`;

interface CustomUserRecord extends AuthUser {
  password: string;
}

const loadCustomUsers = (): CustomUserRecord[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomUserRecord[];
  } catch {
    return [];
  }
};

const saveCustomUsers = (users: CustomUserRecord[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(users));
};

const matchCustomUser = (users: CustomUserRecord[], username: string) => {
  const normalized = username.toLowerCase();
  return users.find((user) => user.username.toLowerCase() === normalized);
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeUsername = (value: string) => value.trim();

const getStoredCustomUsers = (): UserRecord[] => readJson<UserRecord[]>(CUSTOM_USERS_KEY, []) ?? [];

const persistCustomUsers = (users: UserRecord[]) => {
  writeJson(CUSTOM_USERS_KEY, users);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [customUsers, setCustomUsers] = useState<UserRecord[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);

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

  // Load watchlist whenever the current user changes
  useEffect(() => {
    if (!currentUser) {
      setWatchlist([]);
      return;
    }
    const key = buildWatchlistKey(currentUser.username);
    const list = readJson<string[]>(key, []) ?? [];
    setWatchlist(Array.isArray(list) ? list : []);
  }, [currentUser]);

  const persistWatchlist = useCallback(
    (username: string, list: string[]) => {
      writeJson(buildWatchlistKey(username), list);
    },
    []
  );

  const isInWatchlist = useCallback(
    (movieId: string) => {
      if (!currentUser) return false;
      return watchlist.includes(movieId);
    },
    [currentUser, watchlist]
  );

  const addToWatchlist = useCallback(
    (movieId: string) => {
      if (!currentUser) return;
      setWatchlist((prev) => {
        if (prev.includes(movieId)) return prev;
        const next = [...prev, movieId];
        persistWatchlist(currentUser.username, next);
        return next;
      });
    },
    [currentUser, persistWatchlist]
  );

  const removeFromWatchlist = useCallback(
    (movieId: string) => {
      if (!currentUser) return;
      setWatchlist((prev) => {
        if (!prev.includes(movieId)) return prev;
        const next = prev.filter((id) => id !== movieId);
        persistWatchlist(currentUser.username, next);
        return next;
      });
    },
    [currentUser, persistWatchlist]
  );

  const addAssignedMovie = useCallback(
    (movieId: string) => {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        if (prev.allowedMovies.includes(movieId)) return prev;
        const nextUser: AuthUser = { ...prev, allowedMovies: [...prev.allowedMovies, movieId] };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
        return nextUser;
      });
    },
    []
  );

  const removeAssignedMovie = useCallback(
    (movieId: string) => {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        if (!prev.allowedMovies.includes(movieId)) return prev;
        const nextUser: AuthUser = { ...prev, allowedMovies: prev.allowedMovies.filter((id) => id !== movieId) };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
        return nextUser;
      });
    },
    []
  );

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

  const persistUser = useCallback((authUser: AuthUser, source: "login" | "register") => {
    setCurrentUser(authUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    logEvent(EVENT_TYPES.LOGIN_SUCCESS, { username: authUser.username, source });
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const record = findUser(username);
      if (record && record.password === password) {
        const authUser: AuthUser = {
          username: record.username,
          allowedMovies: record.allowedMovies,
        };
        persistUser(authUser, "login");
        return;
      }

      const customUsers = loadCustomUsers();
      const custom = matchCustomUser(customUsers, username);
      if (custom && custom.password === password) {
        const authUser: AuthUser = {
          username: custom.username,
          allowedMovies: custom.allowedMovies,
        };
        persistUser(authUser, "login");
        return;
      }

      logEvent(EVENT_TYPES.LOGIN_FAILURE, { username });
      throw new Error("Invalid credentials");
    },
    [persistUser]
  );

  const resolveOrCreateAllowedMovies = (username: string, requested?: string[]): string[] => {
    if (requested && requested.length > 0) {
      return requested;
    }
    const hash = username.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const movieIndex = (hash % 120) + 1;
    const movieId = `movie-v2-${movieIndex.toString().padStart(3, "0")}`;
    return [movieId];
  };

  const register = useCallback(
    async ({ username, password, allowedMovies }: RegisterInput) => {
      const safeUsername = normalizeUsername(username);
      const safePassword = password.trim();
      if (!safeUsername) {
        throw new Error("Username is required");
      }
      if (!safePassword) {
        throw new Error("Password is required");
      }

      const existingRecord = resolveUserRecord(safeUsername);
      if (existingRecord) {
        if (existingRecord.password !== safePassword) {
          throw new Error("Username already registered with different credentials.");
        }
        const authUser: AuthUser = {
          username: existingRecord.username,
          allowedMovies: existingRecord.allowedMovies,
        };
        persistUser(authUser, "login");
        return;
      }

      const customUsers = loadCustomUsers();
      const nextCustomUsers: CustomUserRecord[] = [
        ...customUsers,
        {
          username: safeUsername,
          allowedMovies: resolveOrCreateAllowedMovies(safeUsername, allowedMovies),
          password: safePassword,
        },
      ];

      saveCustomUsers(nextCustomUsers);
      persistCustomUsers(nextCustomUsers);
      setCustomUsers((prev) => {
        const hasUser = prev.some((user) => user.username.toLowerCase() === safeUsername.toLowerCase());
        if (hasUser) {
          return prev;
        }
        return [
          ...prev,
          {
            username: safeUsername,
            password: safePassword,
            allowedMovies: nextCustomUsers[nextCustomUsers.length - 1].allowedMovies,
          },
        ];
      });

      const authUser: AuthUser = {
        username: safeUsername,
        allowedMovies: nextCustomUsers[nextCustomUsers.length - 1].allowedMovies,
      };
      persistUser(authUser, "register");
    },
    [persistUser, resolveUserRecord, setCustomUsers]
  );

  const logout = useCallback(() => {
    if (currentUser) {
      logEvent(EVENT_TYPES.LOGOUT, { username: currentUser.username });
    }
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    setWatchlist([]);
  }, [currentUser]);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      watchlist,
      isInWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      addAssignedMovie,
      removeAssignedMovie,
      login,
      register,
      logout,
    }),
    [currentUser, watchlist, isInWatchlist, addToWatchlist, removeFromWatchlist, addAssignedMovie, removeAssignedMovie, login, logout, register]
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
