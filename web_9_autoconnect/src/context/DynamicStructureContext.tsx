"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DynamicStructureProvider, { StructureVariation } from '@/utils/dynamicStructureProvider';

interface DynamicStructureContextType {
  getText: (key: string, fallback?: string) => string;
  getId: (key: string, fallback?: string) => string;
  getClass: (key: string, fallback?: string) => string;
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
  const searchParams = useSearchParams();
  const [provider] = useState(() => DynamicStructureProvider.getInstance());
  const [variations, setVariations] = useState<StructureVariation[]>([]);

  useEffect(() => {
    // Load variations from JSON file
    const loadVariations = async () => {
      try {
        const response = await fetch('/data/structureVariations.json');
        const data = await response.json();
        setVariations(data);
        provider.setVariations(data);
      } catch (error) {
        console.error('Failed to load structure variations:', error);
      }
    };

    loadVariations();
  }, [provider]);

  useEffect(() => {
    const seedStructure = searchParams.get('seed-structure');
    if (seedStructure && variations.length > 0) {
      const seedStructureNumber = parseInt(seedStructure, 10);
      provider.setCurrentVariation(seedStructureNumber);
    }
  }, [searchParams, provider, variations]);

  const getText = (key: string, fallback: string = '') => {
    return provider.getText(key, fallback);
  };

  const getId = (key: string, fallback: string = '') => {
    return provider.getId(key, fallback);
  };

  const getClass = (key: string, fallback: string = '') => {
    return provider.getClass(key, fallback);
  };

  return (
    <DynamicStructureContext.Provider value={{ getText, getId, getClass }}>
      {children}
    </DynamicStructureContext.Provider>
  );
}
