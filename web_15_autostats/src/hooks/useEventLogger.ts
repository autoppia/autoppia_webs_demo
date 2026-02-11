'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSeed } from '@/context/SeedContext';
import { logEvent } from '@/library/logger';

export function useEventLogger() {
  const pathname = usePathname();
  const { seed } = useSeed();
  
  useEffect(() => {
    logEvent({
      type: 'page_view',
      route: pathname,
      seed,
      timestamp: Date.now(),
    });
  }, [pathname, seed]);
  
  const logInteraction = (action: string, metadata?: Record<string, any>) => {
    logEvent({
      type: 'interaction',
      route: pathname,
      seed,
      timestamp: Date.now(),
      metadata: {
        action,
        ...metadata,
      },
    });
  };
  
  return { logInteraction };
}
