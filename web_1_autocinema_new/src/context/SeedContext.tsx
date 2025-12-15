"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { clampBaseSeed } from "@/shared/seed-resolver";

interface SeedContextType {
  seed: number;
  setSeed: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
  isSeedReady: boolean; // Indica si el seed está sincronizado con la URL
}

const DEFAULT_SEED = 1;

const SeedContext = createContext<SeedContextType>({
  seed: DEFAULT_SEED,
  setSeed: () => {},
  getNavigationUrl: (path: string) => path,
  isSeedReady: false,
});

const STORAGE_KEY = "autocinema_seed_base";

function SeedInitializer({ onSeedFromUrl }: { onSeedFromUrl: (seed: number | null) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const rawSeed = searchParams.get("seed");
    if (rawSeed) {
      const parsed = clampBaseSeed(Number.parseInt(rawSeed, 10));
      onSeedFromUrl(parsed);
    } else {
      onSeedFromUrl(null);
    }
  }, [searchParams, onSeedFromUrl]);

  return null;
}

export const SeedProvider = ({ 
  children, 
  initialSeed 
}: { 
  children: React.ReactNode;
  initialSeed?: number; // Seed desde Server Component (prioridad sobre useSearchParams)
}) => {
  return (
    <Suspense fallback={children}>
      <SeedProviderInner initialSeed={initialSeed}>{children}</SeedProviderInner>
    </Suspense>
  );
};

function SeedProviderInner({ 
  children, 
  initialSeed 
}: { 
  children: React.ReactNode;
  initialSeed?: number;
}) {
  const searchParams = useSearchParams();
  
  // Inicializar seed directamente desde la URL para evitar problemas de hidratación
  const getInitialSeed = (): number => {
    // PRIORIDAD 1: Leer de window.__INITIAL_SEED__ inyectado por Server Component
    // Esto garantiza que SSR y cliente usen el mismo seed desde el inicio
    if (typeof window !== "undefined" && (window as any).__INITIAL_SEED__ !== undefined) {
      const serverSeed = (window as any).__INITIAL_SEED__;
      if (typeof serverSeed === "number" && Number.isFinite(serverSeed)) {
        return clampBaseSeed(serverSeed);
      }
    }
    
    // PRIORIDAD 2: Si initialSeed viene como prop, usarlo
    if (initialSeed !== undefined) {
      return clampBaseSeed(initialSeed);
    }
    
    // PRIORIDAD 3: Intentar leer de useSearchParams (puede fallar en SSR)
    try {
      const urlSeed = searchParams.get("seed");
      if (urlSeed) {
        return clampBaseSeed(Number.parseInt(urlSeed, 10));
      }
    } catch (error) {
      // useSearchParams puede fallar durante SSR
    }
    
    // PRIORIDAD 4: Intentar leer de window.location (solo en cliente)
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlSeed = params.get("seed");
        if (urlSeed) {
          return clampBaseSeed(Number.parseInt(urlSeed, 10));
        }
        
        // Si no hay seed en URL, intentar localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return clampBaseSeed(Number.parseInt(saved, 10));
        }
      } catch (error) {
        // Ignorar errores
      }
    }
    
    return DEFAULT_SEED;
  };
  
  const [seed, setSeedState] = useState<number>(getInitialSeed);
  const [isSeedReady, setIsSeedReady] = useState<boolean>(false);

  const handleSeedFromUrl = useCallback((urlSeed: number | null) => {
    if (urlSeed !== null) {
      setSeedState(urlSeed);
      setIsSeedReady(true);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, urlSeed.toString());
        } catch (error) {
          console.error("Error saving seed to localStorage:", error);
        }
      }
    } else {
      // Si no hay seed en URL, el seed por defecto está listo
      setIsSeedReady(true);
    }
  }, []);
  
  // Sincronizar seed cuando cambie la URL
  useEffect(() => {
    // Leer seed de la URL (prioridad sobre window.__INITIAL_SEED__)
    const urlSeed = searchParams.get("seed");
    if (urlSeed) {
      const parsed = clampBaseSeed(Number.parseInt(urlSeed, 10));
      if (parsed !== seed) {
        console.log(`[autocinema][seed] Actualizando seed desde URL: ${seed} → ${parsed}`);
        setSeedState(parsed);
      }
      setIsSeedReady(true);
    } else {
      // Si no hay seed en URL, verificar window.__INITIAL_SEED__
      if (typeof window !== "undefined" && (window as any).__INITIAL_SEED__ !== undefined) {
        const initialSeed = clampBaseSeed((window as any).__INITIAL_SEED__);
        if (initialSeed !== seed) {
          console.log(`[autocinema][seed] Actualizando seed desde window.__INITIAL_SEED__: ${seed} → ${initialSeed}`);
          setSeedState(initialSeed);
        }
      }
      setIsSeedReady(true);
    }
  }, [searchParams, seed]);
  
  // Marcar como listo después del primer render del cliente
  useEffect(() => {
    setIsSeedReady(true);
  }, []);

  useEffect(() => {
    console.log("[autocinema][seed] base=", seed);
  }, [seed]);

  const setSeed = useCallback((newSeed: number) => {
    setSeedState(clampBaseSeed(newSeed));
  }, []);

  const getNavigationUrl = useCallback(
    (path: string): string => {
      if (!path) return path;
      if (path.startsWith("http")) return path;
      const currentParams =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const [base, qs] = path.split("?");
      const params = new URLSearchParams(qs || "");
      params.set("seed", seed.toString());
      const enableDynamic = currentParams.get("enable_dynamic");
      if (enableDynamic) {
        params.set("enable_dynamic", enableDynamic);
      }
      const query = params.toString();
      return query ? `${base}?${query}` : base;
    },
    [seed]
  );

  return (
    <SeedContext.Provider value={{ seed, setSeed, getNavigationUrl, isSeedReady }}>
      <SeedInitializer onSeedFromUrl={handleSeedFromUrl} />
      {children}
    </SeedContext.Provider>
  );
}

// Custom hook to use seed context
export const useSeed = () => {
  const context = useContext(SeedContext);
  if (!context) {
    throw new Error("useSeed must be used within a SeedProvider");
  }
  return context;
};
