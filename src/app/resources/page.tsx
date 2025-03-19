import { Rating } from "@/enums/rating.enum";
import ResourceCard from "@/components/resources/ResourceCard";

interface SearchResult {
  id: number;
  name: string;
  description: string;
  category: string;
  type: string[];
  ageRange: string;
  zipCode: string;
  rating: Rating;
  favored: boolean;
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Partial<SearchResult>;
}) {
  const params = {
    description: searchParams.description || "",
    ageRange: searchParams.ageRange || "",
    zipCode: searchParams.zipCode || "",
    category: searchParams.category || "",
    type: searchParams.type || "",
  };

  console.log("Sending search params to API:", params);

  let results: SearchResult[] = [];
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/resources/search`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      },
    );

    console.log("API response status:", response.status);

    if (!response.ok) {
      console.error("API responded with an error:", await response.text());
      throw new Error(
        `Failed to fetch search results. Status: ${response.status}`,
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.warn("API returned an error:", data.error);
      return (
        <div className="flex flex-col justify-center items-center gap-4 p-4 text-white bg-black min-h-screen">
          <div className="text-3xl font-bold">Search Results</div>
          <div>
            {data.error || "Unexpected error occurred. Please try again."}
          </div>
        </div>
      );
    }
    results = data;
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
      {results.map((result) => (
        <ResourceCard
          key={result.id}
          id={result.id}
          name={result.name}
          description={result.description}
          category={result.category}
          type={result.type}
          rating={result.rating}
          favored={result.favored}
        />
      ))}
    </div>
  );
}
