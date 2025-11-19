"use client";

import { useSearchParams } from "next/navigation";
import { getSeedLayout } from "@/dynamic/v1-layouts";
import { ReactNode } from "react";

interface SiteElementsProps {
  children: {
    header: ReactNode;
    hero: ReactNode;
    booking: ReactNode;
    map: ReactNode;
    rides: ReactNode;
    footer?: ReactNode;
  };
}

export default function SiteElements({ children }: SiteElementsProps) {
  const searchParams = useSearchParams();
  const seedParam = searchParams.get('seed');
  const seed = seedParam ? parseInt(seedParam, 10) : undefined;
  
  const layout = getSeedLayout(seed);

  // Render elements in the order specified by the layout
  const renderElements = () => {
    const elements: ReactNode[] = [];
    
    layout.structure.main.sections.forEach((section) => {
      switch (section) {
        case 'hero':
          elements.push(
            <div key="hero" className="hero-section">
              {children.hero}
            </div>
          );
          break;
        case 'booking':
          elements.push(
            <div key="booking" className="booking-section">
              {children.booking}
            </div>
          );
          break;
        case 'map':
          elements.push(
            <div key="map" className="map-section">
              {children.map}
            </div>
          );
          break;
        case 'rides':
          elements.push(
            <div key="rides" className="rides-section">
              {children.rides}
            </div>
          );
          break;
      }
    });
    
    return elements;
  };

  return (
    <>
      {renderElements()}
    </>
  );
}
