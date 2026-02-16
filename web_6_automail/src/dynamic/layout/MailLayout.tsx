"use client";

import React from "react";
import { cn } from "@/library/utils";
import { useLayout } from "@/contexts/LayoutContext";
import { Toolbar } from "@/components/Toolbar";
import { Sidebar } from "@/components/Sidebar";
import { EmailList } from "@/components/EmailList";
import { EmailView } from "@/components/EmailView";
import { ComposeModal } from "@/components/ComposeModal";
import { useEmail } from "@/contexts/EmailContext";

/**
 * Single mail app layout (classic: toolbar, sidebar, list/view, compose).
 * Layout structure lives in @/dynamic so UI is not hardcoded in DynamicLayout.
 */
export function MailLayout() {
  const { currentVariant } = useLayout();
  const { currentEmail } = useEmail();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div
      className={cn("h-screen flex flex-col overflow-hidden bg-background", currentVariant.styles.container)}
      suppressHydrationWarning
    >
      <Toolbar onMenuClick={toggleSidebar} />
      {/* Body: takes remaining height so sidebar and main are proportional to viewport */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar: fixed, full height below toolbar on desktop; ml-64 on main reserves its width */}
        <aside
          className={cn(
            "fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col h-full transform transition-transform duration-200 ease-in-out md:top-16 md:h-[calc(100vh-4rem)]",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
          aria-label="Mail navigation"
        >
          <Sidebar />
        </aside>
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}
        {/* Main: left margin = sidebar width so content is beside it; flex-1 so it takes remaining width and full body height */}
        <main
          className={cn(
            "flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden w-full",
            sidebarOpen && "ml-64",
            "md:ml-64"
          )}
          aria-label="Email list"
        >
          {currentEmail ? (
            <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden h-full">
              <EmailView />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden h-full">
              <EmailList />
            </div>
          )}
        </main>
      </div>
      <ComposeModal />
    </div>
  );
}
