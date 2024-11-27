import ResourcePersonalisation from "@/components/resources/ResourcePersonalisation";
import { Rating } from "@/enums/rating.enum";
import Link from "next/link";

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
    const response = await fetch(`${process.env.NEXT_URL}/resources/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    console.log("API response status:", response.status);

    if (!response.ok) {
      console.error("API responded with an error:", await response.text());
      throw new Error(
        `Failed to fetch search results. Status: ${response.status}`,
      );
    }

    const data = await response.json();
    console.log("Raw data from API:", data);

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
        <div key={result.id} className="w-full max-w-2xl">
          <Link className="w-full" href={`/resources/${result.id}`}>
            <div className="border border-gray-700 p-4 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors duration-200 cursor-pointer">
              <div className="text-xl font-semibold text-pink-400">
                {result.name}
              </div>
              <div className="text-gray-300">{result.description}</div>
              <div className="text-gray-400 mt-2">
                <strong>Category:</strong> {result.category}
              </div>
              <div className="text-gray-400">
                <strong>Type:</strong>{" "}
                {result.type?.length === 0 ? "N/A" : result.type?.join(", ")}
              </div>
              <div className="mt-4">
                <ResourcePersonalisation
                  initialData={{
                    rating: result.rating || Rating.NULL,
                    favored: result.favored || false,
                  }}
                />
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
