/**
 * Enhanced CRM Data with AI Generation Support
 * 
 * This file provides both static and dynamic data generation
 * for the AutoCRM application.
 */

import { readJson, writeJson } from "@/shared/storage";
import { 
  generateClientsWithFallback, 
  generateMattersWithFallback,
  generateFilesWithFallback,
  generateEventsWithFallback,
  generateLogsWithFallback,
  isDataGenerationAvailable 
} from "@/utils/dataGenerator";
import { fetchSeededSelection, getSeedValueFromEnv, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import fallbackClients from "./original/clients_1.json";
import fallbackMatters from "./original/matters_1.json";
import fallbackFiles from "./original/files_1.json";
import fallbackEvents from "./original/events_1.json";
import fallbackLogs from "./original/logs_1.json";

// Client-side cache keys
const CACHE_KEYS = {
  clients: "autocrm_generated_clients_v1",
  matters: "autocrm_generated_matters_v1",
  files: "autocrm_generated_files_v1",
  events: "autocrm_generated_events_v1",
  logs: "autocrm_generated_logs_v1",
};

// Note: v2Seed is now passed directly to initializeClients, initializeMatters, etc.
// This function is kept for backward compatibility but should use the seed parameter
function getActiveSeed(defaultSeed: number = 1): number {
  return getSeedValueFromEnv(defaultSeed);
}

// Dynamic data arrays
let dynamicClients: any[] = isDataGenerationAvailable() ? [] : (fallbackClients as any[]);
let dynamicMatters: any[] = isDataGenerationAvailable() ? [] : (fallbackMatters as any[]);
let dynamicFiles: any[] = isDataGenerationAvailable() ? [] : (fallbackFiles as any[]);
let dynamicEvents: any[] = isDataGenerationAvailable() ? [] : (fallbackEvents as any[]);
let dynamicLogs: any[] = isDataGenerationAvailable() ? [] : (fallbackLogs as any[]);

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

export function readCachedFiles(): any[] | null {
  return readJson<any[]>(CACHE_KEYS.files, null);
}

export function writeCachedFiles(filesToCache: any[]): void {
  writeJson(CACHE_KEYS.files, filesToCache);
}

export function readCachedEvents(): any[] | null {
  return readJson<any[]>(CACHE_KEYS.events, null);
}

export function writeCachedEvents(eventsToCache: any[]): void {
  writeJson(CACHE_KEYS.events, eventsToCache);
}

export function readCachedLogs(): any[] | null {
  return readJson<any[]>(CACHE_KEYS.logs, null);
}

export function writeCachedLogs(logsToCache: any[]): void {
  writeJson(CACHE_KEYS.logs, logsToCache);
}

// Configuration for async data generation
const DATA_GENERATION_CONFIG = {
  DEFAULT_DELAY_BETWEEN_CALLS: 1000,
  DEFAULT_CLIENTS_COUNT: 60,
  DEFAULT_MATTERS_COUNT: 50,
  DEFAULT_FILES_COUNT: 50,
  DEFAULT_EVENTS_COUNT: 30,
  DEFAULT_LOGS_COUNT: 40,
  MAX_RETRY_ATTEMPTS: 2,
  AVAILABLE_CLIENT_CATEGORIES: ["Active", "On Hold", "Archived"],
  AVAILABLE_MATTER_CATEGORIES: ["Active", "On Hold", "Archived"],
};

function isUniqueGenerationEnabled(): boolean {
  const raw = (process.env.NEXT_PUBLIC_DATA_GENERATION_UNIQUE || process.env.DATA_GENERATION_UNIQUE || '').toString().toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
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

/**
 * Get v2 seed from window (synchronized by SeedContext)
 */
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as any).__autocrmV2Seed;
  if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
    return value;
  }
  return null;
};

/**
 * Initialize clients with data generation if enabled
 */
