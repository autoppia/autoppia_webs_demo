"use client";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-neutral-950/90 text-white/70">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary">Autobooks</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Your ultimate book search engine.</h3>
          <p className="mt-4 text-base text-white/70 leading-relaxed max-w-2xl mx-auto">
            Find the perfect book in seconds. From timeless classics to contemporary masterpieces, our search engine lets you explore thousands of books by genre, era, style, or mood. Type what you're looking for and start discovering. Whether you crave an immersive mystery, a thought-provoking literary fiction, or an epic fantasy adventure, your next page-turning obsession is waiting.
          </p>
        </div>
      </div>
      <div className="border-t border-white/5 bg-neutral-950/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Autoppia Experiments</p>
        </div>
      </div>
    </footer>
  );
}
