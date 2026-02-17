'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSeed } from '@/context/SeedContext';

export function useSeedRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { seed } = useSeed();
  
  const push = (href: string) => {
    const url = new URL(href, window.location.origin);
    url.searchParams.set('seed', seed);
    router.push(url.pathname + url.search);
  };
  
  const replace = (href: string) => {
    const url = new URL(href, window.location.origin);
    url.searchParams.set('seed', seed);
    router.replace(url.pathname + url.search);
  };
  
  return {
    push,
    replace,
    back: router.back,
    forward: router.forward,
    refresh: router.refresh,
    prefetch: router.prefetch,
  };
}
