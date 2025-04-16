"use client";

import React, { useState } from "react";
import { Resource } from "@/interfaces/resource";
import ResourceGridBase from "@/components/resources/ResourceGridBase";
import ResourceLocationsMap from "@/components/resources/ResourceLocationsMap";

interface ResourcesWithMapProps {
  resources: Resource[];
  isLoading: boolean;
  error: string | null;
  title?: string;
  className?: string;
  gridClassName?: string;
  emptyMessage?: string | React.ReactNode;
  loadingMessage?: string | React.ReactNode;
  errorPrefix?: string | React.ReactNode;
  children?: React.ReactNode;
}

type ViewMode = "grid" | "map";

const ResourcesWithMap: React.FC<ResourcesWithMapProps> = ({
  resources,
  isLoading,
  error,
  title = "Resources",
  className = "max-w-6xl mx-auto p-4 md:p-8",
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8",
  emptyMessage = "No resources found.",
  loadingMessage = "Loading resources...",
  errorPrefix = "Error:",
  children,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "map" : "grid"));
  };

  if (isLoading && resources.length === 0) {
    return (
      <div className={className}>
        {title && (
          <div className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">
            {title}
          </div>
        )}
        <div className="text-center py-8">{loadingMessage}</div>
      </div>
    );
  }

  if (error && resources.length === 0) {
    return (
      <div className={className}>
        {title && (
          <div className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">
            {title}
          </div>
        )}
        <div className="bg-red-900 bg-opacity-30 p-4 rounded-lg text-center">
          <span className="font-bold">{errorPrefix}</span> {error}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        {title && <div className="text-2xl md:text-3xl font-bold">{title}</div>}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleViewMode}
            className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-md transition-colors"
            aria-label={
              viewMode === "grid" ? "Switch to map view" : "Switch to grid view"
            }
          >
            {viewMode === "grid" ? (
              <>
                <span className="h-5 w-5">🗺️</span>
                <span className="hidden sm:inline">Map View</span>
              </>
            ) : (
              <>
                <span className="h-5 w-5">📊</span>
                <span className="hidden sm:inline">Grid View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="text-center text-gray-400">{emptyMessage}</div>
      ) : viewMode === "grid" ? (
        <ResourceGridBase
          resources={resources}
          isLoading={isLoading}
          error={error}
          title=""
          className="w-full"
          gridClassName={gridClassName}
          emptyMessage={emptyMessage}
        />
      ) : (
        <div className="rounded-lg overflow-hidden">
          <ResourceLocationsMap
            resources={resources}
            loading={isLoading}
            height="600px"
          />
        </div>
      )}
      {children}
    </div>
  );
};

export default ResourcesWithMap;
