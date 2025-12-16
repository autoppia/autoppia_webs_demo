// Server Component - can read searchParams directly
import { Suspense } from "react";
import { HomeContent } from "@/components/pages/HomeContent";

// Server Component - reads searchParams during SSR
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ seed?: string }>;
}) {
  // In Next.js 15+, searchParams is a Promise and must be awaited
  // Even though we do not use it directly here, we read it to validate
  await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
      <HomeContent />
    </Suspense>
  );
}
