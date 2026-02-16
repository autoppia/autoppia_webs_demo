"use client";
import { useEffect, useMemo, useState } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import { DataReadyGate } from "@/components/DataReadyGate";
import { EVENT_TYPES, logEvent } from "@/library/events";
import type { Post } from "@/library/dataset";
import {
  loadHiddenPostIds,
  loadHiddenPosts,
  persistHiddenPostIds,
  persistHiddenPosts,
} from "@/library/localState";

function HiddenPostsContent() {
  const [hiddenPosts, setHiddenPosts] = useState<Post[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setHiddenPosts(loadHiddenPosts());
    setHiddenIds(loadHiddenPostIds());
    logEvent(EVENT_TYPES.VIEW_HIDDEN_POSTS, {
      count: loadHiddenPosts().length,
    });
  }, []);

  useEffect(() => {
    persistHiddenPosts(hiddenPosts);
    persistHiddenPostIds(hiddenIds);
  }, [hiddenPosts, hiddenIds]);

  const list = useMemo(() => hiddenPosts, [hiddenPosts]);

  const restore = (postId: string, post?: Post) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
    setHiddenPosts((prev) => prev.filter((p) => p.id !== postId));
    logEvent(EVENT_TYPES.UNHIDE_POST, {
      postId,
      author: post?.user?.name,
      postContent: post?.content,
      reason: "user_unhide",
      source: "hidden_posts_page",
    });
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hidden posts</h1>
          <p className="text-gray-600 text-sm">
            Posts you hid are stored locally. Restore any to bring them back to your feed.
          </p>
        </div>
        <SeedLink href="/" className="text-blue-600 hover:text-blue-800 font-semibold">
          ← Back to feed
        </SeedLink>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-gray-600 mb-2">You haven’t hidden any posts.</div>
          <SeedLink href="/" className="text-blue-600 hover:underline text-sm">
            Browse the feed to hide or restore posts.
          </SeedLink>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((post) => (
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
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => restore(post.id, post)}
                >
                  Restore
                </button>
              </div>
              {post.image && (
                <div className="rounded-lg overflow-hidden border border-gray-100">
                  <img
                    src={post.image}
                    alt="Hidden post attachment"
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

export default function HiddenPostsPage() {
  return (
    <DataReadyGate>
      <HiddenPostsContent />
    </DataReadyGate>
  );
}
