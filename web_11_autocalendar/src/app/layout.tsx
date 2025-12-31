import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import { SeedProvider } from "@/context/SeedContext";
import { DynamicDebug } from "@/components/debug/DynamicDebug";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoCalendar – Your Smart Scheduling Assistant",
  description:
    "AutoCalendar is a powerful and intuitive calendar app inspired by Google Calendar. Plan, schedule, and manage events with ease and automation.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const params = new URLSearchParams(window.location.search);
                  const seed = params.get('seed');
                  if (seed) {
                    window.__INITIAL_SEED__ = parseInt(seed, 10);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        ></Script>
      </head>
      <body suppressHydrationWarning className="antialiased">
        <SeedProvider>
          <ClientBody>{children}</ClientBody>
          <DynamicDebug />
        </SeedProvider>
      </body>
    </html>
  );
}
