import { useState, useEffect } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { Review } from "@/data/branchesData";
import { useReviews } from "@/hooks/useReviews";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReviewCardProps {
  review: Review;
  onHelpful: (reviewId: string) => void;
}

const ReviewCard = ({ review, onHelpful }: ReviewCardProps) => {
  return (
    <div className="p-3 bg-secondary/30 rounded-xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {review.userName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-card-foreground">
              {review.userName}
            </p>
            <p className="text-xs text-muted-foreground">{review.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3 h-3 ${
                star <= review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
      <button
        onClick={() => onHelpful(review.id)}
        className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <ThumbsUp className="w-3 h-3" />
        <span>Helpful ({review.helpful})</span>
      </button>
    </div>
  );
};

interface AddReviewSheetProps {
  branchId: string;
  branchName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddReviewSheet = ({
  branchId,
  branchName,
  open,
  onOpenChange,
}: AddReviewSheetProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const { addReview } = useReviews(branchId);

  const handleSubmit = () => {
    if (rating === 0 || !comment.trim()) return;

    addReview({
      userId: `user_${Date.now()}`,
      userName: "Anonymous User",
      rating,
      comment: comment.trim(),
    });

    setRating(0);
    setComment("");
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border/50 pb-4">
          <DrawerTitle className="text-center">Review {branchName}</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-4">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Tap to rate</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Your review</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this branch..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </DrawerClose>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || !comment.trim()}
              className="flex-1"
            >
              Submit Review
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ReviewCard;
