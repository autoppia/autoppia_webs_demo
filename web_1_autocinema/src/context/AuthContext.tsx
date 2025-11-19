"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { findUser, type UserRecord } from "@/data/users";
import { EVENT_TYPES, logEvent } from "@/library/events";

interface AuthUser {
  username: string;
  allowedMovies: string[];
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  registerAndLogin: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "autocinemaUser";
const CUSTOM_USERS_KEY = "autocinemaCustomUsers";

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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

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
  }, []);

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

  const registerAndLogin = useCallback(
    async (username: string, password: string) => {
      const safeUsername = username.trim();
      const safePassword = password.trim();
      if (!safeUsername || !safePassword) {
        throw new Error("Username and password are required");
      }

      const existing = findUser(safeUsername);
      if (existing && existing.password === safePassword) {
        const authUser: AuthUser = {
          username: existing.username,
          allowedMovies: existing.allowedMovies,
        };
        persistUser(authUser, "login");
        return;
      }

      const customUsers = loadCustomUsers();
      const custom = matchCustomUser(customUsers, safeUsername);
      if (custom) {
        if (custom.password !== safePassword) {
          throw new Error("Username already registered with different credentials.");
        }
        const authUser: AuthUser = {
          username: custom.username,
          allowedMovies: custom.allowedMovies,
        };
        persistUser(authUser, "login");
        return;
      }

      const hash = safeUsername.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const movieIndex = (hash % 120) + 1;
      const movieId = `movie-v2-${movieIndex.toString().padStart(3, "0")}`;

      const authUser: AuthUser = {
        username: safeUsername,
        allowedMovies: [movieId],
      };

      const nextCustomUsers: CustomUserRecord[] = [
        ...customUsers,
        {
          username: authUser.username,
          allowedMovies: authUser.allowedMovies,
          password: safePassword,
        },
      ];
      saveCustomUsers(nextCustomUsers);
      persistUser(authUser, "register");
    },
    [persistUser]
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
      registerAndLogin,
      logout,
    }),
    [currentUser, login, logout, registerAndLogin]
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
