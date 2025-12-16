"use client";
import { useEffect, useState, useMemo } from "react";
import { type User, type Post } from "@/library/dataset";
import Avatar from "@/components/Avatar";
import Post from "@/components/Post";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { useSeed } from "@/context/SeedContext";
import {
  getEffectiveLayoutConfig,
  getLayoutClasses,
  getShuffledItems,
} from "@/dynamic/v1-layouts";
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

function ProfileContent({ username }: { username: string }) {
  type ExperienceEntry = NonNullable<User["experience"]>[number];
  const { resolvedSeeds, seed } = useSeed();
  const layoutSeed = resolvedSeeds.v1 ?? resolvedSeeds.base ?? seed;
  const layout = getEffectiveLayoutConfig(layoutSeed);

  // Get data from dynamic provider
  const users = dynamicDataProvider.getUsers();
  const mockPosts = dynamicDataProvider.getPosts();

  const user = users.find((u) => u.username === username);
  const currentUser = users[2] || users[0];
  const { getText } = useV3Attributes();
  const isSelf = user?.username === currentUser.username;
  const [connectState, setConnectState] = useState<
    "connect" | "pending" | "connected"
  >("connect");

  // Local state for profile editing
  const [aboutText, setAboutText] = useState(user?.about || "");
  const [bioText, setBioText] = useState(user?.bio || "");
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [titleText, setTitleText] = useState(user?.title || "");
  const [experience, setExperience] = useState<ExperienceEntry[]>(
    user?.experience || []
  );
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingProfileHeader, setIsEditingProfileHeader] = useState(false);
  const [isEditingExperience, setIsEditingExperience] = useState(false);
  const [experienceBackup, setExperienceBackup] = useState<ExperienceEntry[] | null>(null);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [addedExperienceIndex, setAddedExperienceIndex] = useState<number | null>(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [hiddenPostIds, setHiddenPostIds] = useState<Set<string>>(new Set());
  const [hiddenPosts, setHiddenPosts] = useState<Post[]>([]);

  // Load saved about/name/bio/title/experience from localStorage
  useEffect(() => {
    if (isSelf && user) {
      const savedAbout = localStorage.getItem(`profile_about_${user.username}`);
      const savedBio = localStorage.getItem(`profile_bio_${user.username}`);
      const savedName = localStorage.getItem(`profile_name_${user.username}`);
      const savedTitle = localStorage.getItem(`profile_title_${user.username}`);
      const savedExp = localStorage.getItem(`profile_exp_${user.username}`);
      if (savedAbout) {
        setAboutText(savedAbout);
      } else if (user.about) {
        setAboutText(user.about);
      }
      if (savedBio) setBioText(savedBio);
      else if (user.bio) setBioText(user.bio);
      if (savedName) setDisplayName(savedName);
      if (savedTitle) setTitleText(savedTitle);
      if (savedExp) {
        try {
          const parsed = JSON.parse(savedExp);
          if (Array.isArray(parsed)) setExperience(parsed);
        } catch {}
      }
    }
  }, [isSelf, user]);

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

  // Load saved posts from localStorage
  const getLocalPosts = (): Post[] => {
    if (typeof window === "undefined" || !isSelf || !user) return [];
    const savedPosts = localStorage.getItem(`profile_posts_${user.username}`);
    if (savedPosts) {
      try {
        return JSON.parse(savedPosts);
      } catch {
        return [];
      }
    }
    return [];
  };

  const [localPosts, setLocalPosts] = useState<Post[]>(getLocalPosts);
  const [postsState, setPostsState] = useState<Record<string, { likes: number; liked: boolean; comments: Post['comments'] }>>({});

  // Load posts state from localStorage (likes and comments)
  useEffect(() => {
    if (user) {
      const savedState = localStorage.getItem(`profile_posts_state_${user.username}`);
      if (savedState) {
        try {
          setPostsState(JSON.parse(savedState));
        } catch {
          setPostsState({});
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (isSelf && user) {
      setLocalPosts(getLocalPosts());
    }
  }, [isSelf, user]);

  useEffect(() => {
    if (user) {
      const payload = {
        username: user.username,
        name: user.name,
        timestamp: new Date().toISOString(),
        source: "post_header_avatar",
      };

      console.log("📣 VIEW_USER_PROFILE event:", payload);
      logEvent(EVENT_TYPES.VIEW_USER_PROFILE, payload);
    }
  }, [user]);

  if (!user)
    return (
      <div className="text-center text-red-600 mt-8">
        {getText("profile_not_found", "User not found.")}
      </div>
    );

  const posts = mockPosts.filter((p) => p.user.username === user.username);
  const allPosts = isSelf ? [...localPosts, ...posts] : posts;
  
  // Merge posts with saved state (likes and comments) - recalculate when postsState changes
  const postsWithState = useMemo(() => {
    return allPosts.map(post => {
      const state = postsState[post.id];
      if (state) {
        return {
          ...post,
          likes: state.likes,
          liked: state.liked,
          comments: state.comments || post.comments,
        };
      }
      return post;
    });
  }, [allPosts, postsState]);
  
  const visiblePosts = useMemo(() => {
    const shuffled = getShuffledItems(postsWithState, layoutSeed);
    return shuffled.filter((p) => !hiddenPostIds.has(p.id));
  }, [postsWithState, layoutSeed, hiddenPostIds]);
  const profileClasses = getLayoutClasses(layout, "profileLayout");

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

  const handleSaveProfile = () => {
    if (isSelf && user) {
      const previous = {
        name: user.name,
        title: user.title,
        bio: user.bio,
        about: user.about,
      };
      const updated = {
        name: displayName || user.name,
        title: titleText || user.title,
        bio: bioText || user.bio,
        about: aboutText,
      };

      localStorage.setItem(`profile_about_${user.username}`, updated.about);
      localStorage.setItem(`profile_bio_${user.username}`, updated.bio);
      localStorage.setItem(`profile_name_${user.username}`, updated.name);
      localStorage.setItem(`profile_title_${user.username}`, updated.title);

      setIsEditingAbout(false);
      setIsEditingProfileHeader(false);

      logEvent(EVENT_TYPES.EDIT_PROFILE, {
        username: user.username,
        previous,
        updated,
      });
    }
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !isSelf || !user) return;

    const newPost: Post = {
      id: `local_${Date.now()}`,
      user: user,
      content: newPostContent,
      timestamp: new Date().toISOString(),
      likes: 0,
      liked: false,
      comments: [],
    };

    const updatedPosts = [newPost, ...localPosts];
    setLocalPosts(updatedPosts);
    localStorage.setItem(
      `profile_posts_${user.username}`,
      JSON.stringify(updatedPosts)
    );
    setNewPostContent("");

    logEvent(EVENT_TYPES.POST_STATUS, {
      userName: user.name,
      content: newPost.content,
      postId: newPost.id,
    });
  };

  const updateExperienceField = (
    index: number,
    field: keyof ExperienceEntry,
    value: string
  ) => {
    setExperience((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value } as ExperienceEntry;
      return next;
    });
  };

  const handleSaveExperience = () => {
    if (!isSelf || !user) return;
    localStorage.setItem(
      `profile_exp_${user.username}`,
      JSON.stringify(experience)
    );
    setIsEditingExperience(false);
    setExperienceBackup(null);
    logEvent(EVENT_TYPES.EDIT_EXPERIENCE, {
      username: user.username,
      name: user.name,
      experienceCount: experience.length,
      roles: experience.map((exp) => exp?.title),
      experiences: experience,
    });
    if (addedExperienceIndex !== null && experience[addedExperienceIndex]) {
      const newExp = experience[addedExperienceIndex];
      logEvent(EVENT_TYPES.ADD_EXPERIENCE, {
        username: user.username,
        name: user.name,
        experience: newExp,
        experienceCount: experience.length,
      });
    }
    setIsAddingExperience(false);
    setAddedExperienceIndex(null);
  };

  const handleCancelExperience = () => {
    if (experienceBackup) {
      setExperience(experienceBackup);
    }
    setIsEditingExperience(false);
    setExperienceBackup(null);
    setIsAddingExperience(false);
    setAddedExperienceIndex(null);
  };

  const handleAddExperience = () => {
    if (!isEditingExperience) {
      setExperienceBackup(experience.map((e) => ({ ...e })));
    }
    setExperience((prev) => [
      ...prev,
      {
        title: "",
        company: "",
        logo: "",
        duration: "",
        location: "",
        description: "",
      },
    ]);
    setIsAddingExperience(true);
    setAddedExperienceIndex(experience.length);
    setIsEditingExperience(true);
  };

  const handleLike = (postId: string) => {
    const post = allPosts.find((p) => p.id === postId);
    if (!post || !user) return;

    const currentState = postsState[postId] || {
      likes: post.likes || 0,
      liked: post.liked || false,
      comments: post.comments || [],
    };

    const newLiked = !currentState.liked;
    const newLikes = newLiked ? currentState.likes + 1 : Math.max(0, currentState.likes - 1);

    const updatedState = {
      ...postsState,
      [postId]: {
        ...currentState,
        likes: newLikes,
        liked: newLiked,
      },
    };

    setPostsState(updatedState);
    localStorage.setItem(`profile_posts_state_${user.username}`, JSON.stringify(updatedState));

    logEvent(EVENT_TYPES.LIKE_POST, {
      postId,
      action: newLiked ? "liked" : "unliked",
    });
  };

  const handleAddComment = (postId: string, text: string) => {
    const post = allPosts.find((p) => p.id === postId);
    if (!post || !user || !text.trim()) return;

    const currentState = postsState[postId] || {
      likes: post.likes || 0,
      liked: post.liked || false,
      comments: post.comments || [],
    };

    const newComment = {
      id: `comment_${Date.now()}`,
      user: currentUser,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedState = {
      ...postsState,
      [postId]: {
        ...currentState,
        comments: [...(currentState.comments || []), newComment],
      },
    };

    setPostsState(updatedState);
    localStorage.setItem(`profile_posts_state_${user.username}`, JSON.stringify(updatedState));

    logEvent(EVENT_TYPES.COMMENT_ON_POST, {
      postId,
      commentId: newComment.id,
      commentText: text,
    });
  };

  const handleDeletePost = (postId: string) => {
    if (!isSelf || !user) return;
    const target = allPosts.find((p) => p.id === postId);
    setLocalPosts((prev) => {
      const next = prev.filter((p) => p.id !== postId);
      localStorage.setItem(
        `profile_posts_${user.username}`,
        JSON.stringify(next)
      );
      return next;
    });
    setPostsState((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    logEvent(EVENT_TYPES.DELETE_POST, {
      postId,
      author: user.username,
      content: target?.content,
    });
    logEvent(EVENT_TYPES.REMOVE_POST, {
      postId,
      author: user.username,
      content: target?.content,
      source: "profile",
    });
  };

  const handleSavePost = (post: Post) => {
    setSavedPosts((prev) => {
      const deduped = prev.filter((p) => p.id !== post.id);
      return [post, ...deduped];
    });
  };

  const handleHidePost = (postId: string) => {
    setHiddenPostIds((prev) => {
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
  };

  // Company logo mapping for better logos
  const getCompanyLogo = (company: string, fallback: string): string => {
    const logoMap: Record<string, string> = {
      Google: "https://logo.clearbit.com/google.com",
      "Y Combinator": "https://logo.clearbit.com/ycombinator.com",
      Adobe: "/media/companies/adobe-logo.svg",
      Square: "https://logo.clearbit.com/square.com",
      PayPal: "https://logo.clearbit.com/paypal.com",
      Microsoft: "https://logo.clearbit.com/microsoft.com",
      Apple: "https://logo.clearbit.com/apple.com",
      Amazon: "https://logo.clearbit.com/amazon.com",
      Meta: "https://logo.clearbit.com/meta.com",
      Netflix: "https://logo.clearbit.com/netflix.com",
    };
    return logoMap[company] || fallback;
  };

  const renderProfileHeader = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col sm:flex-row items-center gap-6 mb-6">
      <Avatar src={user.avatar} alt={user.name} size={100} />
      <div className="text-center sm:text-left flex flex-col gap-3 flex-1">
        <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start">
          <div className="text-2xl font-bold text-gray-900">
                {isSelf && isEditingProfileHeader ? (
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="border rounded px-3 py-1 text-base"
                  />
            ) : (
              displayName || user.name
            )}
          </div>
          <div className="text-blue-600 font-semibold text-lg">
                {isSelf && isEditingProfileHeader ? (
                  <input
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                    className="border rounded px-3 py-1 text-base"
                  />
            ) : (
              titleText || user.title
            )}
          </div>
          {!isSelf &&
            (connectState === "connect" ? (
              <button
                className="ml-2 px-6 py-2 rounded-full font-medium transition-colors text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                onClick={handleConnect}
              >
                {getText("profile_connect", "Connect")}
              </button>
            ) : connectState === "pending" ? (
              <button
                className="ml-2 px-6 py-2 rounded-full font-medium transition-colors text-white bg-gray-400 cursor-wait"
                disabled
              >
                {getText("profile_pending", "Pending...")}
              </button>
            ) : (
              <span className="ml-2 px-6 py-2 rounded-full font-medium transition-colors text-white bg-green-600 cursor-default select-none">
                {getText("profile_message", "Message")}
              </span>
            ))}
        </div>
        <div className="text-gray-600 text-base">
          {isSelf && isEditingProfileHeader ? (
            <input
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              className="border rounded px-3 py-1 text-base w-full"
              placeholder="Short headline or bio"
            />
          ) : (
            bioText || user.bio
          )}
        </div>
        {isSelf && (
          <div className="ml-auto">
            <button
              onClick={() => {
                if (isEditingProfileHeader) {
                  handleSaveProfile();
                } else {
                  setIsEditingProfileHeader(true);
                }
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              {isEditingProfileHeader ? "💾 Save profile" : "✏️ Edit profile"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderAbout = () => {
    const displayAbout = isSelf ? aboutText : user.about;
    if (!displayAbout && !isSelf) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl text-gray-900">
            {getText("profile_about", "About")}
          </h3>
          {isSelf && (
            <button
              onClick={() => {
                if (isEditingAbout) {
                  handleSaveProfile();
                } else {
                  setIsEditingAbout(true);
                }
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              {isEditingAbout ? "💾 Save" : "✏️ Edit"}
            </button>
          )}
        </div>
        {isEditingAbout && isSelf ? (
          <textarea
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            className="w-full border-2 border-blue-200 rounded-lg p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px] resize-y"
            placeholder="Tell us about yourself..."
            onBlur={handleSaveProfile}
          />
        ) : (
          <p className="whitespace-pre-line text-gray-800 text-base leading-relaxed">
            {displayAbout || "No about information yet."}
          </p>
        )}
      </div>
    );
  };

  const renderExperience = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl text-gray-900">
          {getText("profile_experience", "Experience")}
        </h3>
        {isSelf && (
          <button
            onClick={() => {
              if (isEditingExperience) {
                handleSaveExperience();
              } else {
                setExperienceBackup(experience.map((e) => ({ ...e })));
                setIsEditingExperience(true);
              }
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            {isEditingExperience ? "💾 Save" : "✏️ Edit"}
          </button>
        )}
      </div>
      {experience.length === 0 && !isEditingExperience ? (
        <div className="text-gray-600 text-sm">
          {getText("profile_no_experience", "No experience added yet.")}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {experience.map((exp, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row gap-4 pb-6 last:pb-0 border-b last:border-b-0 border-gray-200"
            >
              <div className="flex-shrink-0">
                <img
                  src={getCompanyLogo(exp.company, exp.logo)}
                  alt={`${exp.company} logo`}
                  className="w-16 h-16 rounded-lg bg-white border-2 border-gray-100 object-contain shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = exp.logo;
                  }}
                />
              </div>
        <div className="flex-1 space-y-2">
          {isEditingExperience ? (
            <>
              <input
                value={exp.title}
                onChange={(e) =>
                        updateExperienceField(i, "title", e.target.value)
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="Title"
                    />
              <input
                value={exp.company}
                onChange={(e) =>
                  updateExperienceField(i, "company", e.target.value)
                }
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Company"
              />
              <input
                value={exp.logo}
                onChange={(e) =>
                  updateExperienceField(i, "logo", e.target.value)
                }
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Logo URL (optional)"
              />
              <input
                value={exp.duration}
                onChange={(e) =>
                  updateExperienceField(i, "duration", e.target.value)
                }
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="Duration"
                    />
                    <input
                      value={exp.location}
                      onChange={(e) =>
                        updateExperienceField(i, "location", e.target.value)
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="Location"
                    />
                    <textarea
                      value={exp.description}
                      onChange={(e) =>
                        updateExperienceField(i, "description", e.target.value)
                      }
                      className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
                      placeholder="Description"
                    />
                  </>
                ) : (
                  <>
                    <div className="font-bold text-lg text-gray-900 mb-1">
                      {exp.title || "New experience"}
                    </div>
                    <div className="font-semibold text-blue-700 text-base mb-2">
                      {exp.company || "Company"}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {exp.duration || "Duration"}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {exp.location || "Location"}
                    </div>
                    <div className="text-gray-700 text-sm leading-relaxed">
                      {exp.description || "No description provided."}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {isSelf && isEditingExperience && (
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            onClick={handleCancelExperience}
            className="px-4 py-2 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveExperience}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            Save experience
          </button>
        </div>
      )}
      {isSelf && (
        <button
          onClick={handleAddExperience}
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-semibold"
        >
          + Add experience
        </button>
      )}
    </div>
  );

  const renderPosts = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xl text-gray-900">
          {getText("profile_posts_by", "Posts by")} {user.name}
        </h2>
      </div>

      {/* Post creation form for self */}
      {isSelf && (
        <form
          onSubmit={handleSubmitPost}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex gap-4">
            <Avatar src={user.avatar} alt={user.name} size={48} />
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share something..."
                className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-y"
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {newPostContent.length}/500
                </span>
                <button
                  type="submit"
                  disabled={!newPostContent.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {visiblePosts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-gray-500 italic text-lg">
              {getText("profile_no_posts", "No posts yet.")}
            </div>
          </div>
        ) : (
          visiblePosts.map((post) => (
            <Post
              key={post.id}
              post={post}
              onLike={handleLike}
              onAddComment={handleAddComment}
              onSave={handleSavePost}
              onHide={(postId) => {
                handleHidePost(postId);
                const target = allPosts.find((p) => p.id === postId);
                if (target) {
                  setHiddenPosts((prev) => {
                    const filtered = prev.filter((p) => p.id !== postId);
                    return [target, ...filtered];
                  });
                }
              }}
              onDelete={isSelf ? handleDeletePost : undefined}
            />
          ))
        )}
      </div>
    </div>
  );

  if (layout.profileLayout === "sidebar") {
    return (
      <section className={profileClasses}>
        <div className="lg:col-span-2">
          {renderProfileHeader()}
          {renderAbout()}
          {renderExperience()}
        </div>
        <div className="lg:col-span-1">
          {renderPosts()}
        </div>
      </section>
    );
  }

  return (
    <section className={`${profileClasses} max-w-4xl mx-auto px-6`}>
      {renderProfileHeader()}
      {renderAbout()}
      {renderExperience()}
      {renderPosts()}
    </section>
  );
}

export default function ProfileClient({ username }: { username: string }) {
  return (
    <DataReadyGate>
      <ProfileContent username={username} />
    </DataReadyGate>
  );
}
