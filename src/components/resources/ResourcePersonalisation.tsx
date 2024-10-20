"use client";

import { Rating } from "@/enums/rating.enum";
import { useState } from "react";

interface ResourcePersonalisationProps {
  initialData: {
    rating: Rating;
    favoured: boolean;
  };
}

export default function ResourcePersonalisation({
  initialData,
}: ResourcePersonalisationProps) {
  const [rating, setRating] = useState<Rating>(initialData.rating);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [favoured, setFavoured] = useState(false);

  return (
    <div className="flex justify-between gap-2">
      <div>{rating === Rating.UP ? "thumbs up" : "not thumbs up"}</div>
      <div>{rating === Rating.DOWN ? "thumbs down" : "not thumbs down"}</div>
      <div>{favoured ? "heart" : "not heart"}</div>
    </div>
  );
}
