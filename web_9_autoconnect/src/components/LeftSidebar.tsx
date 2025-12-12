"use client";
import { useState, useEffect } from "react";
import Avatar from "@/components/Avatar";
import UserSearchBar from "./UserSearchBar";
import { useSeed } from "@/context/SeedContext";
import {
  getEffectiveLayoutConfig,
  getLayoutClasses,
} from "@/dynamic/v1-layouts";
import { dynamicDataProvider } from "@/dynamic/v2-data";
import type { User } from "@/library/dataset";
import Link from "next/link";
import { EVENT_TYPES, logEvent } from "@/library/events";

export default function LeftSidebar() {
  const { seed, resolvedSeeds } = useSeed();
  const layoutSeed = resolvedSeeds.v1 ?? resolvedSeeds.base ?? seed;
  const layout = getEffectiveLayoutConfig(layoutSeed);
  const searchClasses = getLayoutClasses(layout, "searchPosition");
  
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
    <aside className="bg-white rounded-lg shadow p-5 mb-5 sticky top-20 min-h-[calc(100vh-6rem)]">
      {/* Always show SearchBar at top */}
      <div className={`${searchClasses} mb-4`}>
        <UserSearchBar />
      </div>
      
      <div className="flex flex-col items-center gap-2 mb-4">
        <Avatar src={currentUser.avatar} alt={currentUser.name} size={76} />
        <div className="font-bold text-lg mt-2">{currentUser.name}</div>
        <div className="text-gray-600 text-sm">{currentUser.title}</div>
      </div>

      <div className="w-full text-sm text-gray-600 border-t pt-2 mb-2">
        <div className="flex justify-between items-center py-1">
          <span>Profile viewers</span>
          <span className="text-blue-700 font-semibold cursor-pointer">
            500
          </span>
        </div>
        <div className="text-gray-500 text-xs mb-1">
          View all analytics
        </div>
      </div>

      <div className="bg-gray-50 px-2 py-2 text-xs text-gray-500 rounded mb-2 border">
        Achieve 4x more profile visits
        <br />
        <span className="text-black font-medium">
          Get hired faster. Try Premium free.
        </span>
      </div>

      <Link
        href="/saved"
        className="mt-3 inline-flex items-center gap-2 text-gray-700 text-sm cursor-pointer hover:text-blue-600"
        onClick={() =>
          logEvent(EVENT_TYPES.VIEW_SAVED_POSTS, { source: "left_sidebar" })
        }
      >
        <span className="text-yellow-500">&#9734;</span>
        <span>Saved items</span>
      </Link>

      {/* Curioso: Estadísticas divertidas */}
      <div className="mt-4 pt-4 border-t">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-3">
          <div className="text-xs font-semibold text-indigo-700 mb-1">🎯 Network Stats</div>
          <div className="text-2xl font-bold text-indigo-900">2.4K+</div>
          <div className="text-xs text-gray-600">Connections this week</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
          <div className="text-xs font-semibold text-purple-700 mb-1">🚀 Trending</div>
          <div className="text-sm text-gray-700">#TechJobs</div>
          <div className="text-xs text-gray-500 mt-1">15.2K posts today</div>
        </div>
      </div>

      {/* Additional content to make sidebar longer */}
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
                <span className="truncate">{connection.name}</span>
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
