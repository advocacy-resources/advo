"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { ThumbsUp, ThumbsDown, Heart, BadgeCheck } from "lucide-react";
import ReviewList from "@/components/resources/ReviewList";
import ReviewForm from "@/components/resources/ReviewForm";
import { Resource } from "@/interfaces/resource";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchResourceById,
  selectResourceById,
  selectResourcesState,
} from "@/store/slices/resourcesSlice";
import {
  toggleFavorite,
  setResourceRating,
  fetchUserData,
  setUserId,
} from "@/store/slices/userSlice";
import { Rating } from "@/enums/rating.enum";

// Dynamically import the MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/sidebar/SidebarMap"), {
  ssr: false,
});

interface ResourcePageProps {
  params: { id: string };
}
interface Address {
  street: string;
  city: string;
  state: string;
  zip?: string;
}

interface Contact {
  phone?: string;
  email?: string;
  website?: string;
}

interface OperatingHours {
  [key: string]: { open: string; close: string };
}

// This component is now client-side, so we need to fetch data differently
const VerifiedCircle = () => <BadgeCheck className="h-6 w-6 text-green-500" />;

const ResourcePage = ({ params }: ResourcePageProps) => {
  const dispatch = useAppDispatch();
  const resourceFromStore = useAppSelector((state) =>
    selectResourceById(state, params.id),
  );
  const resourcesState = useAppSelector(selectResourcesState);
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const { data: session } = useSession();
  const userRatings = useAppSelector((state) => state.user.ratings);
  const userFavorites = useAppSelector((state) => state.user.favorites);
  const [currentRating, setCurrentRating] = useState<Rating>(Rating.NULL);
  const [isFavored, setIsFavored] = useState<boolean>(false);
  const defaultBanner = "/resourcebannerimage.png";
  const defaultProfilePhoto = "/images/advo-logo-color.png";

  // Fetch resource data using Redux
  useEffect(() => {
    const fetchResourceData = async () => {
      try {
        // Check if we already have the resource with detailed data in the store
        const hasDetailedData = resourcesState.detailsLoaded[params.id];

        // Only use the resource from the store if it has detailed data loaded
        if (resourceFromStore && hasDetailedData) {
          console.log(
            "Using resource from store with detailed data:",
            resourceFromStore,
          );
          setResource(resourceFromStore);

          // Handle address geocoding
          const address = resourceFromStore.address as unknown as Address;
          const addressString =
            address && address.street && address.city && address.state
              ? `${address.street}, ${address.city}, ${address.state}${address.zip ? " " + address.zip : ""}`
              : "";

          if (addressString) {
            const geocoded = await fetch(
              `/api/geocode?address=${encodeURIComponent(addressString)}`,
            );
            if (geocoded.ok) {
              const locationData = await geocoded.json();
              setLocation(locationData);
            }
          }

          setLoading(false);
          return;
        }

        console.log("Fetching resource from API:", params.id);

        // Otherwise, fetch it using the Redux action
        const resultAction = await dispatch(fetchResourceById(params.id));

        if (fetchResourceById.fulfilled.match(resultAction)) {
          setResource(resultAction.payload.resource);

          // Handle address geocoding
          const address = resultAction.payload.resource
            .address as unknown as Address;
          const addressString =
            address && address.street && address.city && address.state
              ? `${address.street}, ${address.city}, ${address.state}${address.zip ? " " + address.zip : ""}`
              : "";

          if (addressString) {
            const geocoded = await fetch(
              `/api/geocode?address=${encodeURIComponent(addressString)}`,
            );
            if (geocoded.ok) {
              const locationData = await geocoded.json();
              setLocation(locationData);
            }
          }
        } else {
          setError("Failed to fetch resource");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchResourceData();
  }, [params.id, dispatch, resourceFromStore, resourcesState.detailsLoaded]);

  // Handle review refresh
  // Set user ID and fetch user data when session is available
  useEffect(() => {
    if (session?.user?.id) {
      // Set the user ID in the Redux store
      dispatch(setUserId(session.user.id));
      // Fetch user data from the server
      dispatch(fetchUserData());
    }
  }, [session, dispatch]);

  // Load user's rating and favorite status
  useEffect(() => {
    if (session && params.id) {
      // Load rating from Redux if available
      if (params.id in userRatings) {
        setCurrentRating(userRatings[params.id]);
      }

      // Load favorite status from Redux if available
      if (params.id in userFavorites) {
        setIsFavored(userFavorites[params.id]);
      }
    }
  }, [session, params.id, userRatings, userFavorites]);

  // Handle rating up
  const handleRatingUp = async () => {
    if (!session || !params.id) return;

    const newRating = currentRating === Rating.UP ? Rating.NULL : Rating.UP;

    try {
      // Dispatch the action to update the rating in Redux
      const resultAction = await dispatch(
        setResourceRating({ resourceId: params.id, rating: newRating }),
      );
      if (resultAction && setResourceRating.fulfilled.match(resultAction)) {
        // Update local state with the result
        setCurrentRating(newRating);
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  // Handle rating down
  const handleRatingDown = async () => {
    if (!session || !params.id) return;

    const newRating = currentRating === Rating.DOWN ? Rating.NULL : Rating.DOWN;

    try {
      // Dispatch the action to update the rating in Redux
      const resultAction = await dispatch(
        setResourceRating({ resourceId: params.id, rating: newRating }),
      );
      if (resultAction && setResourceRating.fulfilled.match(resultAction)) {
        // Update local state with the result
        setCurrentRating(newRating);
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async () => {
    if (!session || !params.id) return;

    try {
      // Dispatch the action to toggle favorite in Redux
      const resultAction = await dispatch(toggleFavorite(params.id));
      if (resultAction && toggleFavorite.fulfilled.match(resultAction)) {
        // Update local state with the result
        setIsFavored(resultAction.payload.isFavorited);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleReviewAdded = () => {
    setRefreshReviews((prev) => prev + 1);
  };

  if (loading) {
    return <div className="text-center py-8">Loading resource...</div>;
  }

  if (error || !resource) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: {error || "Resource not found"}
      </div>
    );
  }

  // Cast JSON values to their respective types
  const address = resource.address as unknown as Address;
  const contact = resource.contact as unknown as Contact;
  const operatingHours = resource.operatingHours as unknown as OperatingHours;

  return (
    <div className="relative">
      {" "}
      {/* Remove top padding to allow banner to go behind navbar */}
      {/* Banner Section - Extends behind navbar but scrolls with content */}
      <div className="relative w-full h-80 overflow-hidden -mt-16 pt-0">
        {" "}
        {/* Negative margin to extend behind navbar */}
        <Image
          src={resource.bannerImageUrl || resource.bannerImage || defaultBanner}
          alt="Resource Banner"
          fill
          style={{ objectFit: "cover" }}
          priority
          unoptimized={!!resource.bannerImage}
        />
        {/* Gradient overlay to improve text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60"></div>
      </div>
      {/* Main Content Section */}
      <div className="relative z-10">
        {" "}
        {/* Add z-index to ensure content is above banner */}
        <div className="flex flex-col gap-6 md:gap-8 p-4 pt-8 md:p-8 md:pt-8 mx-auto w-full max-w-2xl text-white -mt-20">
          {" "}
          {/* Negative margin to overlap with banner */}
          {/* Logo and Name */}
          <section className="mb-6 mt-24">
            {" "}
            {/* Increased top margin to position below navbar */}
            {/* Logo and Name */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left bg-black bg-opacity-70 p-4 rounded-lg">
              {/* Profile Photo */}
              <div className="w-20 h-20 sm:w-16 sm:h-16">
                <Image
                  src={
                    resource.profilePhotoUrl ||
                    resource.profilePhoto ||
                    defaultProfilePhoto
                  }
                  alt={`${resource.name} logo`}
                  width={80}
                  height={80}
                  className="rounded-md"
                  style={{ objectFit: "cover" }}
                  unoptimized={!!resource.profilePhoto}
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {resource.name}
              </h1>
            </div>
            {/* Centered Icons and Stats */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-4 bg-black bg-opacity-70 p-3 rounded-lg">
              {/* Rating Section */}
              <div className="flex items-center gap-4">
                {/* Thumbs Up and Rating */}
                <div className="flex items-center gap-2">
                  <Image
                    src="/thumbs-up.svg"
                    alt="Thumbs Up"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                  <span className="text-sm">
                    {resource.upvoteCount
                      ? `${resource.upvoteCount} upvotes`
                      : "No rating yet"}
                  </span>
                </div>

                {/* Rating Buttons - Only shown if user is logged in */}
                {session && (
                  <div className="flex items-center gap-2">
                    <button
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentRating === Rating.UP
                          ? "bg-green-600"
                          : "bg-gray-700"
                      } text-white transition-colors duration-200 hover:bg-opacity-80`}
                      onClick={handleRatingUp}
                      aria-label="Rate up"
                      title="Rate up"
                    >
                      <ThumbsUp size={18} />
                    </button>
                    <button
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentRating === Rating.DOWN
                          ? "bg-red-600"
                          : "bg-gray-700"
                      } text-white transition-colors duration-200 hover:bg-opacity-80`}
                      onClick={handleRatingDown}
                      aria-label="Rate down"
                      title="Rate down"
                    >
                      <ThumbsDown size={18} />
                    </button>
                    <button
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isFavored ? "bg-pink-600" : "bg-gray-700"
                      } text-white transition-colors duration-200 hover:bg-opacity-80`}
                      onClick={handleToggleFavorite}
                      aria-label="Favorite"
                      title="Favorite"
                    >
                      <Heart
                        size={18}
                        fill={isFavored ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* Verified Listing - Only shown if resource is verified */}
              {resource.verified && (
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-6 w-6 text-green-500" />
                  <span className="text-lg">Verified Listing</span>
                </div>
              )}
            </div>
            {/* Description */}
            <p className="mt-4 text-base md:text-lg text-center sm:text-left bg-black bg-opacity-70 p-4 rounded-lg">
              {resource.description || "No description available."}
            </p>
          </section>
          <hr className="h-[.1rem] bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 border-0" />
          {/* Contact Information */}
          <section className="text-center sm:text-left bg-black bg-opacity-80 p-4 rounded-lg">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 text-center sm:text-left">
              Contact Information
            </h2>
            {contact ? (
              <>
                {contact.phone && (
                  <p className="text-base md:text-lg">Phone: {contact.phone}</p>
                )}
                {contact.email && (
                  <p className="text-base md:text-lg">Email: {contact.email}</p>
                )}
                {contact.website && (
                  <p className="text-base md:text-lg">
                    Website:{" "}
                    <a
                      href={`https://${contact.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {contact.website}
                    </a>
                  </p>
                )}
                {!contact.phone && !contact.email && !contact.website && (
                  <p className="text-base md:text-lg text-red-500">
                    Contact information not available.
                  </p>
                )}
              </>
            ) : (
              <p className="text-base md:text-lg text-red-500">
                Contact information not available.
              </p>
            )}
          </section>
          {/* Operating Hours */}
          <section className="text-center sm:text-left bg-black bg-opacity-80 p-4 rounded-lg">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 text-center sm:text-left">
              Operating Hours
            </h2>
            {operatingHours ? (
              <ul className="space-y-1">
                {Object.entries(operatingHours).map(([day, hours]) => (
                  <li key={day} className="text-base md:text-lg">
                    <strong>
                      {day.charAt(0).toUpperCase() + day.slice(1)}:
                    </strong>{" "}
                    {hours.open && hours.close
                      ? `${hours.open} - ${hours.close}`
                      : "Closed"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base md:text-lg text-red-500">
                Operating hours not available.
              </p>
            )}
          </section>
          {/* Address and Map */}
          <section className="text-center sm:text-left bg-black bg-opacity-80 p-4 rounded-lg">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 text-center sm:text-left">
              Address
            </h2>
            {address ? (
              <p className="text-base md:text-lg mb-4">
                {address.street}, {address.city}, {address.state}{" "}
                {address.zip ? address.zip : ""}
              </p>
            ) : (
              <p className="text-base md:text-lg text-red-500">
                Address not available.
              </p>
            )}
            {location ? (
              <div className="h-64 sm:h-80 md:h-96 w-full bg-gray-200 rounded overflow-hidden relative">
                <MapComponent
                  lat={location.latitude}
                  lon={location.longitude}
                  resourceName={resource.name}
                />
              </div>
            ) : (
              <p className="text-base md:text-lg text-red-500">
                Unable to display map. Location data unavailable.
              </p>
            )}
          </section>
          {/* Additional Details */}
          <section className="text-center sm:text-left bg-black bg-opacity-80 p-4 rounded-lg">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 text-center sm:text-left">
              Additional Details
            </h2>
            <p className="text-base md:text-lg">
              <strong>Category:</strong> {resource.category.join(", ")}
            </p>
            <p className="text-base md:text-lg">
              <strong>Favorites:</strong> {resource.favoriteCount}
            </p>
            <p className="text-base md:text-lg">
              <strong>Upvotes:</strong> {resource.upvoteCount ?? 0}
            </p>
          </section>
          {/* Reviews Section */}
          <section className="text-center sm:text-left bg-black bg-opacity-80 p-4 rounded-lg">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center sm:text-left">
              Reviews
            </h2>
            <div className="mb-6">
              <ReviewList
                resourceId={params.id}
                refreshTrigger={refreshReviews}
              />
            </div>
            <div className="mt-4 flex justify-center sm:justify-start">
              <ReviewForm
                resourceId={params.id}
                onReviewAdded={handleReviewAdded}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ResourcePage;
