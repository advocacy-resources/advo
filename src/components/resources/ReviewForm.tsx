"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import ReviewFormContent from "@/components/resources/ReviewFormContent";

interface ReviewFormProps {
  resourceId: string;
  onReviewAdded: () => void;
}

const ReviewForm = ({ resourceId, onReviewAdded }: ReviewFormProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const { data: session } = useSession();

  const MAX_CHARS = 1000;

  const handleSubmit = async () => {
    if (!session?.user) {
      setError("You must be logged in to submit a review");
      return;
    }

    if (!content.trim()) {
      setError("Review content cannot be empty");
      return;
    }

    if (content.length > MAX_CHARS) {
      setError(`Review must be ${MAX_CHARS} characters or less`);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/v1/resources/${resourceId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      setContent("");
      setIsOpen(false);
      onReviewAdded();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-4 w-full sm:w-auto">
          Add Your Review
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90%] max-w-[500px] text-white p-4 sm:p-6">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-xl">Share Your Experience</DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Tell others about your experience with this resource. Your review
            will help others make informed decisions.
          </DialogDescription>
        </DialogHeader>
        <ReviewFormContent
          content={content}
          setContent={setContent}
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
          submitLabel="Submit Review"
          maxChars={MAX_CHARS}
          placeholder="Write your review here..."
        />
      </DialogContent>
    </Dialog>
  );
};

export default ReviewForm;
