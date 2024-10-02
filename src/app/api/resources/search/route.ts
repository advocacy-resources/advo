import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { ageRange, zipCode, category } = await request.json();

    console.log("Received search params:", {
      ageRange,
      zipCode,
      // social,
      // emotional,
      // physical,
    });

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

    console.log("Search conditions:", JSON.stringify(whereConditions, null, 2));

    // Perform the search based on the constructed where conditions
    const resources = await prisma.resource.findMany({
      where: whereConditions,
    });

    console.log(`Found ${resources.length} resources`);

    // Process resources and map them to the structure expected in the response
    const processedResources = resources.map((resource) => ({
      id: resource.id,
      name: resource.name || "Unnamed Resource",
      description: resource.description || "",
      category: resource.category || [],
      contact: resource.contact || {},
      address: resource.address || {},
      operatingHours: resource.operatingHours || {},
    }));

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
