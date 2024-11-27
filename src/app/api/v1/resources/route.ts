import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("Received POST data:", data);
    const resource = await prisma.resource.create({
      data,
    });
    console.log("Created resource:", resource);
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/resources:", error);
    return NextResponse.json(
      { error: "Failed to create resource", details: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    console.log("GET /api/resources called");
    const resources = await prisma.resource.findMany();
    console.log("Fetched resources:", resources);
    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error in GET /api/resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources", details: (error as Error).message },
      { status: 500 },
    );
  }
}
