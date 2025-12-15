"use client";

import { useEffect, useState } from "react";
import { dynamicDataProvider } from "@/dynamic/v2-data";

export function DataReadyGate({ children }: { children: React.ReactNode }) {
  // Inicializar como true en servidor para evitar diferencias de hidratación
  // Luego verificar en el cliente si realmente está listo
  const [ready, setReady] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Verificar si realmente está listo después del mount
    if (!dynamicDataProvider.isReady()) {
      setReady(false);
      let isMounted = true;
      dynamicDataProvider
        .whenReady()
        .then(() => {
          if (!isMounted) return;
          setReady(true);
        })
        .catch((error) => {
          console.error("[autocinema] Data load failed", error);
          if (!isMounted) return;
          setReady(true);
        });
      return () => {
        isMounted = false;
      };
    }
  }, []);

  // Durante SSR y el primer render del cliente, mostrar children
  // Solo mostrar loading si estamos en cliente y realmente no está listo
  if (mounted && !ready) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-700">
        Loading film library…
      </div>
    );
  }

  return <>{children}</>;
}
