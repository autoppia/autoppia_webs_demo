"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { EVENT_TYPES, logEvent } from "@/events";
import { hashPassword, isStoredPasswordHash } from "@/shared/hash";

const USERS_STORAGE_KEY = "autozone_auth_users_v1";
const CURRENT_USER_STORAGE_KEY = "autozone_auth_current_user_v1";

type StoredUser = {
  id: string;
  username: string;
  /** SHA-256 hex (preferred) or legacy plain text for backward compatibility. */
  password: string;
  createdAt: string;
};

type SessionUser = {
  id: string;
  username: string;
  createdAt: string;
};

type AuthUser = {
  id: string;
  username: string;
  createdAt: string;
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

function isSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== "object") return false;
  const o = value as Partial<SessionUser>;
  return (
    typeof o.id === "string" &&
    o.id.length > 0 &&
    typeof o.username === "string" &&
    typeof o.createdAt === "string"
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
  return { id: user.id, username: user.username, createdAt: user.createdAt };
}

function persistSession(session: SessionUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(session));
  window.localStorage.setItem("user", session.id);
}

function emitAuthChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("autozone:auth-changed"));
}

function readInitialSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isSessionUser(parsed)) return null;
    return { id: parsed.id, username: parsed.username, createdAt: parsed.createdAt };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(readInitialSession);

  useEffect(() => {
    const session = readInitialSession();
    if (session) {
      setCurrentUser(session);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("user", session.id);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CURRENT_USER_STORAGE_KEY && event.key !== "user") return;
      setCurrentUser(readInitialSession());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
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
    if (!existing) {
      throw new Error("Invalid credentials.");
    }

    const passwordOk = isStoredPasswordHash(existing.password)
      ? (await hashPassword(normalizedPassword)) === existing.password
      : existing.password === normalizedPassword;

    if (!passwordOk) {
      throw new Error("Invalid credentials.");
    }

    let nextUsers = users;
    if (!isStoredPasswordHash(existing.password) && existing.password === normalizedPassword) {
      const upgradedHash = await hashPassword(normalizedPassword);
      nextUsers = users.map((u) =>
        u.id === existing.id ? { ...u, password: upgradedHash } : u
      );
      writeUsers(nextUsers);
    }

    const authUser = toAuthUser(existing);
    setCurrentUser(authUser);
    persistSession({
      id: authUser.id,
      username: authUser.username,
      createdAt: authUser.createdAt,
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("autozone:auth-login", { detail: { userId: authUser.id } })
      );
    }
    emitAuthChanged();
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

      const passwordHash = await hashPassword(normalizedPassword);
      const now = new Date().toISOString();
      const newUser: StoredUser = {
        id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        username: normalizedUsername,
        password: passwordHash,
        createdAt: now,
      };
      writeUsers([...users, newUser]);

      const authUser = toAuthUser(newUser);
      setCurrentUser(authUser);
      persistSession({
        id: authUser.id,
        username: authUser.username,
        createdAt: authUser.createdAt,
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("autozone:auth-login", { detail: { userId: authUser.id } })
        );
      }
      emitAuthChanged();
      logEvent(EVENT_TYPES.REGISTER, { username: authUser.username, userId: authUser.id });
    },
    []
  );

  const logout = useCallback(() => {
    if (currentUser && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("autozone:auth-logout", { detail: { previousUserId: currentUser.id } })
      );
    }
    if (currentUser) {
      logEvent(EVENT_TYPES.LOGOUT, { username: currentUser.username, userId: currentUser.id });
    }
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      window.localStorage.setItem("user", "null");
    }
    emitAuthChanged();
  }, [currentUser]);

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
