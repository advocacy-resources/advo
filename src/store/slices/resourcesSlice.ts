// File: src/store/slices/resourcesSlice.ts
// Purpose: Redux slice for managing resources data, search, and pagination state.
// Owner: Advo Team

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import { Resource } from "@/interfaces/resource";

/**
 * Interfaces for handling different ID formats from the API
 * The API may return IDs in different formats that need normalization
 */
interface MongoDBObjectId {
  $oid: string;
}

interface NestedIdObject {
  _id: string;
}

/**
 * Interface defining the structure of search parameters for resource queries.
 * Used for both URL parameters and API requests.
 */
interface SearchParams {
  category: string[];
  type: string[];
  description?: string;
  zipCode?: string;
  distance?: string;
  page?: number;
  limit?: number;
  // Use unknown instead of any for additional properties
  [key: string]: unknown;
}

/**
 * Interface for pagination metadata returned from the API.
 * Used to manage pagination state in the UI.
 */
interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Main state interface for the resources slice.
 * Uses normalized data structure with byId and allIds for efficient lookups.
 */
export interface ResourcesState {
  byId: Record<string, Resource>;
  allIds: string[];
  detailsLoaded: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationData;
  searchParams: {
    category: string[];
    type: string[];
    description?: string;
    zipCode?: string;
    distance?: string;
  };
  lastFetched: number | null;
}

const initialState: ResourcesState = {
  byId: {},
  allIds: [],
  detailsLoaded: {},
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  },
  searchParams: {
    category: [],
    type: [],
    distance: "25", // Default to 25 miles
  },
  lastFetched: null,
};

/**
 * Normalizes resource data from various API formats into a consistent structure.
 * Handles different ID formats (MongoDB ObjectId, string, nested objects) and
 * creates a normalized store with byId and allIds for efficient access.
 *
 * @param resources - Array of resources from the API
 * @returns Object with normalized byId map and allIds array
 */
const normalizeResources = (resources: Resource[]) => {
  const byId: Record<string, Resource> = {};
  const allIds: string[] = [];

  console.log("Resources to normalize:", resources);

  resources.forEach((resource) => {
    // Handle MongoDB ObjectId format (_id with $oid property)
    let id: string;

    if (
      resource._id &&
      typeof resource._id === "object" &&
      (resource._id as MongoDBObjectId).$oid
    ) {
      // MongoDB ObjectId format
      id = (resource._id as MongoDBObjectId).$oid;
      console.log("Found MongoDB ObjectId:", id);
    } else if (typeof resource.id === "string") {
      // Regular string ID
      id = resource.id;
    } else if (
      resource.id &&
      typeof resource.id === "object" &&
      (resource.id as NestedIdObject)._id
    ) {
      // Nested ID object
      id = String((resource.id as NestedIdObject)._id);
    } else {
      // Fallback
      id = String(resource.id || "unknown");
    }

    // Create a normalized resource with a consistent ID format
    const normalizedResource = {
      ...resource,
      id: id,
    };

    console.log("Normalized resource:", { id, name: normalizedResource.name });

    byId[id] = normalizedResource;
    if (!allIds.includes(id)) {
      allIds.push(id);
    }
  });

  console.log("Normalized results:", {
    resourceCount: Object.keys(byId).length,
    idCount: allIds.length,
    ids: allIds,
  });

  return { byId, allIds };
};

/**
 * Async thunk for fetching paginated resources from the API.
 * Uses current search parameters and pagination state from Redux.
 *
 * @param page - Page number to fetch (defaults to 1)
 * @returns Object with normalized resources and pagination data
 */
