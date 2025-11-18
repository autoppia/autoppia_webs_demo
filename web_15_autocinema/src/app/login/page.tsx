"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSeedRouter } from "@/hooks/useSeedRouter";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useSeedRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username.trim(), password.trim());
      setUsername("");
      setPassword("");
      router.push("/profile");
    } catch (err) {
      setError((err as Error).message || "Unable to log in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 text-white">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Autocinema</p>
        <h1 className="mt-2 text-3xl font-semibold">Sign in to start</h1>
        <p className="text-white/70">
          Enter the credential provided in your task instructions. The UI will simply record the authentication events.
        </p>
      </div>
      <form className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6" onSubmit={handleSubmit}>
        <label className="block text-xs uppercase tracking-wide text-white/60">
          Username
          <Input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-1 bg-black/40 text-white"
            placeholder="username"
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
            placeholder="password"
            autoComplete="current-password"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full bg-secondary text-black hover:bg-secondary/80" disabled={isSubmitting}>
          {isSubmitting ? "Verifying…" : "Sign in"}
        </Button>
      </form>
      <p className="text-sm text-white/60">
        Each miner can only manage their assigned film. Once signed in, visit your profile to review or simulate edits.
      </p>
    </main>
  );
}
