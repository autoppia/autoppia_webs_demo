"use client";
import Avatar from "./Avatar";
import type { Post as PostType } from "@/library/dataset";
import { useRef, useState } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import Image from "next/image";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

export default function Post({
  post,
  currentUsername,
  onLike,
  onAddComment,
  onSave,
  onHide,
  onDelete,
  onDeleteComment,
}: {
  post: PostType;
  currentUsername: string;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onSave: (post: PostType) => void;
  onHide: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
}) {
  const [comment, setComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isPostExpanded, setIsPostExpanded] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const commentFormRef = useRef<HTMLFormElement | null>(null);
  const dyn = useDynamicSystem();
  const localTextVariants: Record<string, string[]> = {
    comments_label: ["Comments", "Replies", "Responses"],
    comment_placeholder: ["Add a comment...", "Write a reply...", "Comment here..."],
    comment_button: ["Post", "Send", "Comment"],
    save_post: ["Save", "Bookmark", "Keep"],
    hide_post: ["Hide", "Remove", "Dismiss"],
  };
  const localClassVariants: Record<string, string[]> = {
    post_like_button: [
      "flex items-center gap-1 group rounded-full px-3 py-1",
      "flex items-center gap-1 group rounded-full px-3 py-1 bg-gray-50",
      "flex items-center gap-1 group rounded-full px-3 py-1 border border-gray-200",
    ],
    comment_input: [
      "flex-1 rounded-full border border-gray-200 px-3 py-1 text-sm",
      "flex-1 rounded-full border border-gray-300 px-3 py-1 text-sm",
      "flex-1 rounded-full border border-gray-200 px-3 py-1 text-sm bg-gray-50",
    ],
    comment_button: [
      "px-3 py-1 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 font-medium",
      "px-3 py-1 text-sm rounded-full bg-indigo-600 text-white hover:bg-indigo-700 font-medium",
      "px-3 py-1 text-sm rounded-full bg-blue-700 text-white hover:bg-blue-800 font-medium",
    ],
    action_button: [
      "px-2 py-1 rounded border border-gray-200 hover:bg-gray-50",
      "px-2 py-1 rounded border border-gray-300 hover:bg-gray-100",
      "px-2 py-1 rounded border border-gray-200 hover:bg-blue-50",
    ],
  };
  const withVariant = (type: string, base: string) =>
    cn(
      base,
      dyn.v3.getVariant(type, CLASS_VARIANTS_MAP, ""),
      dyn.v3.getVariant(type, localClassVariants, "")
    );

  function timeAgo(dateString: string) {
    const seconds = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 1000
    );
    const suffix = dyn.v3.getVariant("time_ago_suffix", TEXT_VARIANTS_MAP, "ago");
    if (seconds < 60) return `${seconds}s ${suffix}`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${suffix}`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${suffix}`;
    return `${Math.floor(seconds / 86400)}d ${suffix}`;
  }
  function handleCommentBlur() {
    window.setTimeout(() => {
      const active = document.activeElement;
      const stillInsideComposer =
        !!commentFormRef.current && !!active && commentFormRef.current.contains(active);
      if (!stillInsideComposer && !comment.trim()) {
        setIsCommenting(false);
      }
    }, 0);
  }

  const isCommentExpanded = isCommenting || !!comment.trim();
  const isOwnPost = post.user.username === currentUsername;
  const postLineCount = post.content.split("\n").length;
  const shouldClampPost = post.content.length > 180 || postLineCount > 3;
  return (
    <article
      id={dyn.v3.getVariant("post_article", ID_VARIANTS_MAP, "post-article")}
      className={withVariant("post_card", "bg-white rounded-lg shadow p-4")}
    >
      <div className="flex gap-3 items-start mb-2">
        {dyn.v1.addWrapDecoy(
          "post-author",
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
        )}
        <div>
          {dyn.v1.addWrapDecoy(
            "post-author-name",
            <SeedLink
              href={`/profile/${post.user.username}`}
              className={cn(
                "font-semibold text-sm hover:underline",
                dyn.v3.getVariant("post_author_link", CLASS_VARIANTS_MAP, "")
              )}
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
          )}
          <div className="text-xs text-gray-500">{timeAgo(post.timestamp)}</div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
          <button
            aria-label={dyn.v3.getVariant("save_post", localTextVariants, "Save")}
            title={dyn.v3.getVariant("save_post", localTextVariants, "Save")}
            className="px-2.5 py-1.5 rounded border border-blue-200 text-blue-600 hover:bg-blue-50"
            onClick={() => {
              onSave(post);
              logEvent(EVENT_TYPES.SAVE_POST, {
                postId: post.id,
                author: post.user.name,
                postContent: post.content,
              })
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" fill="currentColor" />
            </svg>
          </button>
          <button
            aria-label={dyn.v3.getVariant("hide_post", localTextVariants, "Hide")}
            title={dyn.v3.getVariant("hide_post", localTextVariants, "Hide")}
            className={withVariant("action_button", "px-2.5 py-1.5 rounded border border-gray-200 hover:bg-gray-50")}
            onClick={() => {
              onHide(post.id);
              logEvent(EVENT_TYPES.HIDE_POST, {
                postId: post.id,
                author: post.user.name,
                postContent: post.content,
                reason: "user_hide",
              })
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6zm9 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
                fill="currentColor"
              />
              <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {isOwnPost && onDelete && (
            <button
              aria-label="Delete"
              title="Delete"
              className="px-2.5 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => onDelete(post.id)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 3h6l1 2h4v2H4V5h4l1-2zm-2 6h2v9H7V9zm4 0h2v9h-2V9zm4 0h2v9h-2V9z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      {dyn.v1.addWrapDecoy(
        "post-content",
        <div className="mb-3">
          <p
            className={cn(
              "text-base whitespace-pre-line break-words",
              !isPostExpanded && shouldClampPost && "line-clamp-3"
            )}
          >
            {post.content}
          </p>
          {shouldClampPost && (
            <button
              type="button"
              className="mt-1 text-xs text-blue-600 hover:underline"
              onClick={() => setIsPostExpanded((prev) => !prev)}
            >
              {isPostExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}
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
          id={dyn.v3.getVariant(
            `post_like_button_${post.id}`,
            ID_VARIANTS_MAP,
            `post_like_button_${post.id}`
          )}
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
          {dyn.v3.getVariant("comments_label", localTextVariants, "Comments")}:{" "}
          {post.comments.length}
        </span>
      </div>
      <div className="pl-2 space-y-2">
        {post.comments.map((c) => (
          <div key={c.id} className="flex gap-2 items-start text-[13px]">
            <Avatar src={c.user.avatar} alt={c.user.name} size={24} />
            <div className="min-w-0 flex-1">
              {(() => {
                const commentLineCount = c.text.split("\n").length;
                const shouldClampComment = c.text.length > 140 || commentLineCount > 3;
                const isExpanded = !!expandedComments[c.id];
                return (
                  <>
                    <span className="font-semibold block">{c.user.name}</span>
                    <div
                      className={cn(
                        "text-gray-600 whitespace-pre-line break-words",
                        !isExpanded && shouldClampComment && "line-clamp-3"
                      )}
                    >
                      {c.text}
                    </div>
                    {shouldClampComment && (
                      <button
                        type="button"
                        className="text-[11px] text-blue-600 hover:underline"
                        onClick={() =>
                          setExpandedComments((prev) => ({
                            ...prev,
                            [c.id]: !prev[c.id],
                          }))
                        }
                      >
                        {isExpanded ? "Show less" : "Show more"}
                      </button>
                    )}
                  </>
                );
              })()}
              <span className="block text-xs text-gray-400">
                {timeAgo(c.timestamp)}
              </span>
            </div>
            {c.user.username === currentUsername && onDeleteComment && (
              <button
                type="button"
                aria-label="Delete comment"
                title="Delete comment"
                className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => onDeleteComment(post.id, c.id)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M9 3h6l1 2h4v2H4V5h4l1-2zm-2 6h2v9H7V9zm4 0h2v9h-2V9zm4 0h2v9h-2V9z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      <form
        ref={commentFormRef}
        onSubmit={(e) => {
          e.preventDefault();
          if (comment.trim()) {
            onAddComment(post.id, comment);
            setComment("");
            setIsCommenting(false);
          }
        }}
        className={cn("mt-2", isCommentExpanded ? "flex flex-col gap-2" : "flex gap-2")}
      >
        <textarea
          id={dyn.v3.getVariant(
            "comment_input",
            ID_VARIANTS_MAP,
            `comment_input_${post.id}`
          )}
          className={cn(
            "flex-1 border border-gray-200 bg-white px-3 text-sm text-gray-800 transition-colors appearance-none focus:outline-none focus:border-blue-400",
            isCommentExpanded
              ? "w-full rounded-lg py-2 min-h-[88px] max-h-36 resize-none overflow-y-auto"
              : "rounded-full py-2 h-10 resize-none overflow-hidden"
          )}
          placeholder={dyn.v3.getVariant("comment_placeholder", localTextVariants, "Add a comment...")}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onFocus={() => setIsCommenting(true)}
          onBlur={handleCommentBlur}
          rows={isCommentExpanded ? 3 : 1}
        />
        {isCommentExpanded && (
          <button
            type="submit"
            id={dyn.v3.getVariant(
              "comment_button",
              ID_VARIANTS_MAP,
              `comment_button_${post.id}`
            )}
            aria-label={dyn.v3.getVariant("comment_button", localTextVariants, "Post")}
            className={withVariant(
              "comment_button",
              "self-end h-10 w-10 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 font-medium inline-flex items-center justify-center"
            )}
            disabled={!comment.trim()}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 20l18-8L3 4v6l12 2-12 2v6z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
      </form>
    </article>
  );
}
