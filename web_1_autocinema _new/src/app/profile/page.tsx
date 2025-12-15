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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Film, Edit, Trash2, Plus, Save, Mail, MapPin, Globe, Heart, FileText } from "lucide-react";

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
  const { currentUser, addAllowedMovie, removeAllowedMovie } = useAuth();
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
      <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen flex items-center justify-center">
        {/* Background grid pattern */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        {/* Background gradient overlays */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
        
        <main className="relative mx-auto max-w-2xl px-4 py-16 text-white">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 text-center backdrop-blur-sm shadow-2xl">
            <h1 className="text-3xl font-semibold">Please sign in</h1>
            <p className="mt-3 text-white/70">Sign in with the credential provided in your task instructions.</p>
            <SeedLink
              href="/login"
              className="mt-6 inline-flex rounded-full border border-white/10 px-6 py-3 text-sm uppercase tracking-wide text-secondary hover:bg-secondary/10 transition-colors"
            >
              Go to login
            </SeedLink>
          </div>
        </main>
      </div>
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
    setProfileMessage("Profile updated successfully.");
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
    setFilmMessage(`Film edited: ${baseMovie.title}`);
  };

  const handleEntryDelete = (baseMovie: Movie) => {
    const payload = movieToFilmPayload(baseMovie);
    logEvent(EVENT_TYPES.DELETE_FILM, payload);
    
    // Remove the movie from the user's allowed movies
    removeAllowedMovie(baseMovie.id);
    
    setFilmMessage(`Film deleted: ${baseMovie.title}`);
  };

  const handleAddFilm = (data: MovieEditorData) => {
    // Generate a unique movie ID based on timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    const newMovieId = `movie-v2-${timestamp}`;
    
    const payload = editorDataToFilmPayload(timestamp, data);
    logEvent(EVENT_TYPES.ADD_FILM, payload);
    
    // Add the new movie to the user's allowed movies
    addAllowedMovie(newMovieId);
    
    setAddFilmMessage(`Film added: ${payload.name}`);
    setAddFilmKey((prev) => prev + 1);
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      {/* Background gradient overlays */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
      
      <main className="relative mx-auto max-w-5xl px-4 py-10 text-white">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/30">
              <User className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">Profile</p>
              <h1 className="text-3xl md:text-4xl font-bold">Welcome, {currentUser.username}</h1>
            </div>
          </div>
          <p className="text-white/70">Manage your profile and assigned movies for validation.</p>
        </header>

        {/* Success Messages */}
        {profileMessage && (
          <div className="mb-6 rounded-xl border border-green-400/30 bg-green-400/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-green-200">{profileMessage}</p>
          </div>
        )}
        {filmMessage && (
          <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-200">{filmMessage}</p>
          </div>
        )}
        {addFilmMessage && (
          <div className="mb-6 rounded-xl border border-green-400/30 bg-green-400/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-green-200">{addFilmMessage}</p>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Edit Profile
            </TabsTrigger>
            <TabsTrigger value="movies" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              Edit Movies
            </TabsTrigger>
            <TabsTrigger value="add-movies" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Movies
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Edit className="h-5 w-5 text-secondary" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                  <p className="text-sm text-white/70">Update your profile information and preferences.</p>
                </div>
              </div>
              
              <form className="space-y-6" onSubmit={handleProfileSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                      <User className="h-4 w-4 text-secondary" />
                      First Name
                    </label>
                    <Input 
                      value={profileForm.firstName} 
                      onChange={(event) => handleProfileInputChange("firstName", event.target.value)} 
                      className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20" 
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                      <User className="h-4 w-4 text-secondary" />
                      Last Name
                    </label>
                    <Input 
                      value={profileForm.lastName} 
                      onChange={(event) => handleProfileInputChange("lastName", event.target.value)} 
                      className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20" 
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                      <Mail className="h-4 w-4 text-secondary" />
                      Email
                    </label>
                    <Input 
                      value={profileForm.email} 
                      onChange={(event) => handleProfileInputChange("email", event.target.value)} 
                      className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20" 
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                      <Heart className="h-4 w-4 text-secondary" />
                      Favorite Genres
                    </label>
                    <Input
                      value={profileForm.favoriteGenres}
                      onChange={(event) => handleProfileInputChange("favoriteGenres", event.target.value)}
                      className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      placeholder="Drama, Action, Comedy..."
                    />
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                      <MapPin className="h-4 w-4 text-secondary" />
                      Location
                    </label>
                    <Input 
                      value={profileForm.location} 
                      onChange={(event) => handleProfileInputChange("location", event.target.value)} 
                      className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20" 
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                      <Globe className="h-4 w-4 text-secondary" />
                      Website
                    </label>
                    <Input 
                      value={profileForm.website} 
                      onChange={(event) => handleProfileInputChange("website", event.target.value)} 
                      className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20" 
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                    <FileText className="h-4 w-4 text-secondary" />
                    Bio
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(event) => handleProfileInputChange("bio", event.target.value)}
                    className="w-full min-h-[120px] rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button 
                    type="submit" 
                    className="h-12 px-8 bg-secondary text-black hover:bg-secondary/90 font-bold shadow-lg shadow-secondary/20 transition-all hover:scale-105"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Save Profile
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* Movies Tab */}
          <TabsContent value="movies" className="space-y-6">
            {/* Assigned Movies */}
            <div className="space-y-4">
              {entries.length > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <Film className="h-5 w-5 text-secondary" />
                  <h2 className="text-2xl font-bold text-white">Assigned Movies</h2>
                  <span className="text-sm text-white/60">({entries.length})</span>
                </div>
              )}
              
              {entries.map(({ movieId, movie }) => {
                const baseMovie = movie ?? buildFallbackMovie(movieId);
                return (
                  <div key={movieId} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Assigned Movie</p>
                        <h3 className="text-2xl font-bold text-white mb-2">{baseMovie.title}</h3>
                        {movie ? (
                          <>
                            <p className="text-sm text-white/70 mb-4 line-clamp-2">{movie.synopsis}</p>
                            <div className="grid gap-3 text-sm text-white/80 md:grid-cols-2">
                              <div className="space-y-2">
                                <p><span className="text-white/50">Director:</span> <span className="font-medium">{movie.director}</span></p>
                                <p><span className="text-white/50">Year:</span> <span className="font-medium">{movie.year}</span></p>
                                <p><span className="text-white/50">Duration:</span> <span className="font-medium">{movie.duration} min</span></p>
                              </div>
                              <div className="space-y-2">
                                <p><span className="text-white/50">Genres:</span> <span className="font-medium">{movie.genres.join(", ")}</span></p>
                                <p><span className="text-white/50">Cast:</span> <span className="font-medium">{movie.cast.slice(0, 3).join(", ")}{movie.cast.length > 3 ? "..." : ""}</span></p>
                                <p><span className="text-white/50">Rating:</span> <span className="font-medium">{movie.rating}</span></p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-white/60">
                            This movie is not available in the current dataset, but you can still edit or delete it.
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                      {movie && (
                        <SeedLink
                          href={`/movies/${movie.id}`}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
                        >
                          <Film className="h-4 w-4" />
                          View Details
                        </SeedLink>
                      )}
                      <Button
                        variant="ghost"
                        className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 text-red-300 hover:bg-red-400/20 transition-colors"
                        onClick={() => handleEntryDelete(baseMovie)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Movie
                      </Button>
                    </div>
                    
                    <div className="border-t border-white/10 pt-6">
                      <MovieEditor movie={baseMovie} onSubmit={(data) => handleEntryEdit(baseMovie, data)} submitLabel="Save Changes" />
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Add Movies Tab */}
          <TabsContent value="add-movies" className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Plus className="h-5 w-5 text-secondary" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Add New Film</h2>
                  <p className="text-sm text-white/70">Add a new film to the catalog.</p>
                </div>
              </div>
              <MovieEditor
                key={`add-film-${addFilmKey}`}
                movie={addFilmTemplate}
                onSubmit={handleAddFilm}
                submitLabel="Add Film"
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
