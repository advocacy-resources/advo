"use client";

import React, { useCallback, useEffect } from "react";
import { Resource } from "@/interfaces/resource";
import ResourceGridBase from "@/components/resources/ResourceGridBase";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchResources,
  setPage,
  setSearchParams,
  resetHomeState,
  selectAllResources,
  selectResourcesLoading,
  selectResourcesError,
  selectResourcesPagination,
} from "@/store/slices/resourcesSlice";

const HomeResourceGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const resources = useAppSelector(selectAllResources);
  const isLoading = useAppSelector(selectResourcesLoading);
  const error = useAppSelector(selectResourcesError);
  const pagination = useAppSelector(selectResourcesPagination);
  const [retryCount, setRetryCount] = React.useState(0);

  // Function to fetch resources using Redux
  const loadResources = useCallback(
    (page = 1) => {
      console.log("HomeResourceGrid: loadResources called with page:", page);
      dispatch(fetchResources(page));
    },
    [dispatch],
  );

  // Initial fetch and reset search params
  useEffect(() => {
    console.log("HomeResourceGrid: Initial fetch effect running");
    // Reset the entire state for homepage when component mounts
    dispatch(resetHomeState());
    // Then load resources with clean state
    loadResources();
  }, [loadResources, dispatch]);

  // Auto-retry mechanism
  useEffect(() => {
    // Only retry if there was an error and we haven't exceeded max retries
    if (error && retryCount < 3) {
      const retryDelay = Math.min(1000 * 2 ** retryCount, 5000); // Exponential backoff with max 5s
      console.log(
        `Retrying fetch (attempt ${retryCount + 1}) in ${retryDelay}ms...`,
      );
      const retryTimer = setTimeout(() => {
        console.log(`Executing retry attempt ${retryCount + 1}`);
        loadResources(pagination.page);
      }, retryDelay);

      return () => clearTimeout(retryTimer);
    }
  }, [error, retryCount, loadResources, pagination]);

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
    loadResources(newPage);
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
        <div className="flex flex-wrap justify-center mt-6 md:mt-8 gap-1 md:gap-2 p-3 md:p-4 bg-gray-900 rounded-lg border border-gray-700">
          {renderPaginationButtons()}
        </div>
      )}
      <div className="text-center text-gray-400 mt-3 md:mt-4 p-2 bg-gray-900 bg-opacity-50 rounded-lg text-sm md:text-base">
        Showing {resources?.length || 0} of {pagination.total} resources
      </div>
    </>
  );

  // Manual retry button for user
  const retryButton = error && (
    <div className="mt-4 flex justify-center">
      <Button
        onClick={() => {
          dispatch(fetchResources(pagination.page));
        }}
        variant="default"
        className="bg-purple-600 hover:bg-purple-700 transition-colors duration-200 rounded-full px-4 py-2"
      >
        Retry Loading Resources
      </Button>
    </div>
  );

  return (
    <ResourceGridBase
      resources={resources}
      isLoading={isLoading}
      error={error}
      title="Latest Resources"
      className="max-w-7xl mx-auto p-4 md:p-8 bg-black bg-opacity-80 rounded-lg shadow-xl"
      gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-2"
      loadingMessage={
        <div className="flex flex-col justify-center items-center h-64 bg-gray-900 bg-opacity-50 rounded-lg border border-gray-700">
          <div className="text-lg md:text-xl text-white mb-4">
            Loading resources...
          </div>
          <div className="w-12 h-12 border-t-2 border-b-2 border-r-2 border-purple-500 rounded-full animate-spin"></div>
        </div>
      }
      errorPrefix={
        <div className="flex flex-col justify-center items-center h-64 bg-gray-900 bg-opacity-50 rounded-lg border border-gray-700">
          <div className="text-lg md:text-xl text-red-500 mb-4 text-center px-4">
            Error loading resources:
          </div>
          {retryButton}
        </div>
      }
      emptyMessage={
        <div className="text-lg md:text-xl text-white text-center py-12 bg-gray-900 bg-opacity-50 rounded-lg border border-gray-700 shadow-inner">
          <div className="mb-2">No resources found</div>
          <p className="text-sm text-gray-400">
            Try adjusting your search criteria
          </p>
        </div>
      }
    >
      {resources?.length > 0 && paginationControls}
      {error && retryButton}
    </ResourceGridBase>
  );
};

export default HomeResourceGrid;
