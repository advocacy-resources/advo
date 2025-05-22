// File: src/components/resources/ResourceCard.tsx
// Purpose: Reusable card component for displaying resource information with interactive elements.
// Owner: Advo Team

"use client";
import Link from "next/link";
import { Rating } from "@/enums/rating.enum";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppSelector } from "@/store/hooks";
import {
  PhoneIcon,
  MapPinIcon,
  ArrowRightIcon,
  BadgeCheck,
} from "lucide-react";
import { Address } from "@/interfaces/resource";
import { selectResourceById } from "@/store/slices/resourcesSlice";

/**
 * Props interface for the ResourceCard component.
 * Defines the minimum data needed to display a resource in card format.
 */
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

/**
 * Displays a resource in a card format with interactive elements.
 * Shows resource image, name, approval rating, and action buttons.
 * Fetches additional resource details from Redux store if available.
 *
 * @param props - The resource data to display in the card
 * @returns React component with the resource card UI
 */
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
  const [approvalPercentage, setApprovalPercentage] = useState<number>(0);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Checks if an address has all required fields for geocoding.
   * Used to determine whether to show the map button.
   * @param address - The address object to check
   * @returns Boolean indicating if the address is complete
   */
  const hasCompleteAddress = (address?: Address): boolean => {
    if (!address) return false;
    return !!(address.street && address.city && address.state);
  };

  /**
   * Formats an address object into a string for Google Maps URL.
   * @param address - The address object to format
   * @returns Formatted address string for Google Maps
   */
  const formatAddress = (address?: Address): string => {
    if (!address) return "";
    return `${address.street}, ${address.city}, ${address.state} ${address.zip || ""}`.trim();
  };

  // Convert numeric IDs to strings for consistent handling
  const safeId = typeof id === "string" ? id : String(id);

  // Retrieve complete resource data from Redux store if available
  const resourceFromStore = useAppSelector((state) =>
    selectResourceById(state, safeId),
  );

  /**
   * Calculates and sets the approval rating percentage from store data.
   * Handles loading states and edge cases like missing IDs.
   */
  useEffect(() => {
    // Set loading to false immediately if we have no valid ID
    if (!safeId || safeId === "unknown") {
      setIsLoading(false);
      return;
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
  }, [safeId, resourceFromStore]);

  /**
   * Determines the display text and color for the approval rating.
   * Changes color based on rating percentage (green for high, yellow for medium, red for low).
   * @returns Object with text and color class for the approval rating
   */
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
      <div className=" w-full border border-gray-700 bg-black text-white p-4 rounded-lg shadow-md">
        Loading resource...
      </div>
    );
  }

  return (
    <div
      data-testid="resource-card"
      className="w-full border border-gray-700 bg-black text-white transition-all duration-300 shadow-md overflow-hidden hover:shadow-lg hover:border-gray-500 flex flex-col"
    >
      <div className="flex flex-col justify-between h-full">
        {/* Top section with logo and title - wrapped in Link */}
        <div className="hover:bg-gray-800 cursor-pointer">
          <Link href={`/resources/${safeId}`} className="block">
            <div className="flex items-center px-2 py-2">
              <div className="w-[60px] h-[60px] flex-shrink-0 mr-4">
                <Image
                  src={
                    profilePhotoUrl ||
                    profilePhoto ||
                    `/api/resources/${safeId}/fallback-image`
                  }
                  alt={`${name} logo`}
                  width={60}
                  height={60}
                  className="rounded-md object-cover w-full h-full"
                  unoptimized={!!profilePhoto}
                />
              </div>
              <h3 className="text-lg font-semibold text-white line-clamp-2">
                {name}
              </h3>
            </div>
          </Link>

          {/* Horizontal rule with gradient animation */}
          <hr
            className="hr-gradient-hover mx-2 my-0"
            style={{ height: "1px", margin: "0" }}
          />
        </div>

        {/* Bottom section with approval rating and action buttons */}
        <div className="flex justify-between items-center px-3 py-2 bg-black">
          {/* Left section: Approval Rating and Verified Badge */}
          <div className="flex items-center gap-3">
            {/* Approval Rating with thumbs up icon */}
            <div className="flex items-center">
              <div className="mr-2">
                <Image
                  src="/thumbs-up.svg"
                  alt="Thumbs up"
                  width={24}
                  height={24}
                  className="w-[24px] h-[24px]"
                />
              </div>
              <span className="text-white font-bold text-base">
                {approvalPercentage}%
              </span>
            </div>

            {/* Verified Badge - only shown if resource is verified */}
            {resourceFromStore?.verified && (
              <div className="flex items-center">
                <BadgeCheck className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Phone Button - Only shown if phone number is available */}
            {resourceFromStore?.contact?.phone && (
              <a
                href={`tel:${resourceFromStore.contact.phone}`}
                className="text-gray-300 hover:text-white flex items-center justify-center"
                aria-label="Call resource"
                title="Call resource"
              >
                <PhoneIcon size={24} className="w-[24px] h-[24px]" />
              </a>
            )}

            {/* Map Button - Only shown if address is complete */}
            {hasCompleteAddress(resourceFromStore?.address) && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(resourceFromStore?.address))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white flex items-center justify-center"
                aria-label="View on map"
                title="View on map"
              >
                <MapPinIcon size={24} className="w-[24px] h-[24px]" />
              </a>
            )}

            {/* Details Button - Always enabled */}
            <Link
              href={`/resources/${safeId}`}
              className="text-gray-300 hover:text-white flex items-center justify-center"
              aria-label="View details"
              title="View details"
            >
              <ArrowRightIcon size={24} className="w-[24px] h-[24px]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
