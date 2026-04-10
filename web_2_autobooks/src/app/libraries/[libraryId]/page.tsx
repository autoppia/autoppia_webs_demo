"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ExternalLink, Library, MapPin } from "lucide-react";
import { getLibraryById } from "@/data/libraries";
import { SeedLink } from "@/components/ui/SeedLink";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

function LibraryDetailContent() {
  const params = useParams<{ libraryId: string }>();
  const libraryId = decodeURIComponent(params.libraryId);
  const lib = getLibraryById(libraryId);
  const dyn = useDynamicSystem();

  if (!lib) {
    return (
      <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen text-white">
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <main className="relative mx-auto max-w-3xl px-4 py-20">
          <h1 className="text-2xl font-semibold">Library not found</h1>
          <SeedLink href="/libraries" preserveSeed className="mt-6 inline-block text-secondary hover:underline">
            {dyn.v3.getVariant("libraries_back_list", TEXT_VARIANTS_MAP, "Back to libraries")}
          </SeedLink>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen text-white">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

      <main className="relative mx-auto max-w-4xl px-4 py-12">
        <SeedLink href="/libraries" preserveSeed className="text-sm text-secondary hover:underline">
          ← {dyn.v3.getVariant("libraries_back_list", TEXT_VARIANTS_MAP, "Back to libraries")}
        </SeedLink>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <p className="text-sm uppercase tracking-widest text-secondary mb-2 flex items-center gap-2">
              <Library className="h-4 w-4" />
              {dyn.v3.getVariant("library_detail_kicker", TEXT_VARIANTS_MAP, "Institution")}
            </p>
            <h1
              id={dyn.v3.getVariant("library-detail-heading", ID_VARIANTS_MAP, "library-detail-heading")}
              className="text-4xl font-bold"
            >
              {lib.name}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-lg text-secondary">
              <MapPin className="h-5 w-5" />
              {lib.city}, {lib.country}
            </p>
            <p className="mt-2 text-sm text-white/50">
              {dyn.v3.getVariant("library_founded_label", TEXT_VARIANTS_MAP, "Founded / established:")}{" "}
              <span className="text-white/80">{lib.founded}</span>
            </p>
            <p className="mt-6 text-lg leading-relaxed text-white/75">{lib.description}</p>

            <section className="mt-10">
              <h2 className="text-xl font-bold mb-3">
                {dyn.v3.getVariant("library_highlights_heading", TEXT_VARIANTS_MAP, "Highlights")}
              </h2>
              <ul className="list-disc space-y-2 pl-5 text-white/75">
                {lib.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            {lib.website ? (
              <a
                href={lib.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-5 py-2 text-sm font-semibold text-secondary hover:bg-secondary/20"
              >
                <ExternalLink className="h-4 w-4" />
                {dyn.v3.getVariant("library_official_site", TEXT_VARIANTS_MAP, "Official website")}
              </a>
            ) : null}
          </div>

          {lib.imageSrc ? (
            <div className="lg:pt-10">
              <img
                src={lib.imageSrc}
                alt=""
                className="w-full rounded-3xl border border-white/10 object-cover shadow-xl"
              />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default function LibraryDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
      <LibraryDetailContent />
    </Suspense>
  );
}
