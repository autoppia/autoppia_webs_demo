"use client";

import { useMemo } from "react";
import { ReactNode } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

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
  const dyn = useDynamicSystem();

  const baseSections = useMemo(() => ["hero", "booking", "map", "rides", "footer"], []);
  const sections = useMemo(() => {
    const order = dyn.v1.changeOrderElements("site-sections", baseSections.length);
    return order.map((idx) => baseSections[idx]);
  }, [dyn.seed, baseSections]);

  return (
    dyn.v1.addWrapDecoy(
      "site-elements",
      <>
      {sections.map((section) => {
        switch (section) {
          case "hero":
            return (
              dyn.v1.addWrapDecoy(
                "hero-section",
                <div
                  key="hero"
                  id={dyn.v3.getVariant("hero-section", ID_VARIANTS_MAP, "hero-section")}
                  className={`hero-section ${dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "")}`}
                >
                  {children.hero}
                </div>
              )
            );
          case "booking":
            return (
              dyn.v1.addWrapDecoy(
                "booking-section",
                <div
                  key="booking"
                  id={dyn.v3.getVariant("booking-section", ID_VARIANTS_MAP, "booking-section")}
                  className={`booking-section ${dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "")}`}
                >
                  {children.booking}
                </div>
              )
            );
          case "map":
            return (
              dyn.v1.addWrapDecoy(
                "map-section",
                <div
                  key="map"
                  id={dyn.v3.getVariant("map-section", ID_VARIANTS_MAP, "map-section")}
                  className={`map-section ${dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "")}`}
                >
                  {children.map}
                </div>
              )
            );
          case "rides":
            return (
              dyn.v1.addWrapDecoy(
                "rides-section",
                <div
                  key="rides"
                  id={dyn.v3.getVariant("rides-section", ID_VARIANTS_MAP, "rides-section")}
                  className={`rides-section ${dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "")}`}
                >
                  {children.rides}
                </div>
              )
            );
          case "footer":
            return children.footer ? (
                dyn.v1.addWrapDecoy(
                  "footer-section",
                  <div
                    key="footer"
                    id={dyn.v3.getVariant("footer-section", ID_VARIANTS_MAP, "footer-section")}
                    className={`footer-section ${dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "")}`}
                  >
                    {children.footer}
                    <span className="sr-only">{dyn.v3.getVariant("footer_label", TEXT_VARIANTS_MAP, "Footer section")}</span>
                  </div>
                )
            ) : null;
          default:
            return null;
        }
      })}
      </>
    )
  );
}
