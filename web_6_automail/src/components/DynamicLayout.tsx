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

export function DynamicLayout() {
  const { currentVariant, seed } = useLayout();
  const { currentEmail } = useEmail();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // console.log('DynamicLayout: Rendering with seed:', seed, 'variant:', currentVariant.name);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Render different layouts based on variant
  switch (currentVariant.id) {
    case 1: // Classic Gmail
      return (
        <div className={cn("h-screen flex flex-col bg-background", currentVariant.styles.container)} suppressHydrationWarning>
          <Toolbar onMenuClick={toggleSidebar} />
          <div className="flex flex-1 overflow-hidden">
            <div className={cn(
              "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
              <Sidebar />
            </div>
            {sidebarOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}
            <div className="flex-1 flex overflow-hidden">
              {currentEmail ? (
                <div className="flex-1">
                  <EmailView />
                </div>
              ) : (
                <div className="flex-1">
                  <EmailList />
                </div>
              )}
            </div>
          </div>
          <ComposeModal />
        </div>
      );

    case 2: // Right Sidebar
      return (
        <div className={cn("h-screen flex flex-col bg-background", currentVariant.styles.container)} suppressHydrationWarning>
          <Toolbar onMenuClick={toggleSidebar} />
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex overflow-hidden mr-64">
              {currentEmail ? (
                <div className="flex-1">
                  <EmailView />
                </div>
              ) : (
                <div className="flex-1">
                  <EmailList />
                </div>
              )}
            </div>
            <div className="w-64 border-l border-border">
              <Sidebar />
            </div>
          </div>
          <ComposeModal />
        </div>
      );

    case 3: // Top Navigation
      return (
        <div className={cn("h-screen flex flex-col bg-background", currentVariant.styles.container)} suppressHydrationWarning>
          <div className="w-full h-16 border-b border-border">
            <Sidebar />
          </div>
          <Toolbar onMenuClick={toggleSidebar} />
          <div className="flex-1">
            {currentEmail ? (
              <div className="flex-1 h-full">
                <EmailView />
              </div>
            ) : (
              <div className="flex-1 h-full">
                <EmailList />
              </div>
            )}
          </div>
          <ComposeModal />
        </div>
      );

    case 4: // Split View
      return (
        <div className={cn("h-screen flex bg-background", currentVariant.styles.container)} suppressHydrationWarning>
          <div className="w-64 border-r border-border">
            <Sidebar />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="h-16 border-b border-border">
              <Toolbar onMenuClick={toggleSidebar} />
            </div>
            <div className="flex-1 flex">
              <div className="w-1/2 border-r border-border">
                <EmailList />
              </div>
              <div className="w-1/2">
                {currentEmail ? (
                  <EmailView />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Select an email to view
                  </div>
                )}
              </div>
            </div>
          </div>
          <ComposeModal />
        </div>
      );

    case 5: // Card Layout
      return (
        <div className={cn("h-screen flex flex-col bg-background", currentVariant.styles.container)} suppressHydrationWarning>
          <Toolbar onMenuClick={toggleSidebar} />
          <div className="flex flex-1">
            <div className="w-64 border-r border-border">
              <Sidebar />
            </div>
            <div className="flex-1 p-4">
              {currentEmail ? (
                <div className="h-full">
                  <EmailView />
                </div>
              ) : (
                <EmailList />
              )}
            </div>
          </div>
          <ComposeModal />
        </div>
      );

    case 6: // Minimalist
      return (
        <div className={cn("h-screen flex flex-col bg-background", currentVariant.styles.container)} suppressHydrationWarning>
          <div className="flex flex-1">
            <div className="w-48 border-r border-border">
              <Sidebar />
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex-1">
                {currentEmail ? (
                  <div className="flex-1 h-full">
                    <EmailView />
                  </div>
                ) : (
                  <div className="flex-1 h-full">
                    <EmailList />
                  </div>
                )}
              </div>
              <div className="border-t border-border">
                <Toolbar onMenuClick={toggleSidebar} />
              </div>
            </div>
          </div>
          <ComposeModal />
        </div>
      );

    case 7: // Dashboard Style
      return (
        <div className={cn("h-screen flex flex-col bg-background", currentVariant.styles.container)} suppressHydrationWarning>
          <Toolbar onMenuClick={toggleSidebar} />
          <div className="flex flex-1">
            <div className="w-72 border-r border-border">
              <Sidebar />
            </div>
            <div className="flex-1 flex overflow-hidden">
              {currentEmail ? (
                <div className="flex-1">
                  <EmailView />
                </div>
              ) : (
                <div className="flex-1">
                  <EmailList />
                </div>
              )}
            </div>
          </div>
          <ComposeModal />
        </div>
      );

    case 8: // Mobile First
      return (
        <div className={cn("h-screen flex flex-col bg-background", currentVariant.styles.container)} suppressHydrationWarning>
          <Toolbar onMenuClick={toggleSidebar} />
          <div className="flex flex-1">
            <div className="flex-1">
              {currentEmail ? (
                <div className="flex-1 h-full">
                  <EmailView />
                </div>
              ) : (
                <div className="flex-1 h-full">
                  <EmailList />
                </div>
              )}
            </div>
            <div className="w-64 border-l border-border">
              <Sidebar />
            </div>
          </div>
          <ComposeModal />
        </div>
      );

    case 9: // Terminal Style
      return (
        <div className={cn("h-screen flex bg-background font-mono", currentVariant.styles.container)} suppressHydrationWarning>
          <div className="w-1/3 border-r border-border">
            <EmailList />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="border-b border-border">
              <Toolbar onMenuClick={toggleSidebar} />
            </div>
            <div className="flex-1">
              {currentEmail ? (
                <EmailView />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select an email to view
                </div>
              )}
            </div>
          </div>
          <div className="w-64 border-l border-border">
            <Sidebar />
          </div>
          <ComposeModal />
        </div>
      );

    case 10: // Magazine Layout
      return (
        <div className={cn("h-screen flex flex-col bg-background", currentVariant.styles.container)} suppressHydrationWarning>
          <div className="w-full h-20 border-b border-border">
            <Sidebar />
          </div>
          <Toolbar onMenuClick={toggleSidebar} />
          <div className="flex flex-1">
            <div className="flex-1">
              {currentEmail ? (
                <div className="flex-1 h-full">
                  <EmailView />
                </div>
              ) : (
                <div className="flex-1 h-full">
                  <EmailList />
                </div>
              )}
            </div>
          </div>
          <ComposeModal />
        </div>
      );

    default:
      return (
        <div className="h-screen flex flex-col bg-background" suppressHydrationWarning>
          <Toolbar onMenuClick={toggleSidebar} />
          <div className="flex flex-1 overflow-hidden">
            <div className={cn(
              "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
              <Sidebar />
            </div>
            {sidebarOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}
            <div className="flex-1 flex overflow-hidden">
              {currentEmail ? (
                <div className="flex-1">
                  <EmailView />
                </div>
              ) : (
                <div className="flex-1">
                  <EmailList />
                </div>
              )}
            </div>
          </div>
          <ComposeModal />
        </div>
      );
  }
} 
