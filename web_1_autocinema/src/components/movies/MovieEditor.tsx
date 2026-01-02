"use client";

import { useState, useMemo } from "react";
import type { Movie } from "@/data/movies";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

export interface MovieEditorData {
  title: string;
  synopsis: string;
  year: string;
  duration: string;
  rating: string;
  director: string;
  genres: string;
  cast: string;
  trailerUrl: string;
}

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
  const dyn = useDynamicSystem();
  const dynamicSubmitLabel = submitLabel === "Save changes" ? dyn.v3.getVariant("save_changes", TEXT_VARIANTS_MAP, "Save changes") : submitLabel === "Add Film" ? dyn.v3.getVariant("add_film", TEXT_VARIANTS_MAP, "Add Film") : submitLabel;
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

  const handleChange = (field: keyof MovieEditorData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(form);
  };

  const selectedGenre = useMemo(() => form.genres.split(",")[0]?.trim() ?? "", [form.genres]);

  const handleGenreSelect = (genre: string) => {
    setForm((prev) => ({ ...prev, genres: genre }));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs uppercase tracking-wide text-white/60">
          Title
          <Input value={form.title} onChange={(event) => handleChange("title", event.target.value)} className="mt-1 bg-black/40 text-white" />
        </label>
        <label className="text-xs uppercase tracking-wide text-white/60">
          Director
          <Input value={form.director} onChange={(event) => handleChange("director", event.target.value)} className="mt-1 bg-black/40 text-white" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="text-xs uppercase tracking-wide text-white/60">
          Year
          <Input value={form.year} onChange={(event) => handleChange("year", event.target.value)} className="mt-1 bg-black/40 text-white" />
        </label>
        <label className="text-xs uppercase tracking-wide text-white/60">
          Duration (min)
          <Input value={form.duration} onChange={(event) => handleChange("duration", event.target.value)} className="mt-1 bg-black/40 text-white" />
        </label>
        <label className="text-xs uppercase tracking-wide text-white/60">
          Rating
          <Input value={form.rating} onChange={(event) => handleChange("rating", event.target.value)} className="mt-1 bg-black/40 text-white" />
        </label>
        <label className="text-xs uppercase tracking-wide text-white/60">
          Trailer URL
          <Input value={form.trailerUrl} onChange={(event) => handleChange("trailerUrl", event.target.value)} className="mt-1 bg-black/40 text-white" />
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
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary"
          rows={4}
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" id={dyn.v3.getVariant("save-changes-button", ID_VARIANTS_MAP, "save-changes-button")} className={cn("rounded-full bg-secondary text-black hover:bg-secondary/80", dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, ""))}>
          {dynamicSubmitLabel}
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
