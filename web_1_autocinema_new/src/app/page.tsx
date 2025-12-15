// Server Component - puede leer searchParams directamente
import { Suspense } from "react";
import { clampBaseSeed } from "@/shared/seed-resolver";
import { HomeContent } from "@/components/pages/HomeContent";

// Server Component - lee searchParams durante SSR
export default function HomePage({
  searchParams,
}: {
  searchParams: { seed?: string };
}) {
  // Leer seed de la URL durante SSR - esto SÍ funciona en Server Components
  const initialSeed = searchParams?.seed 
    ? clampBaseSeed(Number.parseInt(searchParams.seed, 10))
    : 1;

  return (
    <>
      {/* Inyectar seed en el HTML antes de que React se monte */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__INITIAL_SEED__ = ${initialSeed};`,
        }}
      />
      <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
        <HomeContent />
      </Suspense>
    </>
  );
}
