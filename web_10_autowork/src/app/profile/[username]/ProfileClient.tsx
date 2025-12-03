"use client";

import { useEffect, useState, useMemo } from "react";
import { useAutoworkData } from "@/hooks/useAutoworkData";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useSeedLayout } from "@/dynamic/v3-dynamic";
import { useSeedRouter } from "@/hooks/useSeedRouter";

interface UserProfile {
  username: string;
  name: string;
  avatar: string;
  title?: string;
  location?: string;
  about?: string;
  email?: string;
}

export default function ProfileClient({ username }: { username: string }) {
  const router = useSeedRouter();
  const { getElementAttributes, getText } = useSeedLayout();
  const jobsState = useAutoworkData<any>("web_10_autowork_jobs", 6);
  const hiresState = useAutoworkData<any>("web_10_autowork_hires", 6);
  const expertsState = useAutoworkData<any>("web_10_autowork_experts", 6);
  
  const [userJobs, setUserJobs] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [aboutText, setAboutText] = useState("");
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  
  // Mock user profile data
  const user: UserProfile = {
    username: username || "alexsmith",
    name: "Alex Smith",
    avatar: "https://ext.same-assets.com/1836270417/1435009301.png",
    title: "Project Manager",
    location: "San Francisco, CA",
    about: "Experienced project manager specializing in tech and innovation. Love working with talented freelancers to bring creative ideas to life.",
    email: `${username || "alexsmith"}@autowork.com`,
  };

  // Load user data from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      // Load jobs
      const savedJobs = window.localStorage.getItem("autowork_user_jobs");
      if (savedJobs) {
        const jobs = JSON.parse(savedJobs);
        setUserJobs(jobs);
      }
      
      // Load favorites
      const savedFavorites = localStorage.getItem("autowork_expert_favorites");
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }
      
      // Load about
      const savedAbout = localStorage.getItem(`profile_about_${username}`);
      if (savedAbout) {
        setAboutText(savedAbout);
      } else if (user.about) {
        setAboutText(user.about);
      }
    } catch (err) {
      console.error("Failed to load profile data:", err);
    }
  }, [username]);

  // Log view profile event (commented out - event type not defined in autowork)
  // useEffect(() => {
  //   logEvent(EVENT_TYPES.VIEW_USER_PROFILE, {
  //     username: user.username,
  //     name: user.name,
  //     timestamp: new Date().toISOString(),
  //   });
  // }, []);

  // Get favorite experts
  const favoriteExperts = useMemo(() => {
    return expertsState.data.filter((expert: any) => favorites.has(expert.name));
  }, [expertsState.data, favorites]);

  // Combine user jobs with fetched jobs
  const allJobs = useMemo(() => {
    return [...userJobs, ...jobsState.data];
  }, [userJobs, jobsState.data]);

  // Get stats
  const stats = useMemo(() => {
    const totalJobs = allJobs.length;
    const completedJobs = allJobs.filter((j: any) => j.status === "Completed").length;
    const inProgressJobs = allJobs.filter((j: any) => j.status === "In progress").length;
    const totalHires = hiresState.data.length;
    const favoriteCount = favorites.size;
    
    return {
      totalJobs,
      completedJobs,
      inProgressJobs,
      totalHires,
      favoriteCount,
    };
  }, [allJobs, hiresState.data, favorites]);

  const handleSaveAbout = () => {
    localStorage.setItem(`profile_about_${username}`, aboutText);
    setIsEditingAbout(false);
  };

  const handleViewExpert = (expert: any) => {
    const slug = (expert as any).slug ?? expert.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\./g, "");
    router.push(`/expert/${slug}`);
  };

  const handleViewJob = (job: any) => {
    router.push("/jobs");
  };

  return (
    <main className="px-10 mt-12 pb-16 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
        <div className="flex items-start gap-6 mb-6">
          <div className="relative flex-shrink-0">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.name}
            </h1>
            {user.title && (
              <div className="text-lg font-medium text-gray-700 mb-2">
                {user.title}
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {user.location}
              </div>
            )}
            {user.email && (
              <div className="text-sm text-gray-600">
                {user.email}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="text-sm font-semibold text-gray-600 mb-1">Total Jobs</div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalJobs}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="text-sm font-semibold text-gray-600 mb-1">Completed</div>
          <div className="text-3xl font-bold text-green-600">{stats.completedJobs}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="text-sm font-semibold text-gray-600 mb-1">In Progress</div>
          <div className="text-3xl font-bold text-blue-600">{stats.inProgressJobs}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="text-sm font-semibold text-gray-600 mb-1">Total Hires</div>
          <div className="text-3xl font-bold text-purple-600">{stats.totalHires}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="text-sm font-semibold text-gray-600 mb-1">Favorites</div>
          <div className="text-3xl font-bold text-red-600">{stats.favoriteCount}</div>
        </div>
      </div>

      {/* About Section - Full Width */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">About</h2>
          {!isEditingAbout && (
            <button
              onClick={() => setIsEditingAbout(true)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Edit
            </button>
          )}
        </div>
        {isEditingAbout ? (
          <div className="space-y-3">
            <textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              onBlur={handleSaveAbout}
              className="w-full min-h-[120px] p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Tell us about yourself..."
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setIsEditingAbout(false);
                  setAboutText(localStorage.getItem(`profile_about_${username}`) || user.about || "");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAbout}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {aboutText || user.about || "No about information yet."}
          </p>
        )}
      </div>

      {/* Recent Jobs and Favorite Experts - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Jobs</h2>
            <button
              onClick={() => router.push("/jobs")}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View all
            </button>
          </div>
          <div className="space-y-4">
            {allJobs.slice(0, 5).map((job: any, i: number) => (
              <div
                key={i}
                onClick={() => handleViewJob(job)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    job.status === "Completed" 
                      ? "bg-green-100 text-green-700"
                      : job.status === "In progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {job.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Started: {job.start}
                </div>
                {job.activity && (
                  <div className="text-xs text-gray-500 mt-1">
                    {job.activity}
                  </div>
                )}
              </div>
            ))}
            {allJobs.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No jobs yet. <button onClick={() => router.push("/")} className="text-blue-600 hover:underline">Create your first job posting</button>
              </div>
            )}
          </div>
        </div>

        {/* Favorite Experts */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Favorite Experts</h2>
            {favoriteExperts.length > 5 && (
              <button
                onClick={() => router.push("/favorites")}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View all ({favoriteExperts.length})
              </button>
            )}
          </div>
          <div className="space-y-3">
            {favoriteExperts.slice(0, 5).map((expert: any) => {
              const isFavorite = favorites.has(expert.name);
              return (
                <div
                  key={expert.name}
                  className="relative flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  {/* Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newFavorites = new Set(favorites);
                      if (newFavorites.has(expert.name)) {
                        newFavorites.delete(expert.name);
                        logEvent(EVENT_TYPES.HIRE_BTN_CLICKED, {
                          action: "unfavorite_expert",
                          expertName: expert.name,
                        });
                      } else {
                        newFavorites.add(expert.name);
                        logEvent(EVENT_TYPES.HIRE_BTN_CLICKED, {
                          action: "favorite_expert",
                          expertName: expert.name,
                        });
                      }
                      setFavorites(newFavorites);
                      if (typeof window !== "undefined") {
                        try {
                          localStorage.setItem("autowork_expert_favorites", JSON.stringify(Array.from(newFavorites)));
                        } catch (err) {
                          console.error("Failed to save favorites:", err);
                        }
                      }
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-200 transition-colors z-10"
                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <svg
                      className={`w-5 h-5 transition-colors ${
                        isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"
                      }`}
                      fill={isFavorite ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                  
                  <div
                    onClick={() => handleViewExpert(expert)}
                    className="flex items-center gap-3 flex-1 pr-10 cursor-pointer"
                  >
                    <img
                      src={expert.avatar}
                      alt={expert.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">
                        {expert.name}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {expert.role}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {favoriteExperts.length === 0 && (
              <div className="text-center text-gray-500 py-8 text-sm">
                No favorites yet. <button onClick={() => router.push("/experts")} className="text-blue-600 hover:underline">Browse experts</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

