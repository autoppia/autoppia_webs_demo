"use client";

import { useState, useEffect, useCallback } from "react";
import { readJson, writeJson } from "@/shared/storage";
import { EVENT_TYPES, logEvent } from "@/library/events";

export interface Review {
  id: string;
  restaurantId: string;
  username: string;
  rating: number;
  comment: string;
  date: string;
}

const STORAGE_KEY = "autodiningReviews";
const SEED_REVIEW_COUNT_MIN = 3;
const SEED_REVIEW_COUNT_MAX = 5;

const SEED_USERNAMES = [
  "foodie_luna",
  "travelingfork",
  "citydiner",
  "brunchlover",
  "tablehunter",
  "cozyplates",
  "happyspoon",
  "urbanbite",
  "eatsbymike",
  "tastetracker",
];

const SEED_COMMENTS = [
  "Great atmosphere and very friendly staff. Would come back.",
  "Food arrived quickly and everything was really tasty.",
  "Excellent service and quality ingredients. Highly recommended.",
  "Perfect place for dinner with friends, cozy and well located.",
  "Loved the menu variety and the desserts were amazing.",
  "Very good value for the quality. Booking process was smooth.",
  "Portions were generous and the flavors felt authentic.",
  "Clean, elegant and consistent. Great option for special occasions.",
  "A solid choice in the area, attentive team and good timing.",
  "One of the best dining experiences I've had recently.",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function seededValue(seed: number, min: number, max: number): number {
  return min + (seed % (max - min + 1));
}

function generateSeedReviews(restaurantId: string): Review[] {
  const baseSeed = hashString(restaurantId);
  const count = seededValue(baseSeed, SEED_REVIEW_COUNT_MIN, SEED_REVIEW_COUNT_MAX);

  return Array.from({ length: count }, (_, index) => {
    const seed = hashString(`${restaurantId}-${index}`);
    const usernameBase = SEED_USERNAMES[seed % SEED_USERNAMES.length];
    const comment = SEED_COMMENTS[seed % SEED_COMMENTS.length];
    const rating = Number((4 + ((seed % 11) / 10)).toFixed(1));
    const daysAgo = seededValue(seed, 3, 120);
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    return {
      id: `seed-${restaurantId}-${index}`,
      restaurantId,
      username: `${usernameBase}${(seed % 89) + 10}`,
      rating,
      comment,
      date,
    };
  });
}

export function useReviews(restaurantId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);

  const loadReviews = useCallback(() => {
    const allReviews = readJson<Review[]>(STORAGE_KEY, []) || [];
    const hasReviewsForRestaurant = allReviews.some((r) => r.restaurantId === restaurantId);
    const mergedReviews = hasReviewsForRestaurant
      ? allReviews
      : [...generateSeedReviews(restaurantId), ...allReviews];

    if (!hasReviewsForRestaurant) {
      writeJson(STORAGE_KEY, mergedReviews);
    }

    setReviews(
      mergedReviews
        .filter((r) => r.restaurantId === restaurantId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  }, [restaurantId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const addReview = (username: string, rating: number, comment: string) => {
    const allReviews = readJson<Review[]>(STORAGE_KEY, []) || [];
    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      restaurantId,
      username,
      rating,
      comment,
      date: new Date().toISOString(),
    };
    const updated = [newReview, ...allReviews];
    writeJson(STORAGE_KEY, updated);

    logEvent(EVENT_TYPES.REVIEW_CREATED, {
      review_id: newReview.id,
      restaurant_id: restaurantId,
      username,
      rating,
      comment_length: comment.length,
    });

    loadReviews();
  };

  const updateReview = (id: string, rating: number, comment: string) => {
    const allReviews = readJson<Review[]>(STORAGE_KEY, []) || [];
    let updatedReview: Review | undefined;

    const nextReviews = allReviews.map(r => {
      if (r.id === id) {
        updatedReview = { ...r, rating, comment, date: new Date().toISOString() };
        return updatedReview;
      }
      return r;
    });

    writeJson(STORAGE_KEY, nextReviews);

    if (updatedReview) {
      logEvent(EVENT_TYPES.REVIEW_EDITED, {
        review_id: id,
        restaurant_id: restaurantId,
        username: updatedReview.username,
        rating,
        comment_length: comment.length,
      });
    }

    loadReviews();
  };

  const deleteReview = (id: string) => {
    const allReviews = readJson<Review[]>(STORAGE_KEY, []) || [];
    const toDelete = allReviews.find(r => r.id === id);
    const updated = allReviews.filter(r => r.id !== id);
    writeJson(STORAGE_KEY, updated);

    if (toDelete) {
      logEvent(EVENT_TYPES.REVIEW_DELETED, {
        review_id: id,
        restaurant_id: restaurantId,
        username: toDelete.username,
      });
    }

    loadReviews();
  };

  return {
    reviews,
    addReview,
    updateReview,
    deleteReview
  };
}
