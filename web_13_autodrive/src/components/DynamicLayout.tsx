"use client";

import { getSeedLayout, getLayoutClasses, LayoutConfig } from "@/dynamic/v1-layouts";
import { useSeedLayout } from "@/dynamic/v3-dynamic";
import { ReactNode, Suspense } from "react";

interface DynamicLayoutProps {
  children?: ReactNode;
  header: ReactNode;
  main: ReactNode;
  footer?: ReactNode;
}

function DynamicLayoutContent({ 
  children, 
  header, 
  main, 
  footer 
}: DynamicLayoutProps) {
  const { layout, isDynamicEnabled } = useSeedLayout();
  const classes = getLayoutClasses(layout);

  // Render different layouts based on seed
  switch (layout.structure.main.layout) {
    case 'sidebar':
      return (
        <div className={`${classes.container} ${layout.className}`}>
          {layout.structure.header.position === 'left' && (
            <div className={classes.header}>
              {header}
            </div>
          )}
          {layout.structure.header.position === 'top' && (
            <div className={classes.header}>
              {header}
            </div>
          )}
          <div className={classes.main}>
            {layout.structure.footer.position === 'left' && (
              <div className={classes.footer}>
                {footer}
              </div>
            )}
            <div className="flex-1">
              {main}
            </div>
          </div>
          {layout.structure.footer.position === 'bottom' && (
            <div className={classes.footer}>
              {footer}
            </div>
          )}
        </div>
      );

    case 'split':
      return (
        <div className={`${classes.container} ${layout.className}`}>
          {layout.structure.header.position === 'top' && (
            <div className={classes.header}>
              {header}
            </div>
          )}
          {layout.structure.footer.position === 'top' && (
            <div className={classes.footer}>
              {footer}
            </div>
          )}
          <div className={classes.main}>
            {main}
          </div>
          {layout.structure.header.position === 'bottom' && (
            <div className={classes.header}>
              {header}
            </div>
          )}
          {layout.structure.footer.position === 'bottom' && (
            <div className={classes.footer}>
              {footer}
            </div>
          )}
        </div>
      );

    case 'columns':
      return (
        <div className={`${classes.container} ${layout.className}`}>
          {layout.structure.header.position === 'top' && (
            <div className={classes.header}>
              {header}
            </div>
          )}
          <div className={classes.main}>
            {main}
          </div>
          {layout.structure.footer.position === 'bottom' && (
            <div className={classes.footer}>
              {footer}
            </div>
          )}
        </div>
      );

    case 'masonry':
      return (
        <div className={`${classes.container} ${layout.className}`}>
          {layout.structure.header.position === 'top' && (
            <div className={classes.header}>
              {header}
            </div>
          )}
          <div className={classes.main}>
            {main}
          </div>
          {layout.structure.footer.position === 'bottom' && (
            <div className={classes.footer}>
              {footer}
            </div>
          )}
        </div>
      );

    case 'stacked':
      return (
        <div className={`${classes.container} ${layout.className}`}>
          {layout.structure.header.position === 'top' && (
            <div className={classes.header}>
              {header}
            </div>
          )}
          <div className={classes.main}>
            {main}
          </div>
          {layout.structure.footer.position === 'bottom' && (
            <div className={classes.footer}>
              {footer}
            </div>
          )}
        </div>
      );

    default:
      // Default layout
      return (
        <div className={`${classes.container} ${layout.className}`}>
          <div className={classes.header}>
            {header}
          </div>
          <div className={classes.main}>
            {main}
          </div>
          <div className={classes.footer}>
            {footer}
          </div>
        </div>
      );
  }
}

export default function DynamicLayout(props: DynamicLayoutProps) {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-gray-100 flex items-center justify-center">Loading layout...</div>}>
      <DynamicLayoutContent {...props} />
    </Suspense>
  );
}
