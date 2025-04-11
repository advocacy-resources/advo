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
  selectResourcesError
} from "@/store/slices/resourcesSlice";

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

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const resources = useAppSelector(selectAllResources);
  const isLoading = useAppSelector(selectResourcesLoading);
  const error = useAppSelector(selectResourcesError);
  
  // Debug resources
  console.log("Resources in search page:", resources);

  useEffect(() => {
    // Parse the search parameter if it exists
    let searchQuery = {};
    if (searchParams.get("search")) {
      try {
        // Decode the JSON string from the URL
        const searchString = searchParams.get("search") || "";
        searchQuery = JSON.parse(decodeURIComponent(searchString));
      } catch (error) {
        console.error("Error parsing search parameters:", error);
      }
    } else {
      // If no search parameter, use the raw query parameters
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

    // Dispatch the search action
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
        <div>{error || "Unexpected error occurred. Please try again."}</div>
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

  // Debug the resources array before rendering
  console.log("Resources before rendering:", {
    count: resources?.length || 0,
    ids: resources?.map(r => r.id),
    names: resources?.map(r => r.name)
  });
  
  return (
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-4 p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-bold mb-2">Debug Info:</h2>
          <p>Resources count: {resources?.length || 0}</p>
          <p>Resource IDs: {resources?.map(r => r.id).join(', ')}</p>
          <p>Resource names: {resources?.map(r => r.name).join(', ')}</p>
        </div>
        
        <ResourceGridBase
          resources={resources}
          isLoading={isLoading}
          error={error}
          title="Search Results"
          className="w-full"
          gridClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          emptyMessage="No results found. Please try again with different criteria."
        />
      </div>
    </div>
  );
}
