import "./globals.css";
import { ReactNode } from "react";
import HeaderNav from "@/components/HeaderNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AutoConnect – A LinkedIn-like Professional Network",
  description:
    "Connect, share updates, and explore jobs on AutoConnect, a modern LinkedIn clone.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900" suppressHydrationWarning>
        <HeaderNav />
        <main className="w-full mx-auto mt-6 px-5 md:px-24">{children}</main>
      </body>
    </html>
  );
}
