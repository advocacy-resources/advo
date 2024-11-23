import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

export interface IResourceSearchPostRequest {
  ageRange: string;
  zipCode: string;
  category: string[];
  description: string;
  type: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Extract and log incoming search parameters
    const {
      zipCode,
      category,
      description: descriptionOrUndefined,
      type,
    } = (await request.json()) as IResourceSearchPostRequest;

    console.log("Received search parameters:", {
      zipCode,
      category,
      description: descriptionOrUndefined,
      type,
    });

    const description = descriptionOrUndefined?.trim() || null;

    // Normalize arrays and handle potential single strings
    const normalizedCategory = Array.isArray(category)
      ? category
      : [category].filter(Boolean);
    const normalizedType = Array.isArray(type) ? type : [type].filter(Boolean);

    // Check if any search parameters are provided
    const hasSearchParams =
      (zipCode && zipCode.trim() !== "") ||
      (normalizedCategory && normalizedCategory.length > 0) ||
      (description && description.trim() !== "") ||
      (normalizedType && normalizedType.length > 0);

    console.log("hasSearchParams value:", hasSearchParams);

    // If no valid search parameters are provided, return all resources
    if (!hasSearchParams) {
      console.warn(
        "No valid search parameters provided. Returning all resources.",
      );

      const resources = await prisma.resource.findMany({
        orderBy: { createdAt: "desc" }, // Sort by creation date
      });

      console.log("Returning all resources:", resources);
      return NextResponse.json(resources);
    }

    // Construct the MongoDB pipeline for filtered search
    const mustClauses: any[] = [];

    if (normalizedCategory.length > 0) {
      mustClauses.push({
        text: {
          query: normalizedCategory.join(" "),
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

    if (normalizedType.length > 0) {
      mustClauses.push({
        text: {
          query: normalizedType.join(" "),
          path: "type",
        },
      });
    }

    const shouldClause = description
      ? [
          {
            text: {
              query: description,
              path: ["name", "description"],
            },
          },
        ]
      : [];

    const searchClause = {
      $search: {
        index: "resource_index",
        compound: {
          must: mustClauses,
          should: shouldClause,
        },
      },
    };

    const pipeline = [
      searchClause,
      {
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
      },
    ];

    console.log("Constructed pipeline:", JSON.stringify(pipeline, null, 2));

    // Perform the query using aggregateRaw
    const resources = await prisma.resource.aggregateRaw({ pipeline });

    console.log("Resources fetched:", resources);
    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources", details: error.message },
      { status: 500 },
    );
  }
}
