"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import Link from "next/link";

interface SearchResult {
  id: string;
  name: string;
  description: string;
  type: string[];
  category: string[];
}

export default function SearchResultsClient() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      const params = {
        description: searchParams.get("description") || "",
        ageRange: searchParams.get("ageRange") || "",
        zipCode: searchParams.get("zipCode") || "",
        category: searchParams.get("category") || "",
      };

      try {
        const response = await fetch("/api/resources/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        const data = await response.json();
        console.log("Search response:", data);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
        // Handle error (e.g., show error message to user)
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  return (
    <div className="flex flex-col justify-center items-center gap-4 p-4 text-white">
      <h1 className="text-2xl font-bold">Search Results</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : results.length > 0 ? (
        <ul className="space-y-4">
          {results.map((result) => (
            <li key={result.id}>
              <Link href={`/dashboard/resources/${result.id}`}>
                <div className="border p-4 text-black rounded-lg bg-gray-100 hover:bg-gray-300 transition-colors duration-200 cursor-pointer">
                  <h2 className="text-xl font-semibold">{result.name}</h2>
                  <p>{result.description}</p>
                  <p>
                    <strong>Category:</strong> {result.category}
                  </p>
                  <p>
                    <strong>Type:</strong>{" "}
                    {result.type?.length === 0
                      ? "N/A"
                      : result.type?.join(", ")}
                  </p>
                  {/* Add more fields as needed */}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
}
