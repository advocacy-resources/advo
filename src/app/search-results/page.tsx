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
  favoured: boolean;
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

  const response = await fetch(`${process.env.NEXT_URL}/api/resources/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await response.json();
  const results: SearchResult[] = data;

  return (
    <div className="flex flex-col justify-center items-center self-center gap-4 p-4 text-white">
      <div className="text-2xl font-bold">Search Results</div>
      {results.map((result) => (
        <div key={result.id} className="w-full">
          <Link className="w-full" href={`/dashboard/resources/${result.id}`}>
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
                  favoured: result.favoured || false,
                }}
              />
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
