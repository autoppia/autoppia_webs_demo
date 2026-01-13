"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Filter, SortAsc, SortDesc } from "lucide-react";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/lib/utils";
import type { Doctor } from "@/data/doctors";
import { initializeDoctorReviews } from "@/data/reviews-enhanced";

interface DoctorReviewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor | null;
}

function Stars({ value }: { value: number }) {
  const stars = Array.from({ length: 5 }).map((_, i) => {
    const active = value >= i + 1 - 1e-6 || value > i && value < i + 1;
    return (
      <Star key={i} className={`h-4 w-4 ${active ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground"}`} />
    );
  });
  return <div className="flex items-center gap-1">{stars}</div>;
}

export function DoctorReviewsModal({ open, onOpenChange, doctor }: DoctorReviewsModalProps) {
  const dyn = useDynamicSystem();
  const [filterRating, setFilterRating] = React.useState<number | null>(null);
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [reviews, setReviews] = React.useState<Array<{ rating: number; comment: string; patientName: string; date: string }>>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!open || !doctor) return;
      setLoading(true);
      try {
        const data = await initializeDoctorReviews({ id: doctor.id, name: doctor.name, specialty: (doctor as any).specialty });
        if (mounted) setReviews(Array.isArray(data) ? data : []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [open, doctor]);

  const baseReviews = Array.isArray(doctor?.patientReviews) ? doctor!.patientReviews : [];
  const allReviews = doctor ? [...baseReviews, ...reviews] : [];

  const filteredAndSortedReviews = React.useMemo(() => {
    let filtered = allReviews;

    // Filter by rating
    if (filterRating !== null) {
      filtered = filtered.filter(review => review.rating === filterRating);
    }

    // Sort reviews
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return sorted;
  }, [allReviews, filterRating, sortOrder]);

  const ratingStats = React.useMemo(() => {
    const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach(review => {
      stats[review.rating as keyof typeof stats]++;
    });
    return stats;
  }, [allReviews]);

  const averageRating = React.useMemo(() => {
    if (allReviews.length === 0) return 0;
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / allReviews.length;
  }, [allReviews]);

  const handleFilterChange = (rating: number | null) => {
    setFilterRating(rating);
    logEvent(EVENT_TYPES.FILTER_REVIEWS, {
      doctorId: doctor?.id,
      doctorName: doctor?.name,
      specialty: doctor?.specialty,
      filterRating: rating
    });
  };

  const handleSortChange = (order: "newest" | "oldest" | "highest" | "lowest") => {
    setSortOrder(order);
    logEvent(EVENT_TYPES.SORT_REVIEWS, {
      doctorId: doctor?.id,
      doctorName: doctor?.name,
      specialty: doctor?.specialty,
      sortOrder: order
    });
  };

  const handleClose = () => {
    logEvent(EVENT_TYPES.CANCEL_VIEW_REVIEWS, {
      doctorId: doctor?.id,
      doctorName: doctor?.name,
      specialty: doctor?.specialty
    });
    onOpenChange(false);
  };

  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Reviews - {doctor.name}</DialogTitle>
          <DialogDescription>
            Read what patients are saying about {doctor.name} ({doctor.specialty})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating Summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                  <Stars value={averageRating} />
                  <div className="text-sm text-muted-foreground mt-1">
                    Based on {allReviews.length} reviews
                  </div>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2 mb-1">
                      <span className="text-sm w-8">{rating}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ 
                            width: `${allReviews.length > 0 ? (ratingStats[rating as keyof typeof ratingStats] / allReviews.length) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">
                        {ratingStats[rating as keyof typeof ratingStats]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium">Filter by rating:</span>
              <Button
                className={cn(dyn.v3.getVariant("review-filter-all-button", CLASS_VARIANTS_MAP, ""))}
                variant={filterRating === null ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(null)}
              >
                All
              </Button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Button
                  key={rating}
                  className={cn(dyn.v3.getVariant(`review-filter-${rating}-button`, CLASS_VARIANTS_MAP, ""))}
                  variant={filterRating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange(rating)}
                >
                  {rating}★
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <select
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value as "newest" | "oldest" | "highest" | "lowest")}
                className={cn("p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", dyn.v3.getVariant("select", CLASS_VARIANTS_MAP, ""))}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredAndSortedReviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reviews found for the selected filter.
              </div>
            ) : (
              filteredAndSortedReviews.map((review, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {review.patientName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.patientName}</span>
                          <Badge variant="outline" className="text-xs">
                            Verified Patient
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Stars value={review.rating} />
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground ml-13">
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          {dyn.v1.addWrapDecoy("close-reviews-button", (
            <Button 
              className={cn(dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""))}
              variant="outline" 
              onClick={handleClose}
            >
              {dyn.v3.getVariant("close", TEXT_VARIANTS_MAP, "Close")}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
