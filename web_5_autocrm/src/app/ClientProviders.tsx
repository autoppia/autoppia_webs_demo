"use client";

// ClientProviders - No longer needed since we use useDynamicSystem directly
// Keeping as a pass-through for compatibility
export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

