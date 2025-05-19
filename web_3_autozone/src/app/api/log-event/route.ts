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
  const externalPayload = {
    web_agent_id: webAgentIdHeader || null,
    web_url: req.headers.get('referer') || null,
    data,
  };

  console.log(":rocket: Forwarding event to external backend:", JSON.stringify(externalPayload, null, 2));

  try {
    const externalResponse = await fetch('http://app:8080/save_events/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WebAgent-Id': webAgentIdHeader || '',
      },
      body: JSON.stringify(externalPayload),
    });

    // Check if the response status indicates success (e.g., 2xx)
    if (externalResponse.ok) {
      console.log(":white_check_mark: Event successfully forwarded to external backend.");
      return NextResponse.json({
        success: true,
        message: "Event logged locally and forwarded successfully."
      }, { status: 200 });

    } else {
      // If external API returned a non-2xx status
      const errorBody = await externalResponse.text(); // or .json() if expecting JSON error details
      console.error(`:x: Failed to forward event to external backend. Status: ${externalResponse.status}. Body: ${errorBody}`);
       return NextResponse.json({
        success: false,
        error: "Failed to forward event to external backend.",
        statusCode: externalResponse.status,
        externalError: errorBody,
      }, { status: 500 });

    }

  } catch (fetchErr) {
    console.error(":x: Network error while forwarding event to external backend:", fetchErr);
    return NextResponse.json({
      success: false,
      error: `Network error forwarding event to external backend: ${fetchErr.message}`,
    }, { status: 500 }); // Use 500 for server-side error

  }
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
