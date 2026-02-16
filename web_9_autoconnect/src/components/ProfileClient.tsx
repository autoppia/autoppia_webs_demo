"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { type User, type Post } from "@/library/dataset";
import Avatar from "@/components/Avatar";
import Post from "@/components/Post";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useSeed } from "@/context/SeedContext";
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
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

function ProfileContent({ username }: { username: string }) {
  type ExperienceEntry = NonNullable<User["experience"]>[number];
  const { seed } = useSeed();
  // Default layout config (no v1 layout variations in this build)
  const layout = { profileLayout: "full" as const };

  const [userNotFound, setUserNotFound] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  // Get data from dynamic provider
  const users = dynamicDataProvider.getUsers();

  // Subscribe to posts to get stable reference
  const [mockPosts, setMockPosts] = useState<Post[]>(() => dynamicDataProvider.getPosts());

  useEffect(() => {
    const unsubscribe = dynamicDataProvider.subscribePosts((updatedPosts) => {
      setMockPosts(updatedPosts);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to users to get stable reference
  const [usersState, setUsersState] = useState<User[]>(() => dynamicDataProvider.getUsers());

  useEffect(() => {
    const unsubscribe = dynamicDataProvider.subscribeUsers((updatedUsers) => {
      setUsersState(updatedUsers);
    });
    return () => unsubscribe();
  }, []);

  // Serialize usersState for stable dependency
  const usersStateKey = useMemo(() => {
    if (!usersState || usersState.length === 0) return '';
    return usersState.map(u => u.username).sort().join(',');
  }, [usersState]);

  // Memoize user lookup to avoid reference changes - search in usersState directly
  const user = useMemo(() => {
    if (!usersState || usersState.length === 0) return undefined;
    const searchUsername = String(username || "").trim().toLowerCase();

    // Strategy 1: Exact match
    let found = usersState.find((u) => {
      const userUsername = String(u.username || "").trim().toLowerCase();
      return userUsername === searchUsername;
    });

    if (found) return found;

    // Strategy 2: Partial match
    found = usersState.find((u) => {
      const userUsername = String(u.username || "").trim().toLowerCase();
      return userUsername.includes(searchUsername) || searchUsername.includes(userUsername);
    });

    if (found) return found;

    // Strategy 3: Without dots
    const searchWithoutDots = searchUsername.replace(/\./g, "");
    found = usersState.find((u) => {
      const userUsername = String(u.username || "").trim().toLowerCase();
      const userWithoutDots = userUsername.replace(/\./g, "");
      return userWithoutDots === searchWithoutDots;
    });

    return found;
  }, [username, usersState, usersStateKey]);

  // Memoize currentUser to avoid reference changes
  const currentUser = useMemo(() => {
    return usersState[2] || usersState[0];
  }, [usersState, usersStateKey]);

  const dyn = useDynamicSystem();

  // Memoize isSelf to avoid recalculation
  const isSelf = useMemo(() => {
    return user?.username === currentUser?.username;
  }, [user?.username, currentUser?.username]);

  // Create stable reference for dyn.seed
  const dynSeed = dyn.seed;

  // Memoize dyn.v3 to avoid reference changes
  const dynV3 = useMemo(() => dyn.v3, [dyn.seed]);

  // Use ref to maintain stable reference to changeOrderElements
  const changeOrderElementsRef = useRef(dyn.v1.changeOrderElements);
  useEffect(() => {
    changeOrderElementsRef.current = dyn.v1.changeOrderElements;
  }, [dyn.v1]);
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

  // Check if user exists whenever username or data changes
  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      if (!mounted) return;

      setIsCheckingUser(true);

      // Wait for data provider to be ready
      await dynamicDataProvider.whenReady();

      // Wait a bit more to ensure data is fully loaded
      await new Promise(resolve => setTimeout(resolve, 200));

      if (!mounted) return;

      const foundUser = dynamicDataProvider.getUserByUsername(username);

      if (foundUser) {
        console.log(`[autoconnect] ✅ User "${username}" found:`, foundUser.name);
        setUserNotFound(false);
        setIsCheckingUser(false);
      } else {
        const allUsers = dynamicDataProvider.getUsers();
        console.log(`[autoconnect] ❌ User "${username}" not found. Available users (${allUsers.length}):`,
          allUsers.slice(0, 10).map(u => ({ username: u.username, name: u.name })));
        setUserNotFound(true);
        setIsCheckingUser(false);
      }
    };

    checkUser();

    // Subscribe to user updates to re-check when data changes
    const unsubscribe = dynamicDataProvider.subscribeUsers((users) => {
      if (!mounted) return;

      console.log(`[autoconnect] Users updated (${users.length} users), re-checking user ${username}...`);
      setTimeout(() => {
        if (!mounted) return;
        const foundUser = dynamicDataProvider.getUserByUsername(username);
        if (foundUser) {
          console.log(`[autoconnect] ✅ User "${username}" found after update:`, foundUser.name);
          setUserNotFound(false);
          setIsCheckingUser(false);
        } else if (users.length > 0) {
          console.log(`[autoconnect] ❌ User "${username}" still not found after update`);
          setUserNotFound(true);
          setIsCheckingUser(false);
        }
      }, 200);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [username, seed]); // V2 dataset can change by seed

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

  // Calculate posts for this user - memoize with stable dependencies
  // IMPORTANT: All hooks must be called before any early returns to follow React's rules of hooks
  const userUsername = user?.username;

  // Serialize mockPosts for stable dependency check
  const mockPostsKey = useMemo(() => {
    if (!mockPosts || mockPosts.length === 0) return '';
    return mockPosts.map(p => `${p.id}:${p.user?.username || ''}`).sort().join(',');
  }, [mockPosts]);

  const posts = useMemo(() => {
    if (!userUsername || !mockPosts || mockPosts.length === 0) return [];
    return mockPosts.filter((p) => p.user.username === userUsername);
  }, [mockPosts, mockPostsKey, userUsername]);

  // Serialize localPosts for stable dependency check
  const localPostsKey = useMemo(() => {
    if (!localPosts || localPosts.length === 0) return '';
    return localPosts.map(p => p.id).sort().join(',');
  }, [localPosts]);

  const allPosts = useMemo(() => {
    if (!posts || posts.length === 0) {
      return isSelf && localPosts.length > 0 ? localPosts : [];
    }
    return isSelf ? [...localPosts, ...posts] : posts;
  }, [isSelf, localPosts, localPostsKey, posts]);

  // Serialize allPosts for stable dependency
  const allPostsKey = useMemo(() => {
    if (!allPosts || allPosts.length === 0) return '';
    return allPosts.map(p => p.id).sort().join(',');
  }, [allPosts]);

  // Serialize postsState completely for stable dependency comparison
  const postsStateSerialized = useMemo(() => {
    try {
      return JSON.stringify(postsState);
    } catch {
      return '';
    }
  }, [postsState]);

  // Merge posts with saved state (likes and comments) - recalculate when postsState changes
  const postsWithState = useMemo(() => {
    if (!allPosts || allPosts.length === 0) return [];

    // Parse the serialized state to avoid accessing postsState directly
    let parsedState: typeof postsState = {};
    try {
      parsedState = postsStateSerialized ? JSON.parse(postsStateSerialized) : {};
    } catch {
      parsedState = {};
    }

    return allPosts.map(post => {
      const state = parsedState[post.id];
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
  }, [allPosts, allPostsKey, postsStateSerialized]);

  // Serialize hiddenPostIds for stable dependency
  const hiddenPostIdsStr = useMemo(() => {
    return Array.from(hiddenPostIds).sort().join(',');
  }, [hiddenPostIds]);

  // Serialize postsWithState for stable dependency
  const postsWithStateKey = useMemo(() => {
    if (!postsWithState || postsWithState.length === 0) return '';
    return postsWithState.map(p => p.id).sort().join(',');
  }, [postsWithState]);

  // Memoize the order separately - use ref to avoid dependency on dyn.v1
  const postsLength = postsWithState?.length || 0;
  const postsOrder = useMemo(() => {
    if (postsLength === 0) return [];
    return changeOrderElementsRef.current("profile-posts", postsLength);
  }, [postsLength, dynSeed]);

  const visiblePosts = useMemo(() => {
    if (!postsWithState || postsWithState.length === 0) return [];

    // Parse the serialized hiddenPostIds to avoid accessing hiddenPostIds directly
    const hiddenSet = new Set(hiddenPostIdsStr ? hiddenPostIdsStr.split(',') : []);

    const orderedPosts = postsOrder.map((idx) => postsWithState[idx]);
    return orderedPosts.filter((p) => !hiddenSet.has(p.id));
  }, [postsWithState, postsWithStateKey, postsOrder, hiddenPostIdsStr]);

  if (isCheckingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!user || userNotFound) {
    return (
      <div className="text-center text-red-600 mt-8">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p className="mb-4">The user profile you're looking for doesn't exist.</p>
        <p className="text-sm text-gray-500">Username: {username}</p>
      </div>
    );
  }
  const profileClasses = "max-w-5xl";

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
    const post = postsWithState.find((p) => p.id === postId) || allPosts.find((p) => p.id === postId);
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
    const post = postsWithState.find((p) => p.id === postId) || allPosts.find((p) => p.id === postId);
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
    const target = postsWithState.find((p) => p.id === postId) || allPosts.find((p) => p.id === postId);
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
                className={`ml-2 px-6 py-2 rounded-full font-medium transition-colors text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg ${dynV3.getVariant("profile_connect_button", CLASS_VARIANTS_MAP, "")}`}
                onClick={handleConnect}
              >
                {dynV3.getVariant("profile_connect", TEXT_VARIANTS_MAP, "Connect")}
              </button>
            ) : connectState === "pending" ? (
              <button
                className="ml-2 px-6 py-2 rounded-full font-medium transition-colors text-white bg-gray-400 cursor-wait"
                disabled
              >
                {dynV3.getVariant("profile_pending", TEXT_VARIANTS_MAP, "Pending...")}
              </button>
            ) : (
              <span className="ml-2 px-6 py-2 rounded-full font-medium transition-colors text-white bg-green-600 cursor-default select-none">
                {dynV3.getVariant("profile_message", TEXT_VARIANTS_MAP, "Message")}
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
              className={`text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors ${dynV3.getVariant("edit_profile_button", CLASS_VARIANTS_MAP, "")}`}
            >
              {isEditingProfileHeader ? dynV3.getVariant("save_profile_text", TEXT_VARIANTS_MAP, "💾 Save profile") : dynV3.getVariant("edit_profile_text", TEXT_VARIANTS_MAP, "✏️ Edit profile")}
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
            {dynV3.getVariant("profile_about", TEXT_VARIANTS_MAP, "About")}
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
              className={`text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors ${dynV3.getVariant("edit_button", CLASS_VARIANTS_MAP, "")}`}
            >
              {isEditingAbout ? dynV3.getVariant("save_text", TEXT_VARIANTS_MAP, "💾 Save") : dynV3.getVariant("edit_text", TEXT_VARIANTS_MAP, "✏️ Edit")}
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
          {dynV3.getVariant("profile_experience", TEXT_VARIANTS_MAP, "Experience")}
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
            className={`text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors ${dynV3.getVariant("edit_button", CLASS_VARIANTS_MAP, "")}`}
          >
            {isEditingExperience ? dynV3.getVariant("save_text", TEXT_VARIANTS_MAP, "💾 Save") : dynV3.getVariant("edit_text", TEXT_VARIANTS_MAP, "✏️ Edit")}
          </button>
        )}
      </div>
      {experience.length === 0 && !isEditingExperience ? (
        <div className="text-gray-600 text-sm">
          {dynV3.getVariant("profile_no_experience", TEXT_VARIANTS_MAP, "No experience added yet.")}
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
            className={`px-4 py-2 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 ${dynV3.getVariant("cancel_button", CLASS_VARIANTS_MAP, "")}`}
          >
            {dynV3.getVariant("cancel_text", TEXT_VARIANTS_MAP, "Cancel")}
          </button>
          <button
            onClick={handleSaveExperience}
            className={`px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 ${dynV3.getVariant("save_experience_button", CLASS_VARIANTS_MAP, "")}`}
          >
            {dynV3.getVariant("save_experience_text", TEXT_VARIANTS_MAP, "Save experience")}
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
          {dynV3.getVariant("profile_posts_by", TEXT_VARIANTS_MAP, "Posts by")} {user.name}
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
                placeholder={dynV3.getVariant("profile_comment_placeholder", TEXT_VARIANTS_MAP, "Share something...")}
                className={`w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-y ${dynV3.getVariant("profile_comment_textarea", CLASS_VARIANTS_MAP, "")}`}
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {newPostContent.length}/500
                </span>
                <button
                  type="submit"
                  disabled={!newPostContent.trim()}
                  className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg ${dynV3.getVariant("profile_post_button", CLASS_VARIANTS_MAP, "")}`}
                >
                  {dynV3.getVariant("profile_post_button_text", TEXT_VARIANTS_MAP, "Post")}
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
              {dynV3.getVariant("profile_no_posts", TEXT_VARIANTS_MAP, "No posts yet.")}
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
                const target = postsWithState.find((p) => p.id === postId) || allPosts.find((p) => p.id === postId);
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
      dyn.v1.addWrapDecoy("profile-page", (
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
      ), "profile-page-wrap")
    );
  }

  return (
    dyn.v1.addWrapDecoy("profile-page", (
    <section className={`${profileClasses} max-w-4xl mx-auto px-6`}>
      {renderProfileHeader()}
      {renderAbout()}
      {renderExperience()}
      {renderPosts()}
    </section>
    ), "profile-page-wrap")
  );
}

export default function ProfileClient({ username }: { username: string }) {
  return (
    <DataReadyGate>
      <ProfileContent username={username} />
    </DataReadyGate>
  );
}
