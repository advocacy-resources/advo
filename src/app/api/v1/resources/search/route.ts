import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/library";
import geocodeAddress from "@/components/utils/geocode-address";
import {
  isWithinDistance,
  calculateDistance,
} from "@/components/utils/distance-calculator";
import { Resource, Address } from "@/interfaces/resource";

// Define a more specific type for address objects
interface AddressWithZip {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  [key: string]: unknown;
}

// Debug configuration
const DEBUG = {
  enabled: false,
  search: false,
  distance: false,
  geocode: false,
};

// Debug logger utility
function debugLog(
  category: "SEARCH" | "DISTANCE" | "GEOCODE",
  message: string,
  data?: any,
): void {
  if (!DEBUG.enabled) return;

  switch (category) {
    case "SEARCH":
      if (!DEBUG.search) return;
      break;
    case "DISTANCE":
      if (!DEBUG.distance) return;
      break;
    case "GEOCODE":
      if (!DEBUG.geocode) return;
      break;
  }

  const prefix = `[${category} DEBUG]`;
  if (data !== undefined) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

// Types
export interface IResourceSearchPostRequest {
  ageRange: string; // Not implemented yet, but kept for future use
  zipCode: string;
  distance: string; // Distance in miles
  category: string[];
  description: string | null | undefined;
  type: string[];
}

interface PaginationParams {
  page: number;
  limit: number;
}

interface SearchResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// MongoDB Pipeline Types
/**
 * Represents a text search clause in MongoDB Atlas Search
 */
interface TextSearchClause {
  text?: {
    query: string;
    path: string | string[];
  };
  function?: any; // Add support for function-based search
}

/**
 * Represents a compound search clause in MongoDB Atlas Search
 */
interface CompoundSearchClause {
  $search: {
    index: string;
    compound: {
      must: TextSearchClause[];
      should: TextSearchClause[];
    };
  };
}

/**
 * Represents a projection stage in MongoDB aggregation pipeline
 */
interface ProjectionStage {
  $project: Record<string, 0 | 1 | unknown>;
}

/**
 * Represents a pagination stage using $facet in MongoDB aggregation pipeline
 */
interface PaginationStage {
  $facet: {
    metadata: [{ $count: string }];
    data: [{ $skip: number }, { $limit: number }];
  };
}

/**
 * Represents a result projection stage in MongoDB aggregation pipeline
 */
interface ResultProjectionStage {
  $project: {
    data: 1;
    total: { $arrayElemAt: [string, number] };
  };
}

/**
 * Union type for all pipeline stages
 */
type PipelineStage =
  | CompoundSearchClause
  | ProjectionStage
  | PaginationStage
  | ResultProjectionStage;

// Constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Request parameters type
interface SearchRequestParams {
  page?: number | string;
  limit?: number | string;
  zipCode?: string;
  distance?: string; // Distance in miles
  category?: string | string[];
  description?: string;
  type?: string | string[];
}

/**
 * Validates and normalizes search parameters
 */
function validateAndNormalizeParams(params: SearchRequestParams): {
  normalizedParams: Partial<IResourceSearchPostRequest>;
  pagination: PaginationParams;
  hasSearchParams: boolean;
} {
  // Extract and normalize pagination parameters
  const page = Math.max(1, Number(params.page) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(params.limit) || DEFAULT_LIMIT),
  );

  // Extract and normalize search parameters
  const {
    zipCode,
    distance,
    category,
    description: descriptionOrUndefined,
    type,
  } = params;
  const description = descriptionOrUndefined?.trim() || undefined;

  // Normalize arrays and handle potential single strings
  const normalizedCategory = Array.isArray(category)
    ? category
    : category
      ? [category].filter(Boolean)
      : [];
  const normalizedType = Array.isArray(type)
    ? type
    : type
      ? [type].filter(Boolean)
      : [];

  // Check if any search parameters are provided
  const hasSearchParams =
    (zipCode && zipCode.trim() !== "") ||
    normalizedCategory.length > 0 ||
    (description && description.trim() !== "") ||
    normalizedType.length > 0;

  return {
    normalizedParams: {
      zipCode: zipCode?.trim() || "",
      distance: distance?.trim() || "25", // Default to 25 miles if not provided
      category: normalizedCategory,
      description,
      type: normalizedType,
    },
    pagination: { page, limit },
    hasSearchParams,
  };
}

