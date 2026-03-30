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

export function useReviews(restaurantId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);

  const loadReviews = useCallback(() => {
    const allReviews = readJson<Review[]>(STORAGE_KEY, []) || [];
    setReviews(allReviews.filter(r => r.restaurantId === restaurantId));
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
