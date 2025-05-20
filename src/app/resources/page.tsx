// File: src/app/resources/page.tsx
// Purpose: Search results page that displays resources based on search parameters.
// Owner: Advo Team

"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Rating } from "@/enums/rating.enum";
import ResourceGridBase from "@/components/resources/ResourceGridBase";
import { Resource } from "@/interfaces/resource";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  searchResources,
  selectAllResources,
  selectResourcesLoading,
  selectResourcesError,
  selectResourcesSearchParams,
} from "@/store/slices/resourcesSlice";

/**
 * Interface defining the structure of search results from the API
 * Contains resource details needed for display in the search results grid
 */
interface SearchResult {
  id: string | number;
  name: string;
  description: string;
  category: string;
  type: string[];
  ageRange: string;
  zipCode: string;
  rating: Rating;
  favored: boolean;
  profilePhoto?: string | null;
  profilePhotoUrl?: string;
}

/**
 * Search results page component that displays resources matching search criteria.
 * Parses search parameters from URL and dispatches search actions to Redux.
 * Displays loading states, errors, and formatted results.
 * @returns React component with the search results UI
 */
export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const resources = useAppSelector(selectAllResources);
  const isLoading = useAppSelector(selectResourcesLoading);
  const error = useAppSelector(selectResourcesError);
  const storeSearchParams = useAppSelector(selectResourcesSearchParams);

  /**
   * Formats the current search parameters into a human-readable string.
   * Combines description, location, category, and type filters into a sentence.
   * @returns Formatted search query string for display
   */
  const formatSearchQuery = () => {
    const displayText: string[] = [];

    if (storeSearchParams && typeof storeSearchParams === "object") {
      // Check for description
      if ("description" in storeSearchParams && storeSearchParams.description) {
        displayText.push(`"${storeSearchParams.description}"`);
      }

      // Check for zipCode and distance
      if ("zipCode" in storeSearchParams && storeSearchParams.zipCode) {
        const distanceText = storeSearchParams.distance
          ? `within ${storeSearchParams.distance} miles of`
          : "near";
        displayText.push(`${distanceText} ${storeSearchParams.zipCode}`);
      }

      // Check for category
      if (
        "category" in storeSearchParams &&
        Array.isArray(storeSearchParams.category) &&
        storeSearchParams.category.length > 0
      ) {
        displayText.push(`in ${storeSearchParams.category.join(", ")}`);
      }

      // Check for type
      if (
        "type" in storeSearchParams &&
        Array.isArray(storeSearchParams.type) &&
        storeSearchParams.type.length > 0
      ) {
        displayText.push(`type: ${storeSearchParams.type.join(", ")}`);
      }
    }

    return displayText.length > 0 ? displayText.join(" ") : "All resources";
  };

  useEffect(() => {
    /**
     * Extracts and processes search parameters from the URL.
     * Handles both JSON encoded search parameters and individual query parameters.
     * Dispatches the search action to fetch matching resources.
     */
    let searchQuery: {
      category: string[];
      type: string[];
      description?: string;
      zipCode?: string;
      distance?: string;
    } = {
      category: [],
      type: [],
    };
    if (searchParams.get("search")) {
      try {
        // Decode the JSON-encoded search parameters from the URL
        const searchString = searchParams.get("search") || "";
        const decodedString = decodeURIComponent(searchString);
        searchQuery = JSON.parse(decodedString);
      } catch (error) {
        // Silently handle parsing errors
      }
    } else {
      // If no encoded search parameter exists, extract individual query parameters
      const description = searchParams.get("description") || "";
      const zipCode = searchParams.get("zipCode") || "";
      const category = searchParams.getAll("category");
      const type = searchParams.getAll("type");

      searchQuery = {
        description,
        zipCode,
        category,
        type,
      };
    }
    // Dispatch the search action to fetch resources matching the criteria
    dispatch(searchResources(searchQuery));
  }, [searchParams, dispatch]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 p-4 text-white bg-black min-h-screen">
        <div className="text-3xl font-bold">Search Results</div>
        <div>Loading resources...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 p-4 text-white bg-black min-h-screen">
        <div className="text-3xl font-bold">Search Results</div>
        <div className="text-center max-w-2xl">
          <p className="text-red-400 text-xl mb-2">Error</p>
          <p className="mb-4">
            {error || "Unexpected error occurred. Please try again."}
          </p>

          {error && typeof error === "string" && error.includes("zipcode") && (
            <div className="bg-gray-800 p-4 rounded-md text-left">
              <p className="font-bold mb-2">Zipcode Search Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Make sure you entered a valid US zipcode</li>
                <li>Try searching without a zipcode filter</li>
                <li>Try a different zipcode in the same area</li>
              </ul>
            </div>
          )}

          <button
            onClick={() => window.history.back()}
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 p-4 text-white bg-black min-h-screen">
        <div className="text-3xl font-bold">Search Results</div>
        <div>No results found. Please try again with different criteria.</div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white mt-[180px] md:mt-0">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Search Results
          </h1>
          <p className="text-gray-400 italic">{formatSearchQuery()}</p>
        </div>

        <ResourceGridBase
          resources={resources}
          isLoading={isLoading}
          error={error}
          title="" /* Empty string instead of null */
          className="w-full"
          gridClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          emptyMessage="No results found. Please try again with different criteria."
        />
      </div>
    </div>
  );
}
