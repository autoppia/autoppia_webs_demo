"use client";
import { useState } from "react";
import {
  mockPosts as defaultPosts,
  mockUsers,
  type Post as PostType,
} from "@/library/mockData";
import Avatar from "@/components/Avatar";
import Post from "@/components/Post";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { EVENT_TYPES, logEvent } from "@/library/events";

export default function HomePage() {
  // pick a current user
  const currentUser = mockUsers[2];
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
    });
  }

  return (
    <div className="w-full flex gap-2 justify-center min-h-screen">
      {/* Left Sidebar */}
      <div className="hidden lg:block w-[220px] flex-shrink-0">
        <LeftSidebar />
      </div>
      {/* Main Feed */}
      <main className="w-full max-w-[700px] mx-auto flex-1">
        <section>
          {/* New Post Box */}
          <form
            onSubmit={handleSubmitPost}
            className="bg-white rounded-lg shadow p-4 flex gap-3 items-center mb-6"
          >
            <Avatar src={currentUser.avatar} alt={currentUser.name} size={44} />
            <input
              type="text"
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-blue-500"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share something..."
              maxLength={300}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 font-medium disabled:bg-blue-200"
              disabled={!newPost.trim()}
            >
              Post
            </button>
          </form>
          <div className="space-y-4">
            {posts.map((post) => (
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
      {/* Right Sidebar */}
      <div className="hidden xl:block w-[280px] flex-shrink-0">
        <RightSidebar />
      </div>
    </div>
  );
}
