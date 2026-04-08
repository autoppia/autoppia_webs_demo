import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { SeedProvider } from "@/context/SeedContext";
import { LocalDiscordOverlayProvider } from "@/context/LocalDiscordOverlayContext";
import { DataReadyGate } from "@/components/layout/DataReadyGate";
import { V4PopupLayer } from "@/components/layout/V4PopupLayer";

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("autodiscord-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);else document.documentElement.setAttribute("data-theme","dark")}catch(e){document.documentElement.setAttribute("data-theme","dark")}})()`;

export const metadata: Metadata = {
  title: "AutoDiscord – Discord-like Demo",
  description: "A mocked Discord-style chat demo for the subnet.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: inline theme init to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <Suspense
          fallback={
            <div className="min-h-screen bg-discord-darkest flex items-center justify-center">
              Loading…
            </div>
          }
        >
          <SeedProvider>
            <LocalDiscordOverlayProvider>
              <V4PopupLayer>
                <DataReadyGate>{children}</DataReadyGate>
              </V4PopupLayer>
            </LocalDiscordOverlayProvider>
          </SeedProvider>
        </Suspense>
      </body>
    </html>
  );
}
