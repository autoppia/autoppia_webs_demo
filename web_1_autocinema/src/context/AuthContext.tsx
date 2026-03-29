"use client";

import { type UserRecord, findUser } from "@/data/users";
import { getMovies } from "@/dynamic/v2";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { hashPassword, isStoredPasswordHash } from "@/shared/hash";
import { readJson, writeJson } from "@/shared/storage";
import {
  FILM_LIBRARY_UNAVAILABLE,
  resolvePrimaryAllowedMovies,
} from "@/shared/user-movie-assignment";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AuthUser {
  username: string;
  allowedMovies: string[];
  watchlist?: string[];
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  addAllowedMovie: (movieId: string) => void;
  removeAllowedMovie: (movieId: string) => void;
  addToWatchlist: (movieId: string) => void;
  removeFromWatchlist: (movieId: string) => void;
}

interface RegisterInput {
  username: string;
  password: string;
}

const STORAGE_KEY = "autocinemaUser";
const CUSTOM_USERS_KEY = "autocinemaCustomUsers";
const SEED_DATA_READY_EVENT = "autocinema:seedDataReady";

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

const getStoredCustomUsers = (): UserRecord[] =>
  readJson<UserRecord[]>(CUSTOM_USERS_KEY, []) ?? [];

const persistCustomUsers = (users: UserRecord[]) => {
  writeJson(CUSTOM_USERS_KEY, users);
};

