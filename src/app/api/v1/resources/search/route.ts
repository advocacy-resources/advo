import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/library";

// Types
export interface IResourceSearchPostRequest {
  ageRange: string; // Not implemented yet, but kept for future use
  zipCode: string;
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
  text: {
    query: string;
    path: string | string[];
  };
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
  const { zipCode, category, description, type } = params;
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
    mustClauses.push({
      text: {
        query: zipCode.trim(),
        path: "zipCode",
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
  try {
    // Parse request body
    const requestBody = await request.json();

    // Validate and normalize parameters
    const { normalizedParams, pagination, hasSearchParams } =
      validateAndNormalizeParams(requestBody);

    // If no search parameters, return paginated list of all resources
    if (!hasSearchParams) {
      console.info(
        "No search parameters provided. Returning paginated list of all resources.",
      );

      const [resources, count] = await Promise.all([
        prisma.resource.findMany({
          orderBy: { createdAt: "desc" },
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        prisma.resource.count(),
      ]);

      return NextResponse.json({
        data: resources,
        pagination: {
          total: count,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(count / pagination.limit),
        },
      });
    }
    // Build search pipeline
    const searchClause = buildSearchPipeline(normalizedParams);
    const projectionStage = createProjectionStage();

    // Base pipeline with projection
    const basePipeline: PipelineStage[] = [searchClause, projectionStage];
    // Add pagination to pipeline
    const pipeline = addPaginationToPipeline(basePipeline, pagination);

    // Execute the query - cast pipeline to avoid type issues with Prisma
    const result = await prisma.resource.aggregateRaw({
      pipeline: pipeline as unknown as InputJsonValue[],
    });

    // Format and return the response
    const formattedResponse = formatResponse<Record<string, unknown>>(
      result,
      pagination,
    );
    return NextResponse.json(formattedResponse);
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
