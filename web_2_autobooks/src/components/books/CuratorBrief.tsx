"use client";

interface CuratorBriefProps {
  totalBooks: number;
}

export function CuratorBrief({ totalBooks }: CuratorBriefProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#04121b] via-[#061b28] to-[#091e33] p-6 text-white shadow-2xl">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="md:max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Your Collection</p>
          <h2 className="mt-3 text-3xl font-semibold">Explore our curated library.</h2>
          <p className="mt-2 text-base text-white/70">
            We've handpicked thousands of books across all genres. From bestsellers to hidden gems, 
            discover stories that match your reading mood. Filter by genre, year, or search for specific 
            authors and titles to find exactly what you're looking for.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-secondary/80" />
              <span>Browse by genre to discover new favorite authors and styles.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-secondary/80" />
              <span>Search by publication year to explore different literary eras.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-secondary/80" />
              <span>Use keywords to find books by theme, setting, or mood.</span>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center md:max-w-xs">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Books Available</p>
          <p className="mt-3 text-4xl font-semibold text-white">{totalBooks}</p>
          <p className="mt-2 text-sm text-white/50">
            {totalBooks === 1 ? 'book matches your filters' : 'books match your filters'}
          </p>
        </div>
      </div>
    </section>
  );
}
