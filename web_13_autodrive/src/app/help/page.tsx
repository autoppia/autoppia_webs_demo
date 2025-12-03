"use client";

import { SeedLink } from "@/components/ui/SeedLink";
import GlobalHeader from "@/components/GlobalHeader";

const categories = [
  {
    title: "Booking & ETA",
    desc: "Pickups, destinations, live map issues, ETA delays.",
    badge: "Live map",
  },
  {
    title: "Payments & fares",
    desc: "Price estimates, promo codes, refunds, receipts.",
    badge: "Billing",
  },
  {
    title: "Safety & support",
    desc: "Trip safety, contact support, report an incident.",
    badge: "Safety",
  },
  {
    title: "Trips & history",
    desc: "Past trips, exports, itinerary details, receipts.",
    badge: "Trips",
  },
  {
    title: "Account & devices",
    desc: "Login, notifications, language, accessibility.",
    badge: "Account",
  },
  {
    title: "Vehicles & charging",
    desc: "Car options, EV charging stops, comfort settings.",
    badge: "Vehicles",
  },
];

const quickHelp = [
  {
    title: "Map or rides not loading",
    items: [
      "Check that pickup and destination are set; rides unlock after both fields are filled.",
      "Refresh the route map. We ship a static map fallback (map-static.png) if live tiles fail.",
      "Still blank? Clear cache/local storage and retry.",
    ],
  },
  {
    title: "Need a receipt or invoice",
    items: [
      "Open My trips → select the trip → tap “Details”.",
      "Export as PDF or send to your email on file.",
    ],
  },
  {
    title: "Edit or cancel a trip",
    items: [
      "Go to Upcoming → Trip details → Edit pickup/dropoff.",
      "Cancels are free within the grace window shown on the card.",
    ],
  },
];

export default function HelpPage() {
  const footer = (
    <footer className="bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto text-center text-gray-600">
        <p>© 2025 AutoDriver. All rights reserved.</p>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-[#f5fbfc] text-slate-900 flex flex-col">
      <GlobalHeader />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-white via-[#e8f4fb] to-[#f5fbfc] border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-[#2095d2] uppercase tracking-[0.08em]">Help</p>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
                We’re here to keep every ride on track
              </h1>
              <p className="text-lg text-slate-600 max-w-3xl">
                Browse guided fixes, see the status of your trips, or reach out to our crew.
                Your seed data and layout stay intact while you navigate.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5">
                <div className="text-sm font-semibold text-slate-600 mb-2">Search help</div>
                <div className="flex items-center gap-3 bg-[#f6f9fb] border border-slate-200 rounded-lg px-3 py-3">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20" className="text-slate-500">
                    <path
                      d="M15.54 14.13l-3.65-3.65a5.24 5.24 0 0 0 1.03-3.13 5.25 5.25 0 1 0-5.25 5.25c1.15 0 2.22-.39 3.13-1.03l3.65 3.65a.75.75 0 1 0 1.06-1.06zm-9.29-3.63a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0z"
                      fill="currentColor"
                    />
                  </svg>
                  <input
                    className="flex-1 bg-transparent outline-none text-base placeholder:text-slate-400"
                    placeholder="Type a question (e.g. “why is the map blank?”)"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-3 text-sm">
                  <span className="px-3 py-1 bg-[#e8f4fb] text-[#2095d2] rounded-full">Map & ETA</span>
                  <span className="px-3 py-1 bg-[#e8f4fb] text-[#2095d2] rounded-full">Payments</span>
                  <span className="px-3 py-1 bg-[#e8f4fb] text-[#2095d2] rounded-full">Account</span>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-600 mb-1">Live status</div>
                  <div className="text-base text-slate-700">All systems operational</div>
                  <div className="text-xs text-emerald-600 mt-1">Seeds, maps, and rides are responding normally.</div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Online
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-10">
              {categories.map((cat) => (
                <div
                  key={cat.title}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col gap-3 hover:border-[#2095d2] hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-[#2095d2] px-2 py-1 bg-[#e8f4fb] rounded-full">
                      {cat.badge}
                    </div>
                    <svg width="18" height="18" fill="none" viewBox="0 0 18 18" className="text-slate-400">
                      <path d="M6 7l3 3 3-3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{cat.title}</div>
                    <p className="text-sm text-slate-600 mt-1">{cat.desc}</p>
                  </div>
                  <button className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[#2095d2] hover:underline">
                    View guides
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {quickHelp.map((card) => (
              <div key={card.title} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col gap-3">
                <div className="text-sm font-semibold text-[#2095d2]">{card.title}</div>
                <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
                  {card.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-slate-900">Still need help?</div>
              <p className="text-sm text-slate-600">
                Drop us a note and we’ll keep your seed intact while we troubleshoot.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <SeedLink
                href="/contact"
                className="px-4 py-2 rounded-lg bg-[#2095d2] text-white font-semibold shadow hover:bg-[#177bab] transition"
              >
                Contact support
              </SeedLink>
              <SeedLink
                href="/ride/trip/trips"
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:border-[#2095d2] transition"
              >
                View trip history
              </SeedLink>
            </div>
          </div>
        </section>
      </main>

      {footer}
    </div>
  );
}
