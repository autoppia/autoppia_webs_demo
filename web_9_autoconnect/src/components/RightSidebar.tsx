"use client";
import { useState } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import UserSearchBar from "./UserSearchBar";
import { SeedLink } from "@/components/ui/SeedLink";

const companies = [
  {
    name: "Adobe",
    desc: "Company • Design tools",
    logo: "https://logo.clearbit.com/adobe.com",
  },
  {
    name: "Y Combinator",
    desc: "Company • Start up accelerator",
    logo: "https://logo.clearbit.com/ycombinator.com",
  },
  {
    name: "TED",
    desc: "TEDTalks • TEDConferences",
    logo: "https://logo.clearbit.com/ted.com",
  },
];

export default function RightSidebar() {
  const [followed, setFollowed] = useState<{ [name: string]: boolean }>({});

  const handleFollow = (name: string) => {
    const isFollowed = followed[name];
    const newState = { ...followed, [name]: !isFollowed };
    setFollowed(newState);

    logEvent(EVENT_TYPES.FOLLOW_PAGE, {
      company: name,
      action: !isFollowed ? "followed" : "unfollowed",
      source: "right_sidebar",
    });
  };

  const handleViewAll = () => {
    logEvent(EVENT_TYPES.VIEW_ALL_RECOMMENDATIONS, {
      source: "right_sidebar",
    });
  };

  return (
    <aside className="bg-white rounded-lg shadow p-5 sticky top-20">
      {/* Always show SearchBar at top, and also in header for all layouts */}
      <div className={`mb-4`}>
        <UserSearchBar />
      </div>
      <h2 className="font-bold text-base mb-4">Add to your feed</h2>
      <ul className="flex flex-col gap-3 mb-3">
        {companies.map((c) => {
          const isFollowed = followed[c.name];
          return (
            <li key={c.name} className="flex items-center gap-3">
              <img
                src={c.logo}
                alt={c.name}
                className="w-10 h-10 rounded-full bg-gray-100 border"
              />
              <div className="flex-1">
                <div className="font-semibold text-sm leading-tight">
                  {c.name}
                </div>
                <div className="text-xs text-gray-500 -mt-0.5">{c.desc}</div>
              </div>
              <button
                onClick={() => handleFollow(c.name)}
                className={`px-4 py-1 text-xs font-semibold rounded-full transition ${
                  isFollowed
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-200 hover:bg-blue-100 text-blue-700"
                }`}
              >
                {isFollowed ? "✓ Following" : "+ Follow"}
              </button>
            </li>
          );
        })}
      </ul>
      <SeedLink
        href="/recommendations"
        onClick={handleViewAll}
        className="block text-sm text-blue-700 font-medium mt-2 hover:underline"
      >
        View all recommendations &rarr;
      </SeedLink>
    </aside>
  );
}
