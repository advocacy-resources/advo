"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SearchResult {
  id: string;
  name: string;
  description: string;
  type: string[];
  category: string[];
  // Add other fields as needed
}

export default function SearchResultsClient() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      const params = {
        ageRange: searchParams.get("ageRange") || "",
        zipCode: searchParams.get("zipCode") || "",
        social: searchParams.get("social") || "",
        emotional: searchParams.get("emotional") || "",
        physical: searchParams.get("physical") || "",
      };

      try {
        const response = await fetch("/api/resources/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>
      <Link href="/">
        <Button className="mb-4">Back to Search</Button>
      </Link>
      {isLoading ? (
        <p>Loading...</p>
      ) : results.length > 0 ? (
        <ul className="space-y-4">
          {results.map((result) => (
            <li key={result.id}>
              <Link href={`/dashboard/resources/${result.id}`}>
                <div className="border p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                  <h2 className="text-xl font-semibold">{result.name}</h2>
                  <p>{result.description}</p>
                  <p>
                    <strong>Type:</strong> {result.type.join(", ")}
                  </p>
                  <p>
                    <strong>Category:</strong> {result.category.join(", ")}
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
