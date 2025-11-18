"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EVENT_TYPES, logEvent } from "@/library/events";

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    logEvent(EVENT_TYPES.CONTACT_MESSAGE, { name, email, message });
    setStatus("sent");
    setMessage("");
  };

  return (
    <section
      id="contact"
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#05070d] via-[#0d101c] to-[#020306] p-6 text-white shadow-2xl"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Contact</p>
          <h2 className="mt-3 text-3xl font-semibold">Need a new cinematic brief?</h2>
          <p className="mt-2 text-sm text-white/70">
            Share your validation request (user journey, seed, constraints) and we'll route it to the appropriate web
            agent. Every submission is logged as an event for easy auditing.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>• Custom hero/layout mixes</li>
            <li>• Seed curation for movie drops</li>
            <li>• Issues spotted by miners</li>
          </ul>
          {status === "sent" && (
            <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
              Message logged. Thanks for keeping the reel alive.
            </p>
          )}
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-xs uppercase tracking-wide text-white/50">
            Name
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 bg-black/40 text-white"
              placeholder="Your name"
            />
          </label>
          <label className="block text-xs uppercase tracking-wide text-white/50">
            Email
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 bg-black/40 text-white"
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-xs uppercase tracking-wide text-white/50">
            Message
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-1 h-28 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="What scene do you need?"
            />
          </label>
          <Button type="submit" className="w-full bg-secondary text-black hover:bg-secondary/80">
            Send request
          </Button>
        </form>
      </div>
    </section>
  );
}
