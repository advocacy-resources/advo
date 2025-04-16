"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import ResourceLocationsMap from "@/components/resources/ResourceLocationsMap";
import { Resource } from "@/interfaces/resource";

interface ResourceLocationsMapCardProps {
  loading?: boolean;
}

const ResourceLocationsMapCard: React.FC<ResourceLocationsMapCardProps> = ({
  loading = false,
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      if (loading) return;

      try {
        setIsLoading(true);
        const response = await fetch("/api/v1/admin/resources?limit=100");

        if (!response.ok) {
          throw new Error("Failed to fetch resources");
        }

        const data = await response.json();
        setResources(data.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError("Failed to load resources for the map");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [loading]);

  return (
    <Card className="p-6 bg-gray-800 border-0 shadow-md col-span-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Resource Locations</h2>
      </div>

      {error ? (
        <div className="bg-red-900 bg-opacity-30 p-4 rounded-lg text-center text-white">
          <span className="font-bold">Error:</span> {error}
        </div>
      ) : isLoading || loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-2"></div>
            <p className="text-gray-400">Loading resource locations...</p>
          </div>
        </div>
      ) : resources.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">
            No resources with location data available.
          </p>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden">
          <ResourceLocationsMap
            resources={resources}
            loading={isLoading}
            height="500px"
          />
        </div>
      )}
    </Card>
  );
};

export default ResourceLocationsMapCard;
