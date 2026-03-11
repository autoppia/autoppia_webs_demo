/**
 * Enhanced CRM Data with AI Generation Support
 *
 * This file provides both static and dynamic data generation
 * for the AutoCRM application.
 */

import { readJson, writeJson } from "@/shared/storage";
import { fetchSeededSelection } from "@/shared/seeded-loader";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

// Client-side cache keys
const CACHE_KEYS = {
  clients: "autocrm_generated_clients_v1",
  matters: "autocrm_generated_matters_v1",
};

// Dynamic data arrays (populated by initialize* from DB only)
let dynamicClients: unknown[] = [];
let dynamicMatters: unknown[] = [];
let dynamicFiles: unknown[] = [];
let dynamicEvents: unknown[] = [];
let dynamicLogs: unknown[] = [];

// Cache functions
export function readCachedClients(): unknown[] | null {
  return readJson<unknown[]>(CACHE_KEYS.clients, null);
}

export function writeCachedClients(clientsToCache: unknown[]): void {
  writeJson(CACHE_KEYS.clients, clientsToCache);
}

export function readCachedMatters(): unknown[] | null {
  return readJson<unknown[]>(CACHE_KEYS.matters, null);
}

export function writeCachedMatters(mattersToCache: unknown[]): void {
  writeJson(CACHE_KEYS.matters, mattersToCache);
}

export type NormalizedClient = { id: string; name: string; email: string; matters: number; avatar: string; status: string; last: string };
export type NormalizedMatter = { id: string; name: string; client: string; status: string; updated: string };

/**
 * Normalize client data to ensure consistent structure
 */
function normalizeClient(client: Record<string, unknown>, index: number): NormalizedClient {
  return {
    id: (client.id as string) || `CL-${1000 + index}`,
    name: (client.name as string) || `Client ${index + 1}`,
    email: (client.email as string) || `client${index + 1}@example.com`,
    matters: typeof client.matters === 'number' ? client.matters : (Math.floor(Math.random() * 5) + 1),
    avatar: (client.avatar as string) || "",
    status: (client.status as string) || 'Active',
    last: (client.last as string) || 'Today',
  };
}

/**
 * Normalize matter data to ensure consistent structure
 */
function normalizeMatter(matter: Record<string, unknown>, index: number): NormalizedMatter {
  return {
    id: (matter.id as string) || `MAT-${Math.floor(Math.random() * 9000 + 1000)}`,
    name: (matter.name as string) || (matter.title as string) || 'Untitled Matter',
    client: (matter.client as string) || '—',
    status: (matter.status as string) || 'Active',
    updated: (matter.updated as string) || 'Today',
  };
}

const resolveSeed = (seedValue?: number | null): number => {
  // V2 rule: seed always comes from URL, but if V2 is disabled we force seed=1.
  return isV2Enabled()
    ? clampSeed(seedValue ?? getSeedFromUrl())
    : 1;
};

/**
 * Initialize clients with V2 system (DB mode only)
 */
export async function initializeClients(seedOverride?: number | null): Promise<NormalizedClient[]> {
  const effectiveSeed = resolveSeed(seedOverride);
  try {
    const clients = await fetchSeededSelection<Record<string, unknown>>({
      projectKey: "web_5_autocrm",
      entityType: "clients",
      seedValue: effectiveSeed,
      limit: 50,
      method: "distribute",
      filterKey: "status",
    });

    if (Array.isArray(clients) && clients.length > 0) {
      console.log(
        `[autocrm] Loaded ${clients.length} clients from dataset (seed=${effectiveSeed})`
      );
      const result = clients.map((c: Record<string, unknown>, i: number) => normalizeClient(c, i));
      dynamicClients = result as unknown[];
      return result;
    }

    console.warn(`[autocrm] No clients returned from backend (seed=${effectiveSeed})`);
  } catch (error) {
    console.warn("[autocrm] Backend unavailable:", error);
  }
  dynamicClients = [];
  return dynamicClients as NormalizedClient[];
}

/**
 * Initialize matters with V2 system (DB mode only)
 */
export async function initializeMatters(seedOverride?: number | null): Promise<NormalizedMatter[]> {
  const effectiveSeed = resolveSeed(seedOverride);

  try {
    const matters = await fetchSeededSelection<Record<string, unknown>>({
      projectKey: "web_5_autocrm",
      entityType: "matters",
      seedValue: effectiveSeed,
      limit: 50,
      method: "distribute",
      filterKey: "status",
    });

    if (Array.isArray(matters) && matters.length > 0) {
      console.log(
        `[autocrm] Loaded ${matters.length} matters from dataset (seed=${effectiveSeed})`
      );
      const result = matters.map((m: Record<string, unknown>, i: number) => normalizeMatter(m, i));
      dynamicMatters = result as unknown[];
      return result;
    }

    console.warn(`[autocrm] No matters returned from backend (seed=${effectiveSeed})`);
  } catch (error) {
    console.warn("[autocrm] Backend unavailable:", error);
  }

  dynamicMatters = [];
  return dynamicMatters as NormalizedMatter[];
}

/**
 * Initialize files with V2 system (DB mode only)
 */
export async function initializeFiles(seedOverride?: number | null): Promise<unknown[]> {
  const effectiveSeed = resolveSeed(seedOverride);

  try {
    const files = await fetchSeededSelection<Record<string, unknown>>({
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

    console.warn(`[autocrm] No files returned from backend (seed=${effectiveSeed})`);
  } catch (error) {
    console.warn("[autocrm] Backend unavailable:", error);
  }

  dynamicFiles = [];
  return dynamicFiles;
}

/**
 * Initialize events with V2 system (DB mode only)
 */
export async function initializeEvents(seedOverride?: number | null): Promise<unknown[]> {
  const effectiveSeed = resolveSeed(seedOverride);

  try {
    const events = await fetchSeededSelection<Record<string, unknown>>({
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

    console.warn(`[autocrm] No events returned from backend (seed=${effectiveSeed})`);
  } catch (error) {
    console.warn("[autocrm] Backend unavailable:", error);
  }

  dynamicEvents = [];
  return dynamicEvents;
}

/**
 * Initialize logs with V2 system (DB mode only)
 */
export async function initializeLogs(seedOverride?: number | null): Promise<unknown[]> {
  const effectiveSeed = resolveSeed(seedOverride);

  try {
    const logs = await fetchSeededSelection<Record<string, unknown>>({
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

    console.warn(`[autocrm] No logs returned from backend (seed=${effectiveSeed})`);
  } catch (error) {
    console.warn("[autocrm] Backend unavailable:", error);
  }

  dynamicLogs = [];
  return dynamicLogs;
}

// Runtime-only DB fetch for when DB mode is enabled
export async function loadClientsFromDb(seedOverride?: number): Promise<NormalizedClient[]> {
  try {
    const seed = resolveSeed(seedOverride);
    const limit = 50;
    const selected = await fetchSeededSelection<Record<string, unknown>>({
      projectKey: "web_5_autocrm",
      entityType: "clients",
      seedValue: seed,
      limit,
      method: "distribute",
      filterKey: "status",
    });

    if (selected && selected.length > 0) {
      return selected.map((c, i) => normalizeClient(c, i));
    }
  } catch (e) {
    console.warn("Failed to load seeded clients from DB:", e);
  }

  return [];
}

export async function loadMattersFromDb(seedOverride?: number): Promise<NormalizedMatter[]> {
  try {
    const seed = resolveSeed(seedOverride);
    const limit = 50;
    const selected = await fetchSeededSelection<Record<string, unknown>>({
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
