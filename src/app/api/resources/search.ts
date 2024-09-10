import { NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function POST(request: Request) {
  try {
    const { ageRange, zipCode, social, emotional, physical } =
      await request.json();

    let whereConditions: any = {
      OR: [],
    };

    if (social) {
      whereConditions.OR.push({
        AND: [
          { category: { hasSome: ["SOCIAL"] } },
          { type: { hasSome: [social] } },
        ],
      });
    }

    if (emotional) {
      whereConditions.OR.push({
        AND: [
          { category: { hasSome: ["EMOTIONAL"] } },
          { type: { hasSome: [emotional] } },
        ],
      });
    }

    if (physical) {
      whereConditions.OR.push({
        AND: [
          { category: { hasSome: ["PHYSICAL"] } },
          { type: { hasSome: [physical] } },
        ],
      });
    }

    // If no domains were selected, remove the OR condition
    if (whereConditions.OR.length === 0) {
      delete whereConditions.OR;
    }

    if (ageRange) {
      whereConditions.targetAudience = { hasSome: [ageRange] };
    }

    if (zipCode) {
      whereConditions.address = {
        path: "$.zipCode",
        equals: zipCode,
      };
    }

    const resources = await prisma.resource.findMany({
      where: whereConditions,
    });

    // Process resources to handle potentially missing fields
    const processedResources = resources.map(
      (resource: {
        id: any;
        name: any;
        description: any;
        type: any;
        category: any;
        contact: any;
        address: any;
        operatingHours: any;
        eligibilityCriteria: any;
        servicesProvided: any;
        targetAudience: any;
        accessibilityFeatures: any;
        cost: any;
        ratings: any;
        geoLocation: any;
        policies: any;
        tags: any;
      }) => ({
        id: resource.id,
        name: resource.name || "Unnamed Resource",
        description: resource.description || "",
        type: resource.type || [],
        category: resource.category || [],
        contact: resource.contact || {},
        address: resource.address || {},
        operatingHours: resource.operatingHours || {},
        eligibilityCriteria: resource.eligibilityCriteria || "",
        servicesProvided: resource.servicesProvided || [],
        targetAudience: resource.targetAudience || [],
        accessibilityFeatures: resource.accessibilityFeatures || [],
        cost: resource.cost || "",
        ratings: resource.ratings || { average: 0, count: 0 },
        geoLocation: resource.geoLocation || {},
        policies: resource.policies || [],
        tags: resource.tags || [],
      }),
    );

    return NextResponse.json(processedResources);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "This endpoint only supports POST requests" },
    { status: 405 },
  );
}
