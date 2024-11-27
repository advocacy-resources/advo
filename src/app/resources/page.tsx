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

  // TODO: Add favourite and rating fields
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
        <div className="flex flex-col justify-center items-center gap-4 p-4 ">
          <div className="text-2xl font-bold">Search Results</div>
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
      <div className="flex flex-col justify-center items-center self-center gap-4 p-4 ">
        <div className="text-2xl font-bold">Search Results</div>
        <div>No results found. Please try again with different criteria.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center self-center gap-4 p-4 ">
      <div className="text-2xl font-bold">Search Results</div>
      {results.map((result) => (
        <div key={result.id} className="w-full">
          <Link className="w-full" href={`/resources/${result.id}`}>
            <div className="border p-4 text-black rounded-lg bg-gray-100 hover:bg-gray-300 transition-colors duration-200 cursor-pointer">
              <div className="text-xl font-semibold">{result.name}</div>
              <div>{result.description}</div>
              <div>
                <strong>Category:</strong> {result.category}
              </div>
              <div>
                <strong>Type:</strong>{" "}
                {result.type?.length === 0 ? "N/A" : result.type?.join(", ")}
              </div>
              <ResourcePersonalisation
                initialData={{
                  rating: result.rating || Rating.NULL,
                  favored: result.favored || false,
                }}
              />
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
