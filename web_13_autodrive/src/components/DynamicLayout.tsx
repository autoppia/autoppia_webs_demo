"use client";

import { ReactNode, Suspense, useMemo } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

interface DynamicLayoutProps {
  children?: ReactNode;
  header: ReactNode;
  main: ReactNode;
  footer?: ReactNode;
}

function DynamicLayoutContent({ children, header, main, footer }: DynamicLayoutProps) {
  const dyn = useDynamicSystem();
  const hasFooter = Boolean(footer);
  const sections = useMemo(() => (hasFooter ? ["header", "main", "footer"] : ["header", "main"]), [hasFooter]);
  const orderedSections = useMemo(() => {
    const order = dyn.v1.changeOrderElements("layout-sections", sections.length);
    return order.map((idx) => sections[idx]);
  }, [dyn.seed, sections]);

  return dyn.v1.addWrapDecoy(
    "layout-shell",
    <div
      id={dyn.v3.getVariant("layout-container", ID_VARIANTS_MAP, "layout-container")}
      className={`min-h-screen flex flex-col ${dyn.v3.getVariant("grid-container", CLASS_VARIANTS_MAP, "")}`}
    >
      {orderedSections.map((section) => {
        if (section === "header") {
          return dyn.v1.addWrapDecoy(
            "layout-header",
            <div
              key="layout-header"
              id={dyn.v3.getVariant("layout-header", ID_VARIANTS_MAP, "layout-header")}
              className={`w-full ${dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "")}`}
            >
              {header}
            </div>
          );
        }
        if (section === "main") {
          return dyn.v1.addWrapDecoy(
            "layout-main",
            <main
              key="layout-main"
              id={dyn.v3.getVariant("layout-main", ID_VARIANTS_MAP, "layout-main")}
              className={`flex-1 ${dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "")}`}
            >
              {main}
              {children}
            </main>
          );
        }
        if (section === "footer" && footer) {
          return dyn.v1.addWrapDecoy(
            "layout-footer",
            <footer
              key="layout-footer"
              id={dyn.v3.getVariant("layout-footer", ID_VARIANTS_MAP, "layout-footer")}
              className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "")}
            >
              {footer}
              <span className="sr-only">
                {dyn.v3.getVariant("layout_footer_sr", TEXT_VARIANTS_MAP, "Footer section")}
              </span>
            </footer>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function DynamicLayout(props: DynamicLayoutProps) {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-gray-100 flex items-center justify-center">Loading layout...</div>}>
      <DynamicLayoutContent {...props} />
    </Suspense>
  );
}
