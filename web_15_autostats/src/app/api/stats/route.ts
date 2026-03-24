import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

type RawEvent = {
  type: string;
  route?: string;
  seed?: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
};

type EventStats = {
  totalEvents: number;
  byType: Record<string, number>;
  byRoute: Record<string, number>;
  byHour: Record<string, number>;
  seeds: {
    totalSeeds: number;
    topSeeds: { seed: string; count: number }[];
  };
};

async function readEventsFile(): Promise<RawEvent[]> {
  const filePath = path.join(process.cwd(), "event-log.json");

  try {
    const content = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return data as RawEvent[];
    }
    return [];
  } catch {
    // If the file does not exist or is invalid, return an empty array
    return [];
  }
}

function computeStats(events: RawEvent[]): EventStats {
  const byType: Record<string, number> = {};
  const byRoute: Record<string, number> = {};
  const byHour: Record<string, number> = {};
  const seedCounts: Record<string, number> = {};

  for (const event of events) {
    const type = event.type || "unknown";
    byType[type] = (byType[type] ?? 0) + 1;

    const route = event.route || "unknown";
    byRoute[route] = (byRoute[route] ?? 0) + 1;

    const seed = event.seed || "unknown";
    seedCounts[seed] = (seedCounts[seed] ?? 0) + 1;

    if (typeof event.timestamp === "number") {
      const date = new Date(event.timestamp);
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
        date.getUTCDate(),
      ).padStart(2, "0")}T${String(date.getUTCHours()).padStart(2, "0")}:00Z`;
      byHour[key] = (byHour[key] ?? 0) + 1;
    }
  }

  const seedsArray = Object.entries(seedCounts)
    .filter(([seed]) => seed !== "unknown")
    .map(([seed, count]) => ({ seed, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalEvents: events.length,
    byType,
    byRoute,
    byHour,
    seeds: {
      totalSeeds: seedsArray.length,
      topSeeds: seedsArray,
    },
  };
}

export async function GET() {
  const events = await readEventsFile();
  const stats = computeStats(events);

  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

