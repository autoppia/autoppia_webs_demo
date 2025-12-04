"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Project = {
  id: string;
  name: string;
  badge?: string;
};

type ProjectsContextType = {
  projects: Project[];
  addProject: (name: string) => void;
  removeProject: (id: string) => void;
};

const ProjectsContext = createContext<ProjectsContextType | null>(null);

const STORAGE_KEY = "autolist_projects";

const defaultProjects: Project[] = [
  { id: "getting-started", name: "Getting Started", badge: "13" },
];

const generateId = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `proj-${Date.now()}-${Math.floor(Math.random() * 100000)}`);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(defaultProjects);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Project[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
        }
      }
    } catch (error) {
      console.warn("[ProjectsContext] Failed to load projects", error);
    }
  }, []);

  const persist = useCallback((next: Project[]) => {
    setProjects(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        console.warn("[ProjectsContext] Failed to persist projects", error);
      }
    }
  }, []);

  const addProject = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const next = [...projects, { id: generateId(), name: trimmed }];
      persist(next);
    },
    [projects, persist]
  );

  const removeProject = useCallback(
    (id: string) => {
      const next = projects.filter((p) => p.id !== id);
      persist(next);
    },
    [projects, persist]
  );

  return (
    <ProjectsContext.Provider value={{ projects, addProject, removeProject }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return ctx;
}
