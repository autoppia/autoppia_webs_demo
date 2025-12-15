// Server Component - puede leer searchParams directamente
import { Suspense } from "react";
import { HomeContent } from "@/components/pages/HomeContent";

// Server Component - lee searchParams durante SSR
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ seed?: string }>;
}) {
  // En Next.js 15+, searchParams es una Promise y debe ser awaited
  // Aunque no lo usamos aquí directamente, lo leemos para validar
  await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
      <HomeContent />
    </Suspense>
  );
}
