"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import type { Movie, MovieEditorData } from "@/models";
import { getMovies } from "@/dynamic/v2-data";
import { SeedLink } from "@/components/ui/SeedLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EVENT_TYPES, logEvent } from "@/events";
import { MovieEditor } from "@/components/movies/MovieEditor";
import { Trash2 } from "lucide-react";
import {
  collectFilmChangeMetadata,
  editorDataToFilmPayload,
  movieToFilmPayload,
} from "@/events/payloads";

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
  const { currentUser, addAssignedMovie, removeAssignedMovie } = useAuth();
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState<"settings" | "movies">("settings");

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
    setProfileMessage("Your profile has been updated.");
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
    setFilmMessage(`Saved changes for “${baseMovie.title}”.`);
  };

  const handleEntryDelete = (baseMovie: Movie) => {
    const payload = movieToFilmPayload(baseMovie);
    logEvent(EVENT_TYPES.DELETE_FILM, payload);
    setFilmMessage(`Removed “${baseMovie.title}”.`);
  };

  const handleAddFilm = (data: MovieEditorData) => {
    const payload = editorDataToFilmPayload(Math.floor(Date.now() / 1000), data);
    logEvent(EVENT_TYPES.ADD_FILM, payload);
    // Persist a local placeholder entry in user's assigned list so it shows up
    if (modalMovie) {
      addAssignedMovie(modalMovie.id);
    } else {
      addAssignedMovie(addFilmTemplate.id);
    }
    setAddFilmMessage(`Added “${payload.name}”.`);
    setAddFilmKey((prev) => prev + 1);
    // Keep modal open so the user sees the success message in the form
  };

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 text-white">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Profile</p>
        <h1 className="text-3xl font-semibold">Welcome, {currentUser.username}</h1>
        <p className="text-white/70">Manage your account, saved films, and assignments.</p>
      </header>

      {/* Tabs */}
      <nav className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`rounded-full border px-4 py-1.5 text-sm ${activeTab === "settings" ? "border-secondary bg-secondary/20 text-secondary" : "border-white/15 text-white/80 hover:bg-white/5"}`}
        >
          Edit profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("movies")}
          className={`rounded-full border px-4 py-1.5 text-sm ${activeTab === "movies" ? "border-secondary bg-secondary/20 text-secondary" : "border-white/15 text-white/80 hover:bg-white/5"}`}
        >
          My movies
        </button>
      </nav>

      {activeTab === "settings" && profileMessage && (
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{profileMessage}</p>
      )}

      {/* Watchlist tab removed; access via header link to /watchlist */}

      {activeTab === "settings" && (
        <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Account settings</h2>
          <p className="text-sm text-white/70">Update your profile details below.</p>
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
                Save changes
              </Button>
            </div>
          </form>
        </section>
      )}

      {activeTab === "movies" && filmMessage && (
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{filmMessage}</p>
      )}

      {activeTab === "movies" && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">My movies</h2>
            <Button
              className="rounded-full bg-secondary text-black hover:bg-secondary/80"
              onClick={() => {
                setModalMode("add");
                setModalMovie(addFilmTemplate);
                setIsModalOpen(true);
              }}
            >
              Add movie
            </Button>
          </div>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map(({ movieId, movie }) => {
              const baseMovie = movie ?? buildFallbackMovie(movieId);
              return (
                <div
                  key={movieId}
                  onClick={() => {
                    setModalMode("edit");
                    setModalMovie(baseMovie);
                    setIsModalOpen(true);
                  }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 text-left transition hover:bg-black/40 cursor-pointer"
                >
                  <div
                    className="aspect-[16/9] w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.03]"
                    style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.6)), url(${baseMovie.poster}), url('/media/gallery/default_movie.png')` }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEntryDelete(baseMovie);
                      removeAssignedMovie(baseMovie.id);
                    }}
                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-500/40 bg-red-600 text-white shadow-lg transition hover:bg-red-500"
                    aria-label="Delete from my movies"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                  <div className="p-3">
                    <p className="text-xs uppercase tracking-wide text-white/50">Assigned movie</p>
                    <h3 className="truncate text-sm font-semibold text-white">{baseMovie.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-white/60">{baseMovie.synopsis}</p>
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}

      {/* Modal editor */}
      {isModalOpen && modalMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/10 bg-neutral-900 p-4 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{modalMode === "add" ? "Add movie" : "Edit movie"}</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-white/10 px-2 py-1 text-sm text-white/70 hover:bg-white/5"
              >
                Close
              </button>
            </div>
            <div className="mt-3">
              {modalMode === "add" ? (
                <MovieEditor movie={modalMovie} onSubmit={handleAddFilm} submitLabel="Add movie" />
              ) : (
                <MovieEditor
                  movie={modalMovie}
                  onSubmit={(data) => {
                    handleEntryEdit(modalMovie, data);
                    setIsModalOpen(false);
                  }}
                  submitLabel="Save changes"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
