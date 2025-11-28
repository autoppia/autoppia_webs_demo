"use client";

import { useMemo } from "react";
import { useSeedLayout } from "@/dynamic/v3-dynamic";
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
  const { layout } = useSeedLayout();

  const sections = useMemo(
    () => layout?.structure?.main?.sections ?? ["hero", "booking", "map", "rides"],
    [layout?.structure?.main?.sections]
  );

  return (
    <>
      {sections.map((section) => {
        switch (section) {
          case "hero":
            return (
              <div key="hero" className="hero-section">
                {children.hero}
              </div>
            );
          case "booking":
            return (
              <div key="booking" className="booking-section">
                {children.booking}
              </div>
            );
          case "map":
            return (
              <div key="map" className="map-section">
                {children.map}
              </div>
            );
          case "rides":
            return (
              <div key="rides" className="rides-section">
                {children.rides}
              </div>
            );
          case "footer":
            return children.footer ? (
              <div key="footer" className="footer-section">
                {children.footer}
              </div>
            ) : null;
          default:
            return null;
        }
      })}
    </>
  );
}
