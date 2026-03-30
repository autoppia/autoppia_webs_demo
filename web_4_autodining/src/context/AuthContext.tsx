"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { findUser, type UserRecord } from "@/data/users";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { hashPassword, isStoredPasswordHash } from "@/shared/hash";
import { readJson, writeJson } from "@/shared/storage";

interface AuthUser {
  username: string;
  email: string;
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

const STORAGE_KEY = "autodiningUser";
const CUSTOM_USERS_KEY = "autodiningCustomUsers";

interface CustomUserRecord extends AuthUser {
  password: string;
}

const loadCustomUsers = (): CustomUserRecord[] => {
  return readJson<CustomUserRecord[]>(CUSTOM_USERS_KEY, []) ?? [];
};

const saveCustomUsers = (users: CustomUserRecord[]) => {
  writeJson(CUSTOM_USERS_KEY, users);
};

const matchCustomUser = (users: CustomUserRecord[], username: string) => {
  const normalized = username.toLowerCase();
  return users.find((user) => user.username.toLowerCase() === normalized);
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeUsername = (value: string) => value.trim();

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = readJson<AuthUser>(STORAGE_KEY);
    if (stored) {
      setCurrentUser(stored);
    }
  }, []);

  const persistUser = useCallback((authUser: AuthUser, source: "login" | "register") => {
    setCurrentUser(authUser);
    writeJson(STORAGE_KEY, authUser);
    localStorage.setItem("user", authUser.username); // Fallback for existing logEvent user tracking

    if (source === "login") {
      logEvent(EVENT_TYPES.LOGIN, { username: authUser.username, source });
    } else if (source === "register") {
      logEvent(EVENT_TYPES.REGISTER, { username: authUser.username, source });
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const record = findUser(username);
      if (record) {
        const ok = isStoredPasswordHash(record.password)
          ? (await hashPassword(password)) === record.password
          : record.password === password;
        if (ok) {
          // Mock users don't have email, use a default
          persistUser({ username: record.username, email: `${record.username}@example.com` }, "login");
          return;
        }
      }

      const customUsers = loadCustomUsers();
      const custom = matchCustomUser(customUsers, username);
      if (custom) {
        const ok = isStoredPasswordHash(custom.password)
          ? (await hashPassword(password)) === custom.password
          : custom.password === password;
        if (ok) {
          persistUser({ username: custom.username, email: custom.email }, "login");
          return;
        }
      }

      throw new Error("Invalid credentials");
    },
    [persistUser]
  );

  const register = useCallback(
    async ({ username, email, password }: RegisterInput) => {
      const safeUsername = normalizeUsername(username);
      const safeEmail = email.trim();
      const safePassword = password.trim();

      if (!safeUsername) throw new Error("Username is required");
      if (!safeEmail) throw new Error("Email is required");
      if (!safePassword) throw new Error("Password is required");

      const existingRecord = findUser(safeUsername);
      if (existingRecord) throw new Error("Username already exists");

      const customUsers = loadCustomUsers();
      if (matchCustomUser(customUsers, safeUsername)) {
        throw new Error("Username already taken");
      }

      const passwordHash = await hashPassword(safePassword);
      const nextCustomUsers: CustomUserRecord[] = [
        ...customUsers,
        { username: safeUsername, email: safeEmail, password: passwordHash },
      ];

      saveCustomUsers(nextCustomUsers);
      persistUser({ username: safeUsername, email: safeEmail }, "register");
    },
    [persistUser]
  );

  const logout = useCallback(() => {
    if (currentUser) {
      logEvent(EVENT_TYPES.LOGOUT, { username: currentUser.username });
    }
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("user");
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
