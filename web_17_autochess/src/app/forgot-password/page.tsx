"use client";

import React, { useState } from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { Crown } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useSeedRouter();
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    logEvent(EVENT_TYPES.FORGOT_PASSWORD, { username: username.trim() });
    setSubmitted(true);
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
              <DynamicText value="Reset Password" type="text" />
            </h1>
            <p className="text-sm text-zinc-400 mt-2">
              <DynamicText value="Enter your username to reset your password" type="text" />
            </p>
          </div>

          <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-6">
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3">
                  If this account exists, a reset link has been sent.
                </div>
                <a
                  href="/login"
                  onClick={(e) => { e.preventDefault(); router.push("/login"); }}
                  className="inline-block text-amber-400 hover:text-amber-300 text-sm transition-colors"
                >
                  Back to Login
                </a>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="Enter your username"
                      autoComplete="username"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <DynamicText value="Reset Password" type="text" />
                  </button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <a
                    href="/login"
                    onClick={(e) => { e.preventDefault(); router.push("/login"); }}
                    className="text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Back to Login
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </DynamicWrapper>
    </div>
  );
}