/**
 * Builds MongoDB search pipeline based on search parameters
 */
function buildSearchPipeline(
  params: Partial<IResourceSearchPostRequest>,
): CompoundSearchClause {
  const { zipCode, distance, category, description, type } = params;
  const mustClauses: TextSearchClause[] = [];

  if (category && category.length > 0) {
    mustClauses.push({
      text: {
        query: category.join(" "),
        path: "category",
      },
    });
  }

  if (zipCode && zipCode.trim() !== "") {
    // For MongoDB Atlas Search, we need to use a different approach for nested fields
    // We'll use a custom score function to match the zipcode
    mustClauses.push({
      function: {
        score: {
          path: {
            value: "address.zip",
            multi: "first",
          },
          function: {
            equals: {
              value: zipCode.trim(),
            },
          },
        },
      },
    });
  }

  if (type && type.length > 0) {
    mustClauses.push({
      text: {
        query: type.join(" "),
        path: "type",
      },
    });
  }

  const shouldClause: TextSearchClause[] = description
    ? [
        {
          text: {
            query: description,
            path: ["name", "description"],
          },
        },
      ]
    : [];

  return {
    $search: {
      index: "resource_index",
      compound: {
        must: mustClauses,
        should: shouldClause,
      },
    },
  };
}

/**
 * Creates a projection stage for the MongoDB pipeline
 */
function createProjectionStage(): ProjectionStage {
  return {
    $project: {
      _id: 1,
      id: 1,
      name: 1,
      description: 1,
      category: 1,
      type: 1,
      ageRange: 1,
      zipCode: 1,
      createdAt: 1,
      profilePhoto: 1,
      profilePhotoType: 1,
      profilePhotoUrl: 1,
      bannerImage: 1,
      bannerImageType: 1,
      bannerImageUrl: 1,
    },
  };
}

/**
 * Adds pagination to the MongoDB pipeline
 */
function addPaginationToPipeline(
  pipeline: PipelineStage[],
  { page, limit }: PaginationParams,
): PipelineStage[] {
  const paginationStage: PaginationStage = {
    $facet: {
      metadata: [{ $count: "total" }],
      data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
    },
  };

  const resultProjectionStage: ResultProjectionStage = {
    $project: {
      data: 1,
      total: { $arrayElemAt: ["$metadata.total", 0] },
    },
  };

  return [...pipeline, paginationStage, resultProjectionStage];
}

/**
 * Formats the response with pagination metadata
 */
// MongoDB aggregation result type
interface AggregationResult {
  data: Record<string, unknown>[];
  total?: number;
}

/**
 * Formats the response with pagination metadata
 */
