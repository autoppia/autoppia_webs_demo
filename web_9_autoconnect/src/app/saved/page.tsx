"use client";
import { useEffect, useMemo, useState } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import { DataReadyGate } from "@/components/DataReadyGate";
import { EVENT_TYPES, logEvent } from "@/library/events";
import type { Post } from "@/library/dataset";
import {
  loadSavedPosts,
  persistSavedPosts,
} from "@/library/localState";

function SavedPostsContent() {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);

  useEffect(() => {
    setSavedPosts(loadSavedPosts());
    logEvent(EVENT_TYPES.VIEW_SAVED_POSTS, {
      count: loadSavedPosts().length,
    });
  }, []);

  useEffect(() => {
    persistSavedPosts(savedPosts);
  }, [savedPosts]);

  const savedList = useMemo(() => savedPosts, [savedPosts]);

  return (
    <section className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved posts</h1>
          <p className="text-gray-600 text-sm">
            Posts you saved are stored locally in your browser.
          </p>
        </div>
        <SeedLink
          href="/"
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Back to feed
        </SeedLink>
      </div>

      {savedList.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-gray-600 mb-2">No saved posts yet.</div>
          <SeedLink href="/" className="text-blue-600 hover:underline text-sm">
            Browse the feed to save posts.
          </SeedLink>
        </div>
      ) : (
        <div className="space-y-4">
          {savedList.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow p-4 border border-gray-100"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {post.user.name}
                  </div>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {post.content}
                  </div>
                </div>
                <button
                  className="text-sm text-red-600 hover:underline"
                  onClick={() => {
                    setSavedPosts((prev) => prev.filter((p) => p.id !== post.id));
                    logEvent(EVENT_TYPES.REMOVE_POST, {
                      postId: post.id,
                      author: post.user.username || post.user.name,
                      content: post.content,
                      source: "saved_posts_page",
                    });
                  }}
                >
                  Remove
                </button>
              </div>
              {post.image && (
                <div className="rounded-lg overflow-hidden border border-gray-100">
                  <img
                    src={post.image}
                    alt="Saved post attachment"
                    className="w-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function SavedPostsPage() {
  return (
    <DataReadyGate>
      <SavedPostsContent />
    </DataReadyGate>
  );
}
