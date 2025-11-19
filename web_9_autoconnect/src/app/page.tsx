"use client";
import { useState } from "react";
import {
  type Post as PostType,
  type User as UserType,
} from "@/library/dataset";
import Avatar from "@/components/Avatar";
import Post from "@/components/Post";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import UserSearchBar from "@/components/UserSearchBar";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useSeed } from "@/library/useSeed";
import { getLayoutClasses, getShuffledItems } from "@/dynamic/v1-layouts";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { dynamicDataProvider } from "@/dynamic/v2-data";
import { DataReadyGate } from "@/components/DataReadyGate";

function HomeContent() {
  const { seed, layout } = useSeed();
  const { getText, getClass } = useV3Attributes();

  // Get data from dynamic provider
  const users = dynamicDataProvider.getUsers();
  const defaultPosts = dynamicDataProvider.getPosts();

  // pick a current user
  const currentUser = users[2] || users[0];
  const [posts, setPosts] = useState<PostType[]>(
    () => defaultPosts.map((post) => ({ ...post, liked: false })) // ensure fresh local likes
  );
  const [newPost, setNewPost] = useState("");

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

  const shuffledPosts = getShuffledItems(posts, layout.feedOrder);
  const sidebarClasses = getLayoutClasses(layout, 'sidebarPosition');
  const postBoxClasses = getLayoutClasses(layout, 'postBoxPosition');
  const searchClasses = getLayoutClasses(layout, 'searchPosition');

  const renderSidebar = (_position: 'left' | 'right' | 'top' | 'bottom') => null;

  const renderPostBox = () => {
    if (layout.postBoxPosition === 'left' || layout.postBoxPosition === 'right') {
      return (
        <div className={`${layout.postBoxPosition === 'left' ? 'w-[220px]' : 'w-[280px]'} flex-shrink-0 ${postBoxClasses}`}>
          <form
            onSubmit={handleSubmitPost}
            className="bg-white rounded-lg shadow p-4 flex flex-col gap-3 items-center mb-6"
          >
            <Avatar src={currentUser.avatar} alt={currentUser.name} size={44} />
            <input
              type="text"
              className={getClass("post_input", "w-full border border-gray-200 rounded-full px-4 py-2 focus:outline-blue-500")}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={getText("post_placeholder", "Share something...")}
              maxLength={300}
            />
            <button
              type="submit"
              className={getClass("post_button", "w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 font-medium disabled:bg-blue-200")}
              disabled={!newPost.trim()}
            >
              {getText("post_button", "Post")}
            </button>
          </form>
        </div>
      );
    }

    return (
      <form
        onSubmit={handleSubmitPost}
        className="bg-white rounded-lg shadow p-4 flex gap-3 items-center mb-6"
      >
        <Avatar src={currentUser.avatar} alt={currentUser.name} size={44} />
        <input
          type="text"
          className={getClass("post_input", "flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-blue-500")}
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder={getText("post_placeholder", "Share something...")}
          maxLength={300}
        />
        <button
          type="submit"
          className={getClass("post_button", "bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 font-medium disabled:bg-blue-200")}
          disabled={!newPost.trim()}
        >
          {getText("post_button", "Post")}
        </button>
      </form>
    );
  };

  const getMainLayoutClasses = () => {
    switch (layout.mainLayout) {
      case 'default':
        return 'w-full flex gap-2 justify-center min-h-screen';
      case 'reverse':
        return 'w-full flex gap-2 justify-center min-h-screen flex-row-reverse';
      case 'vertical':
        return 'w-full flex flex-col gap-2 justify-center min-h-screen';
      case 'horizontal':
        return 'w-full flex flex-row gap-2 justify-center min-h-screen';
      case 'grid':
        return 'w-full grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-screen';
      case 'sidebar-top':
        return 'w-full flex flex-col gap-2 justify-center min-h-screen';
      case 'sidebar-bottom':
        return 'w-full flex flex-col gap-2 justify-center min-h-screen';
      case 'center-focus':
        return 'w-full flex gap-2 justify-center min-h-screen';
      case 'split-view':
        return 'w-full grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-screen';
      case 'masonry':
        return 'w-full columns-1 md:columns-2 lg:columns-3 gap-4 min-h-screen';
      default:
        return 'w-full flex gap-2 justify-center min-h-screen';
    }
  };

  const renderMainContent = () => {
    if (layout.mainLayout === 'grid' || layout.mainLayout === 'split-view') {
      return (
        <>
          {renderSidebar('left')}
          <main className="w-full max-w-[700px] mx-auto flex-1">
            <section>
              {layout.searchPosition === 'main' && (
                <div className={searchClasses}>
                  <UserSearchBar />
                </div>
              )}
              {renderPostBox()}
              <div className="space-y-4">
                {shuffledPosts.map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onAddComment={handleAddComment}
                  />
                ))}
              </div>
            </section>
          </main>
          {renderSidebar('right')}
        </>
      );
    }

    if (layout.mainLayout === 'masonry') {
      return (
        <div className="space-y-4">
          {shuffledPosts.map((post) => (
            <Post
              key={post.id}
              post={post}
              onLike={handleLike}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      );
    }

    if (layout.mainLayout === 'sidebar-top') {
      return (
        <>
          {renderSidebar('top')}
          <main className="w-full max-w-[700px] mx-auto flex-1">
            <section>
              {layout.searchPosition === 'main' && (
                <div className={searchClasses}>
                  <UserSearchBar />
                </div>
              )}
              {renderPostBox()}
              <div className="space-y-4">
                {shuffledPosts.map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onAddComment={handleAddComment}
                  />
                ))}
              </div>
            </section>
          </main>
        </>
      );
    }

    if (layout.mainLayout === 'sidebar-bottom') {
      return (
        <>
          <main className="w-full max-w-[700px] mx-auto flex-1">
            <section>
              {layout.searchPosition === 'main' && (
                <div className={searchClasses}>
                  <UserSearchBar />
                </div>
              )}
              {renderPostBox()}
              <div className="space-y-4">
                {shuffledPosts.map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onAddComment={handleAddComment}
                  />
                ))}
              </div>
            </section>
          </main>
          {renderSidebar('bottom')}
        </>
      );
    }

    return (
      <>
        {renderSidebar('left')}
        <main className="w-full max-w-[700px] mx-auto flex-1">
          <section>
            {layout.searchPosition === 'main' && (
              <div className={searchClasses}>
                <UserSearchBar />
              </div>
            )}
            {renderPostBox()}
            <div className="space-y-4">
              {shuffledPosts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onAddComment={handleAddComment}
                />
              ))}
            </div>
          </section>
        </main>
        {renderSidebar('right')}
      </>
    );
  };

  const wrapperPadding = layout.headerPosition === 'left' ? 'pl-56' : layout.headerPosition === 'right' ? 'pr-56' : '';

  return (
    <div className={`${getMainLayoutClasses()} ${wrapperPadding}`}>
      {/* Debug indicator for dynamic structure */}
      <div className="w-full px-4 mb-2 text-xs text-gray-500">nav_home: {getText("nav_home", "Home")}</div>
      {/* Floating Search */}
      {layout.searchPosition === 'floating' && (
        <div className={searchClasses}>
          <UserSearchBar />
        </div>
      )}
      {/* Fallback: ensure search is accessible on small screens when header/sidebar may hide it */}
      {layout.searchPosition !== 'main' && (
        <div className="w-full px-4 mt-2 sm:hidden">
          <UserSearchBar />
        </div>
      )}
      
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
