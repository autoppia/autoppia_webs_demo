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
import { resolveSeedsSync, clampBaseSeed } from "@/shared/seed-resolver";
import { isV2AiGenerateEnabled, isV2Enabled } from "@/dynamic/shared/flags";
import { getApiBaseUrl } from "@/shared/data-generator";
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
  try {
    // @ts-ignore - process may not be available in all environments
    const env = typeof process !== 'undefined' ? process.env : {};
    const raw = (env?.NEXT_PUBLIC_DATA_GENERATION_UNIQUE || env?.DATA_GENERATION_UNIQUE || '').toString().toLowerCase();
    return raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
  } catch {
    return false;
  }
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
  value >= 1 && value <= 300 ? fallback : value;

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

const resolveSeed = (dbModeEnabled: boolean, seedValue?: number | null): number => {
  if (!dbModeEnabled) {
    return 1;
  }
  
  if (typeof seedValue === "number" && Number.isFinite(seedValue)) {
    return clampSeed(seedValue);
  }
  
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed !== null) {
    const resolvedSeeds = resolveSeedsSync(baseSeed);
    if (resolvedSeeds.v2 !== null) {
      return resolvedSeeds.v2;
    }
    return clampSeed(baseSeed);
  }
  
  return 1;
};

/**
 * Fetch AI generated clients from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedClients(count: number): Promise<any[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_key: "web_5_autocrm",
        entity_type: "clients",
        count: 50, // Fixed count of 50
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`AI generation request failed: ${response.status} - ${errorText.slice(0, 200)}`);
    }

    const result = await response.json();
    const generatedData = result?.generated_data ?? [];
    
    if (!Array.isArray(generatedData) || generatedData.length === 0) {
      throw new Error("No data returned from AI generation endpoint");
    }

    return generatedData;
  } catch (error) {
    console.error("[autocrm] AI generation failed:", error);
    throw error;
  }
}

/**
 * Initialize clients with V2 system (DB mode, AI generation, or fallback)
 */
export async function initializeClients(v2SeedValue?: number | null): Promise<any[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  // Check base seed from URL - if seed = 1, use original data for both DB and AI modes
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autocrm] Base seed is 1, using original data (skipping DB/AI modes)");
    // Use local fallback data (from webs_server/initial_data/web_5_autocrm/original/)
    // These files are imported at build time and represent the original data
    dynamicClients = (fallbackClients as any[]).map((c, i) => normalizeClient(c, i));
    return dynamicClients;
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);

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
  // Priority 2: AI generation mode - generate data via /datasets/generate-smart endpoint
  else if (aiGenerateEnabled) {
    try {
      console.log("[autocrm] AI generation mode enabled, generating clients...");
      const generatedClients = await fetchAiGeneratedClients(50);
      
      if (Array.isArray(generatedClients) && generatedClients.length > 0) {
        console.log(`[autocrm] Generated ${generatedClients.length} clients via AI`);
        dynamicClients = generatedClients.map((c, i) => normalizeClient(c, i));
        return dynamicClients;
      }
      
      console.warn("[autocrm] No clients generated, falling back to local JSON");
    } catch (error) {
      console.warn("[autocrm] AI generation failed, falling back to local JSON:", error);
    }
  }
  // Priority 3: Fallback - use original local JSON data
  else {
    console.log("[autocrm] V2 modes disabled, loading from local JSON");
  }

  // Fallback to local JSON
  dynamicClients = (fallbackClients as any[]).map((c, i) => normalizeClient(c, i));
  return dynamicClients;
}

/**
 * Fetch AI generated matters from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedMatters(count: number): Promise<any[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_key: "web_5_autocrm",
        entity_type: "matters",
        count: 50, // Fixed count of 50
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`AI generation request failed: ${response.status} - ${errorText.slice(0, 200)}`);
    }

    const result = await response.json();
    const generatedData = result?.generated_data ?? [];
    
    if (!Array.isArray(generatedData) || generatedData.length === 0) {
      throw new Error("No data returned from AI generation endpoint");
    }

    return generatedData;
  } catch (error) {
    console.error("[autocrm] AI generation failed:", error);
    throw error;
  }
}

/**
 * Initialize matters with V2 system (DB mode, AI generation, or fallback)
 */
export async function initializeMatters(v2SeedValue?: number | null): Promise<any[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  // Check base seed from URL - if seed = 1, use original data for both DB and AI modes
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autocrm] Base seed is 1, using original data for matters (skipping DB/AI modes)");
    // Use local fallback data (from webs_server/initial_data/web_5_autocrm/original/)
    dynamicMatters = (fallbackMatters as any[]).map((m, i) => normalizeMatter(m, i));
    return dynamicMatters;
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);

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
  // Priority 2: AI generation mode - generate data via /datasets/generate-smart endpoint
  else if (aiGenerateEnabled) {
    try {
      console.log("[autocrm] AI generation mode enabled, generating matters...");
      const generatedMatters = await fetchAiGeneratedMatters(50);
      
      if (Array.isArray(generatedMatters) && generatedMatters.length > 0) {
        console.log(`[autocrm] Generated ${generatedMatters.length} matters via AI`);
        dynamicMatters = generatedMatters.map((m, i) => normalizeMatter(m, i));
        return dynamicMatters;
      }
      
      console.warn("[autocrm] No matters generated, falling back to local JSON");
    } catch (error) {
      console.warn("[autocrm] AI generation failed, falling back to local JSON:", error);
    }
  }
  // Priority 3: Fallback - use original local JSON data
  else {
    console.log("[autocrm] V2 modes disabled for matters, loading from local JSON");
  }

  // Fallback to local JSON
  dynamicMatters = (fallbackMatters as any[]).map((m, i) => normalizeMatter(m, i));
  return dynamicMatters;
}

/**
 * Initialize files with V2 system (DB mode, AI generation, or fallback)
 */
export async function initializeFiles(): Promise<any[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  // Check base seed from URL - if seed = 1, use original data for both DB and AI modes
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autocrm] Base seed is 1, using original data for files (skipping DB/AI modes)");
    // Use local fallback data (from webs_server/initial_data/web_5_autocrm/original/)
    dynamicFiles = (fallbackFiles as any[]);
    return dynamicFiles;
  }
  
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
 * Initialize events with V2 system (DB mode, AI generation, or fallback)
 */
export async function initializeEvents(): Promise<any[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  // Check base seed from URL - if seed = 1, use original data for both DB and AI modes
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autocrm] Base seed is 1, using original data for events (skipping DB/AI modes)");
    // Use local fallback data (from webs_server/initial_data/web_5_autocrm/original/)
    dynamicEvents = (fallbackEvents as any[]);
    return dynamicEvents;
  }
  
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
 * Initialize logs with V2 system (DB mode, AI generation, or fallback)
 */
export async function initializeLogs(): Promise<any[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  // Check base seed from URL - if seed = 1, use original data for both DB and AI modes
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autocrm] Base seed is 1, using original data for logs (skipping DB/AI modes)");
    // Use local fallback data (from webs_server/initial_data/web_5_autocrm/original/)
    dynamicLogs = (fallbackLogs as any[]);
    return dynamicLogs;
  }
  
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
    const seed = typeof seedOverride === "number" ? seedOverride : getActiveSeed(1);
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
