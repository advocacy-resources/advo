"use client";

import React, { useEffect, useState } from "react";
import { Resource } from "@/interfaces/resource";
import ResourceGridBase from "@/components/resources/ResourceGridBase";

const ResourcesGrid: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching resources...");
        const response = await fetch("/api/v1/resources");
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

  return (
    <ResourceGridBase
      resources={resources}
      isLoading={isLoading}
      error={error}
      title="Resources"
      className="max-w-6xl mx-auto p-8"
      gridClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
    />
  );
};

export default ResourcesGrid;
