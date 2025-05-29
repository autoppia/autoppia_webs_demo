"use client";

import React, { useState } from "react";
import { cn } from "@/library/utils";
import { Toolbar } from "@/components/Toolbar";
import { Sidebar } from "@/components/Sidebar";
import { EmailList } from "@/components/EmailList";
import { EmailView } from "@/components/EmailView";
import { ComposeModal } from "@/components/ComposeModal";
import { useEmail } from "@/contexts/EmailContext";

export default function GmailPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentEmail } = useEmail();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col bg-background" suppressHydrationWarning>
      {/* Top Toolbar */}
      <Toolbar onMenuClick={toggleSidebar} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar />
        </div>

        {/* Sidebar Overlay (Mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Show full-screen email view when email is selected */}
          {currentEmail ? (
            <div className="flex-1">
              <EmailView />
            </div>
          ) : (
            /* Email List takes full width when no email selected */
            <div className="flex-1">
              <EmailList />
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <ComposeModal />
    </div>
  );
}
