// /app/api/log-event/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOG_PATH = path.join(process.cwd(), 'event-log.json');

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    console.error("Error logging event:", err);
    return NextResponse.json({ success: false, error: 'Failed to log event.' }, { status: 500 });
  }
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
  // :white_check_mark: External API expects single event object as `data`
  const externalPayload = {
    web_agent_id: webAgentIdHeader || null,
    web_url: req.headers.get('referer'),
    data: newEntry,
  };

  await fetch('http://localhost:8080/save_events/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(externalPayload),
  });
  return NextResponse.json({ success: true });
}

export async function GET() {
  try {
    if (!fs.existsSync(LOG_PATH)) {
      return NextResponse.json({ logs: [] });
    }

    const logs = fs.readFileSync(LOG_PATH, 'utf-8');
    return new NextResponse(logs, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to read logs.' }, { status: 500 });
  }
}
export async function DELETE() {
  try {
    fs.writeFileSync(LOG_PATH, JSON.stringify([], null, 2));
    return NextResponse.json({ success: true, message: 'Event log cleared' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to clear logs.' }, { status: 500 });
  }
}
