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
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  addAllowedMovie: (movieId: string) => void;
  removeAllowedMovie: (movieId: string) => void;
}

interface RegisterInput {
  username: string;
  password: string;
  allowedMovies?: string[];
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
  }, [currentUser]);

  const addAllowedMovie = useCallback(
    (movieId: string) => {
      if (!currentUser) return;
      
      // Check if movie is already in the list
      if (currentUser.allowedMovies.includes(movieId)) {
        return;
      }

      // Update current user
      const updatedUser: AuthUser = {
        ...currentUser,
        allowedMovies: [...currentUser.allowedMovies, movieId],
      };
      
      // Update state and localStorage
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      // Update custom users if this is a custom user
      const customUsers = loadCustomUsers();
      const customUserIndex = customUsers.findIndex(
        (user) => user.username.toLowerCase() === currentUser.username.toLowerCase()
      );
      
      if (customUserIndex !== -1) {
        const updatedCustomUsers = [...customUsers];
        updatedCustomUsers[customUserIndex] = {
          ...updatedCustomUsers[customUserIndex],
          allowedMovies: updatedUser.allowedMovies,
        };
        saveCustomUsers(updatedCustomUsers);
        persistCustomUsers(updatedCustomUsers);
        setCustomUsers((prev) => {
          const index = prev.findIndex(
            (user) => user.username.toLowerCase() === currentUser.username.toLowerCase()
          );
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              allowedMovies: updatedUser.allowedMovies,
            };
            return updated;
          }
          return prev;
        });
      }
    },
    [currentUser]
  );

  const removeAllowedMovie = useCallback(
    (movieId: string) => {
      if (!currentUser) return;
      
      // Check if movie is in the list
      if (!currentUser.allowedMovies.includes(movieId)) {
        return;
      }

      // Update current user
      const updatedUser: AuthUser = {
        ...currentUser,
        allowedMovies: currentUser.allowedMovies.filter((id) => id !== movieId),
      };
      
      // Update state and localStorage
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      // Update custom users if this is a custom user
      const customUsers = loadCustomUsers();
      const customUserIndex = customUsers.findIndex(
        (user) => user.username.toLowerCase() === currentUser.username.toLowerCase()
      );
      
      if (customUserIndex !== -1) {
        const updatedCustomUsers = [...customUsers];
        updatedCustomUsers[customUserIndex] = {
          ...updatedCustomUsers[customUserIndex],
          allowedMovies: updatedUser.allowedMovies,
        };
        saveCustomUsers(updatedCustomUsers);
        persistCustomUsers(updatedCustomUsers);
        setCustomUsers((prev) => {
          const index = prev.findIndex(
            (user) => user.username.toLowerCase() === currentUser.username.toLowerCase()
          );
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              allowedMovies: updatedUser.allowedMovies,
            };
            return updated;
          }
          return prev;
        });
      }
    },
    [currentUser]
  );

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      register,
      logout,
      addAllowedMovie,
      removeAllowedMovie,
    }),
    [currentUser, login, logout, register, addAllowedMovie, removeAllowedMovie]
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
