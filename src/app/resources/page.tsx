import { Rating } from "@/enums/rating.enum";
import ResourceCard from "@/components/resources/ResourceCard";

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

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Parse the search parameter if it exists
  let searchQuery = {};
  if (searchParams.search) {
    try {
      // Decode the JSON string from the URL
      const searchString =
        typeof searchParams.search === "string"
          ? searchParams.search
          : searchParams.search[0];
      searchQuery = JSON.parse(decodeURIComponent(searchString));
    } catch (error) {
      console.error("Error parsing search parameters:", error);
    }
  } else {
    // If no search parameter, use the raw query parameters
    searchQuery = {
      description: searchParams.description || "",
      zipCode: searchParams.zipCode || "",
      // Ensure category and type are always arrays
      category: Array.isArray(searchParams.category)
        ? searchParams.category
        : searchParams.category
          ? [searchParams.category]
          : [],
      type: Array.isArray(searchParams.type)
        ? searchParams.type
        : searchParams.type
          ? [searchParams.type]
          : [],
    };
  }
  console.log("Sending search params to API:", searchQuery);

  let results: SearchResult[] = [];
  try {
    // For server components, use the absolute URL based on the request
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL
        : "http://localhost:3001";
    const response = await fetch(
      // Fix the URL to avoid path duplication
      baseUrl.includes("/api")
        ? `${baseUrl}/resources/search`
        : `${baseUrl}/api/v1/resources/search`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchQuery),
        cache: "no-store",
      },
    );

    console.log("API response status:", response.status);

    if (!response.ok) {
      console.error("API responded with an error:", await response.text());
      throw new Error(
        `Failed to fetch search results. Status: ${response.status}`,
      );
    }

    const responseData = await response.json();

    // Check if the response has the expected format with data property
    if (responseData && responseData.data) {
      results = responseData.data.map((item: any) => ({
        ...item,
        // Ensure all required props are present
        id: item.id || item._id,
        // Make sure category is an array
        category: Array.isArray(item.category)
          ? item.category
          : item.category
            ? [item.category]
            : [],
        // Make sure type is an array if it exists, otherwise use category
        type: Array.isArray(item.type)
          ? item.type
          : Array.isArray(item.category)
            ? item.category
            : item.category
              ? [item.category]
              : [],
        rating: item.rating || Rating.NULL,
        favored: item.favored || false,
        profilePhoto: item.profilePhoto || null,
        profilePhotoUrl: item.profilePhotoUrl || null,
      }));
    } else if (responseData.error) {
      return (
        <div className="flex flex-col justify-center items-center gap-4 p-4 text-white bg-black min-h-screen">
          <div className="text-3xl font-bold">Search Results</div>
          <div>
            {responseData.error ||
              "Unexpected error occurred. Please try again."}
          </div>
        </div>
      );
    } else if (Array.isArray(responseData)) {
      // Fallback for direct array response with proper formatting
      results = responseData.map((item: any) => ({
        ...item,
        // Ensure all required props are present
        id: item.id || item._id,
        // Make sure category is an array
        category: Array.isArray(item.category)
          ? item.category
          : item.category
            ? [item.category]
            : [],
        // Make sure type is an array if it exists, otherwise use category
        type: Array.isArray(item.type)
          ? item.type
          : Array.isArray(item.category)
            ? item.category
            : item.category
              ? [item.category]
              : [],
        rating: item.rating || Rating.NULL,
        favored: item.favored || false,
        profilePhoto: item.profilePhoto || null,
        profilePhotoUrl: item.profilePhotoUrl || null,
      }));
    } else {
      throw new Error("Unexpected response format from API");
    }
  } catch (error) {
    console.error("Error fetching search results:", error);
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 p-4 text-white bg-black min-h-screen">
        <div className="text-3xl font-bold">Search Results</div>
        <div>No results found. Please try again with different criteria.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-black min-h-screen text-white">
      <div className="text-3xl font-bold">Search Results</div>
      {results.map((result, index) => (
        <ResourceCard
          key={`${result.id}-${index}`} // Add index to ensure uniqueness
          id={result.id}
          name={result.name}
          description={result.description}
          category={result.category}
          type={result.type}
          rating={result.rating}
          favored={result.favored}
          profilePhoto={result.profilePhoto}
          profilePhotoUrl={result.profilePhotoUrl}
        />
      ))}
    </div>
  );
}
