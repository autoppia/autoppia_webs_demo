"use client";

import { Suspense } from "react";
import type { LayoutConfig } from "@/dynamic/v1-layouts";
import { useSeedLayout } from "@/dynamic/v3-dynamic";
import Navbar from "./Navbar";
import Sidebar from "../Sidebar";

// Type for element configuration that can be any of the layout elements
type ElementConfig = 
  | LayoutConfig['elements']['header']
  | LayoutConfig['elements']['sidebar']
  | LayoutConfig['elements']['content']
  | LayoutConfig['elements']['footer'];

// Type for sidebar config that includes placement property
type SidebarConfig = LayoutConfig['elements']['sidebar'];

// Helper function to safely get position from element config
function getElementPosition(config: ElementConfig): React.CSSProperties['position'] {
  return 'position' in config ? config.position : 'static';
}

interface DynamicLayoutProps {
  children: React.ReactNode;
  sidebarProps: {
    onSelect: (v: string) => void;
    selected: string;
    inboxCount: number;
    todayCount: number;
    completedCount: number;
  };
}

// Component that uses useSearchParams - needs to be wrapped in Suspense
function DynamicLayoutContent({ children, sidebarProps }: DynamicLayoutProps) {
  const {
    layout,
    isDynamicEnabled,
    getElementAttributes,
    getElementXPath,
    reorderElements,
  } = useSeedLayout();
  
  // Create container styles based on layout config
  const containerStyle: React.CSSProperties = {
    display: layout.container.type === 'grid' ? 'grid' : 'flex',
    flexDirection: layout.container.direction,
    gridTemplateColumns: layout.container.gridTemplate,
    gridTemplateRows: layout.container.gridTemplate,
  };

  // Render elements in the correct order based on layout config
  const baseElements = [
    {
      key: "header",
      id: "header",
      component: <Navbar className={layout.elements.header.className} />,
      config: layout.elements.header,
    },
    {
      key: "sidebar",
      id: "sidebar",
      component: <Sidebar {...sidebarProps} className={layout.elements.sidebar.className} />,
      config: layout.elements.sidebar,
    },
    {
      key: "content",
      id: "content",
      component: children,
      config: layout.elements.content,
    },
    {
      key: "footer",
      id: "footer",
      component: <Footer />,
      config: layout.elements.footer,
    },
  ];

  // Shuffle elements based on seed when v1 is enabled
  const shuffledElements = isDynamicEnabled 
    ? reorderElements(baseElements)
    : baseElements;

  return (
    <div 
      className={layout.container.className}
      style={containerStyle}
    >
      {shuffledElements.map(({ key, component, config }, index) => {
        const elementAttributes = getElementAttributes(key, index);
        const elementXPath = getElementXPath(key);
        const elementStyle: React.CSSProperties = {
          position: getElementPosition(config),
          // When v1 is enabled and elements are shuffled, use the shuffled index for order
          // This changes the DOM order, which affects XPath and visual rendering
          order: isDynamicEnabled ? index : config.order,
        };

        // Apply specific positioning for sidebar based on layout config
        if (key === 'sidebar' && 'placement' in config) {
          const sidebarConfig = config as SidebarConfig;
          if (sidebarConfig.placement === 'floating') {
            elementStyle.position = 'absolute';
          }
        }

        return (
          <div 
            key={key}
            {...elementAttributes}
            data-xpath={elementXPath}
            className={`${config.className} ${elementAttributes?.className ?? ""}`.trim()}
            style={elementStyle}
          >
            {component}
          </div>
        );
      })}
    </div>
  );
}

// Main export that wraps the content in Suspense
export default function DynamicLayout({ children, sidebarProps }: DynamicLayoutProps) {
  return (
    <Suspense fallback={<div className="flex min-h-screen bg-white">Loading...</div>}>
      <DynamicLayoutContent sidebarProps={sidebarProps}>
        {children}
      </DynamicLayoutContent>
    </Suspense>
  );
}

// Simple footer component
function Footer() {
  return (
    <footer className="p-4 bg-gray-50 border-t border-gray-200 text-center text-gray-600">
      <p>&copy; 2024 AutoList. All rights reserved.</p>
    </footer>
  );
}
