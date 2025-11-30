"use client";

import { useState, useMemo } from "react";
import type { Movie, MovieEditorData } from "@/models";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MovieEditorProps {
  movie: Movie;
  onSubmit: (data: MovieEditorData) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const GENRE_OPTIONS = [
  "Drama",
  "Comedy",
  "Action",
  "Thriller",
  "Sci-Fi",
  "Fantasy",
  "Horror",
  "Documentary",
  "Romance",
];

export function MovieEditor({ movie, onSubmit, onCancel, submitLabel = "Save changes" }: MovieEditorProps) {
  const [form, setForm] = useState<MovieEditorData>({
    title: movie.title,
    synopsis: movie.synopsis,
    year: movie.year.toString(),
    duration: movie.duration.toString(),
    rating: movie.rating.toString(),
    director: movie.director ?? "",
    genres: movie.genres.join(", "),
    cast: movie.cast.join(", "),
    trailerUrl: movie.trailerUrl ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof MovieEditorData, string>>>({});
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string | null }>({ type: null, message: null });

  const handleChange = (field: keyof MovieEditorData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field-level error as user edits
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    // Clear banner on any change
    if (status.type) {
      setStatus({ type: null, message: null });
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof MovieEditorData, string>> = {};

    const isNonEmpty = (v: string) => v.trim().length > 0;
    const toNumber = (v: string) => Number.parseFloat(v.trim());
    const isFiniteNumber = (v: string) => Number.isFinite(toNumber(v));

    // Text fields
    if (!isNonEmpty(form.title)) nextErrors.title = "Title is required";
    if (!isNonEmpty(form.director)) nextErrors.director = "Director is required";
    if (!isNonEmpty(form.synopsis)) nextErrors.synopsis = "Synopsis is required";

    // Numeric fields
    if (!isFiniteNumber(form.year)) {
      nextErrors.year = "Year must be a number";
    } else {
      const yr = toNumber(form.year);
      if (yr < 1900 || yr > 2100) nextErrors.year = "Year must be between 1900 and 2100";
    }
    if (!isFiniteNumber(form.duration)) {
      nextErrors.duration = "Duration must be a number";
    } else {
      const dur = toNumber(form.duration);
      if (dur < 1 || dur > 600) nextErrors.duration = "Duration must be between 1 and 600 minutes";
    }
    if (!isFiniteNumber(form.rating)) {
      nextErrors.rating = "Rating must be a number";
    } else {
      const r = toNumber(form.rating);
      if (r < 0 || r > 5) nextErrors.rating = "Rating must be between 0 and 5";
    }

    // URL (optional)
    const url = form.trailerUrl.trim();
    if (url.length > 0 && !/^https?:\/\//i.test(url)) {
      nextErrors.trailerUrl = "Trailer URL must start with http:// or https://";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus({ type: "error", message: "Please fix the highlighted fields and try again." });
      return;
    }

    try {
      onSubmit(form);
      setStatus({ type: "success", message: "Saved successfully." });
    } catch {
      setStatus({ type: "error", message: "Something went wrong while saving. Please try again." });
    }
  };

  const selectedGenre = useMemo(() => form.genres.split(",")[0]?.trim() ?? "", [form.genres]);

  const handleGenreSelect = (genre: string) => {
    setForm((prev) => ({ ...prev, genres: genre }));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-2xl border border-white/10 bg-black/30 p-4">
      {status.type && status.message && (
        <p
          className={`rounded-xl px-4 py-2 text-sm ${
            status.type === "success"
              ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : "border border-red-400/30 bg-red-400/10 text-red-200"
          }`}
        >
          {status.message}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs uppercase tracking-wide text-white/60">
          Title
          <Input
            value={form.title}
            onChange={(event) => handleChange("title", event.target.value)}
            className={`mt-1 bg-black/40 text-white ${errors.title ? "border-red-400/50 focus:ring-red-400" : ""}`}
          />
          {errors.title && <span className="mt-1 block text-[11px] text-red-300">{errors.title}</span>}
        </label>
        <label className="text-xs uppercase tracking-wide text-white/60">
          Director
          <Input
            value={form.director}
            onChange={(event) => handleChange("director", event.target.value)}
            className={`mt-1 bg-black/40 text-white ${errors.director ? "border-red-400/50 focus:ring-red-400" : ""}`}
          />
          {errors.director && <span className="mt-1 block text-[11px] text-red-300">{errors.director}</span>}
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="text-xs uppercase tracking-wide text-white/60">
          Year
          <Input
            value={form.year}
            onChange={(event) => handleChange("year", event.target.value)}
            className={`mt-1 bg-black/40 text-white ${errors.year ? "border-red-400/50 focus:ring-red-400" : ""}`}
          />
          {errors.year && <span className="mt-1 block text-[11px] text-red-300">{errors.year}</span>}
        </label>
        <label className="text-xs uppercase tracking-wide text-white/60">
          Duration (min)
          <Input
            value={form.duration}
            onChange={(event) => handleChange("duration", event.target.value)}
            className={`mt-1 bg-black/40 text-white ${errors.duration ? "border-red-400/50 focus:ring-red-400" : ""}`}
          />
          {errors.duration && <span className="mt-1 block text-[11px] text-red-300">{errors.duration}</span>}
        </label>
        <label className="text-xs uppercase tracking-wide text-white/60">
          Rating
          <Input
            value={form.rating}
            onChange={(event) => handleChange("rating", event.target.value)}
            className={`mt-1 bg-black/40 text-white ${errors.rating ? "border-red-400/50 focus:ring-red-400" : ""}`}
          />
          {errors.rating && <span className="mt-1 block text-[11px] text-red-300">{errors.rating}</span>}
        </label>
        <label className="text-xs uppercase tracking-wide text-white/60">
          Trailer URL
          <Input
            value={form.trailerUrl}
            onChange={(event) => handleChange("trailerUrl", event.target.value)}
            className={`mt-1 bg-black/40 text-white ${errors.trailerUrl ? "border-red-400/50 focus:ring-red-400" : ""}`}
          />
          {errors.trailerUrl && <span className="mt-1 block text-[11px] text-red-300">{errors.trailerUrl}</span>}
        </label>
      </div>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-white/60">Genres</p>
        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map((genre) => (
            <button
              type="button"
              key={genre}
              onClick={() => handleGenreSelect(genre)}
              className={`rounded-full border px-3 py-1 text-xs ${
                genre === selectedGenre ? "border-secondary bg-secondary/20 text-secondary" : "border-white/15 text-white/70"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
        <Input
          value={form.genres}
          onChange={(event) => handleChange("genres", event.target.value)}
          className="mt-1 bg-black/40 text-white"
          placeholder="Custom genre list"
        />
      </div>
      <label className="block text-xs uppercase tracking-wide text-white/60">
        Cast (comma separated)
        <Input value={form.cast} onChange={(event) => handleChange("cast", event.target.value)} className="mt-1 bg-black/40 text-white" />
      </label>
      <label className="block text-xs uppercase tracking-wide text-white/60">
        Synopsis
        <textarea
          value={form.synopsis}
          onChange={(event) => handleChange("synopsis", event.target.value)}
          className={`mt-1 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white focus:outline-none focus:ring-2 ${errors.synopsis ? "border-red-400/50 focus:ring-red-400" : "focus:ring-secondary"}`}
          rows={4}
        />
        {errors.synopsis && <span className="mt-1 block text-[11px] text-red-300">{errors.synopsis}</span>}
      </label>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" className="rounded-full bg-secondary text-black hover:bg-secondary/80">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" className="rounded-full border border-white/20 text-white" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
