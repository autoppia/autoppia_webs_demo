"use client";
import { useEffect, useState } from "react";
import { logEvent, EVENT_TYPES } from "@/library/events";

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
  {
    name: "Figma",
    desc: "Company • Design systems",
    logo: "https://logo.clearbit.com/figma.com",
  },
  {
    name: "Notion",
    desc: "Company • Productivity",
    logo: "https://logo.clearbit.com/notion.so",
  },
  {
    name: "Stripe",
    desc: "Company • Fintech",
    logo: "https://logo.clearbit.com/stripe.com",
  },
];

export default function RecommendationsPage() {
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    logEvent(EVENT_TYPES.VIEW_ALL_RECOMMENDATIONS, {
      source: "recommendations_page",
    });
  }, []);

  const toggleFollow = (name: string) => {
    const nowFollowing = !following[name];
    setFollowing((prev) => ({ ...prev, [name]: nowFollowing }));

    logEvent(EVENT_TYPES.FOLLOW_PAGE, {
      company: name,
      action: nowFollowing ? "followed" : "unfollowed",
    });
  };

  return (
    <section className="max-w-3xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Recommendations for you</h1>
      {/* Always show recommendations and follow content */}
      <ul className="flex flex-col gap-4">
        {companies.map((c) => (
          <li
            key={c.name}
            className="bg-white shadow rounded-lg p-4 flex items-center gap-4"
          >
            <img
              src={c.logo}
              alt={c.name}
              className="w-12 h-12 rounded-full border bg-gray-100"
            />
            <div className="flex-1">
              <div className="font-semibold text-lg">{c.name}</div>
              <div className="text-sm text-gray-500">{c.desc}</div>
            </div>
            <button
              onClick={() => toggleFollow(c.name)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition ${
                following[c.name]
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 hover:bg-blue-100 text-blue-700"
              }`}
            >
              {following[c.name] ? "Following" : "+ Follow"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
