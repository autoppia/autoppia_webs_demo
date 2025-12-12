"use client";
import Avatar from "./Avatar";
import type { Post as PostType } from "@/library/dataset";
import { useState } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import Image from "next/image";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

export default function Post({
  post,
  onLike,
  onAddComment,
  onSave,
  onHide,
}: {
  post: PostType;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onSave: (post: PostType) => void;
  onHide: (postId: string) => void;
}) {
  const [comment, setComment] = useState("");
  const { getText, getClass, getId } = useV3Attributes();
  const withVariant = (type: string, base: string) => {
    const variant = getClass(type, "");
    return variant ? `${variant} ${base}` : base;
  };
  function timeAgo(dateString: string) {
    const seconds = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 1000
    );
    const suffix = getText("time_ago_suffix", "ago");
    if (seconds < 60) return `${seconds}s ${suffix}`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${suffix}`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${suffix}`;
    return `${Math.floor(seconds / 86400)}d ${suffix}`;
  }
  return (
    <article
      id={getId("post_card", post.id)}
      className={withVariant("post_card", "bg-white rounded-lg shadow p-4")}
    >
      <div className="flex gap-3 items-start mb-2">
        <SeedLink
          href={`/profile/${post.user.username}`}
          className="shrink-0"
          onClick={() =>
            logEvent(EVENT_TYPES.VIEW_USER_PROFILE, {
              username: post.user.username,
              name: post.user.name,
              timestamp: new Date().toISOString(),
              source: "post_header_avatar",
            })
          }
        >
          <Avatar src={post.user.avatar} alt={post.user.name} size={40} />
        </SeedLink>
        <div>
          <SeedLink
            href={`/profile/${post.user.username}`}
            className="font-semibold text-sm hover:underline"
            onClick={() =>
              logEvent(EVENT_TYPES.VIEW_USER_PROFILE, {
                username: post.user.username,
                name: post.user.name,
                source: "post_header_name",
              })
            }
          >
            {post.user.name}
          </SeedLink>
          <div className="text-xs text-gray-500">{timeAgo(post.timestamp)}</div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
          <button
            className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
            onClick={() => {
              onSave(post);
              logEvent(EVENT_TYPES.SAVE_POST, {
                postId: post.id,
                author: post.user.name,
                content: post.content,
              })
            }}
          >
            Save
          </button>
          <button
            className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
            onClick={() => {
              onHide(post.id);
              logEvent(EVENT_TYPES.HIDE_POST, {
                postId: post.id,
                author: post.user.name,
                content: post.content,
                reason: "user_hide",
              })
            }}
          >
            Hide
          </button>
        </div>
      </div>
      <p className="mb-3 text-base whitespace-pre-line break-words">
        {post.content}
      </p>
      {post.image && (
        <div className="rounded-lg overflow-hidden w-full mb-3">
          <Image
            src={post.image}
            alt="Post attachment"
            width={544}
            height={320}
            className="object-cover w-full max-h-80 bg-gray-100"
            style={{ aspectRatio: "16/9" }}
            sizes="(max-width: 600px) 100vw, 544px"
            priority={false}
          />
        </div>
      )}
      <div className="flex gap-4 items-center text-gray-500 text-sm mb-2">
        <button
          id={getId("post_like_button", post.id)}
          className={`${withVariant(
            "post_like_button",
            "flex items-center gap-1 group rounded-full px-3 py-1"
          )} ${post.liked ? "text-blue-600 font-bold" : "hover:text-blue-600"}`}
          onClick={(e) => {
            e.preventDefault();
            onLike(post.id);
          }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="inline">
            <path
              fill="currentColor"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
          {post.likes}
        </button>
        <span>
          {getText("comments_label", "Comments")}: {post.comments.length}
        </span>
      </div>
      <div className="pl-2 space-y-2">
        {post.comments.map((c) => (
          <div key={c.id} className="flex gap-2 items-start text-[13px]">
            <Avatar src={c.user.avatar} alt={c.user.name} size={24} />
            <div>
              <span className="font-semibold">{c.user.name}</span>{" "}
              <span className="ml-1 text-gray-600">{c.text}</span>
              <span className="block text-xs text-gray-400">
                {timeAgo(c.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (comment.trim()) {
            onAddComment(post.id, comment);
            setComment("");
          }
        }}
        className="flex gap-2 mt-2"
      >
        <input
          id={getId("comment_input", post.id)}
          className={withVariant(
            "comment_input",
            "flex-1 rounded-full border border-gray-200 px-3 py-1 text-sm"
          )}
          placeholder={getText("comment_placeholder", "Add a comment...")}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          type="submit"
          id={getId("comment_button", post.id)}
          className={withVariant(
            "comment_button",
            "px-3 py-1 text-sm rounded-full bg-blue-50 hover:bg-blue-100 font-medium"
          )}
          disabled={!comment.trim()}
        >
          {getText("comment_button", "Post")}
        </button>
      </form>
    </article>
  );
}