function formatResponse<T>(
  result: unknown,
  pagination: PaginationParams,
): SearchResponse<T> {
  // Handle the result which might be in different formats
  let data: T[] = [];
  let total = 0;
  if (Array.isArray(result) && result.length > 0 && "data" in result[0]) {
    // Handle result from aggregation with $facet
    const firstResult = result[0] as AggregationResult;
    data = firstResult.data as T[];
    total = firstResult.total || 0;
  } else if (Array.isArray(result)) {
    // Handle direct array result
    data = result as T[];
    total = data.length;
  }
  return {
    data,
    pagination: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

/**
 * Logs an error with context
 */
function logError(message: string, error: Error & { stack?: string }) {
  console.error(`${message}:`, {
    message: error.message,
    stack: error.stack,
  });
}

/**
 * Main API handler for resource search
 */
export async function POST(request: NextRequest) {
  // Set CORS headers
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = [
    "https://advo-q83h0o0hr-kmje405s-projects.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ];

  // Check if the origin is allowed
  const isAllowedOrigin =
    allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");

  // Log MongoDB connection info (without exposing credentials)
  console.log("MongoDB Connection Test - Environment:", process.env.NODE_ENV);
  console.log("MongoDB Connection String exists:", !!process.env.MONGODB_URI);

  try {
    // Test database connection
    try {
      const testCount = await prisma.resource.count();
      console.log(
        "MongoDB Connection Test - Success, resource count:",
        testCount,
      );
    } catch (dbConnError) {
      console.error("MongoDB Connection Test - Failed:", dbConnError);
    }
    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      const response = NextResponse.json(
        {
          error: "Invalid request format",
          details: "Could not parse request body as JSON",
        },
        { status: 400 },
      );

      // Add CORS headers
      if (isAllowedOrigin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Credentials", "true");
      }

      return response;
    }

    // Validate and normalize parameters
    const { normalizedParams, pagination, hasSearchParams } =
      validateAndNormalizeParams(requestBody);

    // If no search parameters, return paginated list of all resources
    if (!hasSearchParams) {
      console.info(
        "No search parameters provided. Returning paginated list of all resources.",
      );

      try {
        const [resources, count] = await Promise.all([
          prisma.resource.findMany({
            orderBy: { createdAt: "desc" },
            skip: (pagination.page - 1) * pagination.limit,
            take: pagination.limit,
          }),
          prisma.resource.count(),
        ]);

        // Create response with data
        const response = NextResponse.json({
          data: resources,
          pagination: {
            total: count,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(count / pagination.limit),
          },
        });

        // Set cache control headers to prevent caching
        response.headers.set("Cache-Control", "no-store, max-age=0");

        // Add CORS headers
        if (isAllowedOrigin) {
          response.headers.set("Access-Control-Allow-Origin", origin);
          response.headers.set("Access-Control-Allow-Credentials", "true");
        }

        return response;
      } catch (dbError) {
        console.error("Database error when fetching resources:", dbError);
        throw new Error("Database error when fetching resources");
      }
    }

    // Try to use MongoDB Atlas Search if available, otherwise fall back to regular queries
    try {
      // Check if we need to handle distance filtering
      let filterByDistance = false;
      let zipLocation: { latitude: number; longitude: number } | null = null;

      if (normalizedParams.zipCode && normalizedParams.distance) {
        try {
          debugLog(
            "SEARCH",
            `Attempting to geocode zipcode: ${normalizedParams.zipCode.trim()}`,
          );
          zipLocation = await geocodeAddress(normalizedParams.zipCode.trim());
          debugLog("SEARCH", "Successfully geocoded zipcode to:", zipLocation);
          filterByDistance = true;
        } catch (error) {
          console.error("Error geocoding zip code for Atlas Search:", error);

          // Return a more helpful error response instead of silently falling back
          const errorMessage =
            error instanceof Error ? error.message : "Unknown geocoding error";
          return NextResponse.json(
            {
              error: "Zipcode search error",
              details: `Could not geocode the provided zipcode: ${errorMessage}`,
              zipCode: normalizedParams.zipCode.trim(),
            },
            { status: 400 },
          );
        }
      }

      // Build search pipeline
      const searchClause = buildSearchPipeline(normalizedParams);
      const projectionStage = createProjectionStage();

      // Base pipeline with projection
      const basePipeline: PipelineStage[] = [searchClause, projectionStage];
      // Add pagination to pipeline
      const pipeline = addPaginationToPipeline(basePipeline, pagination);

      // If we need to filter by distance, we'll need to post-process the results
      const postProcessDistanceFilter = false;

      // Execute the query - cast pipeline to avoid type issues with Prisma
      try {
        let result = await prisma.resource.aggregateRaw({
          pipeline: pipeline as unknown as InputJsonValue[],
        });

        // If we need to filter by distance, post-process the results
        if (filterByDistance && zipLocation) {
          const maxDistance = parseInt(normalizedParams.distance || "25", 10);

          // Extract the resources from the result
          let resources: any[] = [];
          if (
            Array.isArray(result) &&
            result.length > 0 &&
            "data" in result[0]
          ) {
            resources = (result[0] as AggregationResult).data as any[];
          }

          // Process resources in batches to avoid overwhelming the geocoding API
          const BATCH_SIZE = 10;
          let filteredResources: any[] = [];
          
          // Process resources in batches
          for (let i = 0; i < resources.length; i += BATCH_SIZE) {
            const batch = resources.slice(i, i + BATCH_SIZE);
            
            // Process batch in parallel
            const batchResults = await Promise.all(
              batch.map(async (resource: any) => {
                try {
                  // Build the resource address
                  let resourceAddress = "";

                  // Check if address is an object with the expected properties
                  if (
                    resource.address &&
                    typeof resource.address === "object" &&
                    "street" in resource.address &&
                    "city" in resource.address &&
                    "state" in resource.address
                  ) {
                    const address = resource.address as Address;
                    resourceAddress = `${address.street}, ${address.city}, ${address.state} ${address.zip || ""}`;
                  } else if (
                    resource.address &&
                    typeof resource.address === "object"
                  ) {
                    const addressObj = resource.address as AddressWithZip;
                    if (addressObj.zip && typeof addressObj.zip === "string") {
                      resourceAddress = addressObj.zip;
                    }
                  } else {
                    return null;
                  }

                  if (!resourceAddress) return null;

                  // Geocode the resource address
                  const resourceLocation = await geocodeAddress(resourceAddress);

                  // Check if the resource is within the specified distance
                  const withinDistance = isWithinDistance(
                    zipLocation.latitude,
                    zipLocation.longitude,
                    resourceLocation.latitude,
                    resourceLocation.longitude,
                    maxDistance,
                  );

                  return withinDistance ? resource : null;
                } catch (error) {
                  console.error("Error calculating distance:", error);
                  return null;
                }
              }),
            );
            
            // Add filtered results from this batch
            filteredResources = [...filteredResources, ...batchResults.filter(Boolean)];
          }

          // Filter out null values
          const validResources = filteredResources.filter(Boolean);

          // Create a new result with the filtered resources
          if (
            Array.isArray(result) &&
            result.length > 0 &&
            "data" in result[0]
          ) {
            // Create a new result object with the filtered resources
            const newResult = JSON.parse(
              JSON.stringify(result),
            ) as typeof result;
            (newResult[0] as AggregationResult).data = validResources;
            (newResult[0] as AggregationResult).total = validResources.length;
            result = newResult;
          }
        }

        // Format the response
        const formattedResponse = formatResponse(result, pagination);

        // Create the response
        const response = NextResponse.json(formattedResponse);

        // Set cache control headers to prevent caching
        response.headers.set("Cache-Control", "no-store, max-age=0");

        // Add CORS headers
        if (isAllowedOrigin) {
          response.headers.set("Access-Control-Allow-Origin", origin);
          response.headers.set("Access-Control-Allow-Credentials", "true");
        }

        return response;
      } catch (searchError: any) {
        console.error("Atlas Search error:", searchError);

        console.log("Atlas Search error details:", {
          message: searchError.message,
          stack: searchError.stack,
          code: searchError.code,
          name: searchError.name,
        });

        // If the error is related to the search index not being found, fall back to regular query
        if (
          searchError.message &&
          (searchError.message.includes("index not found") ||
            searchError.message.includes("$search") ||
            searchError.message.includes("call"))
        ) {
          console.log(
            "Falling back to regular query without Atlas Search. The 'resource_index' search index is likely missing in MongoDB Atlas.",
          );
          throw new Error("Search index not available, using fallback");
        }

        // For other database errors, rethrow
        throw searchError;
      }
    } catch (fallbackError) {
      console.log("Using fallback search method");

      // Fallback to regular Prisma queries when Atlas Search is not available
      const { zipCode, distance, category, description, type } =
        normalizedParams;

      debugLog("DISTANCE", "Fallback search with params:", {
        zipCode,
        distance,
        category,
        description,
        type,
      });

      // Build where clause for regular query
      const whereClause: Record<string, any> = {};

      // If zipCode and distance are provided, we'll need to filter by distance later
      // We don't add zipCode to the where clause because we want to get all resources
      // and then filter them by distance
      let filterByDistance = false;
      let zipLocation: { latitude: number; longitude: number } | null = null;

      if (zipCode && zipCode.trim() !== "") {
        if (distance) {
          debugLog(
            "DISTANCE",
            `Filtering by distance with zipCode: ${zipCode.trim()} and distance: ${distance}`,
          );
          // Get coordinates for the provided zip code
          try {
            debugLog("DISTANCE", `Geocoding zipCode: ${zipCode.trim()}`);
            zipLocation = await geocodeAddress(zipCode.trim());
            debugLog("DISTANCE", "Geocoded zipCode to:", zipLocation);
            filterByDistance = true;
            // We don't filter by zipCode in the query, we'll do it after getting results
          } catch (error) {
            console.error("Error geocoding zip code:", error);

            // Return a more helpful error response instead of silently falling back
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Unknown geocoding error";
            return NextResponse.json(
              {
                error: "Zipcode search error",
                details: `Could not geocode the provided zipcode: ${errorMessage}`,
                zipCode: zipCode.trim(),
              },
              { status: 400 },
            );
          }
        } else {
          debugLog(
            "DISTANCE",
            `No distance provided, filtering by exact zipCode match: ${zipCode.trim()}`,
          );

          // For MongoDB, we need to use a different approach for nested JSON fields
          // Let's find all resources and filter them manually
          const allResources = await prisma.resource.findMany();

          // Filter resources with matching zipcode
          const matchingResources = allResources.filter((resource) => {
            if (resource.address && typeof resource.address === "object") {
              const address = resource.address as any;
              return address.zip === zipCode.trim();
            }
            return false;
          });

          debugLog(
            "DISTANCE",
            "Resources with zipcode (manual filter):",
            matchingResources.map((r) => ({
              id: r.id,
              name: r.name,
              address: r.address,
            })),
          );

          // For the regular query, we'll use a different approach since Prisma doesn't support
          // direct JSON path queries in the type system
          debugLog("DISTANCE", "Updated where clause:", whereClause);
        }
      }

      if (category && category.length > 0) {
        whereClause.category = {
          hasSome: category,
        };
      }

      if (type && type.length > 0) {
        whereClause.type = {
          hasSome: type,
        };
      }

      if (description && description.trim() !== "") {
        whereClause.OR = [
          { name: { contains: description.trim(), mode: "insensitive" } },
          {
            description: { contains: description.trim(), mode: "insensitive" },
          },
        ];
      }

      // Debug query to find resources with zipcode 74104 using manual filtering
      const allResourcesForDebug = await prisma.resource.findMany();

      // Filter resources with zipcode 74104
      const zipCodeResources = allResourcesForDebug.filter((resource) => {
        if (resource.address && typeof resource.address === "object") {
          const address = resource.address as any;
          return address.zip === "74104";
        }
        return false;
      });

      debugLog(
        "DISTANCE",
        "Resources with zipcode 74104 (manual filter):",
        zipCodeResources.map((r) => ({
          id: r.id,
          name: r.name,
          address: r.address,
        })),
      );

      // Execute regular query
      debugLog(
        "DISTANCE",
        "Executing database query with where clause:",
        whereClause,
      );

      // Get all resources first
      let allResources = await prisma.resource.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
      });

      debugLog("DISTANCE", `All resources count: ${allResources.length}`);

      // Apply manual filtering for zipCode if needed
      if (zipCode && zipCode.trim() !== "" && !filterByDistance) {
        // We already have the matching resources from our debug query
        allResources = zipCodeResources;
        debugLog(
          "DISTANCE",
          `Using zipcode filtered resources: ${allResources.length}`,
        );
      }

      // Apply pagination if not filtering by distance
      let resources = allResources;
      if (!filterByDistance) {
        resources = resources.slice(
          (pagination.page - 1) * pagination.limit,
          pagination.page * pagination.limit,
        );
      }

      // Debug log all resources and their address.zip values
      debugLog(
        "DISTANCE",
        "All resources in database:",
        resources.map((r) => {
          const address =
            typeof r.address === "object" ? (r.address as any) : {};
          return {
            id: r.id,
            name: r.name,
            address: r.address,
            addressZip: address.zip || "not set",
          };
        }),
      );

      debugLog("DISTANCE", `Query returned ${resources.length} resources`);

      // Filter resources by distance if needed
      if (filterByDistance && zipLocation) {
        debugLog("DISTANCE", "Filtering resources by distance");
        const maxDistance = parseInt(distance || "25", 10); // Default to 25 miles
        debugLog("DISTANCE", `Max distance: ${maxDistance} miles`);

        // For each resource, geocode its address and check if it's within the specified distance
        debugLog(
          "DISTANCE",
          `Processing ${resources.length} resources for distance filtering`,
        );
        // Process resources in batches to avoid overwhelming the geocoding API
        const BATCH_SIZE = 10;
        let resourcesWithDistance: any[] = [];
        
        // Process resources in batches
        for (let i = 0; i < resources.length; i += BATCH_SIZE) {
          const batch = resources.slice(i, i + BATCH_SIZE);
          
          debugLog("DISTANCE", `Processing batch ${i/BATCH_SIZE + 1} of ${Math.ceil(resources.length/BATCH_SIZE)}`);
          
          // Process batch in parallel
          const batchResults = await Promise.all(
            batch.map(async (resource: any) => {
              try {
                // Build the resource address
                let resourceAddress = "";

                debugLog("DISTANCE", "Processing resource:", {
                  id: resource.id,
                  name: resource.name,
                  address: resource.address,
                  zipCode: resource.address?.zip || "not set",
                });

                // Check if address is an object with the expected properties
                if (
                  resource.address &&
                  typeof resource.address === "object" &&
                  "street" in resource.address &&
                  "city" in resource.address &&
                  "state" in resource.address
                ) {
                  const address = resource.address as Address;
                  resourceAddress = `${address.street}, ${address.city}, ${address.state} ${address.zip || ""}`;
                  debugLog("DISTANCE", `Using full address: ${resourceAddress}`);
                } else if (
                  resource.address &&
                  typeof resource.address === "object"
                ) {
                  const addressObj = resource.address as AddressWithZip;
                  if (addressObj.zip && typeof addressObj.zip === "string") {
                    resourceAddress = addressObj.zip;
                  }
                  debugLog("DISTANCE", `Using address.zip: ${resourceAddress}`);
                } else {
                  debugLog("DISTANCE", "No valid address found for resource");
                  return { ...resource, withinDistance: false };
                }

                if (!resourceAddress) {
                  debugLog("DISTANCE", "Empty resource address");
                  return { ...resource, withinDistance: false };
                }

                // Geocode the resource address
                debugLog(
                  "DISTANCE",
                  `Geocoding resource address: ${resourceAddress}`,
                );
                const resourceLocation = await geocodeAddress(resourceAddress);
                debugLog("DISTANCE", "Resource location:", resourceLocation);

                // Check if the resource is within the specified distance
                debugLog("DISTANCE", "Calculating distance for resource:", {
                  id: resource.id,
                  name: resource.name,
                  resourceLocation,
                  zipLocation,
                });

                const distance = calculateDistance(
                  zipLocation.latitude,
                  zipLocation.longitude,
                  resourceLocation.latitude,
                  resourceLocation.longitude,
                );

                const withinDistance = distance <= maxDistance;

                debugLog(
                  "DISTANCE",
                  `Resource distance: ${distance.toFixed(2)} miles, within range: ${withinDistance}`,
                );

                return { ...resource, withinDistance, distance };
              } catch (error) {
                console.error("Error calculating distance:", error);
                return { ...resource, withinDistance: false };
              }
            }),
          );
          
          // Add results from this batch
          resourcesWithDistance = [...resourcesWithDistance, ...batchResults];
          
          // Add a small delay between batches to avoid rate limiting
          if (i + BATCH_SIZE < resources.length) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        // Filter resources that are within the specified distance
        const filteredResources = resourcesWithDistance.filter(
          (resource) => resource.withinDistance,
        ) as any[];
        debugLog(
          "DISTANCE",
          `Filtered resources: ${filteredResources.length} out of ${resourcesWithDistance.length}`,
        );

        // Log each filtered resource for debugging
        filteredResources.forEach((resource, index) => {
          debugLog("DISTANCE", `Filtered resource ${index + 1}:`, {
            id: resource.id,
            name: resource.name,
            distance: resource.distance
              ? resource.distance.toFixed(2) + " miles"
              : "unknown",
          });
        });

        // Apply pagination after filtering
        // Cast the filtered resources to the expected type
        resources = filteredResources.slice(
          (pagination.page - 1) * pagination.limit,
          pagination.page * pagination.limit,
        );

        debugLog(
          "DISTANCE",
          `Final resources after pagination: ${resources.length}`,
        );
      }

      // Get the total count
      const count = filterByDistance
        ? resources.length
        : await prisma.resource.count({ where: whereClause });

      // Format and return the response
      const response = NextResponse.json({
        data: resources,
        pagination: {
          total: count,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(count / pagination.limit),
        },
      });

      // Set cache control headers to prevent caching
      response.headers.set("Cache-Control", "no-store, max-age=0");

      // Add CORS headers
      if (isAllowedOrigin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Credentials", "true");
      }

      return response;
    }
  } catch (error) {
    const errorObj = error as Error;
    logError("Error fetching resources", errorObj);

    return NextResponse.json(
      {
        error: "Failed to fetch resources",
        details: errorObj.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
