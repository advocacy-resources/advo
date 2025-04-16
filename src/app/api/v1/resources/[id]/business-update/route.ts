import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/prisma/client";
import { authOptions } from "@/lib/authOptions";

// Helper function to check if user is a business representative for this resource
async function checkBusinessRepAccess(resourceId: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return false;
  }

  // Check if user is a business representative and has access to this resource
  if (
    session.user.role === "business_rep" &&
    session.user.managedResourceId === resourceId
  ) {
    return true;
  }

  // Admins can also update any resource
  if (session.user.role === "admin") {
    return true;
  }

  return false;
}

// PUT handler for business representatives to update their resource
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    // Check if user has access to update this resource
    const hasAccess = await checkBusinessRepAccess(id);
    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. You don't have permission to update this resource.",
        },
        { status: 403 },
      );
    }

    // Get the resource data from the request
    const resourceData = await request.json();

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!existingResource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }

    // Update the resource
    // Only allow updating specific fields that business reps should be able to modify
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: {
        name: resourceData.name,
        description: resourceData.description,
        contact: resourceData.contact, // JSON for contact details (phone, email, website)
        address: resourceData.address, // JSON for structured address
        operatingHours: resourceData.operatingHours, // JSON for operating hours
        // Don't allow updating sensitive fields like:
        // - categories
        // - verified status
        // - favoriteCount
        // - upvoteCount
        // - images
      },
    });

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 },
    );
  }
}

// GET handler to check if user has access to update this resource
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    // Check if user has access to update this resource
    const hasAccess = await checkBusinessRepAccess(id);
    if (!hasAccess) {
      return NextResponse.json({ hasAccess: false }, { status: 200 });
    }

    return NextResponse.json({ hasAccess: true });
  } catch (error) {
    console.error("Error checking resource access:", error);
    return NextResponse.json(
      { error: "Failed to check resource access" },
      { status: 500 },
    );
  }
}
