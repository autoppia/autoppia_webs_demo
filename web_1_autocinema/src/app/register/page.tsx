"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeedLink } from "@/components/ui/SeedLink";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { getMovies } from "@/dynamic/v2";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { Film, UserPlus, Lock, User, Film as FilmIcon } from "lucide-react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

const MIN_PASSWORD_LENGTH = 6;
const FALLBACK_MOVIE_ID = "movie-v2-001";

export default function RegisterPage() {
  const dyn = useDynamicSystem();
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

  // Debug: Verify V2 status
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[register/page] V2 status:", {
        v2Enabled: dyn.v2.isEnabled(),
      });
    }
  }, [dyn.v2]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();
    const normalizedConfirmPassword = confirmPassword.trim();

    if (!normalizedUsername) {
      setError("Username is required");
      return;
    }
    if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (normalizedPassword !== normalizedConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const movieId = assignedMovie || preferredDefaultMovie;
      await register({
        username: normalizedUsername,
        password: normalizedPassword,
        allowedMovies: movieId ? [movieId] : undefined,
      });
      logEvent(EVENT_TYPES.REGISTRATION, {
        username: normalizedUsername,
        assigned_movie: movieId ?? undefined,
      });
      router.push("/profile");
    } catch (err) {
      setError((err as Error).message ?? "Unable to register");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen flex items-center justify-center py-12">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      {/* Background gradient overlays */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

      <main className="relative mx-auto w-full max-w-xl px-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/20 border border-secondary/30 mb-4">
              <Film className="h-8 w-8 text-secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Create Account
            </h1>
            <p className="text-lg text-white/70">
              Join Autocinema and start curating your favorite films
            </p>
          </div>

          {/* Register Form */}
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                    <User className="h-4 w-4 text-secondary" />
                    Username
                  </label>
                  <Input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    id={dyn.v3.getVariant("register-username-input", ID_VARIANTS_MAP, "register-username-input")}
                    className={cn("h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20", dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, ""))}
                    placeholder={dyn.v3.getVariant("username_placeholder", undefined, "Choose a username")}
                    autoComplete="username"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                    <Lock className="h-4 w-4 text-secondary" />
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    id={dyn.v3.getVariant("register-password-input", ID_VARIANTS_MAP, "register-password-input")}
                    className={cn("h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20", dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, ""))}
                    placeholder={dyn.v3.getVariant("password_placeholder", undefined, "Create a password")}
                    autoComplete="new-password"
                    required
                  />
                  <p className="mt-1 text-xs text-white/50">Minimum {MIN_PASSWORD_LENGTH} characters</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                    <Lock className="h-4 w-4 text-secondary" />
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    id={dyn.v3.getVariant("register-confirm-password-input", ID_VARIANTS_MAP, "register-confirm-password-input")}
                    className={cn("h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20", dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, ""))}
                    placeholder={dyn.v3.getVariant("confirm_password_placeholder", undefined, "Confirm your password")}
                    autoComplete="new-password"
                    required
                  />
                </div>

                {movieOptions.length > 0 && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                      <FilmIcon className="h-4 w-4 text-secondary" />
                      Assign Film
                    </label>
                    <select
                      value={assignedMovie}
                      onChange={(event) => setAssignedMovie(event.target.value)}
                      className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:bg-white/15 cursor-pointer"
                    >
                      {movieOptions.map((movie) => (
                        <option key={movie.id} value={movie.id} className="bg-neutral-900 text-white">
                          {movie.title}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-white/50">Select a film to manage</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                id={dyn.v3.getVariant("create-account-button", ID_VARIANTS_MAP, "create-account-button")}
                className={cn("w-full h-12 bg-secondary text-black hover:bg-secondary/90 font-bold text-base shadow-lg shadow-secondary/20 transition-all hover:scale-105", dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, ""))}
                disabled={isSubmitting}
              >
                <UserPlus className="h-5 w-5 mr-2" />
                {isSubmitting ? "Creating account…" : dyn.v3.getVariant("create_account", undefined, "Create account")}
              </Button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="text-center">
            <p className="text-sm text-white/60">
              Already have an account?{" "}
              <SeedLink href="/login" className={cn("font-semibold text-secondary hover:text-secondary/80 transition-colors", dyn.v3.getVariant("nav-link", CLASS_VARIANTS_MAP, ""))} id={dyn.v3.getVariant("sign-in-link", ID_VARIANTS_MAP, "sign-in-link")}>
                {dyn.v3.getVariant("sign_in", undefined, "Sign in")}
              </SeedLink>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
