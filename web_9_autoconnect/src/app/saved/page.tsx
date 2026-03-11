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
  loadSavedPosts,
  persistSavedPosts,
} from "@/library/localState";

const localTextVariants: Record<string, string[]> = {
  saved_posts_subtitle: [
    "Posts you saved are stored locally in your browser.",
    "Saved posts are kept locally in this browser.",
    "Your saved posts are stored on this device.",
  ],
  saved_posts_empty: ["No saved posts yet.", "You have no saved posts.", "Nothing saved yet."],
  saved_posts_empty_cta: [
    "Browse the feed to save posts.",
    "Go back to feed and save posts.",
    "Return to feed to save posts.",
  ],
  saved_posts_back: ["Back to feed", "Return to feed", "Go to feed"],
  saved_posts_remove: ["Remove", "Unsave", "Discard"],
};

const localClassVariants: Record<string, string[]> = {
  saved_page_section: [
    "max-w-4xl mx-auto px-6 py-8",
    "max-w-4xl mx-auto px-6 py-8 bg-white/40 rounded-xl",
    "max-w-4xl mx-auto px-6 py-8",
  ],
  saved_page_card: [
    "bg-white rounded-xl shadow p-4 border border-gray-100",
    "bg-white rounded-xl shadow-md p-4 border border-gray-200",
    "bg-white rounded-xl p-4 border border-gray-100 shadow-sm",
  ],
  saved_remove_button: [
    "text-sm text-red-600 hover:underline",
    "text-sm text-red-500 hover:underline",
    "text-sm text-rose-600 hover:underline",
  ],
};

function SavedPostsContent() {
  const dyn = useDynamicSystem();
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
    <section
      id={dyn.v3.getVariant("saved_page_section", ID_VARIANTS_MAP, "saved-page-section")}
      className={cn(
        "max-w-4xl mx-auto px-6 py-8",
        dyn.v3.getVariant("saved_page_section", CLASS_VARIANTS_MAP, ""),
        dyn.v3.getVariant("saved_page_section", localClassVariants, "")
      )}
    >
      {dyn.v1.addWrapDecoy("saved-page-header", <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            id={dyn.v3.getVariant("saved_posts_title", ID_VARIANTS_MAP, "saved-posts-title")}
            className="text-2xl font-bold text-gray-900"
          >
            {dyn.v3.getVariant("saved_items", TEXT_VARIANTS_MAP, "Saved posts")}
          </h1>
          <p className="text-gray-600 text-sm">
            {dyn.v3.getVariant(
              "saved_posts_subtitle",
              localTextVariants,
              "Posts you saved are stored locally in your browser."
            )}
          </p>
        </div>
        <SeedLink
          href="/"
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          {`← ${dyn.v3.getVariant("saved_posts_back", localTextVariants, "Back to feed")}`}
        </SeedLink>
      </div>)}

      {savedList.length === 0 ? (
        <div
          id={dyn.v3.getVariant("saved_empty_state", ID_VARIANTS_MAP, "saved-empty-state")}
          className="bg-white rounded-xl shadow p-8 text-center"
        >
          <div className="text-gray-600 mb-2">
            {dyn.v3.getVariant("saved_posts_empty", localTextVariants, "No saved posts yet.")}
          </div>
          <SeedLink href="/" className="text-blue-600 hover:underline text-sm">
            {dyn.v3.getVariant(
              "saved_posts_empty_cta",
              localTextVariants,
              "Browse the feed to save posts."
            )}
          </SeedLink>
        </div>
      ) : (
        <div
          id={dyn.v3.getVariant("saved_posts_list", ID_VARIANTS_MAP, "saved-posts-list")}
          className="space-y-4"
        >
          {savedList.map((post) => (
            <div
              key={post.id}
              id={dyn.v3.getVariant(`saved_post_card_${post.id}`, ID_VARIANTS_MAP, `saved-post-card-${post.id}`)}
              className={cn(
                "bg-white rounded-xl shadow p-4 border border-gray-100",
                dyn.v3.getVariant("saved_page_card", CLASS_VARIANTS_MAP, ""),
                dyn.v3.getVariant("saved_page_card", localClassVariants, "")
              )}
            >
              {dyn.v1.addWrapDecoy("saved-post-row", <div className="flex items-start gap-3 mb-2">
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
                    "text-sm text-red-600 hover:underline",
                    dyn.v3.getVariant("saved_remove_button", localClassVariants, "")
                  )}
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
                  {dyn.v3.getVariant("saved_posts_remove", localTextVariants, "Remove")}
                </button>
              </div>)}
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
