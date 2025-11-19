"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { getMovies } from "@/utils/dynamicDataProvider";
import { SeedLink } from "@/components/ui/SeedLink";

const MIN_PASSWORD_LENGTH = 6;
const FALLBACK_MOVIE_ID = "movie-v2-001";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useSeedRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [assignedMovie, setAssignedMovie] = useState(FALLBACK_MOVIE_ID);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const movies = getMovies();
  const movieOptions = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    return [...movies]
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, 25);
  }, [movies]);

  const preferredDefaultMovie = movieOptions[0]?.id ?? FALLBACK_MOVIE_ID;

  useEffect(() => {
    if (!assignedMovie && preferredDefaultMovie) {
      setAssignedMovie(preferredDefaultMovie);
    }
  }, [assignedMovie, preferredDefaultMovie]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.trim().length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    setIsSubmitting(true);
    try {
      const movieId = assignedMovie || preferredDefaultMovie;
      await register({
        username,
        password,
        allowedMovies: movieId ? [movieId] : undefined,
      });
      router.push("/profile");
    } catch (err) {
      setError((err as Error).message ?? "Unable to register");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-12 text-white">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Autocinema</p>
        <h1 className="mt-2 text-3xl font-semibold">Create curator access</h1>
        <p className="text-white/70">
          Pick a username and assign yourself a film to manage. We store the credential locally so you can immediately sign
          in and head to your profile dashboard.
        </p>
      </div>

      <form className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6" onSubmit={handleSubmit}>
        <label className="block text-xs uppercase tracking-wide text-white/60">
          Username
          <Input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-1 bg-black/40 text-white"
            placeholder="cinefan"
            autoComplete="username"
          />
        </label>
        <label className="block text-xs uppercase tracking-wide text-white/60">
          Password
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 bg-black/40 text-white"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </label>
        <label className="block text-xs uppercase tracking-wide text-white/60">
          Confirm password
          <Input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1 bg-black/40 text-white"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </label>


        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full bg-secondary text-black hover:bg-secondary/80" disabled={isSubmitting}>
          {isSubmitting ? "Setting up…" : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-white/60">
        Already registered?{" "}
        <SeedLink href="/login" className="font-semibold text-secondary">
          Go to login
        </SeedLink>
      </p>
    </main>
  );
}

