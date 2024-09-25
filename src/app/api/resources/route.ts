import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("Attempting to create resource with data:", data);
    const resource = await prisma.resource.create({
      data,
    });
    console.log("Resource created successfully:", resource);
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: "Failed to create resource", details: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    console.log("Attempting to fetch resources");
    const resources = await prisma.resource.findMany();
    console.log(`Successfully fetched ${resources.length} resources`);
    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources", details: (error as Error).message },
      { status: 500 },
    );
  }
}
