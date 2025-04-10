"use client";
import Link from "next/link";
import { Rating } from "@/enums/rating.enum";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface ResourceCardProps {
  id: string | number;
  name: string;
  description: string;
  category: string;
  type: string[];
  rating: Rating;
  favored: boolean;
  profilePhoto?: string | null;
  profilePhotoUrl?: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  id,
  name,
  description,
  category,
  type,
  rating: initialRating,
  favored: initialFavored,
  profilePhoto,
  profilePhotoUrl,
}) => {
  const { data: session } = useSession();
  const [currentRating, setCurrentRating] = useState<Rating>(
    initialRating || Rating.NULL,
  );
  const [isFavored, setIsFavored] = useState<boolean>(initialFavored || false);
  const [approvalPercentage, setApprovalPercentage] = useState<number>(0);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial rating and favorite status
  useEffect(() => {
    const fetchRatingData = async () => {
      try {
        const ratingResponse = await fetch(`/api/v1/resources/${id}/rating`);
        if (ratingResponse.ok) {
          const ratingData = await ratingResponse.json();
          setCurrentRating(ratingData.userRating);
          setApprovalPercentage(ratingData.approvalPercentage);
          setTotalVotes(ratingData.totalVotes);
        }

        const favoriteResponse = await fetch(
          `/api/v1/resources/${id}/favorite`,
        );
        if (favoriteResponse.ok) {
          const favoriteData = await favoriteResponse.json();
          setIsFavored(favoriteData.isFavorited);
        }
      } catch (error) {
        console.error("Error fetching resource data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRatingData();
    }
  }, [id]);

  const handleRatingUp = async () => {
    if (!session) return;

    const newRating = currentRating === Rating.UP ? Rating.NULL : Rating.UP;

    try {
      const response = await fetch(`/api/v1/resources/${id}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating: newRating }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentRating(newRating);
        setApprovalPercentage(data.approvalPercentage);
        setTotalVotes(data.upvotes + data.downvotes);
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  const handleRatingDown = async () => {
    if (!session) return;

    const newRating = currentRating === Rating.DOWN ? Rating.NULL : Rating.DOWN;

    try {
      const response = await fetch(`/api/v1/resources/${id}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating: newRating }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentRating(newRating);
        setApprovalPercentage(data.approvalPercentage);
        setTotalVotes(data.upvotes + data.downvotes);
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/v1/resources/${id}/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavored(data.isFavorited);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Helper function to determine approval rating display
  const getApprovalRatingDisplay = () => {
    if (totalVotes === 0) {
      return { text: "No ratings yet", color: "text-gray-400" };
    }

    if (approvalPercentage >= 70) {
      return { text: `${approvalPercentage}%`, color: "text-green-500" };
    }
    if (approvalPercentage <= 30) {
      return { text: `${approvalPercentage}%`, color: "text-red-500" };
    }

    return { text: `${approvalPercentage}%`, color: "text-yellow-500" };
  };

  const approvalRating = getApprovalRatingDisplay();

  if (isLoading) {
    return (
      <div className="h-full w-full border border-gray-700 bg-black text-white p-4 rounded-lg shadow-md">
        Loading resource...
      </div>
    );
  }

  return (
    <div
      data-testid="resource-card"
      className="h-full w-full border border-gray-700 bg-black text-white transition-colors duration-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg"
    >
      {/* Link wrapping the top part of the card */}
      <Link href={`/resources/${id}`} className="block">
        <div className="p-4 hover:bg-gray-800 cursor-pointer">
          {/* Image and Title Row */}
          <div className="flex items-center gap-4">
            <Image
              src={
                profilePhotoUrl || profilePhoto || "/images/tulsa-center.png"
              }
              alt={`${name} logo`}
              width={100}
              height={100}
              className="rounded-md object-cover"
              unoptimized={!!profilePhoto} // Skip Next.js image optimization for data URLs
            />
            <div className="text-xl font-semibold text-white">{name}</div>
          </div>

          <div className="text-gray-300 mt-2">{description}</div>
          <div className="text-sm text-gray-400 mt-1">
            <span className="mr-2">
              Category: {category || "Uncategorized"}
            </span>
            <span>
              Type: {type && type.length > 0 ? type.join(", ") : "None"}
            </span>
          </div>
          <hr className="h-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 border-0 rounded-full my-4" />
        </div>
      </Link>

      {/* Approval Rating and Buttons */}
      <div className="flex justify-between items-center p-4">
        {/* Approval Rating */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Approval Rating:</span>
          <div className="flex flex-col">
            <span className={`text-lg font-bold ${approvalRating.color}`}>
              {approvalRating.text}
            </span>
            <span className="text-xs text-gray-400">
              {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentRating === Rating.UP ? "bg-green-600" : "bg-gray-700"
            } text-white ${!session ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleRatingUp}
            disabled={!session}
            aria-label={session ? "Rate up" : "Sign in to rate up"}
            title={session ? "Rate up" : "Sign in to rate up"}
          >
            👍
          </button>
          <button
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentRating === Rating.DOWN ? "bg-red-600" : "bg-gray-700"
            } text-white ${!session ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleRatingDown}
            disabled={!session}
            aria-label={session ? "Rate down" : "Sign in to rate down"}
            title={session ? "Rate down" : "Sign in to rate down"}
          >
            👎
          </button>
          <button
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isFavored ? "bg-pink-600" : "bg-gray-700"
            } text-white ${!session ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleToggleFavorite}
            disabled={!session}
            aria-label={session ? "Favorite" : "Sign in to favorite"}
            title={session ? "Favorite" : "Sign in to favorite"}
          >
            ❤️
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
