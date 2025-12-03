"use client";

import { useRouter } from "next/navigation";
import { SeedLink } from "@/components/ui/SeedLink";
import { useState } from "react";
import GlobalHeader from "@/components/GlobalHeader";

export default function ContactPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const footer = (
    <footer className="bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto text-center text-gray-600">
        <p>© 2025 AutoDriver. All rights reserved.</p>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#e8f4fb] to-[#f5fbfc] text-slate-900 flex flex-col">
      <GlobalHeader />

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-[#2095d2] uppercase tracking-[0.08em]">Contact</p>
            <h1 className="text-4xl font-bold text-slate-900 leading-tight">Talk to the AutoDriver crew</h1>
            <p className="text-lg text-slate-600 max-w-3xl">
              Tell us what you need—billing, maps, trips, or feedback. We’ll reply in a few hours and keep your seed/layout intact.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
              {/* Car image */}
              <div className="mb-6">
                <img
                  src="/car3.png"
                  alt="AutoDriver car"
                  className="w-full h-56 object-cover rounded-lg shadow-md"
                />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700">Name</label>
                  <input
                    className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2095d2] bg-[#f7f9fb]"
                    placeholder="John Wick"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700">Email</label>
                  <input
                    className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2095d2] bg-[#f7f9fb]"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700">Topic</label>
                  <select className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2095d2] bg-[#f7f9fb]">
                    <option>Pickups & map</option>
                    <option>Payments & fares</option>
                    <option>Trips & history</option>
                    <option>Account & notifications</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700">Priority</label>
                  <select className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2095d2] bg-[#f7f9fb]">
                    <option>Normal</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-700">How can we help?</label>
                <textarea
                  rows={5}
                  className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2095d2] bg-[#f7f9fb] resize-none"
                  placeholder="Share details so we can resolve this faster..."
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  We respond within a few hours. Your seed and layout stay preserved.
                </div>
                <button
                  onClick={() => setStatus("sent")}
                  className="px-5 py-2 rounded-lg bg-[#2095d2] text-white font-semibold shadow hover:bg-[#177bab] transition"
                >
                  Send message
                </button>
              </div>
              {status === "sent" && (
                <div className="text-sm text-emerald-600 font-semibold">
                  Message sent. We’ll get back to you shortly.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                <div className="text-sm font-semibold text-[#2095d2] mb-2">Need an immediate answer?</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>• Check live status on the Help page.</li>
                  <li>• Review trip details in My trips.</li>
                  <li>• Refresh map or set pickup/destination to unlock rides.</li>
                </ul>
                <div className="flex flex-wrap gap-2 mt-3">
                  <SeedLink href="/help" className="px-3 py-1 rounded-full bg-[#e8f4fb] text-[#2095d2] text-xs font-semibold">
                    Go to Help
                  </SeedLink>
                  <SeedLink href="/ride/trip/trips" className="px-3 py-1 rounded-full bg-[#f6f6f6] text-slate-700 text-xs font-semibold">
                    View trips
                  </SeedLink>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-2">
                <div className="text-sm font-semibold text-slate-800">Support hours</div>
                <div className="text-sm text-slate-600">24/7 for trip issues • 9–6 PST for billing.</div>
                <div className="text-sm text-slate-800 mt-2">Contact options</div>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>Email: support@autodriver.ai</li>
                  <li>Slack: #autodriver-support</li>
                  <li>Phone: +1 (415) 800-2025</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {footer}
    </div>
  );
}
