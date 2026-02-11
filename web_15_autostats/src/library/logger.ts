import { WEBS_SERVER_URL } from '@/shared/constants';

interface LogEvent {
  type: string;
  route: string;
  seed: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export async function logEvent(event: LogEvent): Promise<void> {
  // Logging is disabled - silently skip all logging attempts
  // This prevents console errors when the logging server is not available
  return;
}
