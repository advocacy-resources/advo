"use client";

import React, { useState } from "react";
import Image from "next/image";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import ReviewList from "@/components/resources/ReviewList";
import ReviewForm from "@/components/resources/ReviewForm";
import { Resource } from "@/interfaces/resource";

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

const VerifiedCircle = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="30"
    height="30"
  >
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "pink", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "yellow", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#gradient)" />
    <text
      x="50"
      y="55"
      fontSize="24"
      fill="white"
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily="Arial, sans-serif"
    >
      ✔
    </text>
  </svg>
);

const ResourcePage = ({ params }: ResourcePageProps) => {
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const defaultBanner = "/resourcebannerimage.png";
  const defaultProfilePhoto = "/images/advo-logo-color.png";

  // Fetch resource data
  React.useEffect(() => {
    const fetchResourceData = async () => {
      try {
        const response = await fetch(`/api/v1/resources/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch resource");
        }
        const data = await response.json();
        console.log("Resource data:", data.resource);
        console.log("Profile photo exists:", !!data.resource.profilePhoto);
        console.log("Banner image exists:", !!data.resource.bannerImage);
        setResource(data.resource);

        // Handle address geocoding
        const address = data.resource.address as unknown as Address;
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
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchResourceData();
  }, [params.id]);

  // Handle review refresh
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
    <>
      {/* Banner Section */}
      <div className="relative w-full h-48">
        {/* Debug info */}
        <div className="absolute top-0 left-0 z-10 bg-black bg-opacity-70 p-2 text-white text-xs">
          <div>
            Banner Image URL:{" "}
            {resource.bannerImageUrl ||
              (resource.bannerImage ? "Base64 Data" : defaultBanner)}
          </div>
          <div>
            Has Banner Image:{" "}
            {resource.bannerImageUrl || resource.bannerImage ? "Yes" : "No"}
          </div>
        </div>
        <Image
          src={resource.bannerImageUrl || resource.bannerImage || defaultBanner}
          alt="Resource Banner"
          fill
          style={{ objectFit: "cover" }}
          priority
          unoptimized={!!resource.bannerImage}
        />
      </div>

      {/* Main Content Section */}
      <div className="flex flex-col gap-6 md:gap-8 p-4 md:p-8 mx-auto w-full max-w-2xl bg-black text-white">
        {/* Logo and Name */}
        <section className="mb-6">
          {/* Logo and Name */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {/* Profile Photo */}
            <div className="w-20 h-20 sm:w-16 sm:h-16">
              {/* Debug info */}
              <div className="absolute top-0 left-0 z-10 bg-black bg-opacity-70 p-2 text-white text-xs">
                <div>
                  Profile Photo URL:{" "}
                  {resource.profilePhotoUrl ||
                    (resource.profilePhoto
                      ? "Base64 Data"
                      : defaultProfilePhoto)}
                </div>
                <div>
                  Has Profile Photo:{" "}
                  {resource.profilePhotoUrl || resource.profilePhoto
                    ? "Yes"
                    : "No"}
                </div>
              </div>

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
            <h1 className="text-2xl sm:text-3xl font-bold">{resource.name}</h1>
          </div>

          {/* Centered Icons and Stats */}
          <div className="flex justify-center items-center gap-6 mt-4">
            {/* Thumbs Up and Rating */}
            <div className="flex items-center gap-2">
              <Image
                src="/thumbs-up.svg"
                alt="Thumbs Up"
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="text-sm">{"No rating yet"}</span>
            </div>

            {/* Verified Listing */}
            <div className="flex items-center gap-2">
              <VerifiedCircle />
              <span className="text-lg">Verified Listing</span>
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 text-base md:text-lg text-center sm:text-left">
            {resource.description || "No description available."}
          </p>
        </section>

        <hr className="h-[.1rem] bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 border-0" />

        {/* Contact Information */}
        <section className="text-center sm:text-left">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-center sm:text-left">
            Contact Information
          </h2>
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
        </section>

        {/* Operating Hours */}
        <section className="text-center sm:text-left">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-center sm:text-left">
            Operating Hours
          </h2>
          {operatingHours ? (
            <ul className="space-y-1">
              {Object.entries(operatingHours).map(([day, hours]) => (
                <li key={day} className="text-base md:text-lg">
                  <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong>{" "}
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
        <section className="text-center sm:text-left">
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
        <section className="text-center sm:text-left">
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
        <section className="text-center sm:text-left">
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
    </>
  );
};

export default ResourcePage;
