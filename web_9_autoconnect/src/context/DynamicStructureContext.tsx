"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import DynamicStructureProvider, { StructureVariation } from '@/utils/dynamicStructureProvider';
import { useSeed } from '@/context/SeedContext';

interface DynamicStructureContextType {
  getText: (key: string, fallback?: string) => string;
  getId: (key: string, fallback?: string) => string;
  getClass: (key: string, fallback?: string) => string;
  currentVariation: StructureVariation | null;
  seedStructure?: number;
}

const DynamicStructureContext = createContext<DynamicStructureContextType | null>(null);

export const useDynamicStructure = () => {
  const context = useContext(DynamicStructureContext);
  if (!context) {
    throw new Error('useDynamicStructure must be used within a DynamicStructureProvider');
  }
  return context;
};

interface DynamicStructureProviderProps {
  children: React.ReactNode;
}

export default function DynamicStructureProviderComponent({ children }: DynamicStructureProviderProps) {
  // Use SeedContext for unified seed management
  const { resolvedSeeds } = useSeed();
  const rawSeedStructure = resolvedSeeds.v3 ?? resolvedSeeds.v1 ?? resolvedSeeds.base;
  const seedStructure = rawSeedStructure;
  
  const [provider] = useState(() => DynamicStructureProvider.getInstance());
  const [variations, setVariations] = useState<StructureVariation[]>([]);
  const [currentVariation, setCurrentVariation] = useState<StructureVariation | null>(null);

  useEffect(() => {
    // Load variations from JSON file
    const loadVariations = async () => {
      try {
        const response = await fetch('/data/structureVariations.json');
        const data = await response.json();
        setVariations(data.variations || []);
      } catch (error) {
        console.error('Failed to load structure variations:', error);
        setVariations([]);
      }
    };
    
    loadVariations();
  }, []);

  useEffect(() => {
    if (seedStructure) {
      provider.setSeedStructure(seedStructure);
      const variation = provider.getCurrentVariation();
      setCurrentVariation(variation);
    }
  }, [seedStructure, provider, variations]);

  const getText = (key: string, fallback?: string): string => {
    return provider.getText(key, fallback);
  };

  const getId = (key: string, fallback?: string): string => {
    return provider.getId(key, fallback);
  };

  const getClass = (key: string, fallback?: string): string => {
    return provider.getClass(key, fallback);
  };

  return (
    <DynamicStructureContext.Provider
      value={{
        getText,
        getId,
        getClass,
        currentVariation,
        seedStructure,
      }}
    >
      {children}
    </DynamicStructureContext.Provider>
  );
}
