import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOG_PATH = path.join(process.cwd(), 'event-log.json');

export async function POST(req: NextRequest) {
  const body = await req.json();
  const webAgentIdHeader = req.headers.get('X-WebAgent-Id');

  const {
    event_name,
    user_id = null,
    data = {},
  } = body;

  const newEntry = {
    event_name,
    web_agent_id: webAgentIdHeader || null,
    user_id,
    data,
    timestamp: new Date().toISOString(),
  };

  let logs: any[] = [];
  if (fs.existsSync(LOG_PATH)) {
    logs = JSON.parse(fs.readFileSync(LOG_PATH, 'utf-8'));
  }

  logs.push(newEntry);
  fs.writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2));
  return NextResponse.json({ success: true });
}

export async function GET() {
  if (!fs.existsSync(LOG_PATH)) {
    return NextResponse.json({ logs: [] });
  }

  const logs = fs.readFileSync(LOG_PATH, 'utf-8');
  return new NextResponse(logs, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE() {
    fs.writeFileSync(LOG_PATH, JSON.stringify([], null, 2)); // Clear the log
    return NextResponse.json({ success: true, message: 'Event log cleared' });
  }