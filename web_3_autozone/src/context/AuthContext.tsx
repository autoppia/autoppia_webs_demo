"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { EVENT_TYPES, logEvent } from "@/events";

const USERS_STORAGE_KEY = "autozone_auth_users_v1";
const CURRENT_USER_STORAGE_KEY = "autozone_auth_current_user_v1";

type StoredUser = {
  id: string;
  username: string;
  password: string;
  createdAt: string;
};

type AuthUser = {
  id: string;
  username: string;
};

type AuthContextValue = {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isStoredUser(value: unknown): value is StoredUser {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredUser>;
  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.username === "string" &&
    candidate.username.length > 0 &&
    typeof candidate.password === "string" &&
    typeof candidate.createdAt === "string"
  );
}

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredUser);
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function toAuthUser(user: StoredUser): AuthUser {
  return { id: user.id, username: user.username };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!isStoredUser(parsed)) return;
      const authUser = toAuthUser(parsed);
      setCurrentUser(authUser);
      window.localStorage.setItem("user", authUser.id);
    } catch {
      // ignore invalid storage
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();
    if (!normalizedUsername || !normalizedPassword) {
      throw new Error("Username and password are required.");
    }

    const users = readUsers();
    const existing = users.find(
      (user) => user.username.toLowerCase() === normalizedUsername.toLowerCase()
    );
    if (!existing || existing.password !== normalizedPassword) {
      throw new Error("Invalid credentials.");
    }

    const authUser = toAuthUser(existing);
    setCurrentUser(authUser);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(existing));
      window.localStorage.setItem("user", authUser.id);
    }
    logEvent(EVENT_TYPES.LOGIN, { username: authUser.username, userId: authUser.id });
  }, []);

  const register = useCallback(
    async (username: string, password: string, confirmPassword: string) => {
      const normalizedUsername = username.trim();
      const normalizedPassword = password.trim();
      const normalizedConfirm = confirmPassword.trim();
      if (!normalizedUsername) throw new Error("Username is required.");
      if (normalizedPassword.length < 3) {
        throw new Error("Password must be at least 3 characters.");
      }
      if (normalizedPassword !== normalizedConfirm) {
        throw new Error("Passwords do not match.");
      }

      const users = readUsers();
      if (
        users.some((user) => user.username.toLowerCase() === normalizedUsername.toLowerCase())
      ) {
        throw new Error("Username already exists.");
      }

      const newUser: StoredUser = {
        id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        username: normalizedUsername,
        password: normalizedPassword,
        createdAt: new Date().toISOString(),
      };
      writeUsers([...users, newUser]);

      const authUser = toAuthUser(newUser);
      setCurrentUser(authUser);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(newUser));
        window.localStorage.setItem("user", authUser.id);
      }
      logEvent(EVENT_TYPES.REGISTER, { username: authUser.username, userId: authUser.id });
    },
    []
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      window.localStorage.setItem("user", "null");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      register,
      logout,
    }),
    [currentUser, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
