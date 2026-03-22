"use client";

import { Suspense, useMemo } from "react";
import { useParams } from "next/navigation";
import { Award, BookOpen } from "lucide-react";
import { getBooks } from "@/dynamic/v2";
import { getAuthorById, booksForAuthor } from "@/data/authors";
import { SeedLink } from "@/components/ui/SeedLink";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

function AuthorDetailContent() {
  const params = useParams<{ authorId: string }>();
  const authorId = decodeURIComponent(params.authorId);
  const dyn = useDynamicSystem();
  const author = getAuthorById(authorId);
  const books = useMemo(() => getBooks(), []);
  const bibliography = useMemo(() => {
    if (!author) return [];
    return booksForAuthor(books, author);
  }, [author, books]);

  if (!author) {
    return (
      <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen text-white">
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <main className="relative mx-auto max-w-3xl px-4 py-20">
          <h1 className="text-2xl font-semibold">Author not found</h1>
          <SeedLink href="/authors" preserveSeed className="mt-6 inline-block text-secondary hover:underline">
            {dyn.v3.getVariant("authors_back_list", TEXT_VARIANTS_MAP, "Back to authors")}
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
        <SeedLink href="/authors" preserveSeed className="text-sm text-secondary hover:underline">
          ← {dyn.v3.getVariant("authors_back_list", TEXT_VARIANTS_MAP, "Back to authors")}
        </SeedLink>

        <div className="mt-8 flex flex-col gap-8 md:flex-row">
          {author.portraitSrc ? (
            <img
              src={author.portraitSrc}
              alt=""
              className="mx-auto h-48 w-48 flex-shrink-0 rounded-3xl border border-white/10 object-cover md:mx-0"
            />
          ) : (
            <div className="mx-auto flex h-48 w-48 flex-shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-5xl font-bold text-secondary md:mx-0">
              {author.displayName.slice(0, 1)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1
              id={dyn.v3.getVariant("author-detail-heading", ID_VARIANTS_MAP, "author-detail-heading")}
              className="text-4xl font-bold"
            >
              {author.displayName}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-white/75">{author.biography}</p>
          </div>
        </div>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Award className="h-5 w-5 text-secondary" />
            {dyn.v3.getVariant("author_awards_heading", TEXT_VARIANTS_MAP, "Awards & recognition")}
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-white/75">
            {author.awards.map((award) => (
              <li key={award}>{award}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-5 w-5 text-secondary" />
            {dyn.v3.getVariant("author_bibliography_heading", TEXT_VARIANTS_MAP, "Bibliography in this catalog")}
          </h2>
          {bibliography.length === 0 ? (
            <p className="text-white/55">
              {dyn.v3.getVariant(
                "author_no_books",
                TEXT_VARIANTS_MAP,
                "No titles from this author appear in the loaded catalog for your current seed."
              )}
            </p>
          ) : (
            <ul className="space-y-3">
              {bibliography.map((book) => (
                <li key={book.id}>
                  <SeedLink
                    href={`/books/${encodeURIComponent(book.id)}`}
                    preserveSeed
                    className="text-secondary hover:underline font-medium"
                  >
                    {book.title}
                  </SeedLink>
                  <span className="text-white/45">
                    {" "}
                    ({book.year}) · ⭐ {book.rating}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default function AuthorDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
      <AuthorDetailContent />
    </Suspense>
  );
}
