"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type TeamMember = {
  id: string;
  name: string;
  role: string;
};

export type Team = {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
};

type TeamsContextType = {
  teams: Team[];
  addTeam: (team: Omit<Team, "id"> & { id?: string }) => void;
  removeTeam: (id: string) => void;
};

const TeamsContext = createContext<TeamsContextType | null>(null);

const STORAGE_KEY = "autolist_teams";

const generateId = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `team-${Date.now()}-${Math.floor(Math.random() * 100000)}`);

const defaultTeams: Team[] = [
  {
    id: "autolist-devs",
    name: "AutoList Devs",
    description: "Core builders for AutoList frontends",
    members: [
      { id: "alex@example.com", name: "Alex Carter", role: "Lead Engineer" },
      { id: "jamie@example.com", name: "Jamie Lee", role: "Engineer" },
    ],
  },
];

export function TeamsProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(defaultTeams);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Team[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTeams(parsed);
        } else {
          setTeams(defaultTeams);
        }
      }
    } catch (error) {
      console.warn("[TeamsContext] Failed to load teams from storage", error);
    }
  }, []);

  const persist = useCallback((next: Team[]) => {
    setTeams(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        console.warn("[TeamsContext] Failed to persist teams", error);
      }
    }
  }, []);

  const addTeam = useCallback(
    (team: Omit<Team, "id"> & { id?: string }) => {
      const id = team.id || generateId();
      const next: Team[] = [...teams, { ...team, id }];
      persist(next);
    },
    [teams, persist]
  );

  const removeTeam = useCallback(
    (id: string) => {
      const next = teams.filter((t) => t.id !== id);
      persist(next);
    },
    [teams, persist]
  );

  return (
    <TeamsContext.Provider value={{ teams, addTeam, removeTeam }}>
      {children}
    </TeamsContext.Provider>
  );
}

export function useTeams() {
  const ctx = useContext(TeamsContext);
  if (!ctx) {
    throw new Error("useTeams must be used within a TeamsProvider");
  }
  return ctx;
}
