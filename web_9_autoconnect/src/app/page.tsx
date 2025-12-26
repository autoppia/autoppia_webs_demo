"use client";
import { useEffect, useMemo, useState } from "react";
import {
  type Post as PostType,
  type User as UserType,
} from "@/library/dataset";
import Avatar from "@/components/Avatar";
import Post from "@/components/Post";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useSeed } from "@/context/SeedContext";
import { dynamicDataProvider } from "@/dynamic/v2-data";
import { DataReadyGate } from "@/components/DataReadyGate";
import {
  loadHiddenPostIds,
  loadHiddenPosts,
  loadSavedPosts,
  persistHiddenPostIds,
  persistHiddenPosts,
  persistSavedPosts,
} from "@/library/localState";
import Link from "next/link";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

function HomeContent() {
  const { seed, resolvedSeeds } = useSeed();
  resolvedSeeds;
  const dyn = useDynamicSystem();

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

    logEvent(EVENT_TYPES.POST_STATUS, {
      userName: currentUser.name,
      content: newPostData.content,
      postId: newPostData.id,
    });
  }

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

  const shuffledPosts = useMemo(() => {
    if (posts.length === 0) return [];
    const order = dyn.v1.changeOrderElements("home-posts", posts.length);
    return order.map((idx) => posts[idx]);
  }, [posts, dyn.seed]);
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
            <Link href="/saved" className="hover:underline font-semibold">
              View all saved
            </Link>
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
                onLike={handleLike}
                onAddComment={handleAddComment}
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

  const renderTopSidebars = () => (
    <div className="w-full flex flex-col lg:flex-row lg:gap-4 mb-4">
      <div className="w-full lg:w-[280px]">
        <LeftSidebar />
      </div>
      <div className="w-full lg:w-[280px] lg:ml-auto">
        <RightSidebar />
      </div>
    </div>
  );

  const renderBottomSidebars = () => (
    <div className="w-full flex flex-col lg:flex-row lg:gap-4 mt-4">
      <div className="w-full lg:w-[300px]">
        <LeftSidebar />
      </div>
      <div className="w-full lg:w-[300px] lg:ml-auto">
        <RightSidebar />
      </div>
    </div>
  );

  const renderPostBox = () => (
    <form
      onSubmit={handleSubmitPost}
      className="bg-white rounded-lg shadow p-4 flex gap-3 items-center mb-6"
    >
      <Avatar src={currentUser.avatar} alt={currentUser.name} size={44} />
      <input
        type="text"
        className={cn(
          "flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-blue-500",
          dyn.v3.getVariant("post_input", CLASS_VARIANTS_MAP, "")
        )}
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        placeholder={dyn.v3.getVariant("post_placeholder", TEXT_VARIANTS_MAP, "Share something...")}
        maxLength={300}
      />
      <button
        type="submit"
        className={cn(
          "bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 font-medium disabled:bg-blue-200",
          dyn.v3.getVariant("post_button_class", CLASS_VARIANTS_MAP, "")
        )}
        disabled={!newPost.trim()}
      >
        {dyn.v3.getVariant("post_button", TEXT_VARIANTS_MAP, "Post")}
      </button>
    </form>
  );

  const getMainLayoutClasses = () => 'w-full flex gap-4 justify-center min-h-screen';

  const renderMainContent = () => {
    const main = (
      <main className="w-full max-w-[950px] mx-auto flex-1 px-6">
        <section>
          {renderPostBox()}
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
