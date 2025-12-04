"use client";

import { useRouter } from "next/navigation";
import { SeedLink } from "@/components/ui/SeedLink";
import GlobalHeader from "@/components/GlobalHeader";

export default function AboutPage() {
  const router = useRouter();

  const header = <GlobalHeader />;

  const footer = (
    <footer className="bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto text-center text-gray-600">
        <p>© 2025 AutoDriver. All rights reserved.</p>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5fbff] via-white to-[#eef7ff] text-gray-900">
      {header}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-[#2095d2]">About AutoDrive</h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Building the future of urban mobility with AI-powered routing, transparent pricing, and reliable drivers.
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-md bg-[#2095d2] text-white font-semibold shadow hover:bg-[#1273a0] transition"
          >
            Back home
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white shadow border border-gray-100">
            <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              We connect people and places through safe, efficient rides. AutoDrive blends live ETAs, clear fares, and trusted drivers
              to make every trip predictable—whether it’s a quick hop downtown or a cross-city commute.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white shadow border border-gray-100">
            <h2 className="text-xl font-semibold mb-2">Why AutoDrive</h2>
            <ul className="text-gray-600 space-y-2 list-disc list-inside">
              <li>Transparent fares with live ETA grid</li>
              <li>Curated drivers with ratings and languages</li>
              <li>Comfort options: Economy, Comfort, XL, Business</li>
              <li>Future-ready: 2025 roadmap with richer routing</li>
            </ul>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white shadow border border-gray-100">
          <h2 className="text-xl font-semibold mb-3">2025 Roadmap</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="p-4 rounded-xl bg-[#f8fbff] border border-gray-100">
              <div className="font-semibold text-[#2095d2]">Q1 · Smarter ETAs</div>
              <p className="mt-2 text-gray-600">AI-backed routing, live surge insights, and multi-hop predictions.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#fef8f4] border border-gray-100">
              <div className="font-semibold text-[#d1453b]">Q2 · Marketplace</div>
              <p className="mt-2 text-gray-600">Driver perks, preferred rides, and loyalty points for frequent riders.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#f5f9f3] border border-gray-100">
              <div className="font-semibold text-[#1b5fa7]">Q3 · Sustainability</div>
              <p className="mt-2 text-gray-600">EV-first options, green routes, and emissions insights per trip.</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white shadow border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-[#2095d2]/10 border border-[#2095d2]/30 flex items-center justify-center text-[#2095d2] font-bold text-2xl">
            AD
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-1">Meet the Team</h2>
            <p className="text-gray-600 leading-relaxed">
              Product managers, engineers, and designers working together to make every ride smooth. We’re obsessed with clarity:
              better maps, transparent fares, and reliable pickups. AutoDrive is built for 2025 and beyond.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="px-3 py-1 rounded-full bg-[#e7f2fb] text-[#1b5fa7] text-xs font-semibold">Maps & Routing</span>
              <span className="px-3 py-1 rounded-full bg-[#fdf1ec] text-[#c73d2d] text-xs font-semibold">Driver Quality</span>
              <span className="px-3 py-1 rounded-full bg-[#f3f7ed] text-[#2f6b2f] text-xs font-semibold">Rider Trust</span>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <SeedLink href="/" className="text-[#2095d2] font-semibold hover:underline">
            Back to Home
          </SeedLink>
        </div>
      </main>
      {footer}
    </div>
  );
}
