"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

/**
 * Default seed to use when no seed is in the URL.
 * Cambiado a 1 para que sea consistente con el sistema dinámico.
 */
const DEFAULT_SEED = 1;

/**
 * Component that redirects to seed=1 URL if no seed parameter exists in the URL.
 * Esto asegura que siempre haya un seed en la URL.
 * 
 * NOTA: Si el usuario especifica un seed en la URL (ej: ?seed=5), se respeta ese seed.
 */
export function SeedRedirect() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Prevent multiple redirects
    if (hasRedirectedRef.current) return;

    // Check if seed parameter exists in URL
    const seedParam = searchParams.get("seed");
    if (seedParam) {
      // Seed exists in URL, no need to redirect
      hasRedirectedRef.current = true;
      return;
    }

    // No seed in URL - redirect to add default seed (1)
    hasRedirectedRef.current = true;

    const params = new URLSearchParams(searchParams.toString());
    params.set("seed", DEFAULT_SEED.toString());

    const newUrl = `${pathname}?${params.toString()}`;

    // Use replace instead of push to avoid adding to history
    router.replace(newUrl);
  }, [searchParams, pathname, router]);

  return null; // This component doesn't render anything
}
