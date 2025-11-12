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
    // Wait for data to be ready
    dynamicDataProvider.whenReady().then(() => {
      const loadedRestaurants = dynamicDataProvider.getRestaurants();
      setRestaurants(loadedRestaurants);
      setIsLoading(false);
    });
  }, []);

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

