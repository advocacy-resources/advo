"use client";

import React, { useEffect, useState } from "react";
import { Resource } from "&/resource";
import ResourceCard from "@/components/resources/ResourceCard";

const ResourcesGrid: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching resources...");
        const response = await fetch("/api/resources");
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        console.log("Received data:", json);

        if (!Array.isArray(json)) {
          console.error("API response is not an array:", json);
          throw new Error("API did not return an array");
        }

        setResources(json);
      } catch (e) {
        console.error("Error in fetchResources:", e);
        setError(e instanceof Error ? e.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  if (isLoading) {
    return <div>Loading resources...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  console.log("Rendering resources:", resources);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Resources</h1>
      {resources.length === 0 ? (
        <p>No resources found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesGrid;
