"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMovies } from "@/dynamic/v2-data";
import { SeedLink } from "@/components/ui/SeedLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { MovieEditor, type MovieEditorData } from "@/components/movies/MovieEditor";
import type { Movie } from "@/data/movies";
import {
  collectFilmChangeMetadata,
  editorDataToFilmPayload,
  movieToFilmPayload,
} from "@/utils/eventPayloads";

type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  favoriteGenres: string;
};

const buildFallbackMovie = (movieId: string): Movie => ({
  id: movieId,
  title: movieId,
  synopsis: "Dataset entry not found for this seed.",
  year: new Date().getFullYear(),
  duration: 90,
  rating: 4,
  director: "Unknown Director",
  cast: [],
  trailerUrl: "",
  poster: "/media/gallery/default_movie.png",
  genres: ["Drama"],
  category: "Drama",
  imagePath: "gallery/default_movie.png",
});

const parseGenreList = (value: string) =>
  value
    .split(",")
    .map((genre) => genre.trim())
    .filter(Boolean);

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const movies = getMovies();
  const initialProfileState: ProfileFormState = {
    firstName: "",
    lastName: "",
    email: currentUser ? `${currentUser.username}@autocinema.com` : "",
    bio: "",
    location: "",
    website: "",
    favoriteGenres: "",
  };

  const [profileForm, setProfileForm] = useState<ProfileFormState>(initialProfileState);
  const [previousProfileValues, setPreviousProfileValues] = useState<ProfileFormState>(initialProfileState);
  const [filmMessage, setFilmMessage] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [addFilmMessage, setAddFilmMessage] = useState<string | null>(null);
  const [addFilmKey, setAddFilmKey] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    setProfileForm((prev) => ({
      ...prev,
      email: prev.email || `${currentUser.username}@autocinema.com`,
    }));
    setPreviousProfileValues((prev) => ({
      ...prev,
      email: prev.email || `${currentUser.username}@autocinema.com`,
    }));
  }, [currentUser]);

  if (!currentUser) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-3xl font-semibold">Please sign in</h1>
          <p className="mt-3 text-white/70">Sign in with the credential provided in your task instructions.</p>
          <SeedLink
            href="/login"
            className="mt-6 inline-flex rounded-full border border-white/10 px-6 py-3 text-sm uppercase tracking-wide text-secondary"
          >
            Go to login
          </SeedLink>
        </div>
      </main>
    );
  }

  const entries = currentUser.allowedMovies.map((movieId) => ({
    movieId,
    movie: movies.find((movie) => movie.id === movieId),
  }));

  const addFilmTemplate = useMemo(() => buildFallbackMovie(`new-film-${addFilmKey}`), [addFilmKey]);

  const handleProfileInputChange = (key: keyof ProfileFormState, value: string) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const favoriteGenres = parseGenreList(profileForm.favoriteGenres);
    const previousGenres = parseGenreList(previousProfileValues.favoriteGenres);
    logEvent(EVENT_TYPES.EDIT_USER, {
      username: currentUser.username,
      first_name: profileForm.firstName.trim() || null,
      last_name: profileForm.lastName.trim() || null,
      email: profileForm.email.trim() || `${currentUser.username}@autocinema.com`,
      bio: profileForm.bio.trim() || null,
      location: profileForm.location.trim() || null,
      website: profileForm.website.trim() || null,
      favorite_genres: favoriteGenres,
      previous_values: {
        first_name: previousProfileValues.firstName || null,
        last_name: previousProfileValues.lastName || null,
        email: previousProfileValues.email || null,
        bio: previousProfileValues.bio || null,
        location: previousProfileValues.location || null,
        website: previousProfileValues.website || null,
        favorite_genres: previousGenres,
      },
    });
    setPreviousProfileValues(profileForm);
    setProfileMessage("User edit event recorded.");
  };

  const handleEntryEdit = (baseMovie: Movie, data: MovieEditorData) => {
    const original = movieToFilmPayload(baseMovie);
    const updated = editorDataToFilmPayload(original.id, data);
    const { changed_fields, previous_values } = collectFilmChangeMetadata(original, updated);
    logEvent(EVENT_TYPES.EDIT_FILM, {
      ...updated,
      previous_values,
      changed_fields,
    });
    setFilmMessage(`Edit event recorded for ${baseMovie.title}.`);
  };

  const handleEntryDelete = (baseMovie: Movie) => {
    const payload = movieToFilmPayload(baseMovie);
    logEvent(EVENT_TYPES.DELETE_FILM, payload);
    setFilmMessage(`Delete event recorded for ${baseMovie.title}.`);
  };

  const handleAddFilm = (data: MovieEditorData) => {
    const payload = editorDataToFilmPayload(Math.floor(Date.now() / 1000), data);
    logEvent(EVENT_TYPES.ADD_FILM, payload);
    setAddFilmMessage(`Add film event recorded for ${payload.name}.`);
    setAddFilmKey((prev) => prev + 1);
  };

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 text-white">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Profile</p>
        <h1 className="text-3xl font-semibold">Welcome, {currentUser.username}</h1>
        <p className="text-white/70">These are the films assigned to you for validation.</p>
      </header>

      {profileMessage && (
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{profileMessage}</p>
      )}

      <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">Record user edits</h2>
        <p className="text-sm text-white/70">Simulate the settings update flow and emit an EditUserEvent payload.</p>
        <form className="space-y-4" onSubmit={handleProfileSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs uppercase tracking-wide text-white/60">
              First name
              <Input value={profileForm.firstName} onChange={(event) => handleProfileInputChange("firstName", event.target.value)} className="mt-1 bg-black/40 text-white" />
            </label>
            <label className="text-xs uppercase tracking-wide text-white/60">
              Last name
              <Input value={profileForm.lastName} onChange={(event) => handleProfileInputChange("lastName", event.target.value)} className="mt-1 bg-black/40 text-white" />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs uppercase tracking-wide text-white/60">
              Email
              <Input value={profileForm.email} onChange={(event) => handleProfileInputChange("email", event.target.value)} className="mt-1 bg-black/40 text-white" />
            </label>
            <label className="text-xs uppercase tracking-wide text-white/60">
              Favorite genres
              <Input
                value={profileForm.favoriteGenres}
                onChange={(event) => handleProfileInputChange("favoriteGenres", event.target.value)}
                className="mt-1 bg-black/40 text-white"
                placeholder="Comma separated values"
              />
            </label>
          </div>
          <label className="text-xs uppercase tracking-wide text-white/60">
            Location
            <Input value={profileForm.location} onChange={(event) => handleProfileInputChange("location", event.target.value)} className="mt-1 bg-black/40 text-white" />
          </label>
          <label className="text-xs uppercase tracking-wide text-white/60">
            Website
            <Input value={profileForm.website} onChange={(event) => handleProfileInputChange("website", event.target.value)} className="mt-1 bg-black/40 text-white" />
          </label>
          <label className="text-xs uppercase tracking-wide text-white/60">
            Bio
            <textarea
              value={profileForm.bio}
              onChange={(event) => handleProfileInputChange("bio", event.target.value)}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="rounded-full bg-secondary text-black hover:bg-secondary/80">
              Record edit user event
            </Button>
          </div>
        </form>
      </section>

      {filmMessage && (
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{filmMessage}</p>
      )}

      <section className="space-y-4">
        {entries.map(({ movieId, movie }) => {
          const baseMovie = movie ?? buildFallbackMovie(movieId);
          return (
            <div key={movieId} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-wide text-white/50">Assigned movie</p>
              <h2 className="text-2xl font-semibold">{baseMovie.title}</h2>
              {movie ? (
                <>
                  <p className="text-sm text-white/60">{movie.synopsis}</p>
                  <div className="mt-4 grid gap-4 text-sm text-white/70 md:grid-cols-2">
                    <div>
                      <p>
                        <span className="text-white/50">Director:</span> {movie.director}
                      </p>
                      <p>
                        <span className="text-white/50">Year:</span> {movie.year}
                      </p>
                      <p>
                        <span className="text-white/50">Duration:</span> {movie.duration} min
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="text-white/50">Genres:</span> {movie.genres.join(", ")}
                      </p>
                      <p>
                        <span className="text-white/50">Cast:</span> {movie.cast.join(", ")}
                      </p>
                      <p>
                        <span className="text-white/50">Rating:</span> {movie.rating}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/60">
                  This movie is not available in the current dataset, but you can still trigger edit/delete events for auditing.
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                {movie && (
                  <SeedLink
                    href={`/movies/${movie.id}`}
                    className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-secondary"
                  >
                    View details
                  </SeedLink>
                )}
                <Button
                  variant="ghost"
                  className="rounded-full border border-white/10 bg-white/10 text-red-300 hover:bg-red-400/20"
                  onClick={() => handleEntryDelete(baseMovie)}
                >
                  Delete movie
                </Button>
              </div>
              <MovieEditor movie={baseMovie} onSubmit={(data) => handleEntryEdit(baseMovie, data)} submitLabel="Record edit event" />
            </div>
          );
        })}
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Record add film event</h2>
          <p className="text-sm text-white/70">Use the editor to simulate adding a new film into the catalog.</p>
        </div>
        {addFilmMessage && (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{addFilmMessage}</p>
        )}
        <MovieEditor
          key={`add-film-${addFilmKey}`}
          movie={addFilmTemplate}
          onSubmit={handleAddFilm}
          submitLabel="Record add film event"
        />
      </section>
    </main>
  );
}
