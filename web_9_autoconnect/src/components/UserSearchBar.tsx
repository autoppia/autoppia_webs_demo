"use client";
import { useState } from "react";
import Image from "next/image";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { dynamicDataProvider } from "@/dynamic/v2-data";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

export default function UserSearchBar() {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const dyn = useDynamicSystem();
  const matches = q.length === 0 ? [] : dynamicDataProvider.searchUsers(q);
  const router = useSeedRouter();

  const localIdVariants: Record<string, string[]> = {
    "search-input": ["search-input", "user-search", "people-search"],
    "search-results": ["search-results", "user-results", "results-panel"],
  };

  const localClassVariants: Record<string, string[]> = {
    "search-input": [
      "w-full rounded-full border border-gray-300 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50",
      "w-full rounded-full border border-gray-200 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white",
      "w-full rounded-full border border-gray-300 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100",
    ],
    "search-result-item": [
      "flex items-center gap-3 w-full px-2 py-2 hover:bg-blue-50 rounded text-left",
      "flex items-center gap-3 w-full px-2 py-2 hover:bg-gray-50 rounded text-left",
      "flex items-center gap-3 w-full px-2 py-2 hover:bg-indigo-50 rounded text-left",
    ],
  };

  const localTextVariants: Record<string, string[]> = {
    "search_placeholder": [
      "Search users",
      "Find people",
      "Look up professionals",
    ],
    "search_result_name": ["Name", "Full name", "Profile name"],
    "search_result_title": ["Title", "Role", "Position"],
  };

  const withClass = (key: string, base: string) =>
    cn(base, dyn.v3.getVariant(key, CLASS_VARIANTS_MAP, ""), dyn.v3.getVariant(key, localClassVariants, ""));

  return (
    <div className="relative flex-1 max-w-lg">
      <input
        id={dyn.v3.getVariant("search-input", localIdVariants, "search-input")}
        type="text"
        aria-label={dyn.v3.getVariant("search_placeholder", localTextVariants, "Search users")}
        className={withClass(
          "search-input",
          "w-full rounded-full border border-gray-300 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        )}
        placeholder={dyn.v3.getVariant("search_placeholder", localTextVariants, "Search users")}
        value={q}
        onChange={(e) => {
          const val = e.target.value;
          setQ(val);

          if (val.trim().length >= 2) {
            logEvent(EVENT_TYPES.SEARCH_USERS, {
              query: val.trim(),
              resultCount: matches.length,
            });
          }
        }}
        onFocus={() => setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 100)}
      />
      <span className="absolute left-3 top-3 text-gray-400">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          />
        </svg>
      </span>
      {/* Results Dropdown */}
      {focus && matches.length > 0 && (
        <div
          id={dyn.v3.getVariant("search-results", localIdVariants, "search-results")}
          className="absolute left-0 top-12 w-full bg-white border z-30 rounded-lg shadow p-2"
        >
          {matches.map((u, idx) => (
            <div key={u.username}>
              {dyn.v1.addWrapDecoy(
                "user-search-result",
                <button
                  id={dyn.v3.getVariant(
                    `search_result_item_${idx}`,
                    localIdVariants,
                    `search_result_item_${idx}`
                  )}
                  className={withClass(
                    "search-result-item",
                    "flex items-center gap-3 w-full px-2 py-2 hover:bg-blue-50 rounded text-left"
                  )}
                  onMouseDown={() => {
                    router.push(`/profile/${u.username}`);
                    setQ("");
                  }}
                >
                  <Image
                    src={u.avatar}
                    alt={u.name}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                  <span className="flex flex-col">
                    <span className="font-medium">
                      {dyn.v3.getVariant("search_result_name", localTextVariants, u.name)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {dyn.v3.getVariant("search_result_title", localTextVariants, u.title)}
                    </span>
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
