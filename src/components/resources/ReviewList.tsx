"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ReviewFormContent from "@/components/resources/ReviewFormContent";

interface Review {
  id: string;
  userId: string;
  resourceId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  User: {
    name: string;
  };
}

interface ReviewListProps {
  resourceId: string;
  refreshTrigger?: number;
}

const ReviewList = ({ resourceId, refreshTrigger = 0 }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const { data: session } = useSession();
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/resources/${resourceId}/reviews`);

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();
        setReviews(data.reviews);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [resourceId, refreshTrigger]);

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditContent(review.content);
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setIsDeleteDialogOpen(true);
  };

  const submitEditReview = async () => {
    if (!editingReview || !editContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/v1/resources/${resourceId}/reviews/${editingReview.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: editContent }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      // Update the review in the local state
      setReviews(
        reviews.map((r) =>
          r.id === editingReview.id ? { ...r, content: editContent } : r,
        ),
      );

      // Reset editing state
      setEditingReview(null);
      setEditContent("");
    } catch (err) {
      console.error("Error updating review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      const response = await fetch(
        `/api/v1/resources/${resourceId}/reviews/${reviewToDelete}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      // Remove the review from the local state
      setReviews(reviews.filter((r) => r.id !== reviewToDelete));

      // Reset delete state
      setReviewToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  const isCurrentUserReview = (review: Review) => {
    return session?.user?.id === review.userId;
  };

  if (isLoading) {
    return (
      <div className="text-center py-4 text-sm md:text-base">
        Loading reviews...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 py-4 text-center text-sm md:text-base">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400 text-sm md:text-base">
        No reviews yet. Be the first to share your experience!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Edit Review Dialog */}
      {editingReview && (
        <Dialog
          open={!!editingReview}
          onOpenChange={(open) => !open && setEditingReview(null)}
        >
          <DialogContent className="w-[90%] max-w-[500px] text-white p-4 sm:p-6">
            <DialogHeader className="text-center sm:text-left">
              <DialogTitle className="text-xl">Edit Your Review</DialogTitle>
              <DialogDescription className="text-sm md:text-base">
                Make changes to your review below.
              </DialogDescription>
            </DialogHeader>
            <ReviewFormContent
              content={editContent}
              setContent={setEditContent}
              isSubmitting={isSubmitting}
              error={error}
              onSubmit={submitEditReview}
              onCancel={() => setEditingReview(null)}
              submitLabel={isSubmitting ? "Saving..." : "Save Changes"}
              maxChars={1000}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[90%] max-w-[400px] text-white p-4 sm:p-6">
          <DialogHeader className="text-center sm:text-left">
            <DialogTitle className="text-xl">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              Are you sure you want to delete this review? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteReview}
                className="w-full sm:w-auto"
              >
                Delete
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reviews List */}
      {reviews.map((review) => (
        <div key={review.id} className="bg-gray-900 p-4 rounded-md">
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-3 sm:mb-2">
            <h4 className="font-medium text-center sm:text-left">
              {review.User?.name || "Anonymous User"}
            </h4>
            <span className="text-sm text-gray-400 mt-1 sm:mt-0">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-200 text-center sm:text-left">
            {review.content}
          </p>

          {/* Edit/Delete buttons for user's own reviews */}
          {isCurrentUserReview(review) && (
            <div className="flex justify-center sm:justify-end mt-3 space-x-2">
              <Button
                variant="outline"
                onClick={() => handleEditReview(review)}
                className="text-xs px-2 py-1 h-8"
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteReview(review.id)}
                className="text-xs px-2 py-1 h-8"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
