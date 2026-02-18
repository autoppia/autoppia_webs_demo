/**
 * Robust fetch utilities: timeout, retries with exponential backoff,
 * and optional response validation for edge-case resilience.
 */

export interface FetchWithRetryOptions extends RequestInit {
  /** Max number of attempts (including first try). Default 3. */
  maxRetries?: number;
  /** Request timeout in ms. Default 15000. */
  timeoutMs?: number;
  /** Base delay in ms for exponential backoff. Default 1000. */
  baseDelayMs?: number;
  /** Retry only on these status codes (e.g. 502, 503). Empty = retry on any throw. */
  retryStatuses?: number[];
}

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout and optional retries (exponential backoff).
 * Aborts the request if it exceeds timeoutMs.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    baseDelayMs = DEFAULT_BASE_DELAY_MS,
    retryStatuses = [408, 429, 500, 502, 503, 504],
    ...init
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const shouldRetry =
        attempt < maxRetries - 1 &&
        (retryStatuses.length === 0 || retryStatuses.includes(response.status));

      if (!response.ok && shouldRetry) {
        const backoffMs = baseDelayMs * Math.pow(2, attempt);
        await delay(backoffMs);
        continue;
      }

      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err instanceof Error ? err : new Error(String(err));
      const isAbort = err instanceof Error && err.name === "AbortError";
      const shouldRetry =
        attempt < maxRetries - 1 && (isAbort || (err as { status?: number }).status !== undefined);

      if (shouldRetry) {
        const backoffMs = baseDelayMs * Math.pow(2, attempt);
        await delay(backoffMs);
        continue;
      }

      throw lastError;
    }
  }

  throw lastError ?? new Error("fetchWithRetry: max retries exceeded");
}

/**
 * Fetch JSON with timeout and retries, then validate the response is an object.
 * Returns null if response is not ok or body is not valid JSON.
 */
export async function fetchJsonWithRetry<T = unknown>(
  input: RequestInfo | URL,
  options: FetchWithRetryOptions = {}
): Promise<{ ok: boolean; status: number; data: T | null }> {
  try {
    const response = await fetchWithRetry(input, options);
    const text = await response.text();
    let data: T | null = null;
    try {
      const parsed = text ? (JSON.parse(text) as T) : null;
      data = parsed;
    } catch {
      // Invalid JSON
      return { ok: response.ok, status: response.status, data: null };
    }
    return { ok: response.ok, status: response.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: null };
  }
}
