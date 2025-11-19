"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useSeedRouter } from "@/hooks/useSeedRouter";

export default function RegisterPage() {
  const router = useSeedRouter();
  const { registerAndLogin } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      logEvent(EVENT_TYPES.REGISTER_SUBMIT, { username });
      await registerAndLogin(username.trim(), password.trim());
      setSuccessMessage("Registration recorded. Redirecting…");
      router.push("/profile");
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage((error as Error).message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 text-white">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Autocinema</p>
        <h1 className="mt-2 text-3xl font-semibold">Register to curate</h1>
        <p className="text-white/70">Use the credentials from your assignment. We log the event and sign you in.</p>
      </div>

      <form
        className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-xs uppercase tracking-wide text-white/60">
            Username
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 bg-black/40 text-white"
              placeholder="user17"
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
              placeholder="PASSWORD"
              autoComplete="new-password"
            />
          </label>
        </div>

        {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
        {successMessage && <p className="text-sm text-secondary">{successMessage}</p>}

        <Button
          type="submit"
          className="w-full bg-secondary text-black hover:bg-secondary/80"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registering…" : "Register"}
        </Button>
      </form>

      <p className="text-sm text-white/60">Already verified? Head straight to the login page.</p>
    </main>
  );
}