export async function initializeClients(v2SeedValue?: number | null): Promise<any[]> {
  // Check if v2 (DB mode) is enabled
  let dbModeEnabled = false;
  try {
    dbModeEnabled = isDbLoadModeEnabled();
  } catch {}

  // Determine the seed to use
  const effectiveSeed: number = dbModeEnabled ? (v2SeedValue ?? getRuntimeV2Seed() ?? 1) : 1;

  if (!dbModeEnabled) {
    dynamicClients = (fallbackClients as any[]).map((c, i) => normalizeClient(c, i));
    return dynamicClients;
  }

  if (typeof window !== "undefined") {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Load from DB with the determined seed
  try {
    // Clear existing clients to force fresh load
    dynamicClients = [];
    const fromDb = await fetchSeededSelection<any>({
      projectKey: "web_5_autocrm",
      entityType: "clients",
      seedValue: effectiveSeed,
      limit: 100,
      method: "distribute",
      filterKey: "status",
    });
    
    console.log(`[autocrm] Fetched from DB with seed=${effectiveSeed}:`, fromDb);
    
    if (fromDb && fromDb.length > 0) {
      dynamicClients = fromDb.map(normalizeClient);
      return dynamicClients;
    } else {
      console.warn(`[autocrm] No data returned from DB with seed=${effectiveSeed}`);
      throw new Error(`[autocrm] No data found for seed=${effectiveSeed}`);
    }
  } catch (err) {
    console.error(`[autocrm] Failed to load from DB with seed=${effectiveSeed}:`, err);
    dynamicClients = (fallbackClients as any[]).map((c, i) => normalizeClient(c, i));
    return dynamicClients;
  }
}

/**
 * Initialize matters with data generation if enabled
 */
export async function initializeMatters(): Promise<any[]> {
  // If DB mode is off, return fallback immediately
  let dbModeEnabled = false;
  try {
    dbModeEnabled = isDbLoadModeEnabled();
  } catch {}
  if (!dbModeEnabled) {
    dynamicMatters = (fallbackMatters as any[]).map((m, i) => normalizeMatter(m, i));
    return dynamicMatters;
  }

  // DB mode on or generation allowed
  if (!isDataGenerationAvailable()) {
    dynamicMatters = (fallbackMatters as any[]).map((m, i) => normalizeMatter(m, i));
    return dynamicMatters;
  }

  try {
    if (!isUniqueGenerationEnabled()) {
      const cached = readCachedMatters();
      if (cached && cached.length > 0) {
        dynamicMatters = cached.map(normalizeMatter);
        return dynamicMatters;
      }
    }

    console.log("🚀 Starting async data generation for matters...");

    const count = DATA_GENERATION_CONFIG.DEFAULT_MATTERS_COUNT;
    const categories = DATA_GENERATION_CONFIG.AVAILABLE_MATTER_CATEGORIES;

    const generatedMatters = await generateMattersWithFallback(
      [],
      count,
      categories
    );

    const allowed = new Set(categories);
    const normalized = generatedMatters.map((m, i) => ({
      ...normalizeMatter(m, i),
      status: allowed.has(m.status || "") ? m.status : "Active",
    }));

    dynamicMatters = normalized;
    if (!isUniqueGenerationEnabled()) {
      writeCachedMatters(dynamicMatters);
    }
    return dynamicMatters;
  } catch (error) {
    console.warn("⚠️ Failed to generate matters while generation is enabled. Error:", error);
    dynamicMatters = (fallbackMatters as any[]).map((m, i) => normalizeMatter(m, i));
    return dynamicMatters;
  }
}

/**
 * Initialize files with data generation if enabled
 */
export async function initializeFiles(): Promise<any[]> {
  let dbModeEnabled = false;
  try {
    dbModeEnabled = isDbLoadModeEnabled();
  } catch {}
  if (!dbModeEnabled) {
    dynamicFiles = (fallbackFiles as any[]);
    return dynamicFiles;
  }

  if (!isDataGenerationAvailable()) {
    dynamicFiles = (fallbackFiles as any[]);
    return dynamicFiles;
  }

  try {
    if (!isUniqueGenerationEnabled()) {
      const cached = readCachedFiles();
      if (cached && cached.length > 0) {
        dynamicFiles = cached;
        return dynamicFiles;
      }
    }

    const count = DATA_GENERATION_CONFIG.DEFAULT_FILES_COUNT;
    const generatedFiles = await generateFilesWithFallback([], count);
    
    dynamicFiles = generatedFiles;
    if (!isUniqueGenerationEnabled()) {
      writeCachedFiles(dynamicFiles);
    }
    return dynamicFiles;
  } catch (error) {
    console.warn("⚠️ Failed to generate files. Error:", error);
    dynamicFiles = (fallbackFiles as any[]);
    return dynamicFiles;
  }
}

/**
 * Initialize events with data generation if enabled
 */
export async function initializeEvents(): Promise<any[]> {
  let dbModeEnabled = false;
  try {
    dbModeEnabled = isDbLoadModeEnabled();
  } catch {}
  if (!dbModeEnabled) {
    dynamicEvents = (fallbackEvents as any[]);
    return dynamicEvents;
  }

  if (!isDataGenerationAvailable()) {
    dynamicEvents = (fallbackEvents as any[]);
    return dynamicEvents;
  }

  try {
    if (!isUniqueGenerationEnabled()) {
      const cached = readCachedEvents();
      if (cached && cached.length > 0) {
        dynamicEvents = cached;
        return dynamicEvents;
      }
    }

    const count = DATA_GENERATION_CONFIG.DEFAULT_EVENTS_COUNT;
    const generatedEvents = await generateEventsWithFallback([], count);
    
    dynamicEvents = generatedEvents;
    if (!isUniqueGenerationEnabled()) {
      writeCachedEvents(dynamicEvents);
    }
    return dynamicEvents;
  } catch (error) {
    console.warn("⚠️ Failed to generate events. Error:", error);
    dynamicEvents = (fallbackEvents as any[]);
    return dynamicEvents;
  }
}

/**
 * Initialize logs with data generation if enabled
 */
export async function initializeLogs(): Promise<any[]> {
  let dbModeEnabled = false;
  try {
    dbModeEnabled = isDbLoadModeEnabled();
  } catch {}
  if (!dbModeEnabled) {
    dynamicLogs = (fallbackLogs as any[]);
    return dynamicLogs;
  }

  if (!isDataGenerationAvailable()) {
    dynamicLogs = (fallbackLogs as any[]);
    return dynamicLogs;
  }

  try {
    if (!isUniqueGenerationEnabled()) {
      const cached = readCachedLogs();
      if (cached && cached.length > 0) {
        dynamicLogs = cached;
        return dynamicLogs;
      }
    }

    const count = DATA_GENERATION_CONFIG.DEFAULT_LOGS_COUNT;
    const generatedLogs = await generateLogsWithFallback([], count);
    
    dynamicLogs = generatedLogs;
    if (!isUniqueGenerationEnabled()) {
      writeCachedLogs(dynamicLogs);
    }
    return dynamicLogs;
  } catch (error) {
    console.warn("⚠️ Failed to generate logs. Error:", error);
    dynamicLogs = (fallbackLogs as any[]);
    return dynamicLogs;
  }
}

// Runtime-only DB fetch for when DB mode is enabled
export async function loadClientsFromDb(seedOverride?: number): Promise<any[]> {
  if (!isDbLoadModeEnabled()) {
    return [];
  }
  
  try {
    const seed = typeof seedOverride === "number" ? seedOverride : getActiveSeed(1);
    const limit = 100;
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
    const seed = typeof seedOverride === "number" ? seedOverride : getActiveSeed(1);
    const limit = 100;
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
