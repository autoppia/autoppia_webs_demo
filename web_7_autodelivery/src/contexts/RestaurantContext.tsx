"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Restaurant } from "@/data/restaurants";
import type { Testimonial } from "@/data/testimonials";
import { dynamicDataProvider } from "@/dynamic/v2";

interface RestaurantContextType {
  restaurants: Restaurant[];
  testimonials: Testimonial[];
  isLoading: boolean;
  getRestaurantById: (id: string) => Restaurant | undefined;
  getRestaurantsByCuisine: (cuisine: string) => Restaurant[];
  getFeaturedRestaurants: () => Restaurant[];
  searchRestaurants: (query: string) => Restaurant[];
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => dynamicDataProvider.getRestaurants() || []);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => dynamicDataProvider.getTestimonials() || []);
  const [isLoading, setIsLoading] = useState(!dynamicDataProvider.isReady());

  useEffect(() => {
    let mounted = true;
    const unsubscribeRestaurants = dynamicDataProvider.subscribeRestaurants((data) => {
      if (!mounted) return;
      setRestaurants(data);
      setIsLoading(false);
    });
    const unsubscribeTestimonials = dynamicDataProvider.subscribeTestimonials((data) => {
      if (!mounted) return;
      setTestimonials(data);
    });

    if (!dynamicDataProvider.isReady()) {
      dynamicDataProvider.whenReady().then(() => {
        if (!mounted) return;
        setRestaurants(dynamicDataProvider.getRestaurants() || []);
        setTestimonials(dynamicDataProvider.getTestimonials() || []);
        setIsLoading(false);
      });
    }

    return () => {
      mounted = false;
      unsubscribeRestaurants();
      unsubscribeTestimonials();
    };
  }, []);

  const getRestaurantById = (id: string) => dynamicDataProvider.getRestaurantById(id);
  const getRestaurantsByCuisine = (cuisine: string) => dynamicDataProvider.getRestaurantsByCuisine(cuisine);
  const getFeaturedRestaurants = () => dynamicDataProvider.getFeaturedRestaurants();
  const searchRestaurants = (query: string) => dynamicDataProvider.searchRestaurants(query);

  const value: RestaurantContextType = {
    restaurants,
    testimonials,
    isLoading,
    getRestaurantById,
    getRestaurantsByCuisine,
    getFeaturedRestaurants,
    searchRestaurants,
  };

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

export function useRestaurants() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error("useRestaurants must be used within a RestaurantProvider");
  }
  return context;
}

