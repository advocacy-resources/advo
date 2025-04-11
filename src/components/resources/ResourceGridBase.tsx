"use client";

import React from "react";
import { Resource } from "@/interfaces/resource";
import ResourceCard from "@/components/resources/ResourceCard";
import { Rating } from "@/enums/rating.enum";

interface ResourceGridBaseProps {
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

const ResourceGridBase: React.FC<ResourceGridBaseProps> = ({
  resources,
  isLoading,
  error,
  title = "Resources",
  className = "max-w-6xl mx-auto p-4 md:p-8",
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8",
  emptyMessage = "No resources found.",
  loadingMessage = "Loading resources...",
  errorPrefix = "Error:",
  children,
}) => {
  if (isLoading && resources.length === 0) {
    return (
      <div className={className}>
        {title && <div className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">{title}</div>}
        <div className="text-center py-8">{loadingMessage}</div>
      </div>
    );
  }

  if (error && resources.length === 0) {
    return (
      <div className={className}>
        {title && <div className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">{title}</div>}
        <div className="bg-red-900 bg-opacity-30 p-4 rounded-lg text-center">
          <span className="font-bold">{errorPrefix}</span> {error}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && <div className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">{title}</div>}
      {resources.length === 0 ? (
        <div className="text-center py-8 text-gray-400">{emptyMessage}</div>
      ) : (
        <div className={gridClassName}>
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              id={resource.id}
              name={resource.name}
              description={resource.description}
              category={resource.category[0] || ""}
              type={resource.category}
              rating={Rating.NULL}
              favored={false}
              profilePhoto={resource.profilePhoto}
              profilePhotoUrl={resource.profilePhotoUrl}
            />
          ))}
        </div>
      )}
      {children}
    </div>
  );
};

export default ResourceGridBase;
