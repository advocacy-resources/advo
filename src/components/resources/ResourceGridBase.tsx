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
  className = "max-w-6xl mx-auto p-8",
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8",
  emptyMessage = "No resources found.",
  loadingMessage = "Loading resources...",
  errorPrefix = "Error:",
  children,
}) => {
  if (isLoading && resources.length === 0) {
    return (
      <div className={className}>
        {title && <div className="text-3xl font-bold mb-8">{title}</div>}
        <div>{loadingMessage}</div>
      </div>
    );
  }

  if (error && resources.length === 0) {
    return (
      <div className={className}>
        {title && <div className="text-3xl font-bold mb-8">{title}</div>}
        <div>
          {errorPrefix} {error}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && <div className="text-3xl font-bold mb-8">{title}</div>}
      {resources.length === 0 ? (
        <div>{emptyMessage}</div>
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