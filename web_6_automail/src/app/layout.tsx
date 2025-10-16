import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { EmailProvider } from "@/contexts/EmailContext";

// const inter = Inter({ subsets: ["latin"] });
// Load Inter from local files
const inter = localFont({
  src: [
    {
      path: "./fonts/Inter-VariableFont.woff2",
      style: "normal",
    },
    {
      path: "./fonts/Inter-Italic-VariableFont.woff2",
      style: "italic",
    },
  ],
  variable: "--font-inter", // optional CSS variable
});

export const metadata: Metadata = {
  title: "AutoMail - Modern Email Client",
  description: "A modern, intuitive email client with advanced features.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <EmailProvider>{children}</EmailProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
