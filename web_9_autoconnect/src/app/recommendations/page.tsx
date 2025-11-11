"use client";
import { useEffect, useState } from "react";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { dynamicDataProvider } from "@/utils/dynamicDataProvider";
import { DataReadyGate } from "@/components/DataReadyGate";
import type { Recommendation } from "@/library/dataset";
import { useDynamicStructure } from "@/context/DynamicStructureContext";

function RecommendationsContent() {
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const recommendations = dynamicDataProvider.getRecommendations();
  const { getText } = useDynamicStructure();

  useEffect(() => {
    logEvent(EVENT_TYPES.VIEW_ALL_RECOMMENDATIONS, {
      source: "recommendations_page",
    });
  }, []);

  const toggleFollow = (id: string, title: string) => {
    const nowFollowing = !following[id];
    setFollowing((prev) => ({ ...prev, [id]: nowFollowing }));

    logEvent(EVENT_TYPES.FOLLOW_PAGE, {
      recommendation: title,
      action: nowFollowing ? "followed" : "unfollowed",
    });
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'user':
        return '👤';
      case 'job':
        return '💼';
      case 'company':
        return '🏢';
      case 'skill':
        return '🎯';
      case 'event':
        return '📅';
      default:
        return '💡';
    }
  };

  const getActionText = (type: string) => {
    switch (type) {
      case 'user':
        return 'Connect';
      case 'job':
        return 'Apply';
      case 'company':
        return 'Follow';
      case 'skill':
        return 'Learn';
      case 'event':
        return 'Attend';
      default:
        return 'View';
    }
  };

  return (
    <section className="max-w-3xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-6">AI-Generated Recommendations for you</h1>
      <p className="text-gray-600 mb-6">Personalized recommendations powered by AI</p>

      <ul className="flex flex-col gap-4">
        {recommendations.map((rec) => (
          <li
            key={rec.id}
            className="bg-white shadow rounded-lg p-6 flex items-start gap-4"
          >
            <div className="flex-shrink-0">
              {rec.image ? (
                <img
                  src={rec.image}
                  alt={rec.title}
                  className="w-16 h-16 rounded-full border bg-gray-100 object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full border bg-gray-100 flex items-center justify-center text-2xl">
                  {getRecommendationIcon(rec.type)}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {rec.category}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(rec.relevanceScore * 100)}% match
                </span>
              </div>

              <div className="font-semibold text-lg mb-1">{rec.title}</div>
              <div className="text-sm text-gray-600 mb-2">{rec.description}</div>
              <div className="text-sm text-gray-500 italic">"{rec.reason}"</div>

              {rec.metadata && (
                <div className="mt-2 text-xs text-gray-500">
                  {rec.metadata.location && <span>📍 {rec.metadata.location}</span>}
                  {rec.metadata.company && <span> • 🏢 {rec.metadata.company}</span>}
                  {rec.metadata.salary && <span> • 💰 {rec.metadata.salary}</span>}
                  {rec.metadata.skills && rec.metadata.skills.length > 0 && (
                    <span> • 🎯 {rec.metadata.skills.join(', ')}</span>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => toggleFollow(rec.id, rec.title)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition ${
                following[rec.id]
                  ? "bg-green-500 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {following[rec.id]
                ? getText("follow_following", "Following")
                : getText("follow_button", "+ Follow")}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function RecommendationsPage() {
  return (
    <DataReadyGate>
      <RecommendationsContent />
    </DataReadyGate>
  );
}
