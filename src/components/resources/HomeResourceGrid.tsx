"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Resource } from "@/interfaces/resource";
import ResourceGridBase from "@/components/resources/ResourceGridBase";
import { Button } from "@/components/ui/button";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const HomeResourceGrid: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  const fetchResources = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true);
        // Use the search endpoint with pagination but no search parameters
        // This will return the most recent resources
        const response = await fetch("/api/v1/resources/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page,
            limit: pagination.limit,
            // Empty search parameters to get all resources
            category: [],
            type: [],
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.data || !Array.isArray(data.data)) {
          console.error("API response format is unexpected:", data);
          throw new Error("API did not return expected data format");
        }

        setResources(data.data);
        setPagination({
          total: data.pagination.total || 0,
          page: data.pagination.page || 1,
          limit: data.pagination.limit || 12,
          totalPages: data.pagination.totalPages || 0,
        });
      } catch (e) {
        console.error("Error fetching resources:", e);
        setError(e instanceof Error ? e.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit],
  );

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handlePageChange = (newPage: number) => {
    fetchResources(newPage);
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtonsToShow = 5;
    // Calculate pagination range
    const maxStartPage = Math.max(
      1,
      pagination.totalPages - maxButtonsToShow + 1,
    );
    const initialStartPage = Math.max(
      1,
      pagination.page - Math.floor(maxButtonsToShow / 2),
    );
    const startPage = Math.min(initialStartPage, maxStartPage);
    const endPage = Math.min(
      pagination.totalPages,
      startPage + maxButtonsToShow - 1,
    );

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        onClick={() => handlePageChange(pagination.page - 1)}
        disabled={pagination.page <= 1 || isLoading}
        className="px-3 py-2"
      >
        &lt;
      </Button>,
    );

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === pagination.page ? "default" : "outline"}
          onClick={() => handlePageChange(i)}
          disabled={isLoading}
          className="px-4 py-2"
        >
          {i}
        </Button>,
      );
    }

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        onClick={() => handlePageChange(pagination.page + 1)}
        disabled={pagination.page >= pagination.totalPages || isLoading}
        className="px-3 py-2"
      >
        &gt;
      </Button>,
    );

    return buttons;
  };

  // Pagination and resource count components
  const paginationControls = (
    <>
      {/* Pagination controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2 p-4 bg-gray-900 rounded-lg border border-gray-700">
          {renderPaginationButtons()}
        </div>
      )}
      <div className="text-center text-gray-400 mt-4 p-2 bg-gray-900 bg-opacity-50 rounded-lg">
        Showing {resources.length} of {pagination.total} resources
      </div>
    </>
  );

  return (
    <ResourceGridBase
      resources={resources}
      isLoading={isLoading}
      error={error}
      title="Latest Resources"
      className="max-w-7xl mx-auto p-4 md:p-8 bg-black bg-opacity-80 rounded-lg shadow-xl"
      gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-2"
      loadingMessage={
        <div className="flex justify-center items-center h-64 bg-gray-900 rounded-lg border border-gray-700">
          <div className="text-xl text-white">Loading resources...</div>
        </div>
      }
      errorPrefix={
        <div className="flex justify-center items-center h-64 bg-gray-900 rounded-lg border border-gray-700">
          <div className="text-xl text-red-500">Error:</div>
        </div>
      }
      emptyMessage={
        <div className="text-xl text-white text-center py-12 bg-gray-900 rounded-lg border border-gray-700 shadow-inner">
          No resources found.
        </div>
      }
    >
      {resources.length > 0 && paginationControls}
    </ResourceGridBase>
  );
};

export default HomeResourceGrid;
