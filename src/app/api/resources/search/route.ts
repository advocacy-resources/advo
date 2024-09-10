import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { ageRange, zipCode, social, emotional, physical } =
      await request.json();

    console.log("Received search params:", {
      ageRange,
      zipCode,
      social,
      emotional,
      physical,
    });

    let whereConditions: any = {};

    if (physical) {
      whereConditions.type = { hasSome: [physical] };
    }

    if (social) {
      whereConditions.category = { hasSome: ["SOCIAL"] };
      whereConditions.type = {
        ...(whereConditions.type || {}),
        hasSome: [social],
      };
    }

    if (emotional) {
      whereConditions.category = { hasSome: ["EMOTIONAL"] };
      whereConditions.type = {
        ...(whereConditions.type || {}),
        hasSome: [emotional],
      };
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

    console.log("Search conditions:", JSON.stringify(whereConditions, null, 2));

    const resources = await prisma.resource.findMany({
      where: whereConditions,
    });

    console.log(`Found ${resources.length} resources`);
    console.log("Resources:", JSON.stringify(resources, null, 2));

    const processedResources = resources.map((resource) => ({
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
    }));

    return NextResponse.json(processedResources);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { message: "Internal server error", details: (error as Error).message },
      { status: 500 },
    );
  }
}
