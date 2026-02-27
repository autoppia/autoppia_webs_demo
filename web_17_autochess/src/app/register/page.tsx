"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { Crown } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useSeedRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      register(username, password);
      router.push("/tactics");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <div className="py-12 flex justify-center">
      <DynamicWrapper>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-xl bg-amber-600/20 border border-amber-600/30">
                <Crown className="h-8 w-8 text-amber-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">
              <DynamicText value="Create an Account" type="text" />
            </h1>
            <p className="text-sm text-zinc-400 mt-2">
              <DynamicText value="Join AutoChess and start training tactics" type="text" />
            </p>
          </div>

          <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Choose a password"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
              >
                <DynamicText value="Register" type="text" />
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-zinc-500">
                Already have an account?{" "}
                <a
                  href="/login"
                  onClick={(e) => { e.preventDefault(); router.push("/login"); }}
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Login
                </a>
              </span>
            </div>
          </div>
        </div>
      </DynamicWrapper>
    </div>
  );
}
