import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LOG_PATH = path.join(process.cwd(), "event-log.json");

type EventLogEntry = {
  event_name: string;
  user_id: string | null;
  data: Record<string, unknown>;
  web_agent_id: string | null;
  timestamp: string;
};

type IncomingEventPayload = {
  event_name: string;
  user_id?: string;
  data?: Record<string, unknown>;
};

export async function POST(req: NextRequest) {
  let body: IncomingEventPayload;

  try {
    if (!req.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Invalid Content-Type" },
        { status: 400 }
      );
    }

    const rawText = await req.text();
    if (!rawText) {
      return NextResponse.json(
        { success: false, error: "Empty request body" },
        { status: 400 }
      );
    }

    body = JSON.parse(rawText);
  } catch (err) {
    console.error("Error parsing request body:", err);
    return NextResponse.json(
      { success: false, error: "Invalid JSON input" },
      { status: 400 }
    );
  }

  const webAgentIdHeader = req.headers.get("X-WebAgent-Id");

  const { event_name, user_id = null, data = {} } = body;

  const newEntry: EventLogEntry = {
    event_name,
    web_agent_id: webAgentIdHeader || null,
    user_id,
    data,
    timestamp: new Date().toISOString(),
  };

  let logs: EventLogEntry[] = [];
  if (fs.existsSync(LOG_PATH)) {
    logs = JSON.parse(fs.readFileSync(LOG_PATH, "utf-8")) as EventLogEntry[];
  }

  logs.push(newEntry);
  fs.writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2));

  const externalPayload = {
    web_agent_id: newEntry.web_agent_id,
    web_url: req.headers.get("referer"),
    data: newEntry,
  };
  // console.log("🚀 Forwarding event to external backend:", JSON.stringify(externalPayload, null, 2));
  try {
    await fetch("http://app:8080/save_events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(externalPayload),
    });
  } catch (error) {
    console.error("Failed to forward event to external service:", error);
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  if (!fs.existsSync(LOG_PATH)) {
    return NextResponse.json({ logs: [] });
  }

  const logs = fs.readFileSync(LOG_PATH, "utf-8");
  return new NextResponse(logs, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE() {
  fs.writeFileSync(LOG_PATH, JSON.stringify([], null, 2));
  return NextResponse.json({ success: true, message: "Event log cleared" });
}
