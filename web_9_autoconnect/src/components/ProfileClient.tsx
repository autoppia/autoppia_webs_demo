"use client";
import { useState } from "react";
import { mockUsers, mockPosts } from "@/library/dataset";
import Avatar from "@/components/Avatar";
import Post from "@/components/Post";
import { EVENT_TYPES, logEvent } from "@/library/events";

export default function ProfileClient({ username }: { username: string }) {
  const user = mockUsers.find((u) => u.username === username);
  const currentUser = mockUsers[2];
  const isSelf = user?.username === currentUser.username;
  const [connectState, setConnectState] = useState<
    "connect" | "pending" | "connected"
  >("connect");

  if (!user)
    return <div className="text-center text-red-600 mt-8">User not found.</div>;

  const posts = mockPosts.filter((p) => p.user.username === user.username);

  const handleConnect = () => {
    logEvent(EVENT_TYPES.CONNECT_WITH_USER, {
      currentUser: {
        username: currentUser.username,
        name: currentUser.name,
      },
      targetUser: {
        username: user.username,
        name: user.name,
      },
    });

    setConnectState("pending");
    setTimeout(() => setConnectState("connected"), 1000);
  };

  return (
    <section>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row items-center gap-6 mb-8">
        <Avatar src={user.avatar} alt={user.name} size={85} />
        <div className="text-center sm:text-left flex flex-col gap-2 flex-1">
          <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
            <div className="text-xl font-bold">{user.name}</div>
            <div className="text-blue-700 font-medium">{user.title}</div>
            {!isSelf &&
              (connectState === "connect" ? (
                <button
                  className="ml-2 px-4 py-1 rounded-full font-medium transition-colors text-white bg-blue-600 hover:bg-blue-700"
                  onClick={handleConnect}
                >
                  Connect
                </button>
              ) : connectState === "pending" ? (
                <button
                  className="ml-2 px-4 py-1 rounded-full font-medium transition-colors text-white bg-gray-400 cursor-wait"
                  disabled
                >
                  Pending...
                </button>
              ) : (
                <span className="ml-2 px-4 py-1 rounded-full font-medium transition-colors text-white bg-green-600 cursor-default select-none">
                  Message
                </span>
              ))}
          </div>
          <div className="text-gray-600 mt-2">{user.bio}</div>
        </div>
      </div>

      {user.about && (
        <div className="bg-gray-100 border rounded-lg p-5 mb-6">
          <h3 className="font-bold text-lg mb-2">About</h3>
          <p className="whitespace-pre-line text-gray-900">{user.about}</p>
        </div>
      )}

      {user.experience && user.experience.length > 0 && (
        <div className="bg-gray-100 border rounded-lg p-5 mb-8">
          <h3 className="font-bold text-lg mb-4">Experience</h3>
          <div className="flex flex-col gap-6">
            {user.experience.map((exp, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row gap-4 border-b last:border-b-0 pb-4 last:pb-0"
              >
                <img
                  src={exp.logo}
                  alt={`${exp.company} logo`}
                  className="w-12 h-12 rounded bg-white border object-contain mx-auto sm:mx-0"
                />
                <div className="flex-1">
                  <div className="font-semibold">{exp.title}</div>
                  <div className="font-medium text-blue-800">{exp.company}</div>
                  <div className="text-xs text-gray-500">{exp.duration}</div>
                  <div className="text-xs text-gray-500 mb-1">
                    {exp.location}
                  </div>
                  <div className="text-gray-700 text-sm leading-normal">
                    {exp.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="font-semibold text-lg mb-4">Posts by {user.name}:</h2>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-gray-500 italic">No posts yet.</div>
        ) : (
          posts.map((post) => (
            <Post
              key={post.id}
              post={{ ...post, liked: false }}
              onLike={() => {}}
              onAddComment={() => {}}
            />
          ))
        )}
      </div>
    </section>
  );
}