export const fetchResources = createAsyncThunk(
  "resources/fetchResources",
  async (page: number = 1, { getState, rejectWithValue }) => {
    try {
      const { resources } = getState() as { resources: ResourcesState };
      const { searchParams } = resources; // Remove unused pagination variable

      // Always fetch fresh data on homepage load to ensure resources are displayed
      const now = Date.now();

      // For debugging
      console.log("Fetching resources:", {
        existingResourceCount: resources.allIds.length,
        lastFetched: resources.lastFetched
          ? new Date(resources.lastFetched).toLocaleTimeString()
          : "never",
        currentTime: new Date(now).toLocaleTimeString(),
      });

      const response = await fetch("/api/v1/resources/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page,
          limit: resources.pagination.limit,
          ...searchParams,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("API did not return expected data format");
      }

      return {
        items: data.data,
        pagination: {
          total: data.pagination.total || 0,
          page: data.pagination.page || 1,
          limit: data.pagination.limit || 12,
          totalPages: data.pagination.totalPages || 0,
        },
        lastFetched: now,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  },
);

/**
 * Async thunk for fetching detailed information about a single resource.
 * Checks if detailed data is already loaded before making API request.
 *
 * @param id - ID of the resource to fetch
 * @returns Object containing the detailed resource data
 */
export const fetchResourceById = createAsyncThunk(
  "resources/fetchResourceById",
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const { resources } = getState() as { resources: ResourcesState };

      // If we already have detailed data for this resource, return it
      if (resources.detailsLoaded[id] && resources.byId[id]) {
        return { resource: resources.byId[id] };
      }

      const response = await fetch(`/api/v1/resources/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.resource) {
        throw new Error("API did not return expected data format");
      }

      return { resource: data.resource };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  },
);

/**
 * Async thunk for searching resources with various filter criteria.
 * Fetches all pages of results for the search query to provide complete results.
 *
 * @param searchParams - Object containing search filters (category, type, description, etc.)
 * @returns Object with all matching resources and updated pagination data
 */
export const searchResources = createAsyncThunk(
  "resources/searchResources",
  async (searchParams: SearchParams, { rejectWithValue }) => {
    try {
      // We don't need to access the state here
      // const _state = getState();
      const apiUrl = "/api/v1/resources/search";

      // Get all pages of results for the search query
      let allResults: Resource[] = [];
      const currentPage = 1;
      let totalPages = 1;

      // First request to get initial results and pagination info
      console.log("Search params:", searchParams);

      const initialResponse = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...searchParams,
          page: currentPage,
          limit: 12, // Use a consistent limit
        }),
        cache: "no-store",
      });

      if (!initialResponse.ok) {
        throw new Error(
          `Failed to fetch search results. Status: ${initialResponse.status}`,
        );
      }
      const initialData = await initialResponse.json();

      console.log("API response:", initialData);

      if (!initialData.data || !Array.isArray(initialData.data)) {
        throw new Error("API did not return expected data format");
      }

      console.log("First page resources:", initialData.data);

      // Add first page results
      allResults = [...initialData.data];

      // Get pagination info
      totalPages = initialData.pagination.totalPages || 1;

      console.log("Total pages:", totalPages);
      totalPages = initialData.pagination.totalPages || 1;

      // If there are more pages, fetch them
      if (totalPages > 1) {
        // Start from page 2 since we already have page 1
        for (let page = 2; page <= totalPages; page++) {
          const pageResponse = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...searchParams,
              page,
              limit: 12,
            }),
            cache: "no-store",
          });

          if (pageResponse.ok) {
            const pageData = await pageResponse.json();
            console.log(`Page ${page} resources:`, pageData.data);
            if (pageData.data && Array.isArray(pageData.data)) {
              allResults = [...allResults, ...pageData.data];
            }
          }
        }
      }

      console.log("All results:", allResults);

      return {
        items: allResults,
        pagination: {
          total: initialData.pagination.total || 0,
          page: 1, // We're returning all results, so page is 1
          limit: allResults.length, // Limit is now the total number of results
          totalPages: 1, // Since we're returning all results, totalPages is 1
        },
        searchParams,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  },
);

const resourcesSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<SearchParams>) => {
      state.searchParams = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    /**
     * Resets the resources state to initial values for the homepage.
     * Clears search parameters, pagination, and cached data.
     */
    resetHomeState: (state) => {
      state.pagination = {
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
      };
      state.searchParams = {
        category: [],
        type: [],
        distance: "25", // Default to 25 miles
      };
      state.lastFetched = null;
    },
    // Remove the selector from reducers as it's not a reducer function
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchResources
      .addCase(fetchResources.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.isLoading = false;

        // Normalize the resources
        const { byId, allIds } = normalizeResources(action.payload.items);

        // Update the state with normalized data
        state.byId = { ...state.byId, ...byId };

        // For the main list, replace allIds with the new list
        state.allIds = allIds;

        state.pagination = action.payload.pagination;
        state.lastFetched = action.payload.lastFetched;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Handle fetchResourceById
      .addCase(fetchResourceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResourceById.fulfilled, (state, action) => {
        state.isLoading = false;

        const resource = action.payload.resource;
        const id =
          typeof resource.id === "string"
            ? resource.id
            : resource.id &&
                typeof resource.id === "object" &&
                (resource.id as NestedIdObject)._id
              ? String((resource.id as NestedIdObject)._id)
              : String(resource.id);

        // Add or update the resource in the byId map
        state.byId[id] = {
          ...resource,
          id: id,
        };

        // Add the ID to allIds if it's not already there
        if (!state.allIds.includes(id)) {
          state.allIds.push(id);
        }

        // Mark this resource as having detailed data loaded
        state.detailsLoaded[id] = true;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Handle searchResources
      .addCase(searchResources.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchResources.fulfilled, (state, action) => {
        state.isLoading = false;

        console.log(
          "Search results before normalization:",
          action.payload.items,
        );

        // Normalize the resources
        const { byId, allIds } = normalizeResources(action.payload.items);

        console.log("Normalized resources:", { byId, allIds });

        // Update the state with normalized data
        state.byId = { ...state.byId, ...byId };

        // For search results, replace allIds with the new list
        state.allIds = allIds;

        // Mark all search results as NOT having detailed data loaded
        // This ensures that when clicking on a search result, it will fetch the full resource data
        allIds.forEach((id) => {
          state.detailsLoaded[id] = false;
        });

        console.log("Updated state:", {
          byId: state.byId,
          allIds: state.allIds,
          detailsLoaded: state.detailsLoaded,
        });

        state.pagination = action.payload.pagination;
        state.searchParams = action.payload.searchParams;
      })
      .addCase(searchResources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

/**
 * Memoized selectors for accessing resources state.
 * These selectors help optimize rendering by preventing unnecessary recalculations.
 */
export const selectResourcesState = (state: { resources: ResourcesState }) =>
  state.resources;

export const selectResourceById = createSelector(
  [selectResourcesState, (_, id: string) => id],
  (resourcesState, id) => resourcesState.byId[id],
);

export const selectAllResources = createSelector(
  [selectResourcesState],
  (resourcesState) =>
    resourcesState.allIds.map((id) => resourcesState.byId[id]),
);

export const selectResourcesLoading = createSelector(
  [selectResourcesState],
  (resourcesState) => resourcesState.isLoading,
);

export const selectResourcesError = createSelector(
  [selectResourcesState],
  (resourcesState) => resourcesState.error,
);

export const selectResourcesPagination = createSelector(
  [selectResourcesState],
  (resourcesState) => resourcesState.pagination,
);

export const selectResourcesSearchParams = createSelector(
  [selectResourcesState],
  (resourcesState) => resourcesState.searchParams,
);

export const {
  setSearchParams,
  setPage,
  setLimit,
  clearError,
  resetHomeState,
} = resourcesSlice.actions;

export default resourcesSlice.reducer;
