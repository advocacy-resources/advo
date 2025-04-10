"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";

interface ReviewFormContentProps {
  content: string;
  setContent: (content: string) => void;
  isSubmitting: boolean;
  error?: string | null;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
  maxChars?: number;
  placeholder?: string;
}

const ReviewFormContent: React.FC<ReviewFormContentProps> = ({
  content,
  setContent,
  isSubmitting,
  error = null,
  onSubmit,
  onCancel,
  submitLabel,
  maxChars = 1000,
  placeholder = "Write your review here...",
}) => {
  return (
    <>
      <div className="grid gap-4 py-4">
        <Textarea
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[150px] text-black"
          maxLength={maxChars}
        />
        <div className="text-sm text-right text-gray-400">
          {content.length}/{maxChars} characters
        </div>
        {error && (
          <p className="text-red-500 text-sm text-center sm:text-left">
            {error}
          </p>
        )}
      </div>
      <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 pt-4">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={
            isSubmitting || !content.trim() || content.length > maxChars
          }
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
      </DialogFooter>
    </>
  );
};

export default ReviewFormContent;
