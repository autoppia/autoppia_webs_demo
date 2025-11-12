"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Restaurant } from "@/data/restaurants";
import { dynamicDataProvider } from "@/utils/dynamicDataProvider";

interface RestaurantContextType {
  restaurants: Restaurant[];
  isLoading: boolean;
  getRestaurantById: (id: string) => Restaurant | undefined;
  getRestaurantsByCuisine: (cuisine: string) => Restaurant[];
  getFeaturedRestaurants: () => Restaurant[];
  searchRestaurants: (query: string) => Restaurant[];
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Initial load - wait for data to be ready
    const loadData = async () => {
      await dynamicDataProvider.whenReady();
      if (!isMounted) return;
      const loadedRestaurants = dynamicDataProvider.getRestaurants();
      setRestaurants(loadedRestaurants);
      setIsLoading(false);
    };

    loadData();

    // Poll for data updates (in case data generation completes after initial load)
    // Only poll if data generation is enabled
    const pollInterval = setInterval(() => {
      if (!isMounted) return;
      const currentRestaurants = dynamicDataProvider.getRestaurants();
      // Only update if data length has changed (more efficient than full comparison)
      // This handles the case where data generation adds new restaurants
      if (currentRestaurants.length > 0 && currentRestaurants.length !== restaurants.length) {
        setRestaurants([...currentRestaurants]);
        setIsLoading(false);
      }
    }, 2000); // Check every 2 seconds to reduce overhead

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [restaurants.length]); // Only depend on length to avoid unnecessary re-runs

  const getRestaurantById = (id: string) => {
    return dynamicDataProvider.getRestaurantById(id);
  };

  const getRestaurantsByCuisine = (cuisine: string) => {
    return dynamicDataProvider.getRestaurantsByCuisine(cuisine);
  };

  const getFeaturedRestaurants = () => {
    return dynamicDataProvider.getFeaturedRestaurants();
  };

  const searchRestaurants = (query: string) => {
    return dynamicDataProvider.searchRestaurants(query);
  };

  const value: RestaurantContextType = {
    restaurants,
    isLoading,
    getRestaurantById,
    getRestaurantsByCuisine,
    getFeaturedRestaurants,
    searchRestaurants,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurants() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error("useRestaurants must be used within a RestaurantProvider");
  }
  return context;
}

