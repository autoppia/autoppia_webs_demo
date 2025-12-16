"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeedLink } from "@/components/ui/SeedLink";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { getBooks } from "@/dynamic/v2-data";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { BookOpen, UserPlus, Lock, User, Book as BookIcon } from "lucide-react";

const MIN_PASSWORD_LENGTH = 6;
const FALLBACK_BOOK_ID = "book-v2-001";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useSeedRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [assignedBook, setAssignedBook] = useState(FALLBACK_BOOK_ID);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const books = getBooks();
  const bookOptions = useMemo(() => {
    if (!books || books.length === 0) return [];
    return [...books]
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, 25);
  }, [books]);

  const preferredDefaultBook = bookOptions[0]?.id ?? FALLBACK_BOOK_ID;

  useEffect(() => {
    if (!assignedBook && preferredDefaultBook) {
      setAssignedBook(preferredDefaultBook);
    }
  }, [assignedBook, preferredDefaultBook]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();
    const normalizedConfirmPassword = confirmPassword.trim();
    const failurePayload = {
      username: normalizedUsername || username,
    };

    if (!normalizedUsername) {
      logEvent(EVENT_TYPES.REGISTER_FAILURE, { ...failurePayload, reason: "missing_username" });
      setError("Username is required");
      return;
    }
    if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
      logEvent(EVENT_TYPES.REGISTER_FAILURE, { ...failurePayload, reason: "password_too_short" });
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (normalizedPassword !== normalizedConfirmPassword) {
      logEvent(EVENT_TYPES.REGISTER_FAILURE, { ...failurePayload, reason: "password_mismatch" });
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(normalizedUsername, normalizedPassword, normalizedConfirmPassword);
      logEvent(EVENT_TYPES.REGISTRATION_BOOK, {
        username: normalizedUsername,
      });
      router.push("/profile");
    } catch (err) {
      const reason = (err as Error).message || "unknown_error";
      logEvent(EVENT_TYPES.REGISTER_FAILURE, { ...failurePayload, reason });
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
              <BookOpen className="h-8 w-8 text-secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Create Account
            </h1>
            <p className="text-lg text-white/70">
              Join Autobooks and start curating your favorite books
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
                    className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="Choose a username"
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
                    className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="Create a password"
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
                    className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                  />
                </div>

                {bookOptions.length > 0 && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                      <BookIcon className="h-4 w-4 text-secondary" />
                      Assign Book
                    </label>
                    <select
                      value={assignedBook}
                      onChange={(event) => setAssignedBook(event.target.value)}
                      className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:bg-white/15 cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '12px',
                      }}
                    >
                      {bookOptions.map((book) => (
                        <option key={book.id} value={book.id} className="bg-neutral-900 text-white">
                          {book.title}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-white/50">Select a book to manage</p>
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
                className="w-full h-12 bg-secondary text-black hover:bg-secondary/90 font-bold text-base shadow-lg shadow-secondary/20 transition-all hover:scale-105" 
                disabled={isSubmitting}
              >
                <UserPlus className="h-5 w-5 mr-2" />
                {isSubmitting ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="text-center">
            <p className="text-sm text-white/60">
              Already have an account?{" "}
              <SeedLink href="/login" className="font-semibold text-secondary hover:text-secondary/80 transition-colors">
                Sign in
              </SeedLink>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
