import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { Prisma, Category, Resource } from "@prisma/client";
import { InputJsonObject } from "@prisma/client/runtime/library";

export async function POST(request: NextRequest) {
  try {
    const { ageRange, zipCode, category, description } = await request.json();

    // Initialize the where conditions for filtering
    const whereConditions: Prisma.ResourceWhereInput = {
      // Initialize the category filter to handle multiple category types
      category: {
        in: [category as unknown as Category],
      },
    };

    // Filter based on age range (assumed to be in targetAudience field)

    // Filter based on zip code (assuming zipCode is in the address JSON field)
    if (zipCode) {
      whereConditions.address = {
        // path: "$.zipCode",
        equals: zipCode,
      };
    }

    // Perform the search based on the constructed where conditions
    const resources = await prisma.resource.aggregateRaw({
      pipeline: description
        ? [
            {
              $search: {
                index: "resource_index",
                compound: {
                  must: [
                    {
                      text: {
                        query: category,
                        path: "category",
                      },
                    },
                  ],
                  should: [
                    {
                      text: {
                        query: description,
                        path: ["name", "description"],
                      },
                    },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                category: 1,
                type: 1,
              },
            },
          ]
        : [
            {
              $match: {
                category: category,
              },
            },
          ],
    });

    if (!resources) {
      return NextResponse.json(
        { message: "No resources found" },
        { status: 404 },
      );
    }

    // Process resources and map them to the structure expected in the response
    const processedResources = (resources as unknown as Resource[]).map(
      (resource) => ({
        id: resource.id,
        type: resource.type || [],
        name: resource.name || "Unnamed Resource",
        description: resource.description || "",
        category: resource.category || [],
        contact: resource.contact || {},
        address: resource.address || {},
        operatingHours: resource.operatingHours || {},
      }),
    );

    // Return the processed resources as JSON
    return NextResponse.json(processedResources);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { message: "Internal server error", details: (error as Error).message },
      { status: 500 },
    );
  }
}
