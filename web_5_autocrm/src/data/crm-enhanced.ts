/**
 * Enhanced CRM Data with AI Generation Support
 * 
 * This file provides both static and dynamic data generation
 * for the AutoCRM application.
 */

import { readJson, writeJson } from "@/shared/storage";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { clampBaseSeed } from "@/shared/seed-resolver";
import fallbackClients from "./original/clients_1.json";
import fallbackMatters from "./original/matters_1.json";
import fallbackFiles from "./original/files_1.json";
import fallbackEvents from "./original/events_1.json";
import fallbackLogs from "./original/logs_1.json";

// Client-side cache keys
const CACHE_KEYS = {
  clients: "autocrm_generated_clients_v1",
  matters: "autocrm_generated_matters_v1",
};

// Dynamic data arrays
let dynamicClients: any[] = (fallbackClients as any[]);
let dynamicMatters: any[] = (fallbackMatters as any[]);
let dynamicFiles: any[] = (fallbackFiles as any[]);
let dynamicEvents: any[] = (fallbackEvents as any[]);
let dynamicLogs: any[] = (fallbackLogs as any[]);

// Cache functions
export function readCachedClients(): any[] | null {
  return readJson<any[]>(CACHE_KEYS.clients, null);
}

export function writeCachedClients(clientsToCache: any[]): void {
  writeJson(CACHE_KEYS.clients, clientsToCache);
}

export function readCachedMatters(): any[] | null {
  return readJson<any[]>(CACHE_KEYS.matters, null);
}

export function writeCachedMatters(mattersToCache: any[]): void {
  writeJson(CACHE_KEYS.matters, mattersToCache);
}

/**
 * Normalize client data to ensure consistent structure
 */
function normalizeClient(client: any, index: number): any {
  return {
    id: client.id || `CL-${1000 + index}`,
    name: client.name || `Client ${index + 1}`,
    email: client.email || `client${index + 1}@example.com`,
    matters: typeof client.matters === 'number' ? client.matters : (Math.floor(Math.random() * 5) + 1),
    avatar: client.avatar || "",
    status: client.status || 'Active',
    last: client.last || 'Today',
  };
}

/**
 * Normalize matter data to ensure consistent structure
 */
function normalizeMatter(matter: any, index: number): any {
  return {
    id: matter.id || `MAT-${Math.floor(Math.random() * 9000 + 1000)}`,
    name: matter.name || matter.title || 'Untitled Matter',
    client: matter.client || '—',
    status: matter.status || 'Active',
    updated: matter.updated || 'Today',
  };
}

const clampSeed = (value: number, fallback = 1): number =>
  value >= 1 && value <= 300 ? value : fallback;

const getBaseSeedFromUrl = (): number | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const seedParam = params.get("seed");
  if (seedParam) {
    const parsed = Number.parseInt(seedParam, 10);
    if (Number.isFinite(parsed)) {
      return clampBaseSeed(parsed);
    }
  }
  return null;
};

const resolveSeed = (seedValue?: number | null): number => {
  const baseSeed = getBaseSeedFromUrl();
  return clampSeed(seedValue ?? baseSeed ?? 1);
};

/**
 * Initialize clients with V2 system (DB mode or fallback)
 */
