"use client";

import React, { useEffect, useState } from "react";
import { Resource } from "../interfaces/resource";
import ResourceCard from "../components/ResourceCard";

const ResourcesGrid: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    fetch("/api/resources")
      .then((response) => response.json())
      .then((data) => setResources(data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Resources</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
};

export default ResourcesGrid;
