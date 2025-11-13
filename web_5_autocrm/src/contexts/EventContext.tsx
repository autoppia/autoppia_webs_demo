"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { dynamicDataProvider } from "@/utils/dynamicDataProvider";

interface EventContextType {
  events: any[];
  isLoading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    // Initial load
    const loadData = async () => {
      try {
        await dynamicDataProvider.whenReady();
        const loadedEvents = dynamicDataProvider.getEvents();
        if (isMounted) {
          console.log(`📅 Initial events load: ${loadedEvents.length} events`);
          setEvents(loadedEvents);
          if (loadedEvents.length > 0) {
            setIsLoading(false);
          } else if (dynamicDataProvider.isReady()) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Failed to load events:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    const pollForData = () => {
      if (!isMounted) return;

      const currentEvents = dynamicDataProvider.getEvents();
      const currentLength = currentEvents.length;

      setEvents(prevEvents => {
        const prevLength = prevEvents.length;
        if (prevLength !== currentLength) {
          console.log(`📅 Events updated: ${prevLength} → ${currentLength}`);
          return [...currentEvents];
        }
        return prevEvents;
      });

      if (currentLength > 0) {
        setIsLoading(prev => {
          if (prev) {
            console.log("✅ Events data available, stopping loading state");
          }
          return false;
        });
      } else if (dynamicDataProvider.isReady()) {
        setIsLoading(prev => {
          if (prev) {
            console.log("⚠️ Provider ready but no events data");
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

  const value: EventContextType = {
    events,
    isLoading,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
}

