"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeedLink } from "@/components/ui/SeedLink";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
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
      await register(username, password, confirmPassword);
      router.push("/");
    } catch (err) {
      setError((err as Error).message || "Unable to register.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="omnizon-container py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Register</h1>
        <p className="mt-1 text-sm text-slate-600">Create an account to verify review ownership.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="register-username" className="mb-1 block text-sm font-medium text-slate-700">
              Username
            </label>
            <Input
              id="register-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label htmlFor="register-password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <Input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label
              htmlFor="register-confirm-password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Confirm password
            </label>
            <Input
              id="register-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full rounded-full">
            {isSubmitting ? "Creating account..." : "Register"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <SeedLink href="/login" className="font-semibold text-slate-900 underline underline-offset-2">
            Login
          </SeedLink>
        </p>
      </div>
    </main>
  );
}
