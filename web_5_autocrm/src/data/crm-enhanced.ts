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
import { clients as originalClients, DEMO_MATTERS, DEMO_FILES, EVENTS, DEMO_LOGS } from "@/library/dataset";

// Client-side cache keys
const CACHE_KEYS = {
  clients: "autocrm_generated_clients_v1",
  matters: "autocrm_generated_matters_v1",
  files: "autocrm_generated_files_v1",
  events: "autocrm_generated_events_v1",
  logs: "autocrm_generated_logs_v1",
};

// Dynamic data arrays
let dynamicClients: any[] = isDataGenerationAvailable() ? [] : [...originalClients];
let dynamicMatters: any[] = isDataGenerationAvailable() ? [] : [...DEMO_MATTERS];
let dynamicFiles: any[] = isDataGenerationAvailable() ? [] : [...DEMO_FILES];
let dynamicEvents: any[] = isDataGenerationAvailable() ? [] : [...EVENTS];
let dynamicLogs: any[] = isDataGenerationAvailable() ? [] : [...DEMO_LOGS];

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
 * Initialize clients with data generation if enabled
 */
export async function initializeClients(): Promise<any[]> {
  if (isDataGenerationAvailable()) {
    try {
      // Use cache only if unique mode is disabled
      if (!isUniqueGenerationEnabled()) {
        const cached = readCachedClients();
        if (cached && cached.length > 0) {
          dynamicClients = cached.map(normalizeClient);
          return dynamicClients;
        }
      }

      console.log("🚀 Starting async data generation for clients...");
      console.log("📡 Using API:", process.env.API_URL || "http://app:8080");

      const count = DATA_GENERATION_CONFIG.DEFAULT_CLIENTS_COUNT;
      const categories = DATA_GENERATION_CONFIG.AVAILABLE_CLIENT_CATEGORIES;

      console.log(`📊 Will generate ${count} clients`);
      console.log(`🏷️  Categories: ${categories.join(", ")}`);

      const generatedClients = await generateClientsWithFallback(
        [],
        count,
        categories
      );

      // Normalize status field to one of the allowed categories
      const allowed = new Set(categories);
      const normalized = generatedClients.map((c, i) => ({
        ...normalizeClient(c, i),
        status: allowed.has(c.status || "") ? c.status : "Active",
      }));

      dynamicClients = normalized;
      // Cache only if unique mode is disabled
      if (!isUniqueGenerationEnabled()) {
        writeCachedClients(dynamicClients);
      }
      return dynamicClients;
    } catch (error) {
      console.warn("⚠️ Failed to generate clients while generation is enabled. Keeping clients empty until ready. Error:", error);
      dynamicClients = [];
      return dynamicClients;
    }
  } else {
    console.log("ℹ️ Data generation is disabled, using original static clients");
    dynamicClients = originalClients;
    return dynamicClients;
  }
}

/**
 * Initialize matters with data generation if enabled
 */
export async function initializeMatters(): Promise<any[]> {
  if (isDataGenerationAvailable()) {
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
      dynamicMatters = [];
      return dynamicMatters;
    }
  } else {
    dynamicMatters = DEMO_MATTERS;
    return dynamicMatters;
  }
}

/**
 * Initialize files with data generation if enabled
 */
export async function initializeFiles(): Promise<any[]> {
  if (isDataGenerationAvailable()) {
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
      dynamicFiles = [];
      return dynamicFiles;
    }
  } else {
    dynamicFiles = DEMO_FILES;
    return dynamicFiles;
  }
}

/**
 * Initialize events with data generation if enabled
 */
export async function initializeEvents(): Promise<any[]> {
  if (isDataGenerationAvailable()) {
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
      dynamicEvents = [];
      return dynamicEvents;
    }
  } else {
    dynamicEvents = EVENTS;
    return dynamicEvents;
  }
}

/**
 * Initialize logs with data generation if enabled
 */
export async function initializeLogs(): Promise<any[]> {
  if (isDataGenerationAvailable()) {
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
      dynamicLogs = [];
      return dynamicLogs;
    }
  } else {
    dynamicLogs = DEMO_LOGS;
    return dynamicLogs;
  }
}

// Runtime-only DB fetch for when DB mode is enabled
export async function loadClientsFromDb(): Promise<any[]> {
  if (!isDbLoadModeEnabled()) {
    return [];
  }
  
  try {
    const seed = getSeedValueFromEnv(1);
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
          const fallback = originalClients.filter((c) => c.status === cat).slice(0, 5);
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

export async function loadMattersFromDb(): Promise<any[]> {
  if (!isDbLoadModeEnabled()) {
    return [];
  }
  
  try {
    const seed = getSeedValueFromEnv(1);
    const limit = 100;
    const selected = await fetchSeededSelection<any>({
      projectKey: "web_5_autocrm:matters",
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

/**
 * Get all clients
 */
export function getClients(): any[] {
  return dynamicClients;
}

/**
 * Get a client by ID
 */
export function getClientById(id: string): any | undefined {
  return dynamicClients.find((client) => client.id === id);
}

/**
 * Get all matters
 */
export function getMatters(): any[] {
  return dynamicMatters;
}

/**
 * Get a matter by ID
 */
export function getMatterById(id: string): any | undefined {
  return dynamicMatters.find((matter) => matter.id === id);
}

/**
 * Get all files
 */
export function getFiles(): any[] {
  return dynamicFiles;
}

/**
 * Get all events
 */
export function getEvents(): any[] {
  return dynamicEvents;
}

/**
 * Get all logs
 */
export function getLogs(): any[] {
  return dynamicLogs;
}

/**
 * Search clients by query
 */
export function searchClients(query: string): any[] {
  const lowercaseQuery = query.toLowerCase();
  return dynamicClients.filter((client) =>
    client.name.toLowerCase().includes(lowercaseQuery) ||
    client.email.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Search matters by query
 */
export function searchMatters(query: string): any[] {
  const lowercaseQuery = query.toLowerCase();
  return dynamicMatters.filter((matter) =>
    matter.name.toLowerCase().includes(lowercaseQuery) ||
    matter.client.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Reset to original data only
 */
export function resetToOriginalData(): void {
  dynamicClients = [...originalClients];
  dynamicMatters = [...DEMO_MATTERS];
  dynamicFiles = [...DEMO_FILES];
  dynamicEvents = [...EVENTS];
  dynamicLogs = [...DEMO_LOGS];
}

// Export the dynamic data arrays for direct access
export { 
  dynamicClients as clients,
  dynamicMatters as matters,
  dynamicFiles as files,
  dynamicEvents as events,
  dynamicLogs as logs,
};