function ensureResolvedAllowedMovies(username: string): string[] {
  const movies = getMovies();
  const resolved = resolvePrimaryAllowedMovies(movies, username);
  if (resolved.length === 0) {
    throw new Error(FILM_LIBRARY_UNAVAILABLE);
  }
  return resolved;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [customUsers, setCustomUsers] = useState<UserRecord[]>([]);

  useEffect(() => {
    setCustomUsers(getStoredCustomUsers());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSeedDataReady = () => {
      const movies = getMovies();

      setCurrentUser((prev) => {
        if (!movies.length) {
          if (prev) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
          }
          if (localStorage.getItem(STORAGE_KEY)) {
            localStorage.removeItem(STORAGE_KEY);
          }
          return null;
        }

        const resolveFor = (username: string) =>
          resolvePrimaryAllowedMovies(movies, username);

        if (prev) {
          const resolvedAllowedMovies = resolveFor(prev.username);
          if (resolvedAllowedMovies.length === 0) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
          }
          const same =
            resolvedAllowedMovies.length === prev.allowedMovies.length &&
            resolvedAllowedMovies.every(
              (movieId, index) => movieId === prev.allowedMovies[index],
            );
          if (same) return prev;

          const updated: AuthUser = {
            ...prev,
            allowedMovies: resolvedAllowedMovies,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        }

        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (!raw) return null;
          const parsed = JSON.parse(raw) as AuthUser;
          if (!parsed.watchlist) {
            parsed.watchlist = [];
          }
          const resolvedAllowedMovies = resolveFor(parsed.username);
          if (resolvedAllowedMovies.length === 0) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
          }
          const hydrated: AuthUser = {
            ...parsed,
            allowedMovies: resolvedAllowedMovies,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(hydrated));
          return hydrated;
        } catch {
          return null;
        }
      });
    };

    window.addEventListener(SEED_DATA_READY_EVENT, handleSeedDataReady as EventListener);
    return () => {
      window.removeEventListener(SEED_DATA_READY_EVENT, handleSeedDataReady as EventListener);
    };
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
    [customUsers],
  );

  const persistUser = useCallback((authUser: AuthUser, source: "login" | "register") => {
    setCurrentUser(authUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    // Only emit LOGIN on a successful login. Registration emits REGISTRATION from the register page.
    if (source === "login") {
      logEvent(EVENT_TYPES.LOGIN, { username: authUser.username, source });
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
          const resolvedAllowedMovies = ensureResolvedAllowedMovies(
            record.username,
          );
          persistUser(
            { username: record.username, allowedMovies: resolvedAllowedMovies, watchlist: [] },
            "login"
          );
          return;
        }
      }

      const customUsersList = loadCustomUsers();
      const custom = matchCustomUser(customUsersList, username);
      if (custom) {
        const ok = isStoredPasswordHash(custom.password)
          ? (await hashPassword(password)) === custom.password
          : custom.password === password;
        if (ok) {
          const resolvedAllowedMovies = ensureResolvedAllowedMovies(
            custom.username,
          );
          persistUser(
            { username: custom.username, allowedMovies: resolvedAllowedMovies, watchlist: [] },
            "login"
          );
          return;
        }
      }

      throw new Error("Invalid credentials");
    },
    [persistUser],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: setCustomUsers is setState
  const register = useCallback(
    async ({ username, password }: RegisterInput) => {
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
        const samePassword = isStoredPasswordHash(existingRecord.password)
          ? (await hashPassword(safePassword)) === existingRecord.password
          : existingRecord.password === safePassword;
        if (!samePassword) {
          throw new Error(
            "Username already registered with different credentials.",
          );
        }
        const resolvedAllowedMovies = ensureResolvedAllowedMovies(
          existingRecord.username,
        );
        const authUser: AuthUser = {
          username: existingRecord.username,
          allowedMovies: resolvedAllowedMovies,
          watchlist: [],
        };
        persistUser(authUser, "login");
        return;
      }

      const resolvedAllowedMovies = ensureResolvedAllowedMovies(safeUsername);
      const passwordHash = await hashPassword(safePassword);
      const customUsersList = loadCustomUsers();
      const nextCustomUsers: CustomUserRecord[] = [
        ...customUsersList,
        {
          username: safeUsername,
          allowedMovies: resolvedAllowedMovies,
          password: passwordHash,
        },
      ];

      saveCustomUsers(nextCustomUsers);
      persistCustomUsers(nextCustomUsers);
      setCustomUsers((prev) => {
        const hasUser = prev.some(
          (u) => u.username.toLowerCase() === safeUsername.toLowerCase(),
        );
        if (hasUser) return prev;
        return [
          ...prev,
          {
            username: safeUsername,
            password: passwordHash,
            allowedMovies: resolvedAllowedMovies,
          },
        ];
      });

      persistUser(
        {
          username: safeUsername,
          allowedMovies: resolvedAllowedMovies,
          watchlist: [],
        },
        "register",
      );
    },
    [persistUser, resolveUserRecord, setCustomUsers],
  );

  const logout = useCallback(() => {
    if (currentUser) {
      logEvent(EVENT_TYPES.LOGOUT, { username: currentUser.username });
    }
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, [currentUser]);

  // Extra allowed movies beyond the catalog-derived primary slot; login / seed reload still re-resolve to one primary id.
  const addAllowedMovie = useCallback(
    (movieId: string) => {
      if (!currentUser) return;

      if (currentUser.allowedMovies.includes(movieId)) {
        return;
      }

      const updatedUser: AuthUser = {
        ...currentUser,
        allowedMovies: [...currentUser.allowedMovies, movieId],
      };

      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      const customUsersList = loadCustomUsers();
      const customUserIndex = customUsersList.findIndex(
        (user) =>
          user.username.toLowerCase() === currentUser.username.toLowerCase(),
      );

      if (customUserIndex !== -1) {
        const updatedCustomUsers = [...customUsersList];
        updatedCustomUsers[customUserIndex] = {
          ...updatedCustomUsers[customUserIndex],
          allowedMovies: updatedUser.allowedMovies,
        };
        saveCustomUsers(updatedCustomUsers);
        persistCustomUsers(updatedCustomUsers);
        setCustomUsers((prev) => {
          const index = prev.findIndex(
            (user) =>
              user.username.toLowerCase() ===
              currentUser.username.toLowerCase(),
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
    [currentUser],
  );

  const removeAllowedMovie = useCallback(
    (movieId: string) => {
      if (!currentUser) return;

      if (!currentUser.allowedMovies.includes(movieId)) {
        return;
      }

      const updatedUser: AuthUser = {
        ...currentUser,
        allowedMovies: currentUser.allowedMovies.filter((id) => id !== movieId),
      };

      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      const customUsersList = loadCustomUsers();
      const customUserIndex = customUsersList.findIndex(
        (user) =>
          user.username.toLowerCase() === currentUser.username.toLowerCase(),
      );

      if (customUserIndex !== -1) {
        const updatedCustomUsers = [...customUsersList];
        updatedCustomUsers[customUserIndex] = {
          ...updatedCustomUsers[customUserIndex],
          allowedMovies: updatedUser.allowedMovies,
        };
        saveCustomUsers(updatedCustomUsers);
        persistCustomUsers(updatedCustomUsers);
        setCustomUsers((prev) => {
          const index = prev.findIndex(
            (user) =>
              user.username.toLowerCase() ===
              currentUser.username.toLowerCase(),
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
    [currentUser],
  );

  const addToWatchlist = useCallback(
    (movieId: string) => {
      if (!currentUser) return;

      const watchlist = currentUser.watchlist || [];

      if (watchlist.includes(movieId)) {
        return;
      }

      const updatedUser: AuthUser = {
        ...currentUser,
        watchlist: [...watchlist, movieId],
      };

      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    },
    [currentUser],
  );

  const removeFromWatchlist = useCallback(
    (movieId: string) => {
      if (!currentUser) return;

      const watchlist = currentUser.watchlist || [];

      if (!watchlist.includes(movieId)) {
        return;
      }

      const updatedUser: AuthUser = {
        ...currentUser,
        watchlist: watchlist.filter((id) => id !== movieId),
      };

      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    },
    [currentUser],
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
      addToWatchlist,
      removeFromWatchlist,
    }),
    [
      currentUser,
      login,
      logout,
      register,
      addAllowedMovie,
      removeAllowedMovie,
      addToWatchlist,
      removeFromWatchlist,
    ],
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
