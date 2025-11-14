"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import structureVariations from "@/data/structureVariations.json";

// Types for structure variations
interface StructureVariation {
  texts: Record<string, string>;
  ids: Record<string, string>;
}

interface DynamicStructureContextType {
  getText: (key: string) => string;
  getId: (key: string) => string;
  currentVariation: number;
  seedStructure: number | null;
  isEnabled: boolean;
}

// Check if dynamic structure is enabled via environment variable
const isDynamicStructureEnabled = (): boolean => {
  const rawFlag =
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE ??
    process.env.NEXT_PUBLIC_DYNAMIC_HTML_STRUCTURE ??
    process.env.ENABLE_DYNAMIC_HTML_STRUCTURE ??
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML ??
    process.env.ENABLE_DYNAMIC_HTML ??
    '';

  const normalized = rawFlag.toString().trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';  // Default to true if not set, or if explicitly set to "true"
};

// Create context with default values
const DynamicStructureContext = createContext<DynamicStructureContextType>({
  getText: (key: string) => key,
  getId: (key: string) => key,
  currentVariation: 1,
  seedStructure: null,
  isEnabled: true,
});

// Provider component
export function DynamicStructureProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [currentVariation, setCurrentVariation] = useState<number>(1);
  const [seedStructure, setSeedStructure] = useState<number | null>(null);
  const [variationData, setVariationData] = useState<StructureVariation | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  useEffect(() => {
    // Check if dynamic structure is enabled
    const enabled = isDynamicStructureEnabled();
    setIsEnabled(enabled);

    // If disabled, always use variation 1
    if (!enabled) {
      console.log("Dynamic HTML Structure is DISABLED - using default variation");
      setCurrentVariation(1);
      setSeedStructure(null);
      setVariationData((structureVariations as Record<string, StructureVariation>).variation1);
      return;
    }

    // Read seed-structure from URL
    const seedParam = searchParams?.get("seed-structure");
    
    if (seedParam) {
      const parsedSeed = parseInt(seedParam, 10);
      
      // Validate seed is in range 1-300
      if (!isNaN(parsedSeed) && parsedSeed >= 1 && parsedSeed <= 300) {
        setSeedStructure(parsedSeed);
        
        // Map seed to variation (1-10) using modulo formula
        const mappedVariation = ((parsedSeed - 1) % 10) + 1;
        setCurrentVariation(mappedVariation);
        
        // Load variation data
        const variations = structureVariations as Record<string, StructureVariation>;
        const variationKey = `variation${mappedVariation}`;
        
        if (variations[variationKey]) {
          setVariationData(variations[variationKey]);
        } else {
          console.warn(`Variation ${mappedVariation} not found in structureVariations.json`);
          setVariationData(variations.variation1); // Fallback to variation 1
        }
      } else {
        console.warn(`Invalid seed-structure value: ${seedParam}. Must be between 1-300.`);
        // Use default variation 1
        setCurrentVariation(1);
        setSeedStructure(null);
        setVariationData((structureVariations as Record<string, StructureVariation>).variation1);
      }
    } else {
      // No seed parameter - use default variation 1
      setCurrentVariation(1);
      setSeedStructure(null);
      setVariationData((structureVariations as Record<string, StructureVariation>).variation1);
    }
  }, [searchParams]);

  // Function to get text content by key
  const getText = (key: string): string => {
    if (!variationData || !variationData.texts) {
      console.warn(`Variation data not loaded. Returning key: ${key}`);
      return key;
    }
    
    const text = variationData.texts[key];
    
    if (!text) {
      console.warn(`Text key "${key}" not found in variation ${currentVariation}`);
      return key; // Return key as fallback
    }
    
    return text;
  };

  // Function to get element ID by key
  const getId = (key: string): string => {
    if (!variationData || !variationData.ids) {
      console.warn(`Variation data not loaded. Returning key: ${key}`);
      return key;
    }
    
    const id = variationData.ids[key];
    
    if (!id) {
      console.warn(`ID key "${key}" not found in variation ${currentVariation}`);
      return key; // Return key as fallback
    }
    
    return id;
  };

  const value = {
    getText,
    getId,
    currentVariation,
    seedStructure,
    isEnabled,
  };

  return (
    <DynamicStructureContext.Provider value={value}>
      {children}
    </DynamicStructureContext.Provider>
  );
}

// Hook to use the dynamic structure context
export function useDynamicStructure() {
  const context = useContext(DynamicStructureContext);
  
  if (!context) {
    throw new Error("useDynamicStructure must be used within DynamicStructureProvider");
  }
  
  return context;
}

// Export context for testing purposes
export { DynamicStructureContext };

