"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import BookConsultationLogger from "./BookConsultationLogger";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useSeedLayout } from "@/dynamic/v3-dynamic";
import { getSeedLayout } from "@/library/utils";
import { useSeed } from "@/context/SeedContext";
import HireButton from "@/app/components/HireButton";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { dynamicDataProvider } from "@/dynamic/v2";
import { useDynamicSystem } from "@/dynamic/shared";

interface Expert {
  slug: string;
  name: string;
  country: string;
  role: string;
  avatar: string;
  rate: string;
  rating: number;
  jobs: number;
  consultation?: string;
  desc?: string;
  stats?: { earnings: string; jobs: number; hours: number };
  about?: string;
  hoursPerWeek?: string;
  languages?: string[];
  lastReview?: {
    title: string;
    stars: number;
    text: string;
    price: string;
    rate: string;
    time: string;
    dates: string;
  };
}

export default function ExpertProfileClient({ slug }: { slug: string }) {
  const [expert, setExpert] = useState<Expert | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHireLater, setIsHireLater] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { seed } = useSeed();
  const layout = getSeedLayout(seed);
  const { getElementAttributes, getText, dyn } = useSeedLayout();

  // Function to find expert by slug or name
  const findExpert = (searchSlug: string): Expert | null => {
    console.log(`[autowork] findExpert: searching for slug="${searchSlug}"`);

    // First try to find by slug using dynamicDataProvider
    let found = dynamicDataProvider.getExpertBySlug(searchSlug);

    if (found) {
      console.log(`[autowork] findExpert: ✅ Found by slug:`, found.name);
      return found as Expert;
    }

    // If slug looks like a name (contains spaces or doesn't match slug pattern), try by name
    const allExperts = dynamicDataProvider.getExperts();
    console.log(`[autowork] findExpert: Searching in ${allExperts.length} experts`);

    // Try to extract name from slug (reverse the slug generation)
    // If slug was generated from name, try to find by name
    const normalizedSearch = searchSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Try exact match by normalized name
    found = allExperts.find((e) => {
      const expertName = (e.name || "").toLowerCase().trim();
      const expertNameNormalized = expertName.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const expertSlug = (e.slug || "").toLowerCase();
      return expertSlug === normalizedSearch || expertNameNormalized === normalizedSearch || expertName === searchSlug;
    });

    if (found) {
      console.log(`[autowork] findExpert: ✅ Found by normalized name:`, found.name);
      return found as Expert;
    }

    // Try partial match
    found = allExperts.find((e) => {
      const expertName = (e.name || "").toLowerCase().trim();
      const expertSlug = (e.slug || "").toLowerCase();
      const expertNameNoDots = expertName.replace(/\./g, '').replace(/[^a-z0-9]+/g, '');
      const searchNoDots = normalizedSearch.replace(/\./g, '');
      return expertSlug.includes(normalizedSearch) || normalizedSearch.includes(expertSlug) ||
             expertName.includes(searchSlug) || searchSlug.includes(expertName) ||
             expertNameNoDots === searchNoDots;
    });

    if (found) {
      console.log(`[autowork] findExpert: ✅ Found by partial match:`, found.name);
      return found as Expert;
    }

    // NOTE: Removed localStorage fallback to ensure we only use current seed data
    // Using localStorage could return data from a different seed, which breaks consistency

    console.log(`[autowork] findExpert: ❌ Not found after all strategies`);
    console.log(`[autowork] Available experts (first 5):`, allExperts.slice(0, 5).map(e => ({ slug: e.slug, name: e.name })));
    return null;
  };

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 5;

    const loadExpert = async () => {
      if (!mounted) return;

      setIsLoading(true);
      setExpert(null); // Clear expert state when loading

      // Wait for data provider to be ready
      await dynamicDataProvider.whenReady();

      // Wait a bit more to ensure data is fully loaded and synced
      await new Promise(resolve => setTimeout(resolve, 300));

      if (!mounted) return;

      let experts = dynamicDataProvider.getExperts();

      // Retry a few times if no experts loaded yet OR if expert not found but we should wait
      while (mounted && retryCount < maxRetries) {
        // Check if experts are loaded
        if (experts.length === 0) {
          retryCount++;
          console.log(`[autowork] No experts loaded yet, retrying... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 300));
          experts = dynamicDataProvider.getExperts();
          continue;
        }

        // Experts are loaded, check if our expert is in the list
        const found = findExpert(slug);

        // If expert is found in the list, break out of retry loop
        if (found) {
          break;
        }

        // Expert not in list, but might still be loading - retry a couple more times
        if (retryCount < 3) {
          retryCount++;
          console.log(`[autowork] Expert "${slug}" not found in ${experts.length} experts, retrying... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 300));
          experts = dynamicDataProvider.getExperts();
        } else {
          // Give up after 3 retries
          break;
        }
      }

      if (!mounted) return;

      const found = findExpert(slug);

      if (mounted) {
        if (found) {
          setExpert(found);

          // Check if expert is in favorites
          try {
            const favoritesRaw = window.localStorage.getItem("autowork_expert_favorites");
            if (favoritesRaw) {
              const favorites = new Set(JSON.parse(favoritesRaw));
              setIsFavorite(favorites.has(found.name));
            }
          } catch {}

          // Check if expert is in hire later
          try {
            const hireLaterRaw = window.localStorage.getItem("autowork_hire_later_experts");
            if (hireLaterRaw) {
              const hireLaterList = JSON.parse(hireLaterRaw);
              if (Array.isArray(hireLaterList)) {
                setIsHireLater(
                  hireLaterList.some((item: any) => (item.slug || item.name) === found.slug || item.name === found.name)
                );
              }
            }
          } catch {}
        } else {
          // Expert not found with current seed - only mark as not found if experts are loaded
          if (experts.length > 0) {
            console.log(`[autowork] ❌ Expert "${slug}" not found in ${experts.length} experts with current seed`);
            setExpert(null);
          } else {
            // If still no experts, keep checking
            console.log(`[autowork] Still waiting for experts to load...`);
            setIsLoading(true);
            return;
          }
        }

        setIsLoading(false);
      }
    };

    loadExpert();

    // Subscribe to experts updates to re-check when data changes
    const unsubscribe = dynamicDataProvider.subscribeExperts((experts) => {
      if (!mounted) return;

      console.log(`[autowork] Experts updated (${experts.length} experts), re-checking expert "${slug}"...`);

      // If experts array is empty, it means data was cleared (seed change in progress)
      if (experts.length === 0) {
        console.log(`[autowork] Experts array is empty - seed change in progress, clearing expert state`);
        setExpert(null);
        setIsLoading(true);
        return;
      }

      // Wait a bit to ensure data is fully synced
      setTimeout(() => {
        if (!mounted) return;

        const currentExperts = dynamicDataProvider.getExperts();
        if (currentExperts.length > 0) {
          const found = findExpert(slug);
          if (found) {
            console.log(`[autowork] ✅ Expert "${slug}" found after update:`, found.name);
            setExpert(found);
            setIsLoading(false);
          } else {
            console.log(`[autowork] ❌ Expert "${slug}" still not found after update (${currentExperts.length} experts loaded)`);
            setExpert(null);
            setIsLoading(false);
          }
        } else {
          // Still no experts, keep loading state
          setExpert(null);
          setIsLoading(true);
        }
      }, 200);
    });

    // Listen for seed changes to re-check
    const handleSeedChange = () => {
      if (!mounted) return;
      console.log(`[autowork] Seed changed, re-checking expert "${slug}"...`);
      retryCount = 0; // Reset retry count on seed change
      // Clear expert state when seed changes to prevent showing old data
      setExpert(null);
      setIsLoading(true);
      // Reload expert with new seed data
      loadExpert();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("autowork:v2SeedChange", handleSeedChange);
    }

    return () => {
      mounted = false;
      unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("autowork:v2SeedChange", handleSeedChange);
      }
    };
  }, [slug, dyn.v2]);

  if (isLoading || !expert) {
    return (
      <main className="max-w-6xl mx-auto px-5 py-5">
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 flex items-center justify-center text-gray-500">
          {isLoading ? "Loading expert..." : "Expert not found"}
        </div>
      </main>
    );
  }

  // Always show: name first, then about, stats, jobs, reviews (ignoring layout order for these)
  const baseSections = ["name", "about", "stats", "jobs", "reviews"];
  const sidebarSection =
    layout.expertSections?.find((s) => s === "sidebar") || "sidebar";

  const expertSections = [...baseSections, sidebarSection];

  const renderSection = (sectionName: string) => {
    switch (sectionName) {
      case "name":
        return renderNameHeader();
      case "profile":
        return renderProfile();
      case "stats":
        return renderStats();
      case "about":
        return renderAbout();
      case "reviews":
        return renderReviews();
      case "jobs":
        return renderJobsCompleted();
      case "sidebar":
        return renderSidebar();
      default:
        return null;
    }
  };

  const renderNameHeader = () => (
    <div
      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 mb-6 border border-blue-100"
      {...getElementAttributes("expert-name-header", 0)}
    >
      {/* Top Section: Avatar and Info */}
      <div className="flex items-start gap-6 mb-6">
        <div className="relative flex-shrink-0">
          <img
            src={expert.avatar}
            alt={expert.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://ext.same-assets.com/1836270417/1435009301.png";
            }}
            {...getElementAttributes("expert-avatar", 0)}
          />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-bold text-3xl text-gray-900 mb-2"
            {...getElementAttributes("expert-name", 0)}
          >
            {expert.name}
          </div>
          <div className="text-lg font-medium text-gray-700 mb-3">
            {expert.role}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{expert.country}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {new Date()
                  .toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toLowerCase()}{" "}
                local time
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {expert.rating && (
              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(expert.rating || 0)
                        ? "text-yellow-400"
                        : i < (expert.rating || 0)
                        ? "text-yellow-300"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.234c.969 0 1.371 1.24.588 1.81l-3.424 2.49a1 1 0 00-.364 1.118l1.286 3.965c.3.921-.755 1.688-1.539 1.118l-3.424-2.49a1 1 0 00-1.176 0l-3.424 2.49c-.783.57-1.838-.197-1.539-1.118l1.286-3.965a1 1 0 00-.364-1.118L2.22 9.392c-.783-.57-.38-1.81.588-1.81h4.234a1 1 0 00.95-.69l1.286-3.965z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm font-semibold text-gray-700">
                  {expert.rating.toFixed(1)}
                </span>
              </div>
            )}
            {expert.rate && (
              <div className="bg-white px-3 py-1.5 rounded-full shadow-sm">
                <span className="text-sm font-semibold text-gray-700">
                  {expert.rate}
                </span>
              </div>
            )}
            {expert.jobs && (
              <div className="bg-white px-3 py-1.5 rounded-full shadow-sm">
                <span className="text-sm text-gray-600">
                  {expert.jobs} jobs completed
                </span>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="p-2 rounded-full hover:bg-white/80 transition flex-shrink-0"
          title="More options"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>

      {/* Bottom Section: Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-200">
        <HireButton expert={expert} />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          logEvent(EVENT_TYPES.QUICK_HIRE, {
            expertSlug: expert.slug,
            expertName: expert.name,
            country: expert.country,
            role: expert.role,
            rate: expert.rate,
            rating: expert.rating,
            jobs: expert.jobs,
            source: "expert_profile",
          });
            // End hire flow immediately for quick hire
            window.alert("Quick hire completed for this expert.");
          }}
          className={`px-6 py-2.5 border-2 border-green-600 text-green-700 rounded-lg font-medium hover:bg-green-50 transition cursor-pointer ${dyn.v3.getVariant("quick-hire-button-class", CLASS_VARIANTS_MAP, "")}`}
        >
          {dyn.v3.getVariant("quick-hire-button-text", TEXT_VARIANTS_MAP, getText("expert-quick-hire-button-label", "Quick hire"))}
        </button>
        <button
          id={dyn.v3.getVariant("contact-button", ID_VARIANTS_MAP, "contact-button")}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setContactOpen(true);
            logEvent(EVENT_TYPES.CONTACT_EXPERT_OPENED, {
              expertSlug: expert.slug,
              expertName: expert.name,
              country: expert.country,
              role: expert.role,
              rate: expert.rate,
              rating: expert.rating,
            });
          }}
          className={`px-6 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition cursor-pointer ${dyn.v3.getVariant("contact-button-class", CLASS_VARIANTS_MAP, "")}`}
        >
          {dyn.v3.getVariant("contact-button-text", TEXT_VARIANTS_MAP, getText("expert-message-button-label", "Contact"))}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            const raw = window.localStorage.getItem("autowork_hire_later_experts");
            const list = raw ? JSON.parse(raw) : [];
            const parsedList = Array.isArray(list) ? list : [];
            const existingIndex = parsedList.findIndex(
              (item: any) => (item.slug || item.name) === expert.slug
            );

            if (existingIndex >= 0) {
              parsedList.splice(existingIndex, 1);
              setIsHireLater(false);
              logEvent(EVENT_TYPES.HIRE_LATER_REMOVED, {
                expertSlug: expert.slug,
                expertName: expert.name,
                country: expert.country,
                role: expert.role,
                source: "expert_profile",
              });
            } else {
              parsedList.push({
                slug: expert.slug,
                name: expert.name,
                role: expert.role,
                country: expert.country,
                avatar: expert.avatar,
                rate: expert.rate,
              });
              setIsHireLater(true);
              logEvent(EVENT_TYPES.HIRE_LATER_ADDED, {
                expertSlug: expert.slug,
                expertName: expert.name,
                country: expert.country,
                role: expert.role,
                source: "expert_profile",
              });
            }

            window.localStorage.setItem("autowork_hire_later_experts", JSON.stringify(parsedList));
          }}
          className={`px-6 py-2.5 border-2 rounded-lg font-medium transition cursor-pointer ${
            isHireLater
              ? "border-orange-500 text-orange-700 bg-orange-50 hover:bg-orange-100"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          } ${dyn.v3.getVariant("hire-later-button-class", CLASS_VARIANTS_MAP, "")}`}
        >
          {dyn.v3.getVariant("hire-later-button-text", TEXT_VARIANTS_MAP, isHireLater ? "Remove hire later" : "Hire later")}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const newFavoriteState = !isFavorite;
            setIsFavorite(newFavoriteState);

            // Update localStorage
            try {
              const favoritesRaw = window.localStorage.getItem(
                "autowork_expert_favorites"
              );
              const favorites = favoritesRaw
                ? new Set(JSON.parse(favoritesRaw))
                : new Set<string>();

              if (newFavoriteState) {
                favorites.add(expert.name);
                logEvent(EVENT_TYPES.FAVORITE_EXPERT_SELECTED, {
                  expertSlug: expert.slug,
                  expertName: expert.name,
                  country: expert.country,
                  role: expert.role,
                  timestamp: Date.now(),
                  source: "expert_profile",
                });
              } else {
                favorites.delete(expert.name);
                logEvent(EVENT_TYPES.FAVORITE_EXPERT_REMOVED, {
                  expertSlug: expert.slug,
                  expertName: expert.name,
                  country: expert.country,
                  role: expert.role,
                  timestamp: Date.now(),
                  source: "expert_profile",
                });
              }

              window.localStorage.setItem(
                "autowork_expert_favorites",
                JSON.stringify(Array.from(favorites))
              );
            } catch (err) {
              console.error("Failed to save favorite:", err);
            }
          }}
          className={`p-2.5 border-2 rounded-lg transition cursor-pointer ${
            isFavorite
              ? "border-red-300 bg-red-50 hover:bg-red-100"
              : "border-gray-300 hover:bg-red-50 hover:border-red-300"
          } ${dyn.v3.getVariant("add-to-favorites-button-class", CLASS_VARIANTS_MAP, "")}`}
          id={dyn.v3.getVariant("add-to-favorites-button", ID_VARIANTS_MAP, "add-to-favorites-button")}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            className={`w-5 h-5 transition-colors ${
              isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
            }`}
            fill={isFavorite ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div
      className="bg-white rounded-xl shadow-lg p-6 mb-6"
      {...getElementAttributes("expert-profile-section", 0)}
    >
      <div
        className="text-lg font-semibold text-gray-900 mb-2"
        {...getElementAttributes("expert-role", 0)}
      >
        {expert.role}
      </div>
      {expert.desc && (
        <div
          className="text-gray-600 text-sm"
          {...getElementAttributes("expert-desc", 0)}
        >
          {expert.desc}
        </div>
      )}
    </div>
  );

  const renderStats = () => {
    if (!expert.stats) return null;
    return (
      <div
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
        {...getElementAttributes("expert-stats-section", 0)}
      >
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div
              className="text-2xl font-bold text-gray-900"
              {...getElementAttributes("stats-earnings-value", 0)}
            >
              {expert.stats.earnings || "$0"}
            </div>
            <div
              className="text-sm text-gray-600 mt-1"
              {...getElementAttributes("stats-earnings-label", 0)}
            >
              {getText("stats-earnings-label", "Total earnings")}
            </div>
          </div>
          <div>
            <div
              className="text-2xl font-bold text-gray-900"
              {...getElementAttributes("stats-jobs-value", 0)}
            >
              {expert.stats.jobs || expert.jobs || 0}
            </div>
            <div
              className="text-sm text-gray-600 mt-1"
              {...getElementAttributes("stats-jobs-label", 0)}
            >
              {getText("stats-jobs-label", "Total jobs")}
            </div>
          </div>
          <div>
            <div
              className="text-2xl font-bold text-gray-900"
              {...getElementAttributes("stats-hours-value", 0)}
            >
              {expert.stats.hours || 0}
            </div>
            <div
              className="text-sm text-gray-600 mt-1"
              {...getElementAttributes("stats-hours-label", 0)}
            >
              {getText("stats-hours-label", "Total hours")}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAbout = () => {
    if (!expert.about) return null;
    return (
      <div
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
        {...getElementAttributes("expert-about-section", 0)}
      >
        <h3
          className="font-bold text-lg mb-3"
          {...getElementAttributes("expert-about-title", 0)}
        >
          About
        </h3>
        <p
          className="text-gray-700 leading-relaxed"
          {...getElementAttributes("expert-about-text", 0)}
        >
          {expert.about}
        </p>
      </div>
    );
  };

  const renderReviews = () => {
    if (!expert.lastReview) return null;
    return (
      <div
        className="bg-green-50 rounded-xl shadow-lg p-6 mb-6 border border-green-100"
        {...getElementAttributes("expert-reviews-section", 0)}
      >
        <h3
          className="font-bold text-lg mb-4 text-green-700"
          {...getElementAttributes("expert-reviews-title", 0)}
        >
          Highly recommended
        </h3>
        <div className="flex items-center gap-2 mb-3">
          {[...Array(expert.lastReview.stars || 5)].map((_, i) => (
            <svg
              key={i}
              className="w-5 h-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.234c.969 0 1.371 1.24.588 1.81l-3.424 2.49a1 1 0 00-.364 1.118l1.286 3.965c.3.921-.755 1.688-1.539 1.118l-3.424-2.49a1 1 0 00-1.176 0l-3.424 2.49c-.783.57-1.838-.197-1.539-1.118l1.286-3.965a1 1 0 00-.364-1.118L2.22 9.392c-.783-.57-.38-1.81.588-1.81h4.234a1 1 0 00.95-.69l1.286-3.965z" />
            </svg>
          ))}
          <span className="text-sm font-semibold text-gray-700">
            {expert.lastReview.stars || 5}
          </span>
        </div>
        <div className="text-xs text-gray-600 mb-3">
          {expert.lastReview.dates}
        </div>
        <p className="text-gray-700 italic mb-4 text-sm leading-relaxed">
          "{expert.lastReview.text}"
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-600 border-t border-green-200 pt-3">
          <span className="font-semibold text-gray-700">
            {expert.lastReview.price}
          </span>
          <span>{expert.lastReview.rate}</span>
          <span>{expert.lastReview.time}</span>
        </div>
      </div>
    );
  };

  const renderJobsCompleted = () => {
    const sampleJobs = [
      {
        title: "E-commerce Platform Development",
        client: "Tech Startup",
        duration: "3 months",
        status: "Completed",
      },
      {
        title: "API Integration & Documentation",
        client: "Enterprise Corp",
        duration: "2 months",
        status: "Completed",
      },
      {
        title: "Mobile App Backend",
        client: "Mobile Solutions",
        duration: "4 months",
        status: "Completed",
      },
    ];

    return (
      <div
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
        {...getElementAttributes("expert-jobs-section", 0)}
      >
        <h3
          className="font-bold text-lg mb-4 flex items-center gap-2"
          {...getElementAttributes("expert-jobs-title", 0)}
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Recent Work
        </h3>
        <div className="space-y-4">
          {sampleJobs.map((job, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {job.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">{job.client}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {job.duration}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  {job.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSidebar = () => (
    <div
      className="space-y-6"
      {...getElementAttributes("expert-sidebar-section", 0)}
    >
      {/* Hours per week card */}
      {expert.hoursPerWeek && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h4
            className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2"
            {...getElementAttributes("sidebar-hours-label", 0)}
          >
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {getText("sidebar-hours-label", "Hours per week")}
          </h4>
          <div
            className="text-gray-900 font-medium"
            {...getElementAttributes("sidebar-hours-value", 0)}
          >
            {expert.hoursPerWeek}
          </div>
        </div>
      )}

      {/* Languages card */}
      {expert.languages && expert.languages.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h4
            className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2"
            {...getElementAttributes("sidebar-languages-label", 0)}
          >
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            {getText("sidebar-languages-label", "Languages")}
          </h4>
          <div className="space-y-2">
            {expert.languages.map((lang, i) => (
              <div
                key={i}
                className="text-gray-900 text-sm bg-gray-50 px-3 py-2 rounded-lg"
                {...getElementAttributes("sidebar-language-item", i)}
              >
                {lang}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verifications card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h4
          className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2"
          {...getElementAttributes("sidebar-verifications-label", 0)}
        >
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {getText("sidebar-verifications-label", "Verifications")}
        </h4>
        <div
          className="text-gray-900 text-sm"
          {...getElementAttributes("sidebar-verifications-value", 0)}
        >
          Verified as {expert.role.toLowerCase()}
        </div>
      </div>

      {/* Response Time card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-100">
        <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Response Time
        </h4>
        <div className="text-2xl font-bold text-blue-700 mb-1">&lt; 1 hour</div>
        <div className="text-xs text-gray-600">
          Usually responds within an hour
        </div>
      </div>

      {/* Availability card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Availability
        </h4>
        <div className="text-gray-900 text-sm font-medium mb-2">
          Available for new projects
        </div>
        <div className="text-xs text-gray-500">Open to proposals</div>
      </div>

      {/* Completion Rate card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Job Success Score
        </h4>
        <div className="text-2xl font-bold text-green-600 mb-1">98%</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: "98%" }}
          ></div>
        </div>
        <div className="text-xs text-gray-500">Based on completed jobs</div>
      </div>

      {/* Member Since card */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Member Since
        </h4>
        <div className="text-gray-900 text-sm font-medium">
          {new Date(2020, 0, 1).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {expert && <BookConsultationLogger expert={expert} />}
      {dyn.v1.addWrapDecoy("expert-profile-main", (
      <main className="max-w-6xl mx-auto px-5 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {expertSections
              .filter((section) =>
                [
                  "name",
                  "profile",
                  "stats",
                  "about",
                  "jobs",
                  "reviews",
                ].includes(section)
              )
              .map((section, index) => (
                <div key={`${section}-${index}`}>{renderSection(section)}</div>
              ))}
          </div>

          <div className="lg:col-span-1">
            {expertSections
              .filter((section) => section === "sidebar")
              .map((section, index) => (
                <div key={`${section}-${index}`}>{renderSection(section)}</div>
              ))}
          </div>
        </div>
      </main>
      ))}
      {contactOpen && expert && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Contact {expert.name}</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setContactOpen(false);
                  setContactMessage("");
                }}
              >
                ×
              </button>
            </div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Message
            </label>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className="w-full min-h-[140px] border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Write a short message to the expert..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setContactOpen(false);
                  setContactMessage("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                onClick={() => {
                  logEvent(EVENT_TYPES.CONTACT_EXPERT_MESSAGE_SENT, {
                    expertSlug: expert.slug,
                    expertName: expert.name,
                    country: expert.country,
                    role: expert.role,
                    rate: expert.rate,
                    rating: expert.rating,
                    messageLength: contactMessage.length,
                    message: contactMessage,
                  });
                  setContactOpen(false);
                  setContactMessage("");
                }}
              >
                Send message
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
