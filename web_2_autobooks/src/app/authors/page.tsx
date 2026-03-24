"use client";

import { Suspense, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { getBooks } from "@/dynamic/v2";
import { filterAuthorsByQuery, listAuthors, booksForAuthor } from "@/data/authors";
import { SeedLink } from "@/components/ui/SeedLink";
import { Input } from "@/components/ui/input";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
function AuthorsContent() {
  const dyn = useDynamicSystem();
  const books = useMemo(() => getBooks(), []);
  const [authorQuery, setAuthorQuery] = useState("");
  const rows = useMemo(() => {
    const filtered = filterAuthorsByQuery(listAuthors(), authorQuery);
    return filtered.map((author) => ({
      author,
      count: booksForAuthor(books, author).length,
    }));
  }, [books, authorQuery]);

  return (
    <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

      <main className="relative mx-auto max-w-6xl px-4 py-12 text-white">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-secondary mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {dyn.v3.getVariant("authors_section_kicker", TEXT_VARIANTS_MAP, "Catalog")}
            </p>
            <h1
              id={dyn.v3.getVariant("authors-page-heading", ID_VARIANTS_MAP, "authors-page-heading")}
              className="text-4xl font-bold"
            >
              {dyn.v3.getVariant("authors_page_title", TEXT_VARIANTS_MAP, "Authors")}
            </h1>
            <p className="mt-2 max-w-2xl text-white/65">
              {dyn.v3.getVariant(
                "authors_page_subtitle",
                TEXT_VARIANTS_MAP,
                "Biographies, awards, and titles available in the current catalog."
              )}
            </p>
          </div>
          <SeedLink
            href="/"
            preserveSeed
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            {dyn.v3.getVariant("authors_back_home", TEXT_VARIANTS_MAP, "Back to home")}
          </SeedLink>
        </div>

        <div className="mb-8 max-w-xl">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            {dyn.v3.getVariant("authors_search_label", TEXT_VARIANTS_MAP, "Search authors")}
          </label>
          <Input
            id={dyn.v3.getVariant("search-input", ID_VARIANTS_MAP, "search-input")}
            value={authorQuery}
            onChange={(e) => setAuthorQuery(e.target.value)}
            placeholder={dyn.v3.getVariant(
              "authors_search_placeholder",
              TEXT_VARIANTS_MAP,
              "Filter by name, bio, or id…"
            )}
            className="h-11 border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-secondary"
          />
        </div>

        {rows.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center text-white/65">
            {dyn.v3.getVariant("authors_no_match", TEXT_VARIANTS_MAP, "No authors match your search.")}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map(({ author, count }) => (
            <SeedLink
              key={author.id}
              href={`/authors/${encodeURIComponent(author.id)}`}
              preserveSeed
              className="group flex gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5 backdrop-blur-sm transition hover:border-secondary/40"
            >
              {author.portraitSrc ? (
                <img
                  src={author.portraitSrc}
                  alt=""
                  className="h-20 w-20 flex-shrink-0 rounded-2xl border border-white/10 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl font-bold text-secondary">
                  {author.displayName.slice(0, 1)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-white group-hover:text-secondary transition-colors">
                  {author.displayName}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-white/60">{author.biography}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-secondary/90">
                  {count}{" "}
                  {dyn.v3.getVariant("authors_titles_in_catalog", TEXT_VARIANTS_MAP, "titles in catalog")}
                </p>
              </div>
            </SeedLink>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function AuthorsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
      <AuthorsContent />
    </Suspense>
  );
}