export async function initializeClients(seedOverride?: number | null): Promise<any[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const effectiveSeed = resolveSeed(seedOverride);
  if (effectiveSeed === 1 && dbModeEnabled) {
    console.log("[autocrm] Base seed is 1, using original data (skipping DB/AI modes)");
    // Use local fallback data (from webs_server/initial_data/web_5_autocrm/original/)
    // These files are imported at build time and represent the original data
    dynamicClients = (fallbackClients as any[]).map((c, i) => normalizeClient(c, i));
    return dynamicClients;
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    try {
      const clients = await fetchSeededSelection<any>({
        projectKey: "web_5_autocrm",
        entityType: "clients",
        seedValue: effectiveSeed,
        limit: 50, // Fixed limit of 50 items for DB mode
        method: "distribute",
        filterKey: "status",
      });

      if (Array.isArray(clients) && clients.length > 0) {
        console.log(
          `[autocrm] Loaded ${clients.length} clients from dataset (seed=${effectiveSeed})`
        );
        dynamicClients = clients.map((c, i) => normalizeClient(c, i));
        return dynamicClients;
      }

      console.warn(`[autocrm] No clients returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      console.warn("[autocrm] Backend unavailable, falling back to local JSON:", error);
    }
  }

  // Fallback to local JSON
  dynamicClients = (fallbackClients as any[]).map((c, i) => normalizeClient(c, i));
  return dynamicClients;
}

/**
 * Initialize matters with V2 system (DB mode or fallback)
 */
export async function initializeMatters(seedOverride?: number | null): Promise<any[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const effectiveSeed = resolveSeed(seedOverride);
  if (effectiveSeed === 1 && dbModeEnabled) {
    console.log("[autocrm] Base seed is 1, using original data for matters (skipping DB/AI modes)");
    // Use local fallback data (from webs_server/initial_data/web_5_autocrm/original/)
    dynamicMatters = (fallbackMatters as any[]).map((m, i) => normalizeMatter(m, i));
    return dynamicMatters;
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    try {
      const matters = await fetchSeededSelection<any>({
        projectKey: "web_5_autocrm",
        entityType: "matters",
        seedValue: effectiveSeed,
        limit: 50, // Fixed limit of 50 items for DB mode
        method: "distribute",
        filterKey: "status",
      });

      if (Array.isArray(matters) && matters.length > 0) {
        console.log(
          `[autocrm] Loaded ${matters.length} matters from dataset (seed=${effectiveSeed})`
        );
        dynamicMatters = matters.map((m, i) => normalizeMatter(m, i));
        return dynamicMatters;
      }

      console.warn(`[autocrm] No matters returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      console.warn("[autocrm] Backend unavailable, falling back to local JSON:", error);
    }
  }

  // Fallback to local JSON
  dynamicMatters = (fallbackMatters as any[]).map((m, i) => normalizeMatter(m, i));
  return dynamicMatters;
}

/**
 * Initialize files with V2 system (DB mode or fallback)
 */
export async function initializeFiles(seedOverride?: number | null): Promise<any[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const effectiveSeed = resolveSeed(seedOverride);
  if (effectiveSeed === 1 && dbModeEnabled) {
    console.log("[autocrm] Base seed is 1, using original data for files (skipping DB/AI modes)");
    dynamicFiles = (fallbackFiles as any[]);
    return dynamicFiles;
  }
  
  if (dbModeEnabled) {
    try {
      const files = await fetchSeededSelection<any>({
        projectKey: "web_5_autocrm",
        entityType: "files",
        seedValue: effectiveSeed,
        limit: 50,
        method: "distribute",
      });

      if (Array.isArray(files) && files.length > 0) {
        console.log(`[autocrm] Loaded ${files.length} files from dataset (seed=${effectiveSeed})`);
        dynamicFiles = files;
        return dynamicFiles;
      }

      console.warn(`[autocrm] No files returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      console.warn("[autocrm] Backend unavailable, falling back to local JSON:", error);
    }
  }

  dynamicFiles = (fallbackFiles as any[]);
  return dynamicFiles;
}

/**
 * Initialize events with V2 system (DB mode or fallback)
 */
export async function initializeEvents(seedOverride?: number | null): Promise<any[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const effectiveSeed = resolveSeed(seedOverride);
  if (effectiveSeed === 1 && dbModeEnabled) {
    console.log("[autocrm] Base seed is 1, using original data for events (skipping DB/AI modes)");
    dynamicEvents = (fallbackEvents as any[]);
    return dynamicEvents;
  }
  
  if (dbModeEnabled) {
    try {
      const events = await fetchSeededSelection<any>({
        projectKey: "web_5_autocrm",
        entityType: "events",
        seedValue: effectiveSeed,
        limit: 50,
        method: "distribute",
      });

      if (Array.isArray(events) && events.length > 0) {
        console.log(`[autocrm] Loaded ${events.length} events from dataset (seed=${effectiveSeed})`);
        dynamicEvents = events;
        return dynamicEvents;
      }

      console.warn(`[autocrm] No events returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      console.warn("[autocrm] Backend unavailable, falling back to local JSON:", error);
    }
  }

  dynamicEvents = (fallbackEvents as any[]);
  return dynamicEvents;
}

/**
 * Initialize logs with V2 system (DB mode or fallback)
 */
export async function initializeLogs(seedOverride?: number | null): Promise<any[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const effectiveSeed = resolveSeed(seedOverride);
  if (effectiveSeed === 1 && dbModeEnabled) {
    console.log("[autocrm] Base seed is 1, using original data for logs (skipping DB/AI modes)");
    dynamicLogs = (fallbackLogs as any[]);
    return dynamicLogs;
  }
  
  if (dbModeEnabled) {
    try {
      const logs = await fetchSeededSelection<any>({
        projectKey: "web_5_autocrm",
        entityType: "logs",
        seedValue: effectiveSeed,
        limit: 50,
        method: "distribute",
      });

      if (Array.isArray(logs) && logs.length > 0) {
        console.log(`[autocrm] Loaded ${logs.length} logs from dataset (seed=${effectiveSeed})`);
        dynamicLogs = logs;
        return dynamicLogs;
      }

      console.warn(`[autocrm] No logs returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      console.warn("[autocrm] Backend unavailable, falling back to local JSON:", error);
    }
  }

  dynamicLogs = (fallbackLogs as any[]);
  return dynamicLogs;
}

// Runtime-only DB fetch for when DB mode is enabled
export async function loadClientsFromDb(seedOverride?: number): Promise<any[]> {
  if (!isDbLoadModeEnabled()) {
    return [];
  }
  
  try {
    const seed = resolveSeed(seedOverride);
    const limit = 50;
    const selected = await fetchSeededSelection<any>({
      projectKey: "web_5_autocrm",
      entityType: "clients",
      seedValue: seed,
      limit,
      method: "distribute",
      filterKey: "status",
    });
    
    if (selected && selected.length > 0) {
      const categories = ["Active", "On Hold", "Archived"];
      const byCategory: Record<string, any[]> = {};
      for (const c of selected) {
        const cat = c.status || "Unknown";
        byCategory[cat] = byCategory[cat] || [];
        byCategory[cat].push(c);
      }

      const supplemented: any[] = [...selected];
      for (const cat of categories) {
        if (!byCategory[cat] || byCategory[cat].length === 0) {
          const fallback = (fallbackClients as any[]).filter((c) => c.status === cat).slice(0, 5);
          if (fallback.length > 0) {
            supplemented.push(...fallback);
          }
        }
      }

      const seen = new Set<string>();
      const deduped = supplemented.filter((c) => {
        const id = c.id || `${c.name}-${c.status}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      return deduped.map(normalizeClient);
    }
  } catch (e) {
    console.warn("Failed to load seeded clients from DB:", e);
  }
  
  return [];
}

export async function loadMattersFromDb(seedOverride?: number): Promise<any[]> {
  if (!isDbLoadModeEnabled()) {
    return [];
  }
  
  try {
    const seed = resolveSeed(seedOverride);
    const limit = 50;
    const selected = await fetchSeededSelection<any>({
      projectKey: "web_5_autocrm",
      entityType: "matters",
      seedValue: seed,
      limit,
      method: "distribute",
      filterKey: "status",
    });
    
    if (selected && selected.length > 0) {
      return selected.map(normalizeMatter);
    }
  } catch (e) {
    console.warn("Failed to load seeded matters from DB:", e);
  }
  
  return [];
}

// Export the dynamic data arrays for direct access
export { 
  dynamicClients as clients,
  dynamicMatters as matters,
  dynamicFiles as files,
  dynamicEvents as events,
  dynamicLogs as logs,
};
