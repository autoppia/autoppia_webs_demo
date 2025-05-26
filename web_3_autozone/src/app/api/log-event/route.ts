import { NextRequest, NextResponse } from 'next/server';
// import fs from 'fs';
// import path from 'path';

// const LOG_PATH = path.join(process.cwd(), 'event-log.json');


export async function POST(req: NextRequest) {
  let body: any;

  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ success: false, error: 'Invalid Content-Type' }, { status: 400 });
    }

    const rawText = await req.text();
    if (!rawText) {
      return NextResponse.json({ success: false, error: 'Empty request body' }, { status: 400 });
    }

    body = JSON.parse(rawText);
  } catch (err) {
    console.error("Error parsing request body:", err);
    return NextResponse.json({ success: false, error: 'Invalid JSON input' }, { status: 400 });
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

  // let logs: any[] = [];
  // if (fs.existsSync(LOG_PATH)) {
  //   logs = JSON.parse(fs.readFileSync(LOG_PATH, 'utf-8'));
  // }
  //
  // logs.push(newEntry);
  // fs.writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2));

  const externalPayload = {
    web_agent_id: webAgentIdHeader || null,
    web_url: req.headers.get('referer'),
    data: newEntry,
  };

  // console.log("🚀 Forwarding event to external backend:", JSON.stringify(externalPayload, null, 2));

  await fetch('http://app:8080/save_events/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(externalPayload),
  });

  return NextResponse.json({ success: true });
}
export async function GET() {
  // if (!fs.existsSync(LOG_PATH)) {
  //   return NextResponse.json({ logs: [] });
  // }
  //
  // const logs = fs.readFileSync(LOG_PATH, 'utf-8');
  // return new NextResponse(logs, {
  //   status: 200,
  //   headers: { 'Content-Type': 'application/json' },
  // });

  return NextResponse.json({ logs: [], message: 'File logging is disabled' });
}

export async function DELETE() {
    // fs.writeFileSync(LOG_PATH, JSON.stringify([], null, 2)); // Clear the log
    // return NextResponse.json({ success: true, message: 'Event log cleared' });
    return NextResponse.json({ success: true, message: 'Event log deletion is disabled' });
  }
