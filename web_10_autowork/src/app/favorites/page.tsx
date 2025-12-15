"use client";

import { useEffect, useState, useMemo } from "react";
import { useAutoworkData } from "@/hooks/useAutoworkData";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useSeedLayout } from "@/dynamic/v3-dynamic";

export default function FavoritesPage() {
  const router = useSeedRouter();
  const expertsState = useAutoworkData<any>("web_10_autowork_experts", 6);
  const { getElementAttributes, getText } = useSeedLayout();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Load favorites from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("autowork_expert_favorites");
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    } catch (err) {
      console.error("Failed to load favorites:", err);
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: Set<string>) => {
    setFavorites(newFavorites);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("autowork_expert_favorites", JSON.stringify(Array.from(newFavorites)));
      } catch (err) {
        console.error("Failed to save favorites:", err);
      }
    }
  };

  const toggleFavorite = (expertName: string, e: React.MouseEvent, expert?: any) => {
    e.preventDefault();
    e.stopPropagation();
    const slug =
      expert?.slug ??
      expertName.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "");
    const newFavorites = new Set(favorites);
    if (newFavorites.has(expertName)) {
      newFavorites.delete(expertName);
      logEvent(EVENT_TYPES.FAVORITE_EXPERT_REMOVED, {
        expertName,
        source: "favorites_page",
        role: expert?.role,
        country: expert?.country,
        expertSlug: slug,
      });
    } else {
      newFavorites.add(expertName);
      logEvent(EVENT_TYPES.FAVORITE_EXPERT_SELECTED, {
        expertName,
        source: "favorites_page",
        role: expert?.role,
        country: expert?.country,
        expertSlug: slug,
      });
    }
    saveFavorites(newFavorites);
  };

  const handleViewExpert = (expert: any) => {
    const slug = (expert as any).slug ?? expert.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\./g, "");
    router.push(`/expert/${slug}`);
  };

  // Filter experts to show only favorites
  const favoriteExperts = useMemo(() => {
    return expertsState.data.filter((expert: any) => favorites.has(expert.name));
  }, [expertsState.data, favorites]);

  if (favoriteExperts.length === 0) {
    return (
      <main className="px-10 mt-12 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">Experts you've saved to your favorites</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
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
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No favorites yet</h2>
          <p className="text-gray-500 text-center max-w-md">
            Start exploring experts and click the heart icon to save them to your favorites.
          </p>
          <button
            onClick={() => {
              logEvent(EVENT_TYPES.BROWSE_FAVORITE_EXPERT, {
                source: "favorites_empty_state",
              });
              router.push("/experts");
            }}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Browse Experts
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="px-10 mt-12 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
        <p className="text-gray-600">
          {favoriteExperts.length} {favoriteExperts.length === 1 ? 'expert' : 'experts'} saved
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {favoriteExperts.map((expert: any, i: number) => {
          const isFavorite = favorites.has(expert.name);
          return (
            <div
              key={expert.name}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100 group relative"
            >
              {/* Favorite Button */}
              <button
                type="button"
                onClick={(e) => toggleFavorite(expert.name, e, expert)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
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

              <div className="flex items-start gap-4 mb-4 pr-8">
                <div className="relative flex-shrink-0">
                  <img
                    src={expert.avatar}
                    alt={expert.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-md group-hover:border-purple-400 transition-colors"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg text-gray-900 mb-1">
                    {expert.name}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {expert.country}
                  </div>
                  <div className="text-sm font-semibold text-gray-800 mb-1">
                    {expert.role}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-blue-600">
                  {expert.rate}
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <svg
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.234c.969 0 1.371 1.24.588 1.81l-3.424 2.49a1 1 0 00-.364 1.118l1.286 3.965c.3.921-.755 1.688-1.539 1.118l-3.424-2.49a1 1 0 00-1.176 0l-3.424 2.49c-.783.57-1.838-.197-1.539-1.118l1.286-3.965a1 1 0 00-.364-1.118L2.22 9.392c-.783-.57-.38-1.81.588-1.81h4.234a1 1 0 00.95-.69l1.286-3.965z" />
                  </svg>
                  <span className="font-semibold text-gray-700">{expert.rating}</span>
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">{expert.jobs} reviews</span>
              </div>

              <div className="text-sm text-gray-700 mb-4 leading-relaxed line-clamp-3">
                {expert.desc}
              </div>

              <div className="flex items-center gap-2 text-blue-600 font-semibold mb-4 pb-4 border-b border-gray-100">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-blue-600">
                  <path
                    stroke="currentColor"
                    strokeWidth="1.5"
                    d="M7.75 8.5h8.5M7.75 11.75h5.5M17.25 6.25V5A2.25 2.25 0 0 0 15 2.75H5A2.25 2.25 0 0 0 2.75 5v8A2.25 2.25 0 0 0 5 15.25h1.25m1 4.5h10A2.25 2.25 0 0 0 19.5 17.5v-6.25m-6.75 7.75-2.25-2.25m0 0 .446-.447c.267-.268.661-.306.93-.05l.424.406c.27.257.662.241.919-.03a.656.656 0 0 0-.018-.908l-.36-.356c-.26-.257-.239-.668.033-.917l.349-.327a.873.873 0 0 1 1.17.003l1.222 1.125c.32.294.843.217 1.064-.167l.022-.037M19.5 13V5A2.25 2.25 0 0 0 17.25 2.75H7a2.25 2.25 0 0 0-2.25 2.25v8c0 .414.336.75.75.75h12.5a.75.75 0 0 0 .75-.75Z"
                  />
                </svg>
                <span className="text-base">{expert.consultation}</span>
              </div>

              <button
                onClick={() => handleViewExpert(expert)}
                className="w-full mt-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Consult an expert
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
