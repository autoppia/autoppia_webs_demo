"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { dynamicDataProvider } from "@/utils/dynamicDataProvider";

interface ClientContextType {
  clients: any[];
  isLoading: boolean;
  getClientById: (id: string) => any | undefined;
  searchClients: (query: string) => any[];
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    // Initial load
    const loadData = async () => {
      try {
        await dynamicDataProvider.whenReady();
        const loadedClients = dynamicDataProvider.getClients();
        if (isMounted) {
          console.log(`📊 Initial clients load: ${loadedClients.length} clients`);
          setClients(loadedClients);
          if (loadedClients.length > 0) {
            setIsLoading(false);
          } else if (dynamicDataProvider.isReady()) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Failed to load clients:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    const pollForData = () => {
      if (!isMounted) return;

      const currentClients = dynamicDataProvider.getClients();
      const currentLength = currentClients.length;

      setClients(prevClients => {
        const prevLength = prevClients.length;
        if (prevLength !== currentLength) {
          console.log(`📊 Clients updated: ${prevLength} → ${currentLength}`);
          return [...currentClients];
        }
        return prevClients;
      });

      if (currentLength > 0) {
        setIsLoading(prev => {
          if (prev) {
            console.log("✅ Clients data available, stopping loading state");
          }
          return false;
        });
      } else if (dynamicDataProvider.isReady()) {
        setIsLoading(prev => {
          if (prev) {
            console.log("⚠️ Provider ready but no clients data");
          }
          return false;
        });
      }
    };

    pollForData();
    pollInterval = setInterval(pollForData, 2000);

    return () => {
      isMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);

  const getClientById = (id: string) => {
    return dynamicDataProvider.getClientById(id);
  };

  const searchClients = (query: string) => {
    return dynamicDataProvider.searchClients(query);
  };

  const value: ClientContextType = {
    clients,
    isLoading,
    getClientById,
    searchClients,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClients must be used within a ClientProvider");
  }
  return context;
}

