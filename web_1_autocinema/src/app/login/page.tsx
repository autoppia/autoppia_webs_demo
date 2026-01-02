"use client";

import { type FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { SeedLink } from "@/components/ui/SeedLink";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { Film, LogIn, Lock, User } from "lucide-react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

export default function LoginPage() {
  const dyn = useDynamicSystem();
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
    <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen flex items-center justify-center">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      {/* Background gradient overlays */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
      
      <main className="relative mx-auto w-full max-w-md px-6 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/20 border border-secondary/30 mb-4">
              <Film className="h-8 w-8 text-secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Welcome Back
            </h1>
            <p className="text-lg text-white/70">
              Sign in to access your movie curator dashboard
            </p>
          </div>

          {/* Login Form */}
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
                    id={dyn.v3.getVariant("login-username-input", ID_VARIANTS_MAP, "login-username-input")}
                    className={cn("h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20", dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, ""))}
                    placeholder={dyn.v3.getVariant("login_username_placeholder", TEXT_VARIANTS_MAP, "Enter your username")}
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
                    id={dyn.v3.getVariant("login-password-input", ID_VARIANTS_MAP, "login-password-input")}
                    className={cn("h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20", dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, ""))}
                    placeholder={dyn.v3.getVariant("login_password_placeholder", TEXT_VARIANTS_MAP, "Enter your password")}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                id={dyn.v3.getVariant("login-sign-in-button", ID_VARIANTS_MAP, "login-sign-in-button")}
                className={cn("w-full h-12 bg-secondary text-black hover:bg-secondary/90 font-bold text-base shadow-lg shadow-secondary/20 transition-all hover:scale-105", dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, ""))}
                disabled={isSubmitting}
              >
                <LogIn className="h-5 w-5 mr-2" />
                {isSubmitting ? "Signing in…" : dyn.v3.getVariant("sign_in", undefined, "Sign in")}
              </Button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-3">
            <p className="text-sm text-white/60">
              Need an account?{" "}
              <SeedLink href="/register" className={cn("font-semibold text-secondary hover:text-secondary/80 transition-colors", dyn.v3.getVariant("nav-link", CLASS_VARIANTS_MAP, ""))} id={dyn.v3.getVariant("create-account-link", ID_VARIANTS_MAP, "create-account-link")}>
                {dyn.v3.getVariant("create_one", undefined, "Create one")}
              </SeedLink>
            </p>
            <p className="text-xs text-white/50 max-w-md mx-auto">
              Each user can only manage their assigned film. Once signed in, visit your profile to review or simulate edits.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
