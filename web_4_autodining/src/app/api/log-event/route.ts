// src/app/api/log-event/route.ts

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL || "http://app:8080";

interface LogEventRequestBody {
  event_name: string;
  user_id?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
}

export async function POST(req: NextRequest) {
  // Envolver todo en try-catch para que NUNCA falle y rompa la página
  try {
    let body: LogEventRequestBody;

    // 1) Validar y parsear JSON - si falla, responder éxito de todas formas
    try {
      const ct = req.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        // Responder éxito incluso si el content-type es inválido
        return NextResponse.json({ success: true });
      }

      const raw = await req.text();
      if (!raw) {
        // Responder éxito incluso si está vacío
        return NextResponse.json({ success: true });
      }

      body = JSON.parse(raw);
    } catch (err) {
      // Si hay error parseando, responder éxito de todas formas - no romper la página
      return NextResponse.json({ success: true });
    }

    // 2) Construir el evento
    const webAgentId = req.headers.get("X-WebAgent-Id") || "1";
    const validatorId = req.headers.get("X-Validator-Id") || "1";
    const { event_name, user_id = null, data = {} } = body;

    const newEntry = {
      event_name,
      web_agent_id: webAgentId,
      user_id,
      data,
      timestamp: new Date().toISOString(),
      validator_id: validatorId,
    };

    const externalPayload = {
      web_agent_id: webAgentId,
      web_url: req.headers.get("referer") || null,
      data: newEntry,
      validator_id: validatorId,
    };

    // 3) Enviar al backend real (silent fail si no está disponible)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

      const res = await fetch(`${BACKEND_URL}/save_events/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(externalPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        // Error silencioso - solo log en desarrollo
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ Backend returned error:", res.status);
        }
        // Continuar como si fuera éxito para no afectar UX
      }
    } catch (err: any) {
      // Error silencioso - solo log en desarrollo y si no es timeout
      if (process.env.NODE_ENV === "development" && err.name !== "AbortError") {
        console.warn("⚠️ Backend not available (this is ok in development)");
      }
      // Continuar como si fuera éxito para no afectar UX
    }

    // 4) Responder éxito siempre (no queremos afectar la UX si el backend falla)
    return NextResponse.json({ success: true });
  } catch (err) {
    // Si algo falla completamente, responder éxito de todas formas
    // Nunca romper la página por un error de logging
    return NextResponse.json({ success: true });
  }
}

export async function GET() {
  return NextResponse.json({ logs: [], message: "File logging is disabled" });
}

export async function DELETE() {
  return NextResponse.json({
    success: true,
    message: "Event log deletion is disabled",
  });
}
