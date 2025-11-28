"use client";
import { useState } from "react";
import Image from "next/image";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { dynamicDataProvider } from "@/dynamic/v2-data";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

export default function UserSearchBar() {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const { getText, getClass, getId } = useV3Attributes();
  const withVariant = (type: string, base: string) => {
    const variant = getClass(type, "");
    return variant ? `${variant} ${base}` : base;
  };
  const matches =
    q.length === 0
      ? []
      : dynamicDataProvider.searchUsers(q);
  const router = useSeedRouter();
  return (
    <div className="relative flex-1 max-w-lg">
      <input
        id={getId("search_field")}
        type="text"
        aria-label={getText("search_aria_label", "Search users")}
        className={withVariant(
          "input-text",
          "w-full rounded-full border border-gray-300 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        )}
        placeholder={getText("search_placeholder", "Search users")}
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
          id={getId("search_results_panel")}
          className="absolute left-0 top-12 w-full bg-white border z-30 rounded-lg shadow p-2"
        >
          {matches.map((u, idx) => (
            <button
              key={u.username}
              id={getId("search_result_item", idx)}
              className={withVariant(
                "card",
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
                <span className="font-medium">{u.name}</span>
                <span className="text-xs text-gray-500">{u.title}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
