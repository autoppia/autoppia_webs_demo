'use client';

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useSeed } from '@/context/SeedContext';
import { logEvent, type EventType } from '@/library/events';

export function useEventLogger() {
  const pathname = usePathname();
  const { seed } = useSeed();

  const logInteraction = useCallback((eventType: EventType, data?: Record<string, unknown>) => {
    logEvent(eventType, { ...data, route: pathname, seed });
  }, [pathname, seed]);

  return { logInteraction };
}
