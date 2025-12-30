"use client";

import { ReactNode } from "react";

interface LayoutWrapperProps {
  children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return <div>{children}</div>;
} 
