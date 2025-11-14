"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { dynamicDataProvider } from "@/utils/dynamicDataProvider";

interface LogContextType {
  logs: any[];
  isLoading: boolean;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    // Initial load
    const loadData = async () => {
      try {
        await dynamicDataProvider.whenReady();
        const loadedLogs = dynamicDataProvider.getLogs();
        if (isMounted) {
          console.log(`🧾 Initial logs load: ${loadedLogs.length} entries`);
          setLogs(loadedLogs);
          if (loadedLogs.length > 0) {
            setIsLoading(false);
          } else if (dynamicDataProvider.isReady()) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Failed to load logs:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    const pollForData = () => {
      if (!isMounted) return;

      const currentLogs = dynamicDataProvider.getLogs();
      const currentLength = currentLogs.length;

      setLogs(prevLogs => {
        const prevLength = prevLogs.length;
        if (prevLength !== currentLength) {
          console.log(`🧾 Logs updated: ${prevLength} → ${currentLength}`);
          return [...currentLogs];
        }
        return prevLogs;
      });

      if (currentLength > 0) {
        setIsLoading(prev => {
          if (prev) {
            console.log("✅ Logs data available, stopping loading state");
          }
          return false;
        });
      } else if (dynamicDataProvider.isReady()) {
        setIsLoading(prev => {
          if (prev) {
            console.log("⚠️ Provider ready but no logs data");
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

  const value: LogContextType = {
    logs,
    isLoading,
  };

  return (
    <LogContext.Provider value={value}>
      {children}
    </LogContext.Provider>
  );
}

export function useLogs() {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error("useLogs must be used within a LogProvider");
  }
  return context;
}

