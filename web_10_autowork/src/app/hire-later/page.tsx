"use client";

import { useEffect, useState } from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { EVENT_TYPES, logEvent } from "@/library/events";

type HireLaterExpert = {
  slug: string;
  name: string;
  role?: string;
  country?: string;
  avatar?: string;
  rate?: string;
};

export default function HireLaterPage() {
  const router = useSeedRouter();
  const [experts, setExperts] = useState<HireLaterExpert[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("autowork_hire_later_experts");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setExperts(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load hire-later experts:", err);
    }
  }, []);

  const persist = (list: HireLaterExpert[]) => {
    setExperts(list);
    if (typeof window !== "undefined") {
      localStorage.setItem("autowork_hire_later_experts", JSON.stringify(list));
    }
  };

  const handleRemove = (expert: HireLaterExpert) => {
    const filtered = experts.filter((e) => e.slug !== expert.slug);
    persist(filtered);
    logEvent(EVENT_TYPES.HIRE_LATER_REMOVED, {
      expertSlug: expert.slug,
      expertName: expert.name,
      source: "hire_later_page",
    });
  };

  const handleStartHire = (expert: HireLaterExpert) => {
    logEvent(EVENT_TYPES.HIRE_LATER_START, {
      expertSlug: expert.slug,
      expertName: expert.name,
    });
    router.push(`/expert/${expert.slug}/hire`);
  };

  const handleBrowse = () => {
    router.push("/experts");
  };

  return (
    <main className="px-10 mt-12 pb-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hire later</h1>
          <p className="text-gray-600">Experts you saved to revisit</p>
        </div>
        {experts.length > 0 && (
          <button
            onClick={handleBrowse}
            className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Browse more experts
          </button>
        )}
      </div>

      {experts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 flex flex-col items-center justify-center min-h-[360px]">
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 11c0 3.866-1.79 7-4 7s-4-3.134-4-7 1.79-7 4-7 4 3.134 4 7zM16 7h.01M21 7h.01M19 11c0 3.866-1.79 7-4 7s-4-3.134-4-7 1.79-7 4-7 4 3.134 4 7z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Nothing saved yet
          </h2>
          <p className="text-gray-500 text-center max-w-md mb-6">
            Use the "Hire later" button on an expert to add them here and follow up when you are ready.
          </p>
          <button
            onClick={handleBrowse}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
          >
            Find experts
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {experts.map((expert) => (
            <div
              key={expert.slug}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={expert.avatar}
                  alt={expert.name}
                  className="w-14 h-14 rounded-full object-cover border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{expert.name}</div>
                  <div className="text-sm text-gray-600 truncate">{expert.role}</div>
                  <div className="text-xs text-gray-500">{expert.country}</div>
                </div>
              </div>
              {expert.rate && (
                <div className="text-sm font-semibold text-blue-700">{expert.rate}</div>
              )}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleStartHire(expert)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg"
                >
                  Start hiring
                </button>
                <button
                  onClick={() => handleRemove(expert)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
