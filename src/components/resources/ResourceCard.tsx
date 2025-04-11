"use client";
import Link from "next/link";
import { Rating } from "@/enums/rating.enum";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite, setResourceRating } from "@/store/slices/userSlice";
import { selectResourceById } from "@/store/slices/resourcesSlice";

interface ResourceCardProps {
  id: string | number;
  name: string;
  description: string;
  category: string; // First category from the array
  type: string[]; // Using the full category array as type
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
  const dispatch = useAppDispatch();
  const userRatings = useAppSelector((state) => state.user.ratings);
  const userFavorites = useAppSelector((state) => state.user.favorites);
  const [currentRating, setCurrentRating] = useState<Rating>(
    initialRating || Rating.NULL,
  );
  const [isFavored, setIsFavored] = useState<boolean>(initialFavored || false);
  const [approvalPercentage, setApprovalPercentage] = useState<number>(0);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Ensure we have a valid string ID
  const safeId = typeof id === 'string' ? id : String(id);
  
  // Get the full resource from Redux if available
  const resourceFromStore = useAppSelector(state => selectResourceById(state, safeId));

  // Debug the processed ID
  // Debug the link href
  useEffect(() => {
    console.log("Link href value:", {
      safeId,
      href: safeId !== "unknown" ? `/resources/${safeId}` : "#",
    });
  }, [safeId]);
  console.log("Resource ID after processing:", {
    safeId,
  });
// Use Redux state for ratings and favorites
useEffect(() => {
  // Set loading to false immediately if we have no valid ID
  if (!safeId || safeId === "unknown") {
    setIsLoading(false);
    return;
  }

  // Use data from Redux if available
  if (safeId in userRatings) {
    setCurrentRating(userRatings[safeId]);
  }
  
  if (safeId in userFavorites) {
    setIsFavored(userFavorites[safeId]);
  }
  
  // Set loading to false after we've processed the data
  setIsLoading(false);
  
  // If we have the resource in the store, we can get approval data from it
  if (resourceFromStore) {
    const upvotes = resourceFromStore.upvoteCount || 0;
    // Since we don't have a downvotes property, we'll estimate it from approval percentage
    // or just use a default value of 0
    const downvotes = 0;
    const total = upvotes + downvotes;
    
    if (total > 0) {
      const percentage = Math.round((upvotes / total) * 100);
      setApprovalPercentage(percentage);
      setTotalVotes(total);
    }
  }
}, [safeId, userRatings, userFavorites, resourceFromStore]);

  const handleRatingUp = async () => {
    if (!session || !safeId || safeId === "unknown") return;

    const newRating = currentRating === Rating.UP ? Rating.NULL : Rating.UP;

    try {
      // Ensure we have a valid ID before dispatching
      if (safeId && safeId !== "unknown") {
        // Dispatch the action to update the rating in Redux
        const resultAction = await dispatch(
          setResourceRating({ resourceId: safeId, rating: newRating }),
        );
        if (resultAction && setResourceRating.fulfilled.match(resultAction)) {
          // Update local state with the result
          setCurrentRating(newRating);
          setApprovalPercentage(resultAction.payload.approvalPercentage);
          setTotalVotes(resultAction.payload.totalVotes);
        }
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  const handleRatingDown = async () => {
    if (!session || !safeId || safeId === "unknown") return;

    const newRating = currentRating === Rating.DOWN ? Rating.NULL : Rating.DOWN;

    try {
      // Ensure we have a valid ID before dispatching
      if (safeId && safeId !== "unknown") {
        // Dispatch the action to update the rating in Redux
        const resultAction = await dispatch(
          setResourceRating({ resourceId: safeId, rating: newRating }),
        );
        if (resultAction && setResourceRating.fulfilled.match(resultAction)) {
          // Update local state with the result
          setCurrentRating(newRating);
          setApprovalPercentage(resultAction.payload.approvalPercentage);
          setTotalVotes(resultAction.payload.totalVotes);
        }
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!session || !safeId || safeId === "unknown") return;

    try {
      // Ensure we have a valid ID before dispatching
      if (safeId && safeId !== "unknown") {
        // Dispatch the action to toggle favorite in Redux
        const resultAction = await dispatch(toggleFavorite(safeId));
        if (resultAction && toggleFavorite.fulfilled.match(resultAction)) {
          // Update local state with the result
          setIsFavored(resultAction.payload.isFavorited);
        }
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
      className="h-full w-full border border-gray-700 bg-black text-white transition-all duration-300 rounded-lg shadow-md overflow-hidden hover:shadow-lg hover:border-gray-500 flex flex-col"
    >
      {/* Link wrapping the top part of the card */}
      <Link
        href={`/resources/${safeId}`}
        className="block flex-1 min-h-[280px] flex flex-col"
      >
        <div className="p-4 hover:bg-gray-800 cursor-pointer flex-1 flex flex-col">
          {/* Image and Title Row */}
          <div className="flex items-center gap-4 mb-3">
            <div className="w-[80px] h-[80px] flex-shrink-0">
              <Image
                src={
                  profilePhotoUrl || profilePhoto || "/images/tulsa-center.png"
                }
                alt={`${name} logo`}
                width={80}
                height={80}
                className="rounded-md object-cover w-full h-full"
                unoptimized={!!profilePhoto} // Skip Next.js image optimization for data URLs
              />
            </div>
            <h3 className="text-xl font-semibold text-white line-clamp-2">
              {name}
            </h3>
          </div>

          <div className="text-gray-300 mt-2 line-clamp-3 mb-auto">
            {description}
          </div>

          <div className="text-sm text-gray-400 mt-3">
            <span className="inline-block bg-gray-800 text-xs px-2 py-1 rounded-full mr-2">
              {category || "Uncategorized"}
            </span>
            <span className="text-xs">
              {type && type.length > 0 ? type.join(", ") : "None"}
            </span>
          </div>
          <hr className="hr-gradient-hover" />
        </div>
      </Link>

      {/* Approval Rating and Buttons */}
      <div className="flex justify-between items-center p-4 bg-gray-900 h-[80px] mt-auto">
        {/* Approval Rating */}
        <div className="flex items-center gap-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${approvalRating.color} bg-opacity-20`}
          >
            <span className={`text-sm font-bold ${approvalRating.color}`}>
              {approvalPercentage}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">
              {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentRating === Rating.UP ? "bg-green-600" : "bg-gray-700"
            } text-white ${!session ? "opacity-50 cursor-not-allowed" : ""} transition-colors duration-200 hover:bg-opacity-80`}
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
            } text-white ${!session ? "opacity-50 cursor-not-allowed" : ""} transition-colors duration-200 hover:bg-opacity-80`}
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
            } text-white ${!session ? "opacity-50 cursor-not-allowed" : ""} transition-colors duration-200 hover:bg-opacity-80`}
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
