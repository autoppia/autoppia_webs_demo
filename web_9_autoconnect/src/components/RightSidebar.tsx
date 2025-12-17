"use client";
import { useState } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import UserSearchBar from "./UserSearchBar";

const companies = [
  {
    name: "Adobe",
    desc: "Company • Design tools",
    logo: "/media/companies/adobe-logo.svg",
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
  const [imageErrors, setImageErrors] = useState<{ [name: string]: boolean }>({});

  const handleFollow = (name: string) => {
    const isFollowed = followed[name];
    const newState = { ...followed, [name]: !isFollowed };
    setFollowed(newState);

    const eventType = !isFollowed ? EVENT_TYPES.FOLLOW_PAGE : EVENT_TYPES.UNFOLLOW_PAGE;
    logEvent(eventType, {
      company: name,
      source: "right_sidebar",
    });
  };

  return (
    <aside className="bg-white rounded-lg shadow p-5 sticky top-20 min-h-[calc(100vh-6rem)]">
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
              <div className="w-10 h-10 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0">
                {imageErrors[c.name] ? (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                    {c.name.charAt(0)}
                  </div>
                ) : (
                  <img
                    src={c.logo}
                    alt={c.name}
                    className="w-full h-full object-contain rounded-full"
                    onError={() => {
                      setImageErrors((prev) => ({ ...prev, [c.name]: true }));
                    }}
                  />
                )}
              </div>
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
      <div className="block text-xs text-gray-500 mt-2">
        View all recommendations &rarr;
      </div>

      {/* Curioso: Widget de actividades recientes */}
      <div className="mt-4 pt-4 border-t">
        <h3 className="font-bold text-sm mb-3 text-gray-700">⚡ Quick Insights</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-green-500">●</span>
            <span>23 people viewed your profile</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-blue-500">●</span>
            <span>8 new connections</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-purple-500">●</span>
            <span>5 job recommendations</span>
          </div>
        </div>
      </div>

      {/* Curioso: Tips o curiosidades */}
      <div className="mt-4 pt-4 border-t bg-amber-50 rounded-lg p-3">
        <div className="text-xs font-semibold text-amber-800 mb-2">💡 Pro Tip</div>
        <div className="text-xs text-gray-700 leading-relaxed">
          Posting at 8 AM on weekdays can increase engagement by up to 40%!
        </div>
      </div>

      {/* Additional content to make sidebar longer */}
      <div className="mt-4 pt-4 border-t">
        <h3 className="font-bold text-sm mb-3 text-gray-700">📊 Your Activity</h3>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center text-gray-600">
            <span>Posts this month</span>
            <span className="font-semibold text-blue-700">12</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span>Connections</span>
            <span className="font-semibold text-blue-700">1.2K</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span>Impressions</span>
            <span className="font-semibold text-blue-700">8.5K</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="font-bold text-sm mb-3 text-gray-700">🎓 Learning</h3>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs font-semibold text-blue-800 mb-1">Complete your profile</div>
          <div className="text-xs text-gray-600 mb-2">Add skills to get discovered</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">65% complete</div>
        </div>
      </div>
    </aside>
  );
}
