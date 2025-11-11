"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DynamicStructureProvider, { StructureVariation } from '@/utils/dynamicStructureProvider';

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
  const searchParams = useSearchParams();
  const [provider] = useState(() => DynamicStructureProvider.getInstance());
  const [variations, setVariations] = useState<StructureVariation[]>([]);
  const [currentVariation, setCurrentVariation] = useState<StructureVariation | null>(null);
  const [seedStructure, setSeedStructure] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Load variations from JSON file
    const loadVariations = async () => {
      try {
        const response = await fetch('/data/structureVariations.json');
        const data = await response.json();
        setVariations(data);
        provider.setVariations(data);
        // Initialize current variation if seed-structure already present
        const ss = searchParams.get('seed-structure');
        if (ss) {
          const n = parseInt(ss, 10);
          if (!Number.isNaN(n)) {
            provider.setCurrentVariation(n);
            setCurrentVariation(provider.getCurrentVariation());
            setSeedStructure(n);
          }
        } else {
          setCurrentVariation(provider.getCurrentVariation());
        }
      } catch (error) {
        console.error('Failed to load structure variations:', error);
      }
    };

    loadVariations();
  }, [provider, searchParams]);

  useEffect(() => {
    const ss = searchParams.get('seed-structure');
    if (ss && variations.length > 0) {
      const n = parseInt(ss, 10);
      if (!Number.isNaN(n)) {
        provider.setCurrentVariation(n);
        setCurrentVariation(provider.getCurrentVariation());
        setSeedStructure(n);
      }
    }
  }, [searchParams, provider, variations]);

  const getText = (key: string, fallback: string = '') => provider.getText(key, fallback);

  const getId = (key: string, fallback: string = '') => provider.getId(key, fallback);

  const getClass = (key: string, fallback: string = '') => provider.getClass(key, fallback);

  return (
    <DynamicStructureContext.Provider value={{ getText, getId, getClass, currentVariation, seedStructure }}>
      {children}
    </DynamicStructureContext.Provider>
  );
}
