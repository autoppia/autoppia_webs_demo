"use client";

import { type FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { SeedLink } from "@/components/ui/SeedLink";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useSeedRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signup(username.trim(), password.trim(), confirmPassword.trim());
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      router.push("/profile");
    } catch (err) {
      setError((err as Error).message || "Unable to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 text-white">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Autobooks</p>
        <h1 className="mt-2 text-3xl font-semibold">Create an account</h1>
        <p className="text-white/70">
          Sign up to get started. You'll be assigned a book to manage once you create your account.
        </p>
      </div>
      <form className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6" onSubmit={handleSubmit}>
        <label className="block text-xs uppercase tracking-wide text-white/60">
          Username
          <Input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-1 bg-black/40 text-white"
            placeholder="Choose a username"
            autoComplete="username"
            required
          />
        </label>
        <label className="block text-xs uppercase tracking-wide text-white/60">
          Password
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 bg-black/40 text-white"
            placeholder="Create a password"
            autoComplete="new-password"
            required
            minLength={3}
          />
        </label>
        <label className="block text-xs uppercase tracking-wide text-white/60">
          Confirm Password
          <Input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1 bg-black/40 text-white"
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
            minLength={3}
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full bg-secondary text-black hover:bg-secondary/80" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Sign up"}
        </Button>
      </form>
      <p className="text-center text-sm text-white/60">
        Already have an account?{" "}
        <SeedLink href="/login" className="text-secondary hover:underline">
          Sign in
        </SeedLink>
      </p>
    </main>
  );
}

