"use client";
import { useState, useEffect } from "react";
import Avatar from "@/components/Avatar";
import UserSearchBar from "./UserSearchBar";
import { useSeed } from "@/context/SeedContext";
import { dynamicDataProvider } from "@/dynamic/v2-data";
import type { User } from "@/library/dataset";
import Link from "next/link";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

export default function LeftSidebar() {
  useSeed();
  const dyn = useDynamicSystem();
  const localTextVariants: Record<string, string[]> = {
    saved_items: ["Saved items", "Bookmarks", "My saves"],
    hidden_posts: ["Hidden posts", "Hidden", "Muted posts"],
  };
  const localClassVariants: Record<string, string[]> = {
    sidebar_link: [
      "mt-3 inline-flex items-center gap-2 text-gray-700 text-sm cursor-pointer hover:text-blue-600",
      "mt-3 inline-flex items-center gap-2 text-gray-700 text-sm cursor-pointer hover:text-indigo-600",
      "mt-3 inline-flex items-center gap-2 text-gray-700 text-sm cursor-pointer hover:text-blue-500",
    ],
  };
  
  // Get current user inside component to avoid undefined error
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [recentConnections, setRecentConnections] = useState<User[]>([]);
  
  useEffect(() => {
    const users = dynamicDataProvider.getUsers();
    const user = users[2] || users[0];
    if (user) {
      setCurrentUser(user);
      // Get recent connections (other users, excluding current user)
      const connections = users
        .filter((u) => u.username !== user.username)
        .slice(0, 3);
      setRecentConnections(connections);
    }
  }, []);

  // Show loading state or placeholder if user not ready
  if (!currentUser) {
    return (
      <aside className="bg-white rounded-lg shadow p-5 mb-5 sticky top-20">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "bg-white rounded-lg shadow p-5 mb-5 sticky top-20 min-h-[calc(100vh-6rem)]",
        dyn.v3.getVariant("left_sidebar", CLASS_VARIANTS_MAP, "")
      )}
      id={dyn.v3.getVariant("left_sidebar", ID_VARIANTS_MAP, "left_sidebar")}
    >
      {/* Always show SearchBar at top */}
      {dyn.v1.addWrapDecoy(
        "sidebar-search",
        <div className="mb-4">
          <UserSearchBar />
        </div>
      )}
      
      {dyn.v1.addWrapDecoy(
        "sidebar-profile",
        <div className="flex flex-col items-center gap-2 mb-4">
          <Avatar src={currentUser.avatar} alt={currentUser.name} size={76} />
          <div className="font-bold text-lg mt-2">
            {dyn.v3.getVariant("sidebar_name", TEXT_VARIANTS_MAP, currentUser.name)}
          </div>
          <div className="text-gray-600 text-sm">
            {dyn.v3.getVariant("sidebar_title", TEXT_VARIANTS_MAP, currentUser.title)}
          </div>
        </div>
      )}

      {dyn.v1.addWrapDecoy(
        "sidebar-analytics",
        <div className="w-full text-sm text-gray-600 border-t pt-2 mb-2">
          <div className="flex justify-between items-center py-1">
            <span>{dyn.v3.getVariant("profile_viewers", TEXT_VARIANTS_MAP, "Profile viewers")}</span>
            <span className="text-blue-700 font-semibold cursor-pointer">500</span>
          </div>
          <div className="text-gray-500 text-xs mb-1">
            {dyn.v3.getVariant("view_analytics", TEXT_VARIANTS_MAP, "View all analytics")}
          </div>
        </div>
      )}

      {dyn.v1.addWrapDecoy(
        "sidebar-premium",
        <div className="bg-gray-50 px-2 py-2 text-xs text-gray-500 rounded mb-2 border">
          {dyn.v3.getVariant("premium_hint", TEXT_VARIANTS_MAP, "Achieve 4x more profile visits")}
          <br />
          <span className="text-black font-medium">
            {dyn.v3.getVariant("premium_cta", TEXT_VARIANTS_MAP, "Get hired faster. Try Premium free.")}
          </span>
        </div>
      )}

      <Link
        href="/saved"
        className={cn(
          "mt-3 inline-flex items-center gap-2 text-gray-700 text-sm cursor-pointer hover:text-blue-600",
          dyn.v3.getVariant("sidebar_link", localClassVariants, "")
        )}
        onClick={() =>
          logEvent(EVENT_TYPES.VIEW_SAVED_POSTS, { source: "left_sidebar" })
        }
      >
        <span className="text-yellow-500">&#9734;</span>
        <span>{dyn.v3.getVariant("saved_items", localTextVariants, "Saved items")}</span>
      </Link>
      <Link
        href="/hidden"
        className={cn(
          "mt-2 inline-flex items-center gap-2 text-gray-700 text-sm cursor-pointer hover:text-blue-600",
          dyn.v3.getVariant("sidebar_link", localClassVariants, "")
        )}
        onClick={() =>
          logEvent(EVENT_TYPES.VIEW_HIDDEN_POSTS, { source: "left_sidebar" })
        }
      >
        <span className="text-gray-500">👁‍🗨</span>
        <span>{dyn.v3.getVariant("hidden_posts", localTextVariants, "Hidden posts")}</span>
      </Link>

      {/* Curioso: Estadísticas divertidas */}
      {dyn.v1.addWrapDecoy(
        "sidebar-stats",
        <div className="mt-4 pt-4 border-t">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-3">
            <div className="text-xs font-semibold text-indigo-700 mb-1">🎯 Network Stats</div>
            <div className="text-2xl font-bold text-indigo-900">
              {dyn.v3.getVariant("network_stats_value", undefined, "2.4K+")}
            </div>
            <div className="text-xs text-gray-600">
              {dyn.v3.getVariant("network_stats_copy", TEXT_VARIANTS_MAP, "Connections this week")}
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
            <div className="text-xs font-semibold text-purple-700 mb-1">🚀 Trending</div>
            <div className="text-sm text-gray-700">#TechJobs</div>
            <div className="text-xs text-gray-500 mt-1">15.2K posts today</div>
          </div>
        </div>
      )}

      {/* Additional content to make sidebar longer */}
      {dyn.v1.addWrapDecoy(
        "sidebar-connections",
        <div className="mt-4 pt-4 border-t">
          <h3 className="font-bold text-sm mb-3 text-gray-700">👥 Recent Connections</h3>
          <div className="space-y-2 text-xs">
            {recentConnections.length > 0 ? (
              recentConnections.map((connection) => (
                <div key={connection.username} className="flex items-center gap-2 text-gray-600">
                  <Avatar 
                    src={connection.avatar} 
                    alt={connection.name} 
                    size={24}
                    href={`/profile/${connection.username}`}
                  />
                  <span className="truncate">
                    {dyn.v3.getVariant("recent_connection", undefined, connection.name)}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                  <span>Loading...</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <h3 className="font-bold text-sm mb-3 text-gray-700">📌 Featured Posts</h3>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="p-2 bg-gray-50 rounded">
            <div className="font-semibold text-gray-700">Tips for remote work</div>
            <div className="text-gray-500 mt-1">2.5K views</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="font-semibold text-gray-700">Career growth strategies</div>
            <div className="text-gray-500 mt-1">1.8K views</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
