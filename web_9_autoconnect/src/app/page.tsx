"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Post as PostType,
} from "@/library/dataset";
import Post from "@/components/Post";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import FeedComposerBar from "@/components/FeedComposerBar";
import PostComposerModal from "@/components/PostComposerModal";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { dynamicDataProvider } from "@/dynamic/v2";
import { DataReadyGate } from "@/components/DataReadyGate";
import {
  loadHiddenPostIds,
  loadHiddenPosts,
  loadSavedPosts,
  persistHiddenPostIds,
  persistHiddenPosts,
  persistSavedPosts,
} from "@/library/localState";
import { SeedLink } from "@/components/ui/SeedLink";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

function HomeContent() {
  const dyn = useDynamicSystem();

  const homeTextVariants: Record<string, string[]> = {
    post_placeholder: ["Share something...", "What's on your mind?", "Write an update..."],
    post_button: ["Post", "Share", "Publish"],
    comment_placeholder: ["Add a comment...", "Write a reply...", "Comment here..."],
    save_post: ["Save", "Bookmark", "Keep"],
    hide_post: ["Hide", "Remove", "Dismiss"],
  };

  const homeClassVariants: Record<string, string[]> = {
    post_input: [
      "flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-blue-500",
      "flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-indigo-500",
      "flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-blue-600",
    ],
    post_button_class: [
      "bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 font-medium disabled:bg-blue-200",
      "bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-2 font-medium disabled:bg-indigo-200",
      "bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2 font-medium disabled:bg-blue-200",
    ],
  };
  // Get data from dynamic provider
  const users = dynamicDataProvider.getUsers();
  const defaultPosts = dynamicDataProvider.getPosts();

  // pick a current user
  const currentUser = users[2] || users[0];
  const [posts, setPosts] = useState<PostType[]>(
    () => defaultPosts.map((post) => ({ ...post, liked: false })) // ensure fresh local likes
  );
  const [savedPosts, setSavedPosts] = useState<PostType[]>([]);
  const [hiddenPostIds, setHiddenPostIds] = useState<Set<string>>(new Set());
  const [hiddenPosts, setHiddenPosts] = useState<PostType[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const composerTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Subscribe to posts updates to refresh when data changes (e.g., seed change)
  useEffect(() => {
    const unsubscribePosts = dynamicDataProvider.subscribePosts((updatedPosts) => {
      console.log(`[autoconnect] Posts updated (${updatedPosts.length} posts), refreshing home page...`);
      // Update posts with fresh data, preserving liked state from local state
      setPosts((currentPosts) => {
        // Create a map of current liked state by post ID
        const likedStateMap = new Map(
          currentPosts.map((p) => [p.id, { liked: p.liked, likes: p.likes }])
        );

        // Map new posts, preserving liked state if post ID matches
        // Note: When seed changes, posts will have new IDs, so we reset all likes
        return updatedPosts.map((post) => {
          const existingState = likedStateMap.get(post.id);
          if (existingState) {
            return { ...post, liked: existingState.liked, likes: existingState.likes };
          }
          return { ...post, liked: false };
        });
      });
    });

    // Also subscribe to users updates to ensure posts have correct user references
    const unsubscribeUsers = dynamicDataProvider.subscribeUsers((updatedUsers) => {
      console.log(`[autoconnect] Users updated (${updatedUsers.length} users), refreshing posts with new user references...`);
      // When users change, refresh posts to get updated user references
      const freshPosts = dynamicDataProvider.getPosts();
      setPosts((currentPosts) => {
        // Create a map of current liked state by post ID
        const likedStateMap = new Map(
          currentPosts.map((p) => [p.id, { liked: p.liked, likes: p.likes }])
        );

        // Map new posts with updated user references
        return freshPosts.map((post) => {
          const existingState = likedStateMap.get(post.id);
          if (existingState) {
            return { ...post, liked: existingState.liked, likes: existingState.likes };
          }
          return { ...post, liked: false };
        });
      });
    });

    return () => {
      unsubscribePosts();
      unsubscribeUsers();
    };
  }, []);

  // Seed changes are handled centrally by DataReadyGate (reloads provider).

  useEffect(() => {
    setSavedPosts(loadSavedPosts());
    setHiddenPostIds(loadHiddenPostIds());
    setHiddenPosts(loadHiddenPosts());
  }, []);

  useEffect(() => {
    persistSavedPosts(savedPosts);
  }, [savedPosts]);

  useEffect(() => {
    persistHiddenPostIds(hiddenPostIds);
    persistHiddenPosts(hiddenPosts);
  }, [hiddenPostIds, hiddenPosts]);

  function handleSubmitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!newPost.trim()) return;

    const newPostData: PostType = {
      id: Math.random().toString(36).slice(2),
      user: currentUser,
      content: newPost,
      timestamp: new Date().toISOString(),
      likes: 0,
      liked: false,
      comments: [],
    };

    setPosts([newPostData, ...posts]);
    setNewPost("");
    setIsComposerOpen(false);

    logEvent(EVENT_TYPES.POST_STATUS, {
      userName: currentUser.name,
      content: newPostData.content,
      postId: newPostData.id,
    });
  }

  const autoResizeComposer = useCallback((el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    const maxHeight = Math.floor(window.innerHeight * 0.55);
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    if (!isComposerOpen || !composerTextareaRef.current) return;
    autoResizeComposer(composerTextareaRef.current);
  }, [isComposerOpen, autoResizeComposer]);

  function handleLike(postId: string) {
    setPosts((ps) =>
      ps.map((p) => {
        if (p.id === postId) {
          const liked = !p.liked;
          const updatedPost = {
            ...p,
            liked,
            likes: liked ? p.likes + 1 : p.likes - 1,
          };

          logEvent(EVENT_TYPES.LIKE_POST, {
            postId,
            userName: currentUser.name,
            action: liked ? "liked" : "unliked",
            posterContent: p.content,
            posterName: p.user.name,
          });

          return updatedPost;
        }
        return p;
      })
    );
  }

  function handleAddComment(postId: string, text: string) {
    const comment = {
      id: Math.random().toString(36).slice(2),
      user: currentUser,
      text,
      timestamp: new Date().toISOString(),
    };

  const post = posts.find((p) => p.id === postId);

  setPosts((ps) =>
    ps.map((p) =>
      p.id === postId
        ? {
            ...p,
            comments: [...p.comments, comment],
          }
        : p
      )
    );

    logEvent(EVENT_TYPES.COMMENT_ON_POST, {
      postId,
      commentId: comment.id,
      userName: currentUser.name,
      commentText: text,
      posterName: post?.user.name,
      posterContent: post?.content,
    });
  }

  function handleDeletePost(postId: string) {
    const target = posts.find((p) => p.id === postId);
    if (!target || target.user.username !== currentUser.username) return;

    setPosts((ps) => ps.filter((p) => p.id !== postId));
    setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
    setHiddenPostIds((prev) => {
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
    setHiddenPosts((prev) => prev.filter((p) => p.id !== postId));

    logEvent(EVENT_TYPES.DELETE_POST, {
      postId,
      author: currentUser.username,
      content: target.content,
      source: "home",
    });
  }

  function handleDeleteComment(postId: string, commentId: string) {
    const targetPost = posts.find((p) => p.id === postId);
    const targetComment = targetPost?.comments.find((c) => c.id === commentId);
    if (!targetComment || targetComment.user.username !== currentUser.username) return;

    setPosts((ps) =>
      ps.map((p) =>
        p.id === postId
          ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
          : p
      )
    );

    logEvent(EVENT_TYPES.DELETE_COMMENT, {
      postId,
      commentId,
      author: currentUser.username,
      commentText: targetComment.text,
      source: "home_comment",
    });
  }

  const shuffledPosts = useMemo(() => {
    if (posts.length === 0) return [];
    const order = dyn.v1.changeOrderElements("home-posts", posts.length);
    return order.map((idx) => posts[idx]);
  }, [posts, dyn.v1.changeOrderElements]);
  const visiblePosts = useMemo(
    () => shuffledPosts.filter((p) => !hiddenPostIds.has(p.id)),
    [shuffledPosts, hiddenPostIds]
  );
  const renderPostsBlock = () => (
    <>
      {savedPosts.length > 0 && (
        <div className="mb-4 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-sm text-gray-700">
              Saved posts ({savedPosts.length})
            </h2>
            <button
              className="text-xs text-blue-600 hover:underline"
              onClick={() => setSavedPosts([])}
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-blue-700 mb-2">
            <SeedLink href="/saved" className="hover:underline font-semibold">
              View all saved
            </SeedLink>
            <span className="text-gray-300">•</span>
            <span className="text-gray-600">
              Saved posts persist locally for this session.
            </span>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            {savedPosts.map((p) => (
              <li key={`saved-${p.id}`} className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <div>
                  <div className="font-semibold">{p.user.name}</div>
                  <div className="text-gray-600 line-clamp-2">{p.content}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
          <div className="space-y-4">
            {visiblePosts.map((post) => (
              <Post
                key={post.id}
                post={post}
                currentUsername={currentUser.username}
                onLike={handleLike}
                onAddComment={handleAddComment}
                onDelete={handleDeletePost}
                onDeleteComment={handleDeleteComment}
                onSave={(p) =>
                  setSavedPosts((prev) => {
                    const deduped = prev.filter((x) => x.id !== p.id);
                    return [p, ...deduped];
                  })
                }
                onHide={(postId) =>
                  setHiddenPostIds((prev) => {
                    const next = new Set(prev);
                    next.add(postId);
                    const found = posts.find((p) => p.id === postId);
                    if (found) {
                      setHiddenPosts((hp) => {
                        const filtered = hp.filter((p) => p.id !== postId);
                        return [found, ...filtered];
                      });
                    }
                    return next;
                  })
                }
              />
            ))}
          </div>
        </>
  );
  const renderSidebar = (position: 'left' | 'right') => {
    if (position === 'left') {
      return (
        <aside className="w-[280px] flex-shrink-0 hidden lg:block">
          <LeftSidebar />
        </aside>
      );
    }
    if (position === 'right') {
      return (
        <aside className="w-[280px] flex-shrink-0 hidden lg:block">
          <RightSidebar />
        </aside>
      );
    }
    return null;
  };

  const feedComposerInputClass = cn(
    dyn.v3.getVariant("post_input", homeClassVariants, ""),
    dyn.v3.getVariant("post_input", CLASS_VARIANTS_MAP, ""),
    "text-left text-gray-500 min-h-[44px] w-full"
  );
  const feedComposerButtonClass = cn(
    dyn.v3.getVariant("post_button_class", homeClassVariants, ""),
    dyn.v3.getVariant("post_button_class", CLASS_VARIANTS_MAP, ""),
    "h-10 w-10 rounded-full inline-flex items-center justify-center p-0"
  );
  const modalPostButtonClass = cn(
    dyn.v3.getVariant("post_button_class", homeClassVariants, ""),
    dyn.v3.getVariant("post_button_class", CLASS_VARIANTS_MAP, "")
  );
  const postPlaceholderText = dyn.v3.getVariant("post_placeholder", homeTextVariants, "Share something...");
  const postButtonLabel = dyn.v3.getVariant("post_button", homeTextVariants, "Post");

  const getMainLayoutClasses = () => 'w-full flex gap-4 justify-center min-h-screen';

  const renderMainContent = () => {
    const main = (
      <main className="w-full max-w-[950px] mx-auto flex-1 px-6">
        <section>
          <FeedComposerBar
            avatarSrc={currentUser.avatar}
            avatarAlt={currentUser.name}
            placeholder={postPlaceholderText}
            postAriaLabel={postButtonLabel}
            inputClassName={feedComposerInputClass}
            buttonClassName={feedComposerButtonClass}
            onOpenComposer={() => setIsComposerOpen(true)}
          />
          {renderPostsBlock()}
        </section>
      </main>
    );

    return (
      <>
        {renderSidebar('left')}
        {main}
        {renderSidebar('right')}
      </>
    );
  };

  const wrapperPadding = '';

  return (
    <div className={`${getMainLayoutClasses()} ${wrapperPadding}`}>
      {renderMainContent()}
      <PostComposerModal
        isOpen={isComposerOpen}
        avatarSrc={currentUser.avatar}
        avatarAlt={currentUser.name}
        value={newPost}
        placeholder={postPlaceholderText}
        postButtonLabel={postButtonLabel}
        postButtonClassName={modalPostButtonClass}
        textareaRef={composerTextareaRef}
        onClose={() => setIsComposerOpen(false)}
        onSubmit={handleSubmitPost}
        onChange={(value, el) => {
          setNewPost(value);
          autoResizeComposer(el);
        }}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <DataReadyGate>
      <HomeContent />
    </DataReadyGate>
  );
}
