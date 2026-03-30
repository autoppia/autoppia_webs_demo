"use client";

import type React from "react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useDynamicSystem } from "@/dynamic/shared";
import { cn } from "@/library/utils";
import { User, Lock, Mail, LogIn, UserPlus, LogOut } from "lucide-react";

export function AuthModal() {
  const { currentUser, login, register, logout, isAuthenticated } = useAuth();
  useDynamicSystem();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await register({ username, email, password });
      }
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated && currentUser) {
    return (
      <div className="p-4 w-64 bg-zinc-950 rounded-lg shadow-xl border">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-amber-600" />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="font-bold text-white">{currentUser.username}</p>
          </div>
          <Button
            onClick={logout}
            className="w-full bg-amber-500 text-black hover:bg-amber-400 border-none shadow-none"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border-2 border-zinc-900 rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:border-amber-500/60 group/container">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isLogin ? "Sign in to manage your bookings" : "Join us for a better experience"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 bg-white text-black placeholder:text-zinc-500 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
              placeholder="Enter username"
              required
            />
          </div>
        </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-zinc-300 bg-white text-black placeholder:text-zinc-500 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 bg-white text-black placeholder:text-zinc-500 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
              placeholder="Enter password"
              required
            />
          </div>
        </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-zinc-300 bg-white text-black placeholder:text-zinc-500 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-700/40 italic">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold h-11"
        >
          {isSubmitting ? "Processing..." : (isLogin ? "Sign In" : "Register")}
          {isLogin ? <LogIn className="ml-2 w-4 h-4" /> : <UserPlus className="ml-2 w-4 h-4" />}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </p>
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          className="text-amber-500 font-bold hover:underline mt-1"
        >
          {isLogin ? "Create one now" : "Go to Login"}
        </button>
      </div>
    </div>
  );
}
