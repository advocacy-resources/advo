"use client";

import React, { useEffect, useState } from "react";
import { Resource } from "&/resource";
import ResourceCard from "#/resource/ResourceCard";

const ResourcesGrid: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch("/api/resources");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        console.log("Fetched data:", json); // Log the fetched data
        if (Array.isArray(json)) {
          setResources(json);
        } else {
          throw new Error("Fetched data is not an array");
        }
      } catch (e) {
        console.error("Error fetching resources:", e);
        setError("Failed to fetch resources. Please try again later.");
      }
    };

    fetchResources();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Resources</h1>
      {resources.length === 0 ? (
        <p>Loading resources...</p>
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
