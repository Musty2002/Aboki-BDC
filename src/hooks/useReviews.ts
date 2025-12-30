import { useState, useEffect, useCallback } from "react";
import { Review } from "@/data/branchesData";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "bdc_branch_reviews";

// Sample initial reviews
const sampleReviews: Record<string, Review[]> = {
  "abuja-wuse": [
    {
      id: "r1",
      userId: "u1",
      userName: "Chisom A.",
      rating: 5,
      comment: "Excellent rates and very professional staff. Quick service!",
      date: "2024-12-28",
      helpful: 12,
    },
    {
      id: "r2",
      userId: "u2",
      userName: "Emeka O.",
      rating: 4,
      comment: "Good rates but sometimes the queue is long during peak hours.",
      date: "2024-12-25",
      helpful: 8,
    },
  ],
  "lagos-vi": [
    {
      id: "r3",
      userId: "u3",
      userName: "Folake B.",
      rating: 5,
      comment: "Best rates on the island! I always come here for my forex needs.",
      date: "2024-12-27",
      helpful: 15,
    },
  ],
  "abuja-maitama": [
    {
      id: "r4",
      userId: "u4",
      userName: "Ibrahim M.",
      rating: 5,
      comment: "Premium service, competitive rates. Highly recommended!",
      date: "2024-12-29",
      helpful: 6,
    },
  ],
};

export const useReviews = (branchId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  // Load reviews from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let allReviews: Record<string, Review[]> = {};
    
    if (stored) {
      try {
        allReviews = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse reviews:", e);
        allReviews = { ...sampleReviews };
      }
    } else {
      allReviews = { ...sampleReviews };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));
    }
    
    setReviews(allReviews[branchId] || []);
  }, [branchId]);

  const addReview = useCallback(
    (review: Omit<Review, "id" | "date" | "helpful">) => {
      const newReview: Review = {
        ...review,
        id: `review_${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        helpful: 0,
      };

      setReviews((prev) => {
        const updated = [newReview, ...prev];
        
        // Update localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        const allReviews = stored ? JSON.parse(stored) : { ...sampleReviews };
        allReviews[branchId] = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));
        
        return updated;
      });

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });

      return newReview;
    },
    [branchId]
  );

  const markHelpful = useCallback(
    (reviewId: string) => {
      setReviews((prev) => {
        const updated = prev.map((r) =>
          r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
        );
        
        // Update localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        const allReviews = stored ? JSON.parse(stored) : { ...sampleReviews };
        allReviews[branchId] = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));
        
        return updated;
      });
    },
    [branchId]
  );

  const getAverageRating = useCallback(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  return {
    reviews,
    addReview,
    markHelpful,
    getAverageRating,
  };
};
