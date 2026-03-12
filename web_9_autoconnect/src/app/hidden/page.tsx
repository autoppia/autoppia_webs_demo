"use client";
import { useEffect, useMemo, useState } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import { DataReadyGate } from "@/components/DataReadyGate";
import { EVENT_TYPES, logEvent } from "@/library/events";
import type { Post } from "@/library/dataset";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";
import {
  loadHiddenPostIds,
  loadHiddenPosts,
  persistHiddenPostIds,
  persistHiddenPosts,
} from "@/library/localState";

const localTextVariants: Record<string, string[]> = {
  hidden_posts_subtitle: [
    "Posts you hid are stored locally. Restore any to bring them back to your feed.",
    "Hidden posts stay in your browser. Restore any item to return it to your feed.",
    "You can restore hidden posts at any time to show them again in your feed.",
  ],
  hidden_posts_empty: [
    "You haven’t hidden any posts.",
    "No hidden posts yet.",
    "Your hidden list is empty.",
  ],
  hidden_posts_empty_cta: [
    "Browse the feed to hide or restore posts.",
    "Go back to feed and manage hidden posts.",
    "Return to feed to hide or restore posts.",
  ],
  hidden_posts_back: ["Back to feed", "Return to feed", "Go to feed"],
  hidden_posts_restore: ["Restore", "Unhide", "Show again"],
};

const localClassVariants: Record<string, string[]> = {
  hidden_page_section: [
    "max-w-4xl mx-auto px-6 py-8",
    "max-w-4xl mx-auto px-6 py-8 bg-white/40 rounded-xl",
    "max-w-4xl mx-auto px-6 py-8",
  ],
  hidden_page_card: [
    "bg-white rounded-xl shadow p-4 border border-gray-100",
    "bg-white rounded-xl shadow-md p-4 border border-gray-200",
    "bg-white rounded-xl p-4 border border-gray-100 shadow-sm",
  ],
  hidden_restore_button: [
    "text-sm text-blue-600 hover:underline",
    "text-sm text-indigo-600 hover:underline",
    "text-sm text-blue-700 hover:underline",
  ],
};

function HiddenPostsContent() {
  const dyn = useDynamicSystem();
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
    <section
      id={dyn.v3.getVariant("hidden_page_section", ID_VARIANTS_MAP, "hidden-page-section")}
      className={cn(
        "max-w-4xl mx-auto px-6 py-8",
        dyn.v3.getVariant("hidden_page_section", CLASS_VARIANTS_MAP, ""),
        dyn.v3.getVariant("hidden_page_section", localClassVariants, "")
      )}
    >
      {dyn.v1.addWrapDecoy("hidden-page-header", <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            id={dyn.v3.getVariant("hidden_posts_title", ID_VARIANTS_MAP, "hidden-posts-title")}
            className="text-2xl font-bold text-gray-900"
          >
            {dyn.v3.getVariant("hidden_posts", TEXT_VARIANTS_MAP, "Hidden posts")}
          </h1>
          <p className="text-gray-600 text-sm">
            {dyn.v3.getVariant(
              "hidden_posts_subtitle",
              localTextVariants,
              "Posts you hid are stored locally. Restore any to bring them back to your feed."
            )}
          </p>
        </div>
        <SeedLink href="/" className="text-blue-600 hover:text-blue-800 font-semibold">
          {`← ${dyn.v3.getVariant("hidden_posts_back", localTextVariants, "Back to feed")}`}
        </SeedLink>
      </div>)}

      {list.length === 0 ? (
        <div
          id={dyn.v3.getVariant("hidden_empty_state", ID_VARIANTS_MAP, "hidden-empty-state")}
          className="bg-white rounded-xl shadow p-8 text-center"
        >
          <div className="text-gray-600 mb-2">
            {dyn.v3.getVariant("hidden_posts_empty", localTextVariants, "You haven’t hidden any posts.")}
          </div>
          <SeedLink href="/" className="text-blue-600 hover:underline text-sm">
            {dyn.v3.getVariant(
              "hidden_posts_empty_cta",
              localTextVariants,
              "Browse the feed to hide or restore posts."
            )}
          </SeedLink>
        </div>
      ) : (
        <div
          id={dyn.v3.getVariant("hidden_posts_list", ID_VARIANTS_MAP, "hidden-posts-list")}
          className="space-y-4"
        >
          {list.map((post) => (
            <div
              key={post.id}
              id={dyn.v3.getVariant(`hidden_post_card_${post.id}`, ID_VARIANTS_MAP, `hidden-post-card-${post.id}`)}
              className={cn(
                "bg-white rounded-xl shadow p-4 border border-gray-100",
                dyn.v3.getVariant("hidden_page_card", CLASS_VARIANTS_MAP, ""),
                dyn.v3.getVariant("hidden_page_card", localClassVariants, "")
              )}
            >
              {dyn.v1.addWrapDecoy("hidden-post-row", <div className="flex items-start gap-3 mb-2">
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
                  className={cn(
                    "text-sm text-blue-600 hover:underline",
                    dyn.v3.getVariant("hidden_restore_button", localClassVariants, "")
                  )}
                  onClick={() => restore(post.id, post)}
                >
                  {dyn.v3.getVariant("hidden_posts_restore", localTextVariants, "Restore")}
                </button>
              </div>)}
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
